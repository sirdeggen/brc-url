import { kv } from '@vercel/kv'

export default async function handler(req, res) {
    try {
        const { brc, path, key } = req.body
        if (key !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'key is invalid' })
        await kv.set(brc, path)
        return res.status(201).json({ brc, path })
    } catch (error) {
        console.log({ error })
        return res.status(500).end()
    }
}
