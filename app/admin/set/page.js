'use client'
import 'styles/global.css'
import Head from 'next/head'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

export default function Page() {
    const [response, setBrc] = useState(null)
    const [key, setKey] = useState(null)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        const key = localStorage.getItem('key')
        if (key) setKey(key)
    }, [])

    function initKey({ key }) {
        localStorage.setItem('key', key)
        setKey(key)
    }

    function logout() {
        localStorage.removeItem('key')
        setKey(null)
    }

    const onSubmit = async data => {
        try {
            data.key = key || localStorage.getItem('key') || ''
            const res = await fetch('/api/set/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (res?.error) return {}
            const result = await res.json()
            console.log({ result })
            return setBrc(result)
        } catch (error) {
            console.log({ error })
            return {}
        }
    }

    if (!key)
        return (
            <div>
                <Head>
                    <title>BRC shortURLs</title>
                    <meta name="description" content="Short URL manager for BRC repo" />
                </Head>
                <main>
                    <h1>BRC Short URL manager</h1>
                    <p>Admin only please add key</p>
                    <form onSubmit={handleSubmit(initKey)}>
                        <input
                            defaultValue={'6beb94782468b98a0ba1e84665dd14b0d18361c0610179b6cf93049943e50b84'}
                            {...register('key', { required: true })}
                        />
                        {errors.key && <span>This field is required</span>}

                        <input type="submit" />
                    </form>
                </main>
            </div>
        )
    return (
        <div>
            <Head>
                <title>BRC shortURLs</title>
                <meta name="description" content="Short URL manager for BRC repo" />
            </Head>
            <main>
                <h1>BRC Short URL manager</h1>
                <p>Add a short URL map here</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input defaultValue={0} type="number" {...register('brc', { required: true })} />
                    {errors.brc && <span>This field is required</span>}

                    <input defaultValue={'/path/within/gitbook'} {...register('path', { required: true })} />
                    {errors.path && <span>This field is required</span>}

                    <input type="submit" />

                    {response && (
                        <div>
                            <p>Short URL created</p>
                            <p>
                                <a href={'/' + response?.brc}>{`brc.dev/${response?.brc}`}</a>
                            </p>
                        </div>
                    )}
                </form>
                <button onClick={logout}>Logout</button>
            </main>
        </div>
    )
}
