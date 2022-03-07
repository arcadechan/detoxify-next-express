import Head from "next/head"
import { Footer, Header, PlaylistGenerator } from "../components"
import Cookies from 'js-cookie';
import { useEffect, useState } from "react";

export async function getStaticProps() {
  return {
    props: {
      CLIENT_ID: process.env.CLIENT_ID,
      REDIRECT_URI: process.env.REDIRECT_URI,
      SCOPES: process.env.SCOPES,
      STATE: process.env.STATE
    }
  }
}

export default function DetoxedReleaseRadar(props) {
  const { CLIENT_ID, REDIRECT_URI, SCOPES, STATE } = props;

  const [ isAccessCodeSet, setAccessCode ] = useState(false)

  useEffect(() => {
    if(Cookies.get('spotify_access_code')) setAccessCode(true)
  }, [])
  
  return (
    <>
      <Head>
        <title>detoxify - api test</title>
        <meta name="description" content='detoxify - A tool for generating a custom Spotify "Release Radar" playlist' />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className='mx-auto px-10 max-w-screen-lg'>
        {
          isAccessCodeSet
            ? (<PlaylistGenerator/>)
            : (
              <div id='pre-authentication' className='flex flex-col items-center px-5'>
                <p>
                  Hit the following button to authenticate this service with Spotify to generate your Detoxed Release Radar playlist!
                  The authentication will ask for two simple permissions:
                </p>
                <ul className="list-inside">
                  <li>
                    <h6>user-read-private</h6>
                    <p>Used to get your username, necessary to then save a playlist to your account.</p>
                  </li>
                  <li>
                    <h6>user-follow-read</h6>
                    <p>Used to find all the artists you are following.</p>
                  </li>
                  <li>
                    <h6>playlist-modify-public</h6>
                  </li>
                  <li>
                    <h6>playlist-modify-private</h6>
                    <p>Used to create and manage your "Detoxed Release Radar" playlist on your account, whether it's set to public or private.</p>
                  </li>
                  <li>
                    <h6>ugc-image-upload</h6>
                    <p>Needed to upload your "Detoxed Release Radar's" playlist cover image (You're free to change this image at any time).</p>
                  </li>
                </ul>
                <div className="inline-block mb-5">
                  <form method="GET" action="https://accounts.spotify.com/authorize">
                    <input type="hidden" name="client_id" value={CLIENT_ID ?? ''} />
                    <input type="hidden" name="response_type" value="code" />
                    <input type="hidden" name="redirect_uri" value={REDIRECT_URI ?? ''} />
                    <input type="hidden" name="scope" value={SCOPES ?? ''} />
                    <input type="hidden" name="state" value={STATE ?? ''} />
                    <button className="btn btn-spotify m-1">Login With Spotify</button>
                  </form>
                </div>
                <div className="inline-block">
                  <p>
                    <strong>Reminder:</strong> As a Spotify user you can revoke this applications permissions at any time, or any application you've authenticated before, by visiting <a href="https://www.spotify.com/us/account/apps/" target="_blank">https://www.spotify.com/us/account/apps/</a> and removing access.
                  </p>
                </div>
              </div>
            )
        }
      </main>
      <Footer />
    </>
  )
}