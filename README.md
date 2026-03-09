# BRC Short URL Service

A lightweight URL shortening service for BRC (Bitcoin Request for Comments) protocol mappings. This service allows you to register short numeric identifiers that redirect to longer URLs on the BSV blockchain documentation.

## Overview

This service provides two main API endpoints:

1. **Register Mappings** - Create new BRC short URL mappings (authenticated)
2. **Resolve Mappings** - Redirect from a BRC ID to the mapped URL

## API Endpoints

### Register a New URL Mapping

**Endpoint:** `POST /set/url`

**Description:** Creates a new mapping from a BRC ID to a URL path.

**Authentication:** Required - Include valid `key` in request body

**Request:**

```bash
curl -X POST https://brc.dev/set/url \
  -H "Content-Type: application/json" \
  -d '{
    "brc": 20,
    "path": "/specs/brc-20-tokens",
    "key": "YOUR_ADMIN_KEY"
  }'
```

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `brc` | number | Yes | The numeric BRC identifier (e.g., 20, 42, 100) |
| `path` | string | Yes | The URL path to redirect to (relative to https://bsv.brc.dev) |
| `key` | string | Yes | The admin authentication key |

**Success Response (200 OK):**

```json
{
  "brc": 20,
  "path": "/specs/brc-20-tokens"
}
```

**Error Response (400/401):**

```json
{
  "error": "key is invalid"
}
```

**Example - Node.js/JavaScript:**

```javascript
async function registerBrcMapping(brc, path, adminKey) {
  const response = await fetch('https://brc.dev/set/url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brc,
      path,
      key: adminKey
    })
  });

  if (!response.ok) {
    throw new Error('Failed to register mapping');
  }

  return response.json();
}

// Usage
registerBrcMapping(20, '/specs/brc-20-tokens', process.env.ADMIN_KEY)
  .then(result => console.log('Mapping created:', result))
  .catch(err => console.error('Error:', err));
```

**Example - Python:**

```python
import requests
import json

def register_brc_mapping(brc: int, path: str, admin_key: str):
    url = 'https://brc.dev/set/url'
    payload = {
        'brc': brc,
        'path': path,
        'key': admin_key
    }

    response = requests.post(url, json=payload)

    if response.status_code != 200:
        raise Exception(f"Registration failed: {response.json()}")

    return response.json()

# Usage
result = register_brc_mapping(20, '/specs/brc-20-tokens', 'your-admin-key')
print(f"Created mapping: {result}")
```

---

### Resolve a BRC Mapping

**Endpoint:** `GET /:brc`

**Description:** Redirects from a BRC ID to the mapped URL.

**Request:**

```bash
curl -L https://brc.dev/20
```

**Response:** HTTP 307 Temporary Redirect to `https://bsv.brc.dev{path}`

**Example:**
- Request: `GET https://brc.dev/20`
- Response: Redirects to `https://bsv.brc.dev/specs/brc-20-tokens`

---

## Authentication

The `POST /set/url` endpoint requires a valid admin key. The key must match the value of the `ADMIN_KEY` environment variable on the server.

**Important:** Always keep your admin key secure. Store it in environment variables or secrets management systems, never hardcode it in client-side code.

## Error Handling

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Invalid request | Malformed JSON or missing required fields |
| 401 | key is invalid | The provided admin key does not match the server key |
| 200 | Success | Mapping registered successfully |

## Usage for Bots

Bots can automatically register new BRC protocol mappings by making HTTP POST requests to the `/set/url` endpoint.

**Example Bot Implementation:**

```javascript
// Discord bot, GitHub bot, or any automated system
class BrcMappingBot {
  constructor(apiUrl, adminKey) {
    this.apiUrl = apiUrl;
    this.adminKey = adminKey;
  }

  async registerBrc(brcNumber, path) {
    try {
      const response = await fetch(`${this.apiUrl}/set/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brc: brcNumber,
          path: path,
          key: this.adminKey
        })
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Registered: https://brc.dev/${data.brc}`);
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
}

// Usage in a bot
const bot = new BrcMappingBot('https://brc.dev', process.env.ADMIN_KEY);
await bot.registerBrc(20, '/specs/brc-20-tokens');
```

## Development

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Running Locally

```bash
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```
ADMIN_KEY=your-secret-admin-key
```

### Building for Production

```bash
yarn build
yarn start
```

## Deployment

Deploy to [Vercel](https://vercel.com/) for free:

```bash
vercel
```

Make sure to set the `ADMIN_KEY` environment variable in your Vercel project settings.
