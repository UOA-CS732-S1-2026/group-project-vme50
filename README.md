# Platemates

Platemates is a web application designed to help University of Auckland students connect through shared meal experiences. The application allows students to create, browse, join, and manage meal sessions with other students, making it easier to socialise, discover food spots, and reduce the cost of eating out.

The project was developed as part of **COMPSCI 732**.

---

# Team Members

- Madhuja Chenthilraj _(mche257@aucklanduni.ac.nz)_
- Xiaoping Liu _(xilu128@aucklanduni.ac.nz)_
- Zhaofei Xu _(zxu783@aucklanduni.ac.nz)_
- Haowei Zheng _(hzhe889@aucklanduni.ac.nz)_
- Chenggong Ma _(cma736@aucklanduni.ac.nz)_
- Reign Naig _(enai775@aucklanduni.ac.nz)_

---

# Table of Contents

- [Project Overview](#project-overview)
- [Motivation](#motivation)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [How to Run the Project](#how-to-run-the-project)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Project Management](#project-management)
- [Future Enhancements](#future-enhancements)

---

# Project Overview

Platemates is a student-focused meal coordination platform designed specifically for University of Auckland students. The platform enables students to create meal invitations, join meal sessions, and connect with other students through shared dining experiences.

The application focuses on solving common student challenges such as:

- Difficulty meeting new people
- Eating alone frequently
- High food costs
- Lack of structured social meal coordination
- Difficulty finding affordable group dining opportunities

Rather than functioning purely as a food discovery or delivery application, Platemates combines social interaction with practical meal planning.

Example meal session:

> “Going to Dominion Road for noodles at 7PM — looking for 3 more people to share dishes with.”

Other students can browse active sessions and join if interested.

---

# Motivation

Many students, especially international students, experience challenges adapting to a new city and social environment. Students often struggle to meet new people, organise social outings, or reduce the cost of eating out.

Large restaurant portions and shared dining culture are common in many Auckland restaurants, but students may not always have a group available to share meals with.

Platemates aims to create a simple and accessible platform that helps students:

- Meet new people
- Organise spontaneous meal plans
- Share food costs
- Explore restaurants together
- Build social connections through dining

---

# Features

## Authentication & Authorization

- User registration
- User login/logout
- JWT-based authentication
- Protected routes
- University of Auckland student email validation

---

## Meal Sessions

- Create meal sessions
- Join meal sessions
- Leave meal sessions
- View all active meal sessions
- Participant limit handling
- Restriction to one active joined meal

---

## Dashboard

- Active meal session dashboard
- Meal details display
- Session owner information
- Dynamic participant updates
- Full session indication

---

## User Profile Feature

Users can personalise and edit their profile.

Profile includes:

- Name
- Email
- Course
- Bio / About Me section
- Interests
- Avatar colour customisation

---

## My Meals Section

Users can view meals they have joined separately from the main dashboard.

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

---

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

---

## Database

- MongoDB

---

## Tools & Collaboration

- GitHub
- GitHub Issues
- GitHub Projects
- GitHub Wiki
- Discord
- WhatsApp
- Google Docs
- Vercel

---

# Project Structure

```text
group-project-vme50/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── server.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   └── TESTING.md
│
├── README.md
└── .env.example
```

---

# How to Run the Project

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB Community Server OR MongoDB Atlas
- Git

---

## Clone the Repository

```bash
git clone <repository-url>
cd group-project-vme50
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

---

# Environment Variables

Environment variables are required for both the frontend and backend.

Please refer to the `.env.example` file included in the repository for the required environment variables and setup instructions.

Important:
- Never commit real `.env` files to GitHub.
- Keep secrets and database credentials private.
---

# Running the Application

## Start Backend

From the `backend` folder:

```bash
npm run dev
```
---

## Start Frontend

From the `frontend` folder:

```bash
npm run dev
```
---

# Testing

Testing was conducted manually across all core workflows.

Tested features include:

- User registration
- Login/logout
- Invalid credential handling
- UOA email validation
- Meal session creation
- Joining/leaving meals
- Participant count updates
- Full session handling
- Profile editing
- Avatar colour updates
- Frontend-backend integration
- Protected route handling

Detailed testing documentation can be found in:

```text
docs/TESTING.md
```

---

# Git Workflow

The project used a branch-based Git workflow.

Typical workflow:

```bash
git checkout main
git pull origin main
git checkout -b feature/feature-name
```

After making changes:

```bash
git status
git add .
git commit -m "Meaningful commit message"
git push -u origin feature/feature-name
```

Pull Requests were then created for review and merging into `main`.

---

# Project Management

The team used:

- GitHub Issues
- GitHub Projects
- GitHub Wiki
- Discord
- WhatsApp
- Google Docs

to manage tasks, communication, documentation, and project progress.

Regular meetings were conducted throughout the semester to discuss implementation progress, blockers, integration, testing, and project improvements.

---

# Future Enhancements

Possible future improvements include:

- Restaurant partnership portal
- Restaurant promotions and discounts
- Real-time notifications
- Friends system
- Student rewards/points system
- Vibe rating system
- Group chat functionality
- Meal recommendations

---

# Notes

This project was developed for academic purposes as part of COMPSCI 732.

Real `.env` files and secrets should never be committed to GitHub.