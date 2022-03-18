import { useState, useEffect } from "react"
import axios from 'axios'

axios.defaults.withCredentials = true;

const GEN_STATE = {
  PENDING: 'pending',
  GETTING_ARTISTS: 'gettingArtists',
  ARTISTS_RETRIEVED: 'artistsRetrieved',
  GENERATING_PLAYLIST: 'generatingPlaylist',
  ALBUMS_RETRIEVED: 'albumsRetrieved',
}

const API = 'http://localhost:8000'

const PlaylistGenerator = () => {
  const [generation, setGeneration] = useState(GEN_STATE.PENDING)
  const [artists, setArtists] = useState([])
  const [albums, setAlbums] = useState([])
  const [tracks, setTracks] = useState({})
  const [trackCount, setTrackCount] = useState(0);
  const [artistsInStorage, setArtistsInStorage] = useState(false)
  const [albumsInStorage, setAlbumsInStorage] = useState(false)
  const [tracksInStorage, setTracksInStorage] = useState(false)
  // const [artistGalleryOpen, setArtistGalleryOpen] = useState(false)
  // const [previewUrl, setPreviewUrl] = useState(null)
  // const [previewArtists, setPreviewArtists] = useState([])
  // const [previewTrack, setPreviewTrack] = useState(null)
  // const [stopThings, setStopThings] = useState(false)

  const getArtists = async () => {
    setGeneration(GEN_STATE.GETTING_ARTISTS)
    setArtistsInStorage(false)

    await axios.get(`${API}/get-artists`)
      .then(response => {
        setGeneration(GEN_STATE.ARTISTS_RETRIEVED)
        setArtists(response.data.artists)

        localStorage.setItem('artists', JSON.stringify(response.data.artists))
      }).catch(error => {
        setGeneration(GEN_STATE.PENDING)
        console.error(error)
      })
  }

  const generatePlaylist = async () => {
    setGeneration(GEN_STATE.GENERATING_PLAYLIST);
    setAlbums([])
    setTracks([])

    const artistIds = artists.map(artist => artist.id);

    console.log({artistIds});

    await axios.post(`${API}/create-playlist`, { artistIds })
      .then(response => {
        console.log('generatePlaylist response.data', response.data)
        setGeneration(GEN_STATE.ALBUMS_RETRIEVED);
        setAlbums(response.data.albums)
        setTracks(response.data.tracks)

        localStorage.setItem('albums', JSON.stringify(response.data.albums))
        localStorage.setItem('tracks', JSON.stringify(response.data.tracks))
      }).catch(error => {
        setGeneration(GEN_STATE.PENDING)
        console.error(error);
      });
  }

  const {
    PENDING,
    GETTING_ARTISTS,
    ARTISTS_RETRIEVED,
    GENERATING_PLAYLIST,
    ALBUMS_RETRIEVED
  } = GEN_STATE

  useEffect(() => {
    const savedArtists = localStorage.getItem('artists')

    if(!!savedArtists){
      setGeneration(GEN_STATE.ARTISTS_RETRIEVED)
      setArtistsInStorage(true)
      setArtists(JSON.parse(savedArtists))
    }

    return () => {
      setGeneration(GEN_STATE.PENDING),
      setArtistsInStorage(false),
      setArtists([])
   }
  }, [setGeneration, setArtists, setArtistsInStorage])

  useEffect(() => {
    const savedAlbums = localStorage.getItem('albums')
    const savedTracks = localStorage.getItem('tracks')

    if(!!savedAlbums){
      setGeneration(GEN_STATE.ALBUMS_RETRIEVED)
      setAlbumsInStorage(true)
      setAlbums(JSON.parse(savedAlbums))
    }

    if(!!savedTracks){
      setTracksInStorage(true)
      setTracks(JSON.parse(savedTracks))
    }

    return () => {
      setGeneration(GEN_STATE.PENDING),
      setAlbums([]),
      setTracks([]),
      setAlbumsInStorage(false),
      setArtistsInStorage(false)
    }
  }, [setGeneration, setAlbums, setTracks, setAlbumsInStorage, setArtistsInStorage])

  useEffect(() => {
    let count = 0
    
    if(tracks.length){
      for(const track in tracks){
        count += tracks[track].length
      }

      setTrackCount(count);
    }

    return () => {
      setTracks(0)
    }
  }, [setTracks])

  console.log({albums})

  return (
    <>
      <div className="py-10">
        <div className="text-center">
          {generation !== GENERATING_PLAYLIST && <h2 className="text-4xl">Artists</h2>}
          {generation === PENDING && <p>The first step is to get all the artists you follow. Click the "Get Artists" button when you're ready!</p>}
          <div>
            {generation === GETTING_ARTISTS && <p>Getting followed artists...</p>}
          </div>
        </div>

        {generation === GETTING_ARTISTS && <div>Loading...</div>}

        <div className="w-full justify-center">
          {(generation === ARTISTS_RETRIEVED || generation == ALBUMS_RETRIEVED) && (
            <div>
              {artistsInStorage && <p>Here is a list of your followed artists we saved from the last time you fetched them. If the artists you follow hasn't changed, you can go ahead and just hit the "Generate Detoxed Release Radar" button. Otherwise you can hit the "Get Artists" button to get your followed artists again.</p>}
              {!artistsInStorage && <p>Artists retrieved! Double check your list and if the list of artists looks ok, press the "Generate Detoxed Release Radar" button below the artist list to create the playlist into your account.</p>}
              <p>You can click on each artists card to navigate to their artists page on Spotify</p>
            </div>
          )}
          {[PENDING, ARTISTS_RETRIEVED, ALBUMS_RETRIEVED].includes(generation) && (
            <button
              id='get-artists-btn'
              className="btn btn-spotify mx-auto my-4"
              onClick={() => getArtists()}
            >
              Get Artists
            </button>
          )}
          {(generation === ARTISTS_RETRIEVED || generation == ALBUMS_RETRIEVED) && (
              <>
                <h6 class="d-block text-center my-4">Artist Count: { artists.length }</h6>
                <div id='artists-gallery' class='w-full p-0 mx-auto my-4'>
                  {artists.length && artists.map((artist, i) => {
                    return (
                      <div key={i} class='artist-container w-full md:w-1/2 xl:w-1/3 p-0'>
                        <a href={artist.external_urls.spotify} target='_blank'>
                          <div class='artist-no'>{ i + 1 }</div>
                          <div class='artist-image-container'>
                            { artist.images.length ? (
                              <img src={artist.images[2]['url']} alt="" class='artist-image'/>
                            ) : (
                              <svg role="img" viewBox="-25 -22 100 100" class="artist-image no-artist-image" >
                                <path d="M35.711 34.619l-4.283-2.461a1.654 1.654 0 0 1-.808-1.156 1.65 1.65 0 0 1 .373-1.36l3.486-4.088a14.3 14.3 0 0 0 3.432-9.293V14.93c0-3.938-1.648-7.74-4.522-10.435C30.475 1.764 26.658.398 22.661.661c-7.486.484-13.35 6.952-13.35 14.725v.875c0 3.408 1.219 6.708 3.431 9.292l3.487 4.089a1.656 1.656 0 0 1-.436 2.516l-8.548 4.914A14.337 14.337 0 0 0 0 49.513V53.5h2v-3.987c0-4.417 2.388-8.518 6.237-10.705l8.552-4.916a3.648 3.648 0 0 0 1.783-2.549 3.643 3.643 0 0 0-.822-2.999l-3.488-4.091a12.297 12.297 0 0 1-2.951-7.993v-.875c0-6.721 5.042-12.312 11.479-12.729 3.449-.22 6.725.949 9.231 3.298a12.182 12.182 0 0 1 3.89 8.976v1.331c0 2.931-1.048 5.77-2.952 7.994l-3.487 4.089a3.653 3.653 0 0 0-.822 3 3.653 3.653 0 0 0 1.782 2.548l3.036 1.745a11.959 11.959 0 0 1 2.243-1.018zM45 25.629v15.289a7.476 7.476 0 0 0-5.501-2.418c-4.135 0-7.5 3.365-7.5 7.5s3.364 7.5 7.5 7.5 7.5-3.365 7.5-7.5V29.093l5.861 3.384 1-1.732L45 25.629zM39.499 51.5a5.506 5.506 0 0 1-5.5-5.5c0-3.033 2.467-5.5 5.5-5.5s5.5 2.467 5.5 5.5-2.467 5.5-5.5 5.5z" fill="currentColor" fillRule="evenodd"></path>
                              </svg>
                            )}
                          </div>
                          <div class='artist-name'>{ artist.name }</div>
                        </a>
                      </div>
                    )
                  })}
                </div>
              </>
          )}

          {( generation === ARTISTS_RETRIEVED || generation === ALBUMS_RETRIEVED ) && <hr/>}

          {( generation === ARTISTS_RETRIEVED || generation === ALBUMS_RETRIEVED ) && (
            <div class='my-5'>
              <div class='w-full text-center'>
                <h2>Albums</h2>
                { albumsInStorage ? (
                  <p>Here's a list of all the albums from the latest "Detoxed Release Radar" you generated. You may generate a new playlist at any time, but keep in mind that doing so will wipe clean the one you have with new stuff, so make sure you saved all the stuff you want as there is no guarantee the same tracks will make it on there again!</p>
                ) : (
                  <p>To generate a playlist on your account go ahead and press "Generate Detoxed Release Radar"</p>
                )}
              </div>

              <button
                id='create-playlist-btn'
                onClick={() => generatePlaylist()}
                class={`btn btn-spotify mx-auto my-4 w-full ${!albumsInStorage ? 'pending': ''}`}
              >
                Generate Detoxed <br class='mobile-break'/>Release Radar
              </button>
            </div>
          )}

          { generation === ALBUMS_RETRIEVED && <h6>Album Count { albums.length }</h6>}
          { trackCount > 0 && <h6 class='w-full text-center my-4'>Track Count: { trackCount }</h6> }
          
          { generation === ALBUMS_RETRIEVED && (
            <div id='album-gallery' class='w-full p-0 my-4'>
              { albums.length && albums.map((album, i) => {
                return (
                  <div class='album-container w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-0'>
                    <div>
                      <div class='album-inner-container text-center'>
                        {(album.images.length > 0) && (
                          <>
                            { !!album.images[1] ? (
                              <img src={album.images[1]['url']} class='album-image'/>
                            ) : (
                              <img src={album.images[0]['url']} class='album-image'/>
                            )}
                          </>
                        )}
                        <div class='flip-card mt-2'>
                          <div id={`card-${i}`} class='table-container flip-card-inner'>
                            <div class='flip-card-front'>
                              <table class='mt-2'>
                                <tbody>
                                  <tr>
                                    { albums.artists.length === 1 ? (
                                      <>
                                        <td>Artist:</td>
                                        <td>
                                          <a href={album.artists[0].external_urls.spotify} target='_blank' class='album-artist-link'>{ album.artists[0].name }</a>
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td>Artists:</td>
                                        <td>
                                          {artists.map((artist, artistIndex) => {
                                            return (
                                              <>
                                                <a href={artist.external_urls.spotify} key={artistIndex} target='_blank' class='album-artist-link'>{ artist.name }</a>
                                                { (artistIndex < album.artists.length - 1) && <span>, </span>}
                                              </>
                                            )
                                          })}
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                  <tr>
                                      <td>Album:</td>
                                      <td><a href={album.external_urls.spotify} class="album-link">{ album.name }</a></td>
                                  </tr>
                                  <tr>
                                      <td>Type:</td>
                                      <td style="text-transform: capitalize;">{ album.album_type }</td>
                                  </tr>
                                  <tr>
                                      <td>Released:</td>
                                      <td>{ album.release_date }</td>
                                  </tr>
                                  <tr>
                                      <td>Tracks:</td>
                                      <td>{ album.total_tracks }</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div class='flip-card-back'>
                              <div class='track-list-container'>
                                <table>
                                  <thead>
                                    <tr>
                                      <td class='track-no'>Track #</td>
                                      <td class='track-title'>Title</td>
                                      <td></td>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tracks.length && tracks[album.id].map((track, trackIndex) => {
                                      return (
                                        <tr key={trackIndex} class=''>
                                          <td class='track-no-row'>{ track.track_number }</td>
                                          <td>{ track.number }</td>
                                          <td class='track-preview'>
                                            <i class='fas fa-play-circle'></i>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button class='btn btn-spotify mt-3 flip-card-button'>
                          <i class='fas fa-redo-alt'></i> View album <span id={`flip-view-tracks-${trackIndex}`}>tracks</span><span id={`flip-view-albums-${trackIndex}`}>info</span>.
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PlaylistGenerator