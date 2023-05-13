export const metadata = {
  title: 'BRC URL shortener',
  description: 'Admin panel for BRC URL shortener',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
