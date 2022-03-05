import Head from 'next/head'
import { Footer, Header } from '../components'

export default function Home() {
  return (
    <>
      <Head>
        <title>detoxify</title>
        <meta name="description" content='detoxify - A tool for generating a custom Spotify "Release Radar" playlist'/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header/>
      <main className='mx-auto px-10 max-w-screen-lg'>
        <div id='home' className='relative block -top-32'></div>
        <section className='py-10'>
          <div className='max-w-screen-lg px-5 mx-auto text-center w-full'>
            <h1 className='text-5xl font-bold'>Detoxify is shutting down.</h1>
            <h4 className='text-2xl font-bold mt-8'>What did Detoxify do?</h4>
            <div className='my-8'>
              <p><i><b>Detoxify</b></i> created a custom <b>Your Release Radar</b> in your library.</p>
              <p><i><b>Detoxify</b></i> fixed the issue with seeing wrong artist releases from artists you didn&apos;t follow.</p>
              <p><i><b>Detoxify</b></i> looked at the last 3 albums and 3 singles released within the last month by each artist you follow to add to your playlist.</p>
              <p><i><b>Detoxify</b></i> included complete singles and album releases, as opposed to Release Radar&apos;s 30 track limit.</p>
            </div>
          </div>
        </section>
        <hr className='my-5'/>
        <div id='about' className='relative block -top-32'></div>
        <section className='py-10'>
          <h1 className='text-5xl font-bold text-center mb-5'>about</h1>
          <h3 className='text-2xl font-bold mb-5 text-center'>The issue with <i>Your Release Radar.</i></h3>
          <p>
            <i><b>Your Release Radar</b></i> is a wonderful source of new music for Spotify users, but it&apos;s been plagued with one key issue: incorrect artist suggestions.
            The issue ultimately lies in the fact that many artists around the world share the same name, and they end up being attributed as the wrong artist in their  track&apos;s
            metadata. Track submissions, being a manually approved workflow, result in errors like a rapper named Devo being marked as the 80s new wave Devo.
          </p>
          <p>
            I discovered others had encountered this same experience, so I spent some time in Spotify&apos;s community raising this issue and explaining my personal findings.
            When it became clear that there was no fix in sight, I decided to find a solution that used Spotify&apos;s very own Web API.
            I was able to develop a tool that not only filtered out the wrong artists I was being suggested, but also generated a larger playlist containing
            entire albums, instead of being limited to Release Radar&apos;s traditional ~30 some track count.
          </p>
          <p>
            Spotify personnel eventually gave an official explanation on how Release Radar functions, and why it was having the error it does. With that I&apos;ve decided to discontinue this web application.
            Even with its faults, Release Radar provides a good enough starting point, if you simply ignore the incorrectly tagged songs. I have other projects in my backlog,
            and I don&apos;t have the time to dedicate to keep this going.
          </p>
          <p>
            This was a wonderful learning experience, and maybe the site will make a return in another form or service in the future.
            Seeing monthly spikes ranging from 1k - 3k album API requests was a surreal experience for me as a developer.
            Thanks for those of you who used the app across the year.
          </p>
          <p>This isn&apos;t goodbye forever, just more of a &quot;see you later.&quot;</p>
        </section>
        <hr className='my-5'/>
        <div id='credits' className='relative block -top-32'></div>
        <section className='py-10'>
          <h1 className='text-5xl font-bold text-center mb-5'>credits</h1>
          <p>The original application was built with the following technologies/services/assets:</p>
          <ul className='credits-list'>
            <li>
              Laravel
              <ul>
                <li>GuzzleHTTP Client</li>
              </ul>
            </li>
            <li>
              Vue.js
              <ul>
                <li><a href="https://codepen.io/numerical/pen/yKMaaP" target='_blank' rel='noreferrer'>Vue.js + HTML 5 Audio Player</a> by Cameron at CodePen</li>
              </ul>
            </li>
            <li>
              Spotify API
              <ul>
                <li>
                  <span className='font-bold'>user-read-private</span>
                  <br />
                  <span className='italic text-sm'>Used to get your username, necessary to then save a playlist to your account.</span>
                </li>
                <li>
                  <span className='font-bold'>user-follow-read</span>
                  <br />
                  <span className='italic text-sm'>Used to find all the artists you are following.</span>
                </li>
                <li className='font-bold'>playlist-modify-public</li>
                <li>
                  <span className='font-bold'>playlist-modify-private</span>
                  <br />
                  <span className='italic text-sm'>Used to create and manage your &quot;Detoxed Release Radar&quot; playlist on your account, whether it&apos;s set to public or private.</span>
                </li>
                <li>
                  <span className='font-bold'>ugc-image-upload</span>
                  <br />
                  <span className='italic text-sm'>Needed to upload your &quot;Detoxed Release Radar&apos;s&quot; playlist cover image (You&apos;re free to change this image at any time).</span>
                </li>
              </ul>
            </li>
            <li>
              Bootstrap
              <ul>
                <li><a href="https://sharebootstrap.com/art-studio-minimal-studio-template/" target='_blank' rel='noreferrer'>Art Studio Minimal Portfolio Theme</a> by ShareBootstrap</li>
              </ul>
            </li>
            <li>Hamburger menu icon made by <a href="https://www.flaticon.com/authors/hirschwolf" target='_blank' rel='noreferrer'>hirschwolf</a> from <a href="https://www.flaticon.com/" target='_blank' rel='noreferrer'>www.flaticon.com</a></li>
            <li>Potion icon made by <a href="https://www.flaticon.com/authors/freepik" target='_blank' rel='noreferrer'>Freepik</a> from <a href="https://www.flaticon.com/" target='_blank' rel='noreferrer'>www.flaticon.com</a></li>
            <li><a href="https://www.pexels.com/photo/high-voltage-power-lines-against-mountains-in-sunset-4555345/" target='_blank' rel='noreferrer'>Playlist cover image</a> by <a href="https://www.pexels.com/@roman-odintsov" target='_blank' rel='noreferrer'></a> from <a href="https://www.pexels.com/" target='_blank' rel='noreferrer'>Pexels</a></li>
          </ul>
          <br />
          <p>The repo for the original application can be <a href="https://github.com/arcadechan/detoxify" target='_blank' rel='noreferrer'>found here.</a></p>
        </section>
        <hr className='my-5'/>
        <div id='contact' className='relative block -top-32'></div>
        <section className='py-10'>
          <h1 className='text-5xl font-bold text-center mb-5'>contact</h1>
          <div className='text-center mb-5'>
            <p>If you have any questions or feedback, please drop me a line!</p>
            <small>Fields marked with an asterisk(*) are required.</small>
          </div>
          <form id='contact-form' name='contact' method='POST' action='/success' data-netlify='true' netlify-honeypot='bot-field'>
            <p className='hidden'>Leave blank if you&apos;re human: <input name='bot-field'/></p>
            <input type='hidden' name='form-name' value='contact'/>
            <input type="text" id='fname' placeholder='Your name' name='name'/>
            <input type="email" id='email' placeholder='Enter email *' name='email' required='required'/>
            <textarea name="message" id="message" rows="5" placeholder='Enter your message *' required='required'></textarea>
            <div className='my-10 w-full md:w-1/3 mx-auto'>
              <button id='contact-form-submit' type='submit' className='btn-spotify w-full font-bold text-xl md:text-3xl'>Submit</button>
            </div>
          </form>
        </section>
        <hr className='my-5'/>
      </main>
      <Footer/>
    </>
  )
}
