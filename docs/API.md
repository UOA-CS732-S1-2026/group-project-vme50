# Platemates API Reference

This file summarizes the current backend API for Platemates in table form.

## Auth APIs

| Method | Path | Purpose | Auth Required | Request Body | Typical Response |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No | `name`, `email`, `password` | `token`, `user` |
| `POST` | `/api/auth/login` | Log in a user | No | `email`, `password` | `token`, `user` |
| `POST` | `/api/auth/logout` | Log out the current user | Yes | None | `message` |
| `GET` | `/api/auth/me` | Get the current user profile | Yes | None | `user` |
| `PATCH` | `/api/auth/profile` | Update the current user profile | Yes | `name`, `bio`, `favoriteCuisine`, `yearOfStudy`, `avatarColor` | `message`, `user` |

## Meal Session APIs

| Method | Path | Purpose | Auth Required | Request Body | Typical Response |
|---|---|---|---|---|---|
| `GET` | `/api/meal` | Get all active meal sessions | No | None | `MealSession[]` |
| `GET` | `/api/meal/:id` | Get one meal session by ID | No | None | `session` |
| `POST` | `/api/meal/create` | Create a new meal session | Yes | `title`, `description`, `location`, `time`, `slots` | `session` |
| `POST` | `/api/meal/:id/join` | Join a meal session | Yes | None | `message`, `session` |
| `POST` | `/api/meal/:id/leave` | Leave a meal session | Yes | None | `message`, `session` |
| `POST` | `/api/meal/:id/close` | Close a meal session as the host | Yes | None | `message`, `session` |
| `GET` | `/api/meal/mine/hosting` | Get sessions hosted by the current user | Yes | None | `sessions` |
| `GET` | `/api/meal/mine/joined` | Get sessions joined by the current user | Yes | None | `sessions` |

## Developer and Utility APIs

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/` | Backend root route | Simple server status text |
| `GET` | `/api/test` | Backend health test | Used for quick backend checks |
| `GET` | `/api` | API index | Utility endpoint |
| `GET` | `/api/meta/endpoints` | API catalog | Developer-facing metadata |

## Reserved Placeholder APIs

These endpoints are reserved so the team can extend the platform later without pretending unfinished frontend features are fully implemented.

| Method | Path | Purpose | Status |
|---|---|---|---|
| `GET` | `/api/platform/notifications` | Notifications module | Placeholder |
| `GET` | `/api/platform/restaurants` | Restaurant module | Placeholder |
| `GET` | `/api/platform/history` | Session history module | Placeholder |
| `GET` | `/api/platform/rewards` | Rewards module | Placeholder |

## Frontend Page to API Mapping

| Page | APIs Used |
|---|---|
| `Login` | `/api/auth/login` |
| `Register` | `/api/auth/register` |
| `Dashboard` | `/api/meal`, `/api/meal/:id/join`, `/api/meal/:id/leave` |
| `Session Details` | `/api/meal/:id`, `/api/meal/:id/join`, `/api/meal/:id/leave`, `/api/meal/:id/close` |
| `Create Session` | `/api/meal/create` |
| `Profile` | `/api/auth/me`, `/api/auth/profile`, `/api/meal/mine/hosting`, `/api/meal/mine/joined` |
| `Logout` | `/api/auth/logout` |

## Notes

| Topic | Details |
|---|---|
| Auth header | Protected endpoints require `Authorization: Bearer <token>` |
| Response format | Some endpoints return a top-level `session`, some return `user`, and some return arrays |
| Placeholder endpoints | Keep them documented, but do not treat them as finished product features |
| Frontend rule | Only fully interactive UI should rely on real implemented APIs |
