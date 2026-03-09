'use client'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

export default function Page() {
    const [response, setBrc] = useState(null)
    const [key, setKey] = useState(null)
    const [syncLoading, setSyncLoading] = useState(false)
    const [syncResult, setSyncResult] = useState(null)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    useEffect(() => {
        const key = localStorage.getItem('key')
        if (key) {
            setKey(key)
        } else {
            setKey('no key')
        }
    }, [])

    function initKey({ key }) {
        localStorage.setItem('key', key)
        setKey(key)
    }

    function logout() {
        localStorage.removeItem('key')
        setKey(null)
    }

    async function syncReadme() {
        setSyncLoading(true)
        setSyncResult(null)
        try {
            const res = await fetch('/sync/readme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key || localStorage.getItem('key') || '' }),
            })
            const result = await res.json()
            setSyncResult(result)
        } catch (error) {
            setSyncResult({ error: error.message })
        } finally {
            setSyncLoading(false)
        }
    }

    const onSubmit = async data => {
        try {
            data.key = key || localStorage.getItem('key') || ''
            const res = await fetch('/set/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (res?.error) return {}
            const result = await res.json()
            return setBrc(result)
        } catch (error) {
            console.log({ error })
            return {}
        }
    }

    if (!key)
        return (
            <div>
                <main>
                    <h1>Authorizing...</h1>
                </main>
            </div>
        )
    if (key === 'no key')
        return (
            <div>
                <main>
                    <h1>BRC Short URL manager</h1>
                    <p>Admin only please add key</p>
                    <form onSubmit={handleSubmit(initKey)}>
                        <input defaultValue={''} {...register('key', { required: true })} />
                        {errors.key && <span>This field is required</span>}

                        <input type="submit" />
                    </form>
                </main>
            </div>
        )
    return (
        <div>
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

                <div style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
                    <h2>Sync from GitHub</h2>
                    <button
                        onClick={syncReadme}
                        disabled={syncLoading}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '1rem',
                            cursor: syncLoading ? 'not-allowed' : 'pointer',
                            opacity: syncLoading ? 0.6 : 1
                        }}
                    >
                        {syncLoading ? 'Scanning...' : 'Scan README.md'}
                    </button>

                    {syncResult && (
                        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: syncResult.error ? '#fee' : '#efe', borderRadius: '4px' }}>
                            {syncResult.error ? (
                                <p style={{ color: '#c00' }}>Error: {syncResult.error}</p>
                            ) : (
                                <>
                                    <p style={{ color: '#060' }}>
                                        ✓ Synced {syncResult.registered} mappings
                                        {syncResult.failed > 0 && ` (${syncResult.failed} failed)`}
                                    </p>
                                    {syncResult.failed > 0 && (
                                        <details>
                                            <summary>Failed mappings:</summary>
                                            <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                                                {JSON.stringify(syncResult.errors, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button onClick={logout}>Logout</button>
            </main>
        </div>
    )
}
