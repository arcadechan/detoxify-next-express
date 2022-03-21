import { Request, Response } from 'express'
import axios, { Axios, AxiosError, AxiosResponse } from 'axios'
import { refreshAccess } from './AuthorizationController'
import { debug } from 'console'
import fs from 'fs'

// const SPOTIFY_API: string = process.env.SPOTIFY_API

const getArtists = async (req: Request, res: Response) => {
  let accessToken: string = req.cookies.spotify_access_token

  // debug('getArtists {accessToken, req.cookies}', {accessToken, 'req.cookies': req.cookies})

  if(!accessToken)
  {
    // debug('no access token!')
    const refreshResponse = await refreshAccess(req);

    accessToken = refreshResponse.accessToken
    const expiresIn = refreshResponse.expiresIn

    if(accessToken.length && expiresIn.length){
      res.cookie('spotify_access_token', accessToken, {
        expires: new Date(Date.parse(expiresIn)),
      })
    }

    // debug('getArtists accessToken from refresh', {accessToken})
  }

  const artists: any[] = []
  let nextURL: string|null = 'https://api.spotify.com/v1/me/following?type=artist&limit=50'
  let count: number = 0;

  do
  {
    await axios.get(nextURL,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then((response: AxiosResponse) =>
    {
      // debug('getArtists axios response', {'data.artists.items': response.data.artists.items, 'headers': response.headers})
      artists.push(...response.data.artists.items)
      count++;
      nextURL = response.data.artists.next
    }).catch((error: AxiosError) =>
    {
      debug('getArtists error', {error, responseHeaders: error.response.headers, responseData: error.response.data})
      nextURL = ''
      res.status(500).send(error.response.data);
      return;
    })
  }while(nextURL && count < 2)


  const junkArtistInfo: string[] = ['followers', 'genres', 'href', 'popularity']

  const cleanedArtists = artists.map(artist =>
  {
    junkArtistInfo.forEach(key =>
    {
      delete artist[key]
    })

    return artist
  })

  res.status(200).json({artists: cleanedArtists})
}

const createPlaylist = async (req: Request, res: Response) => {
  const userId: string = req.cookies.spotify_user_id
  const userCountry: string = req.cookies.spotify_user_country
  let spotify_playlist_id: string = req.cookies.spotify_playlist_id
  let accessToken: string = req.cookies.spotify_access_token

  if(!accessToken)
  {
    const refreshResponse = await refreshAccess(req);

    accessToken = refreshResponse.accessToken
    const expiresIn = refreshResponse.expiresIn

    if(accessToken.length && expiresIn.length){
      res.cookie('spotify_access_token', accessToken, {
        expires: new Date(Date.parse(expiresIn)),
      })
    }
  }

  if(!spotify_playlist_id)
  {
    const createPlaylistResponse = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {name: 'Detoxed Release Radar'},
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then((response: AxiosResponse) => response )
    .catch((err: AxiosError) => err.response )

    if(createPlaylistResponse.status === 201)
    {
      spotify_playlist_id = createPlaylistResponse.data.id;
      res.cookie('spotify_playlist_id', spotify_playlist_id)

      const defaultImage: string = Buffer.from(fs.readFileSync('./public/img/detoxed-release-radar.jpg')).toString('base64');

      await axios.put(`https://api.spotify.com/v1/playlists/${spotify_playlist_id}/images`, defaultImage,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'image/jpeg'
        }
      })
      .then((response: AxiosResponse) => response)
      .catch((err: AxiosError) =>
      {
        debug(`Something went wrong when trying to attach the default image to playlist: ${spotify_playlist_id}`);
        debug(err.response);
      })
    }
    else
    {
      debug(createPlaylistResponse.data)
      res.status(500).send('Something went wrong when trying to create the playlist')
      return;
    }
  }
  else
  {
    // Follow the playlist in case a user has deleted it from their account. This reduces cluttering the playlist recovery list.
    await axios.put(`https://api.spotify.com/v1/playlist/${spotify_playlist_id}/followers`, {public: false},
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .catch((err: AxiosError) =>
    {
      debug(`Something went wrong when trying to re-follow playlist: ${spotify_playlist_id}`)
      debug(err.response)
    })

    // Delete contents in playlist before adding new songs.
    await axios.put(`https://api.spotify.com/v1/playlist/${spotify_playlist_id}/tracks`, {uris: []},
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .catch((err: AxiosError) =>
    {
      debug(`Something went wrong when trying to clear playlist: ${spotify_playlist_id}`)
      debug(err.response)
    })
  }

  const albums: any[] = []
  const albumTracks: any = {}

  if(req.body?.artistIds.length)
  {
    const { artistIds } = req.body
    const now = new Date()
    const oneMonthBack = new Date().setDate(now.getDate() - 30)

    const junkAlbumInfo: string[] = ['album_group', 'available_markets', 'href', 'release_date_precision']
    const junkTrackInfo: string[] = ['available_markets', 'disc_number', 'explicit', 'external_urls', 'href', 'is_local', 'type']
    const junkTrackArtistInfo: string[] = ['external_urls', 'href', 'id', 'type', 'uri']

    for(const artistId of artistIds)
    {
      const artistAlbums: any[] = []

      const singlesResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`,
      {
        params: {
          include_groups: 'single',
          market: userCountry,
          limit: 3
        },
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }).then((response: AxiosResponse) => response)
      .catch((err: AxiosError) =>
      {
        debug(`Something went wrong when trying to get artist's (${artistId}) singles.`)
        debug(err.response.data)
        return err.response
      })

      const albumsResponse = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`,
      {
        params: {
          include_groups: 'album',
          market: userCountry,
          limit: 3
        },
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }).then((response: AxiosResponse) => response)
      .catch((err: AxiosError) =>
      {
        debug(`Something went wrong when trying to get artist's (${artistId}) albums.`)
        debug(err.response.data)
        return err.response
      })

      if(singlesResponse.status === 200 && albumsResponse.status === 200)
      {
        artistAlbums.push(...singlesResponse.data.items, ...albumsResponse.data.items)

        debug(`Starting loop of ${artistId}'s albums.`);
        for(const album of artistAlbums)
        {
          if(Date.parse(album.release_date) >= oneMonthBack)
          {
            junkAlbumInfo.forEach(key =>
            {
              delete album[key]
            })

            albums.push(album)

            debug('Calling',`https://api.spotify/com/v1/albums/${album.id}/tracks`)
            const tracksResponse = await axios.get(`https://api.spotify.com/v1/albums/${album.id}/tracks`,
            {
              params: {
                limit: 50
              },
              headers: { 'Authorization': `Bearer ${accessToken}` }
            })
            .then((response: AxiosResponse) => response)
            .catch((err: AxiosError) =>
            {
              debug(`Something went wrong when trying to get album (${album.id}) tracks for artist ${artistId}`)
              debug(err)
              return {status: 500, data: null};
            })

            if(tracksResponse.status === 200)
            {
              const tracks: any[] = tracksResponse.data.items;
              const trackUris: string[] = []

              tracks.forEach(track =>
              {
                junkTrackInfo.forEach(key =>
                {
                  delete track[key]
                })

                track.artists.forEach((artist: any) =>
                {
                  junkTrackArtistInfo.forEach(key =>
                  {
                    if(!!artist[key]) delete artist[key]
                  })
                })

                trackUris.push(track.uri)
              })

              albumTracks[album.id] = tracks

              await axios.post(`https://api.spotify.com/v1/playlists/${spotify_playlist_id}/tracks`, { uris: trackUris },
              {
                headers: { 'Authorization': `Bearer ${accessToken}` }
              })
              .catch((err: AxiosError) =>
              {
                debug(`Something went wrong when trying to add tracks to playlist: ${spotify_playlist_id}`)
                debug(err.response)
              })
            }
            else
            {
              continue;
            }
          }
        }
      }
      else
      {
        continue;
      }
    }
  }

  res.status(200).json({albums, tracks: albumTracks})
}

export {
  getArtists,
  createPlaylist
}