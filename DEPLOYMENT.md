# 🚀 SafeRoute AI — Deployment Guide

Step-by-step instructions to deploy the full project online. Two options are covered:

| Option | What You Get | Cost | Difficulty |
|---|---|---|---|
| **A. Render (one container, one URL)** ⭐ Recommended | Frontend + backend on a single URL | Free | Easiest |
| **B. Vercel (frontend) + Render (backend)** | Split deployment, faster frontend CDN | Free | Medium |

---

## Option A — One-Click Deploy to Render (Recommended)

Your repo already contains everything needed: `Dockerfile` (builds the React app and serves it through FastAPI) and `render.yaml` (Render Blueprint).

### Step 1 — Make sure your code is on GitHub

All the latest code is already pushed to `https://github.com/HexaCipher/team_042` (branch `main`). ✅

### Step 2 — Create a free Render account

1. Go to **https://dashboard.render.com**
2. Click **Sign in with GitHub** and authorise Render.
3. Allow Render access to the `HexaCipher/team_042` repository.

### Step 3 — Deploy using the Blueprint

1. On the Render dashboard, click **New +** → **Blueprint**.
2. Select the repository **HexaCipher/team_042**.
3. Render will automatically detect `render.yaml` and show a service called **saferoute-ai** (Docker environment, free plan, Oregon region).
4. Click **Apply** (or **New Service** → **Create Service**).
5. Render now builds the image — this takes **8–15 minutes** the first time (it installs Python libraries and builds the React app).

### Step 4 — Verify the deployment

1. When the build finishes, Render shows the status **Live** and gives you a URL like:
   `https://saferoute-ai.onrender.com`
2. Open these in a browser to verify:
   - `https://saferoute-ai.onrender.com/health` → should return `"status": "healthy"` and `"total_segments": 428`
   - `https://saferoute-ai.onrender.com/` → the SafeRoute AI dashboard with the live map
   - `https://saferoute-ai.onrender.com/docs` → interactive API documentation

### Step 5 — Test the app

- Click a **red road section** on the map → the inspector panel opens.
- Try the **What-If Simulator** → add "street lighting" → the score improves.
- Open **Fix This First** → the ranked priority list appears.

Done — the whole project is now live on one URL. 🎉

### Render specifics worth knowing

- **Free plan cold starts:** after ~15 minutes of inactivity the service sleeps; the first request then takes ~50 seconds to wake it up. Open the `/health` URL first to warm it up before a demo.
- **Ephemeral disk:** the free plan does not keep files between restarts, so the SQLite database (used by the Action Tracker) resets on every redeploy. Map data and safety scores are **not** affected — they are loaded from files baked into the image. For persistent Action-Tracker data, upgrade the plan or attach a Render Disk.
- **Automatic redeploys:** every push to `main` on GitHub triggers a new deployment automatically.

---

## Option B — Frontend on Vercel + Backend on Render

Use this if you want the dashboard to load faster worldwide (Vercel's CDN).

### Part 1 — Deploy the backend on Render

1. Render dashboard → **New +** → **Web Service**.
2. Select the **HexaCipher/team_042** repository.
3. Fill in:
   - **Name:** `saferoute-api`
   - **Runtime:** Docker
   - **Dockerfile path:** `Dockerfile`
   - **Instance type:** Free
   - **Health check path:** `/health`
4. Click **Create Web Service** and wait for the build (8–15 min).
5. Note your backend URL, e.g. `https://saferoute-api.onrender.com`.

> ⚠️ When using this split option, the same `Dockerfile` works as-is: the SPA mount in `backend/main.py` is conditional and only activates if built frontend assets exist inside the container — the API works standalone either way.

### Part 2 — Deploy the frontend on Vercel

1. Go to **https://vercel.com** → **Sign in with GitHub**.
2. Click **Add New…** → **Project** → import **HexaCipher/team_042**.
3. Before deploying, configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (default)
   - **Environment Variables:** add
     ```
     VITE_API_BASE_URL = https://saferoute-api.onrender.com/api/v1
     ```
     (use your actual Render backend URL from Part 1)
4. Click **Deploy** (takes 2–4 minutes).
5. Vercel gives you a URL like `https://team-042.vercel.app` — open it and verify the map loads data from the Render backend.

> ✅ **CORS is already handled** — the backend accepts any `https://` origin (`allow_origin_regex=r"https?://.*"` in `backend/main.py`), so the Vercel frontend can talk to the Render backend with no extra configuration.

---

## Optional — Test the Container Locally First

Docker is installed on this machine, so you can replicate the exact cloud build before deploying:

```bash
# 1. Build the image (first run: 8–15 minutes)
docker build -t saferoute-ai .

# 2. Run the container
docker run --rm -p 8000:8000 saferoute-ai

# 3. Verify in a browser
#    http://localhost:8000/health  and  http://localhost:8000/
```

If both URLs work locally, the Render deployment will work too — it runs this same image.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `/health` shows `"total_segments": 0` | Data artifacts missing | Ensure `backend/data/processed/` files are committed and pushed |
| Dashboard loads but shows **offline** banner | Backend not running / wrong URL | Check the Render service is **Live**; verify `VITE_API_BASE_URL` (Option B) |
| `npm ci` fails during Docker build | Lockfile out of sync | Run `npm install` locally, commit updated `package-lock.json`, push |
| First request very slow | Free-plan cold start | Normal on Render free — wait ~50 s, or open `/health` first |
| Action Tracker items disappear | Ephemeral disk on free plan | Re-run seed or upgrade plan / attach a disk |
| Build timeout / out of memory | Heavy first build | Retry the deploy; Render caches layers after the first success |

---

## Deployed? Add the Live URL to Your Submission

Once live, paste your deployment URL (Option A: `https://saferoute-ai.onrender.com`, or the Vercel URL from Option B) into the hackathon submission form alongside the documentation PDF.

