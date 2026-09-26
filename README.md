# MedRisk Lite

FMEA (Failure Mode and Effects Analysis) tool for a portable ultrasound probe, with an ESP32 hardware prototype feeding live sensor data (temperature + moisture) into the app.

- `app/` — Expo (React Native Web) frontend
- `server/` — Express + Prisma backend (Postgres/Neon)
- `hardware/` — ESP32 firmware (PlatformIO) for the temperature/moisture sensor prototype

## Setup

### 1. Environment files

Neither `app/.env` nor `server/.env` is committed (they hold real secrets). Copy the examples and fill in the real values — get these from whoever has them (Vignesh):

```
cp app/.env.example app/.env
cp server/.env.example server/.env
```

You need:
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (app/.env) and `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` (server/.env) — from the Clerk dashboard
- `DATABASE_URL` (server/.env) — the Neon Postgres connection string
- `HARDWARE_DEVICE_KEY` / `HARDWARE_WORKSPACE_ID` (server/.env) — for the ESP32 integration
- `GROQ_API_KEY` (server/.env, optional) — powers the AI features; app works without it (falls back to rule-based logic)

If Clerk auth isn't fully working yet, you can bypass it for local dev:
```
# app/.env
EXPO_PUBLIC_BYPASS_AUTH=true
# server/.env
BYPASS_AUTH=true
```
This treats every request as one fixed dev user — **do not use in production.**

### 2. Install and run

```
cd server && npm install && npm run dev      # backend on http://localhost:4000
cd app && npm install && npm run web         # frontend on http://localhost:8082
```

Open **http://localhost:8082**.

### 3. Hardware (ESP32)

See `hardware/src/main.cpp`. Before flashing, fill in at the top of the file:
- `WIFI_SSID` / `WIFI_PASSWORD` — must be a **2.4GHz** network (ESP32 can't join 5GHz-only networks)
- `SERVER_HOST` — the LAN IP of the machine running `server/` (run `ipconfig`, use the IPv4 address of your active adapter)
- `DEVICE_KEY` — must match `HARDWARE_DEVICE_KEY` in `server/.env` exactly

Build/flash with [PlatformIO](https://platformio.org/):
```
cd hardware
pio run -t upload
pio device monitor
```

The ESP32 posts readings every 5s to `POST /api/hardware/reading` (device-key authenticated). The app's Dashboard screen polls `GET /api/hardware/readings/latest` every 15s and shows them in the "Hardware" card.
