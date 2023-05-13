import Head from 'next/head'
import 'styles/global.css'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <Head>
                <title>BRC shortURLs</title>
                <meta name="description" content="Short URL manager for BRC repo" />
            </Head>
            <body>{children}</body>
        </html>
    )
}
