# Secure File Sharing + Cyber Tools

Full-stack project with:
- **Secure file upload/download** (password + expiry)
- A set of **cybersecurity utilities** (hashing, integrity, URL scan, malware heuristic, IP tracker, headers analyzer, subdomain scan, Shodan, etc.)

## Run locally

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment variables

Backend uses:
- `MONGO_URI` (MongoDB connection string)
- `VT_API_KEY` (optional)
- `SHODAN_API_KEY` (optional, required for Shodan tool)
- `FRONTEND_URL` (frontend origin used for secure download links and CORS-safe browser access)

Frontend uses:
- `VITE_API_URL` (full backend API base, for example `https://your-backend.onrender.com/api`)

## Deploy on Render

This repo is ready to deploy on Render with:
- one Node web service for `backend`
- one static site for `frontend`
- MongoDB hosted separately, such as MongoDB Atlas

### Option 1: Blueprint deploy

1. Push this repo to GitHub.
2. In Render, choose `New +` -> `Blueprint`.
3. Select this repository. Render will read [`render.yaml`](./render.yaml).
4. Create the services and fill in the env vars:
   - Backend:
     - `MONGO_URI`
     - `VT_API_KEY` if you want VirusTotal tools
     - `SHODAN_API_KEY` if you want Shodan tools
     - `FRONTEND_URL` = your frontend Render URL, for example `https://cyber-security-frontend.onrender.com`
   - Frontend:
     - `VITE_API_URL` = your backend API URL, for example `https://cyber-security-backend.onrender.com/api`

### Option 2: Manual deploy

Backend Render service:
- Type: `Web Service`
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`

Frontend Render service:
- Type: `Static Site`
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Rewrite rule: `/*` -> `/index.html`

### Important notes

- The backend will start without `MONGO_URI`, but upload/history features will not work until it is set.
- `FRONTEND_URL` should be the deployed frontend origin, without a trailing slash.
- `VITE_API_URL` should point to the backend `/api` base, not just the domain.
- If you change one Render URL after deploy, update the matching env var in the other service.

Do **not** commit `.env` files. This repo is set up to ignore them.

# cyber-security-basic-project
