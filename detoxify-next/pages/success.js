import Head from "next/head"
import Link from "next/link"
import { Footer, Header } from "../components"

export default function Success() {
    return (
        <>
            <Head>
                <title>detoxify - form submitted!</title>
                <meta name="description" content='detoxify - A tool for generating a custom Spotify "Release Radar" playlist'/>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header/>
            <main className='mx-auto px-10 max-w-screen-lg'>
                <section className='py-10 text-center'>
                    <h1 className='text-5xl font-bold mt-5 mb-10'>Thanks for your form submission!</h1>
                    <Link href='/#home' passHref>
                        <a>
                            <button className='btn-spotify w-full md:w-1/3 font-bold text-xl md:text-3xl'>Go Back</button>
                        </a>
                    </Link>
                </section>
                <hr className='my-5'/>
            </main>
            <Footer/>
        </>
    )
}