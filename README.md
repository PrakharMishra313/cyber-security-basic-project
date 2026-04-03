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

Do **not** commit `.env` files. This repo is set up to ignore them.

