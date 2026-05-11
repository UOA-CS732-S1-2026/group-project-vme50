# Frontend

This frontend is built with React, TypeScript, and Vite.

## Requirements

- Node.js 20+
- npm

## Run the frontend

From the `frontend` directory:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Notes

- The frontend can start by itself for UI development.
- Login, register, and meal session features require the backend to be running.
- The backend is currently expected to run on `http://localhost:5050`.

## Common issue on macOS

If macOS blocks native modules in `node_modules`, run:

```bash
xattr -dr com.apple.quarantine node_modules
```
