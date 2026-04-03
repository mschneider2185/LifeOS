# Notion Integration Setup Guide

Follow these steps to connect LifeOS to your Notion workspace.

---

## Step 1 — Create a Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Name it **"LifeOS App"**
4. Select the workspace where your LifeOS databases live
5. Under **Capabilities**, ensure it has:
   - **Read content** ✓
   - **Update content** ✓
   - **Insert content** ✓
6. Click **Submit**
7. Copy the **Internal Integration Secret** (starts with `ntn_`)

## Step 2 — Add the API Key to Your Environment

1. Open `.env.local` in the project root
2. Set the key:
   ```
   NOTION_API_KEY=ntn_your_secret_here
   ```

## Step 3 — Share Each Database with the Integration

For each database listed below, you need to grant access:

1. Open the database in Notion
2. Click the **"..."** menu (top-right)
3. Go to **Connections** → **Add connections**
4. Search for **"LifeOS App"** and select it

### Databases to Connect

| Database       | ID                                 | Purpose                        |
|----------------|------------------------------------|--------------------------------|
| Check-ins      | `be279e07e4494391936c8134f0d053d4` | Daily 30-second check-ins      |
| Goals          | `17f3f35170e04ce2911fcb76182ba62f` | Goals with consequence framing |
| Projects       | `7254b157403c4640acae675505cc409d` | Project tracker with WIP limits|
| Tasks          | `2d3e7ce2e2a080329387eddaa6263ee3` | Task management                |
| Health         | `4e8edb28aaaf4486890d5245731f0db2` | Health & wellness tracking     |

### Pages to Connect

| Page           | ID                                 | Purpose                        |
|----------------|------------------------------------|--------------------------------|
| Brain Dump     | `331e7ce2e2a0814c94eef2d3a18a8a87` | Zero-friction brain dump zone  |

## Step 4 — Verify the Connection

After setting up, run the dev server and test:

```bash
npm run dev
```

The Notion API routes (`app/api/notion/`) will use the `NOTION_API_KEY` to authenticate. If you see 401 errors, double-check:

1. The API key in `.env.local` is correct
2. Each database/page has the "LifeOS App" connection added
3. The integration has read/update/insert capabilities

## Troubleshooting

- **"Could not find database"** — The database hasn't been shared with the integration. Open it in Notion and add the connection.
- **"API token is invalid"** — Regenerate the token at notion.so/my-integrations and update `.env.local`.
- **"Unauthorized"** — Make sure you're using the Internal Integration Secret, not the OAuth client secret.
