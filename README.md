# PlateMates

PlateMates is a full-stack web application for University of Auckland students to create, browse, join, and leave shared meal sessions. The project was built for COMPSCI 732 and combines a React frontend with a Node.js, Express, and MongoDB backend.

## Team

- Madhuja Chenthilraj _(mche257@aucklanduni.ac.nz)_
- Xiaoping Liu _(xilu128@aucklanduni.ac.nz)_
- Zhaofei Xu _(zxu783@aucklanduni.ac.nz)_
- Haowei Zheng _(hzhe889@aucklanduni.ac.nz)_
- Chenggong Ma _(cma736@aucklanduni.ac.nz)_
- Reign Naig _(enai775@aucklanduni.ac.nz)_

![](./Vme50.png)

## Core Features

- User registration and login for University of Auckland accounts
- JWT-based authentication and logout
- Create meal sessions
- View available meal sessions
- Join and leave meal sessions
- Profile editing
- Location display with Leaflet maps

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Leaflet / React Leaflet

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt

## Local Development

### Backend

Create `backend/.env`:

```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/platemates
JWT_SECRET=change_this_to_a_random_string
```

Start the backend:

```bash
cd backend
npm install
npm run dev
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5050
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

By default, Vite serves the app at [http://localhost:5173](http://localhost:5173).

## CI / Quality Checks

Run these from the project root before pushing:

```bash
npm run fix
npm run ci
```

These checks cover formatting, linting, and automated tests.

## Notes

- Do not commit real `.env` files.
- Frontend environment variables must start with `VITE_`.
- MongoDB must be running before the backend starts.
