import { useState } from "react"
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
  const [generation, setGeneration] = useState('pending')
  const [artists, setArtists] = useState([])
  const [albums, setAlbums] = useState([])
  const [tracks, setTracks] = useState({})
  const [artistsInStorage, setArtistsInStorage] = useState(false)
  const [albumsInStorage, setAlbumsInStorage] = useState(false)
  const [tracksInStorage, setTracksInStorage] = useState(false)
  const [artistGalleryOpen, setArtistGalleryOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewArtists, setPreviewArtists] = useState([])
  const [previewTrack, setPreviewTrack] = useState(null)
  const [stopThings, setStopThings] = useState(false)

  const getArtists = async () => {
    setGeneration(GEN_STATE.GETTING_ARTISTS)
    setArtistsInStorage(false)

    await axios.get(`${API}/get-artists`)
      .then(response => {
        setGeneration(GEN_STATE.ARTISTS_RETRIEVED)
        setArtists(response.data)

        localStorage.setItem('artists', JSON.stringify(response.data))
      }).catch(error => {
        setGeneration(GEN_STATE.PENDING)
        console.error(error)
      })
  }

  const {
    PENDING,
    GETTING_ARTISTS,
    ARTISTS_RETRIEVED,
    GENERATING_PLAYLIST,
    ALBUMS_RETRIEVED
  } = GEN_STATE

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

        <div className="w-12 justify-center">
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
        </div>
      </div>
    </>
  )
}

export default PlaylistGenerator