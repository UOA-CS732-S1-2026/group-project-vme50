# PlateMates

PlateMates is a full-stack web application for University of Auckland students to create, browse, join, and leave shared meal sessions. The project was built for COMPSCI 732 and combines a React frontend with a Node.js, Express, and MongoDB backend.

<<<<<<< Updated upstream
Your team members are:
- Madhuja Chenthilraj _(mche257@aucklanduni.ac.nz)_
- Xiaoping Liu _(xilu128@aucklanduni.ac.nz)_
- Zhaofei Xu _(zxu783@aucklanduni.ac.nz)_
- Haowei Zheng _(hzhe889@aucklanduni.ac.nz)_
- Chenggong Ma _(cma736@aucklanduni.ac.nz)_
- Reign Naig _(enai775@aucklanduni.ac.nz)_
=======
![PlateMates logo](/Users/liuxiaoping/Documents/github-clones/Vme50.png)
>>>>>>> Stashed changes

## Team

- Madhuja Chenthilraj
- Xiaoping Liu
- Zhaofei Xu
- Haowei Zheng
- Chenggong Ma
- Reign Naig

<<<<<<< Updated upstream
![](./Vme50.png)
=======
## Core Features

- User registration and login for University of Auckland accounts
- JWT-based authentication and logout
- Create meal sessions
- View all available meal sessions
- Join and leave meal sessions
- Live meal slot updates with Socket.IO
- Location display with Leaflet maps

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router
- Leaflet / React Leaflet
- Socket.IO client

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO

## Repository Structure

```text
.
├── backend/     Express API, database models, services, tests
├── frontend/    React client application
├── docs/        Project documentation
├── .env.example Environment variable template
└── package.json Root scripts for linting, formatting, and CI
```

## Environment Setup

Use `.env.example` as the template for local development.

### Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/platemates
JWT_SECRET=change_this_to_a_random_string
```

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000
```

## Local Development

### 1. Install dependencies

From the frontend directory:

```bash
npm install
```

From the backend directory:

```bash
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running locally before starting the backend.

Example with Homebrew on macOS:

```bash
brew services start mongodb-community@8.0
```

### 3. Start the backend

```bash
cd backend
npm run dev
```

The backend starts on the configured `PORT`.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

By default, Vite serves the app at:

```text
http://localhost:5173
```

## API Overview

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Meal Sessions

- `GET /api/meals`
- `POST /api/meals/create`
- `POST /api/meals/:id/join`
- `POST /api/meals/:id/leave`

## Quality Checks

Run project-wide checks from the repository root.

### Lint frontend and backend

```bash
npm run lint
```

### Auto-fix formatting and lint issues

```bash
npm run fix
```

### CI-equivalent command

```bash
npm run ci
```

This runs:

- frontend lint
- backend lint
- backend tests

## Notes

- Do not commit real `.env` files.
- Frontend environment variables must start with `VITE_`.
- The backend currently expects MongoDB to be available before startup.
>>>>>>> Stashed changes
