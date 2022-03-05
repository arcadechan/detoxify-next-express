import Link from "next/link"
import { useState } from "react"

const navLinks = [
    { label: 'Home', href: '/#home' },
    { label: 'About', href: '/#about' },
    { label: 'Credits', href: '/#credits' },
    { label: 'Contact', href: '/#contact' }
]

const Header = () => {
    const [ active, setActive ] = useState(false)
    
    const handleClick = () => {
        setActive(!active)
    }

    return (
        <>
            <header className='py-4 sticky top-0 bg-dark-gray border-b border-light-black'>
                <div className='px-3 mx-auto max-w-screen-lg'>
                    <nav className='flex flex-wrap md:flex-nowrap text-center justify-between px-4 py-2 items-center'>
                        <Link href='/#home' passHref>
                            <a>
                                <img id='navbar-detoxify-logo' className='max-w-none' src="/detoxify.png" alt=""/>
                            </a>
                        </Link>
                        <button type='button' onClick={handleClick} className='md:hidden'>
                            <svg id='navbar-menu-icon'>
                                <use xlinkHref='/svg-sprites.svg#menu'></use>
                            </svg>
                        </button>
                        <div id='nav-links' className={`${ active ? '' : 'hidden' } md:flex mt-4 md:mt-0 basis-full`}>
                            <ul className='flex flex-col md:flex-row pl-0 mb-0 text-left'>
                                {navLinks.map((link, i) => {
                                    return (
                                        <li className='hover:bg-light-black' key={i}>
                                            <a href={ link.href } className='text-bold p-3 block' onClick={handleClick}>{ link.label }</a>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </nav>
                </div>
            </header>
        </>
    )
}

export default Header