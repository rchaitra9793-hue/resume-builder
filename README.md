# AI Resume Builder

An AI Resume Builder is a web application that helps users create professional resumes quickly using AI-powered
suggestions and customizable templates.

React + Vite frontend (`client/`) and Node + Express + MongoDB backend (`server/`).
Free stack: MongoDB Atlas (database) · Render (backend) · Vercel (frontend) · Google Gemini free tier (AI).

## Run locally

Two terminals (MongoDB must be running locally):

```bash
cd server && npm install && npm run dev     # http://localhost:3000
cd client && npm install && npm run dev     # http://localhost:5173
```

`server/.env` is created from `server/.env.example`. Get a free Gemini key at https://aistudio.google.com/apikey.

---

## Deploy for free (public link that works on phones)

You will create 4 free accounts: GitHub, MongoDB Atlas, Render, Vercel. Do the steps in order.

### Step 1 - Put the code on GitHub

1. Create a new **empty** repository on https://github.com/new (e.g. `resume-builder`). Don't add a README.
2. In this project folder run:

```bash
git add .
git commit -m "Prepare AI Resume Builder for deployment"
git remote add origin https://github.com/<your-username>/resume-builder.git
git push -u origin main
```

`.env` files are in `.gitignore`, so your Gemini key and secrets are **not** uploaded.

### Step 2 - Free database (MongoDB Atlas)

1. Sign up at https://www.mongodb.com/cloud/atlas/register and create a **free M0** cluster.
2. **Database Access** -> Add user (username + password, role "Read and write to any database").
3. **Network Access** -> Add IP Address -> **Allow access from anywhere** (`0.0.0.0/0`). Render's IP changes, so this is required.
4. **Connect** -> Drivers -> copy the connection string and add the database name before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/resume-builder?retryWrites=true&w=majority`

### Step 3 - Backend on Render

1. Sign up at https://render.com with GitHub.
2. **New** -> **Blueprint** -> pick your repo. Render reads `render.yaml` and creates `resume-builder-api`.
   (Or **New -> Web Service**: Root Directory `server`, Build `npm ci`, Start `npm start`, Instance type **Free**.)
3. Fill in the environment variables it asks for:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas connection string from Step 2 |
   | `GEMINI_API_KEY` | your Gemini key |
   | `CLIENT_URL` | leave empty for now (filled in Step 5) |
   `JWT_SECRET` is generated automatically.
4. Deploy. Open `https://<your-service>.onrender.com/api/health` - it should show `{"ok":true}`.

### Step 4 - Frontend on Vercel

1. Sign up at https://vercel.com with GitHub -> **Add New** -> **Project** -> import your repo.
2. **Root Directory**: `client` (Framework: Vite is detected automatically).
3. **Environment Variables**: `VITE_API_URL` = `https://<your-service>.onrender.com` (no `/api`, no trailing slash).
4. Deploy. You get a URL like `https://resume-builder-xyz.vercel.app` - this is your public link.

### Step 5 - Lock the backend to your website

In Render -> your service -> **Environment**, set `CLIENT_URL` to your Vercel URL
(e.g. `https://resume-builder-xyz.vercel.app`, no trailing slash) and save. Render redeploys.
Add more URLs separated by commas if you add a custom domain.

### Step 6 - Open it on your phone

Open the Vercel URL on your phone, sign up, and build a resume. Share the link with anyone.
Use **Public** + **Share** in the builder to share a read-only link to a single resume.

---

## Android app (APK) - free, using PWABuilder

The site is an installable app (PWA): it has a manifest, app icons and a service worker. PWABuilder wraps it into an
Android APK that runs in Chrome, so every feature (AI, Download PDF, Share, Remove Background) works the same as the
website, and app updates happen automatically whenever you redeploy the site.

**You must finish the deployment steps above first** - the APK opens your live Vercel URL.

### Step A - Generate the APK

1. Go to https://www.pwabuilder.com and paste your Vercel URL (e.g. `https://resume-builder-xyz.vercel.app`) -> **Start**.
2. It shows a report card. Manifest and Service Worker should be green. Click **Package For Stores**.
3. Under **Android** click **Generate Package**. In the options:
   - **Package ID**: e.g. `app.vercel.resumebuilder` (lowercase, dots, must be unique; never change it later)
   - **App name**: Resume Builder · **Launcher name**: Resume Builder
   - **Signing key**: "Create new" (fill in your name/organization)
4. Click **Download Package**. You get a zip containing:
   - `*.apk` - install this on phones (share this file)
   - `*.aab` - only needed for the Google Play Store
   - `signing.keystore` + `signing-key-info.txt` - **keep these safe and private** (needed for future updates)
   - `assetlinks.json` - used in Step B

### Step B - Remove the browser address bar inside the app

1. Create the folder `client/public/.well-known/` and copy `assetlinks.json` from the zip into it.
2. `git add . && git commit -m "Add Android asset links" && git push` (Vercel redeploys).
3. Check `https://<your-vercel-url>/.well-known/assetlinks.json` shows the JSON.
4. Close and reopen the app on your phone - it now opens full screen like a normal app.

### Step C - Install and share the APK

- **Share**: upload the `.apk` to Google Drive (set "Anyone with the link") or a GitHub Release
  (GitHub repo -> Releases -> Draft a new release -> attach the .apk) and send the link on WhatsApp/email.
- **Install on a phone**: open the link, download the .apk, tap it. Android asks to allow
  **"Install unknown apps"** for Chrome/Files the first time - allow it, then tap **Install**.
  (Play Protect may show a warning for apps not from the Play Store - tap "Install anyway".)
- **No APK needed?** On Android Chrome, open the website -> menu (three dots) -> **Install app** / **Add to Home
  screen**. On iPhone Safari: Share -> **Add to Home Screen**.

### Updating the app

Just `git push` - Vercel redeploys and the installed app shows the new version. Only rebuild the APK in PWABuilder
if you change the app name, icon or package settings (use the same `signing.keystore` and Package ID).

---

## Good to know

- **Render free tier sleeps after 15 minutes idle.** The first visit after that takes ~30-60 seconds while it wakes
  up (the site pings the server as soon as it opens). After that it's fast.
- **Updates:** `git push` -> Render and Vercel redeploy automatically.
- **Changed `VITE_API_URL`?** Redeploy on Vercel (it's baked in at build time).
- **"Not allowed by CORS" errors:** `CLIENT_URL` on Render must exactly match the address in the browser bar.
- **Remove Background** runs on the visitor's device (uses the GPU when available). The first use downloads a ~44 MB model (use Wi-Fi on phones);
  it's slower on older phones.
- **Download PDF on phones:** the Download button opens the print dialog - choose "Save as PDF".
- **Free AI limits:** if the Gemini free quota is hit, the app asks you to wait a minute.

## API

| Method | Route | Auth |
|---|---|---|
| GET | /api/health | - |
| POST | /api/users/register, /api/users/login | - |
| GET | /api/users/data, /api/users/resumes | token |
| POST | /api/resumes/create | token |
| PUT | /api/resumes/update/:id | token |
| DELETE | /api/resumes/delete/:id | token |
| GET | /api/resumes/get/:id | token |
| GET | /api/resumes/public/:id | - (public resumes only) |
| POST | /api/ai/enhance-summary, /api/ai/enhance-job-desc, /api/ai/tailor | token |
