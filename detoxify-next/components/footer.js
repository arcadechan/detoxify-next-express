const links = [
    { name: 'My Github', href: 'https://github.com/arcadechan', iconName: 'github.svg' },
    { name: 'My Spotify', href: 'https://open.spotify.com/user/arcadechan', iconName: 'spotify.svg' },
    { name: 'My Discord', href: 'https://discordapp.com/usrs/102697190526287872', iconName: 'discord.svg' },
]

const Footer = () => {
    return (
        <>
            <footer className='pt-4 pb-10'>
                <div className='flex justify-center md:justify-end items-center px-10 mx-auto max-w-screen-lg'>
                    {links.map( ( link, i ) => {
                        return (
                            <div className='px-3 inline-block' key={i}>
                                <a href={ link.href } title={ link.name } className='' target='_blank' rel='noreferrer'>
                                    <img src={`/${ link.iconName }`} alt={ link.name } className='h-8'/>
                                </a>
                            </div>
                        )
                    })}
                </div>
            </footer>
        </>
    )
}

export default Footer