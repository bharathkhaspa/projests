# SnapScan 📸 — Receipt Scanner Mobile App

Point your phone at a receipt → an AI vision model reads it → you get a
**structured expense** (merchant, date, total, tax, category, line items) saved
to a local history. React Native (Expo) app + a small Node server that keeps
the API key safely off the device.

```
📱 Expo app ──photo (base64)──▶ Node/Express server ──▶ Claude vision
     ▲                                                    │ structured output
     └───────────── expense JSON ◀────────────────────────┘  (JSON schema-enforced)
```

**Why the schema matters:** the server uses the Claude API's structured
outputs (`output_config.format` with a strict JSON schema), so the app always
receives valid, typed JSON — amounts are numbers, category is one of 8 enums,
and non-receipt photos are flagged with `is_receipt: false` instead of
hallucinated data.

## 1. Run the server

```bash
cd snapscan/server
npm install
copy .env.example .env          # put your real ANTHROPIC_API_KEY in .env
npm start                       # listens on 0.0.0.0:3900
```

## 2. Run the mobile app

```bash
cd snapscan
npx create-expo-app@latest mobile-app --template blank-typescript
cd mobile-app
npx expo install expo-image-picker @react-native-async-storage/async-storage

# replace the generated App.tsx with ours:
copy ..\mobile\App.tsx App.tsx

npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (same Wi-Fi network).

**Important:** open `App.tsx` and set `SERVER_URL` to your computer's LAN IP
(run `ipconfig` and use the IPv4 address, e.g. `http://192.168.1.5:3900`) —
the phone cannot reach `localhost` on your PC.

## Demo tips (for showing clients)

- Crumpled, faded thermal receipts are the impressive demo — the model reads
  them anyway.
- Photograph a random object to show the `is_receipt: false` guardrail.
- The history tab shows this is an app, not a one-shot demo.

## Roadmap

- [ ] Monthly spend summary by category
- [ ] Export history as CSV
- [ ] Batch scan mode
