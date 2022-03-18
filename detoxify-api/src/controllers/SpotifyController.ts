import { Request, Response } from 'express'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { refreshAccess } from './AuthorizationController'
import { debug } from 'console'

// const SPOTIFY_API: string = process.env.SPOTIFY_API

const getArtists = async (req: Request, res: Response) => {
  let accessToken: string = req.cookies.spotify_access_token

  debug('getArtists {accessToken, req.cookies}', {accessToken, 'req.cookies': req.cookies})

  if(!accessToken)
  {
    debug('no access token!')
    const refreshResponse = await refreshAccess(req);

    accessToken = refreshResponse.accessToken
    const expiresIn = refreshResponse.expiresIn

    if(accessToken.length && expiresIn.length){
      res.cookie('spotify_access_token', accessToken, {
        expires: new Date(Date.parse(expiresIn)),
      })
    }

    debug('getArtists accessToken from refresh', {accessToken})
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
      debug('getArtists axios response', {'data.artists.items': response.data.artists.items, 'headers': response.headers})
      artists.push(...response.data.artists.items)
      count++;
      nextURL = response.data.artists.next
    }).catch((error: AxiosError) =>
    {
      debug('getArtists error', {error, responseHeaders: error.response.headers, responseData: error.response.data})
      nextURL = ''
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

export {
  getArtists
}