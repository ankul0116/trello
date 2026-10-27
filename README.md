# Trello-Style Project Management API

A REST API for a Trello-style task manager. Users create organizations, add members, and track issues on Kanban boards, with access control at the organization level.

Built with Node.js, Express and MongoDB.

> **Authorship:** the backend (everything in the root folder) is my own work. The React client in `frontend/` was generated with AI assistance as a demo UI for the API.

## Features

- Sign-up and sign-in with bcrypt password hashing and JWT authentication
- Organizations with one admin and any number of members
- Organization-level access control on every board and issue route
- Boards inside organizations, issues inside boards
- Issue workflow: `next_up` → `in_progress` → `done`
- Request validation with Zod
- Deleting an organization also deletes its boards and issues

## Tech stack

| Part | Technologies |
|---|---|
| Backend | Node.js, Express 5, MongoDB, Mongoose, jsonwebtoken, bcrypt, Zod, dotenv, cors |
| Frontend (demo client) | React, TypeScript, Vite, Tailwind CSS, Axios, React Router |

## How access control works

Every protected request passes through two middleware functions before it reaches its route handler:

```
request
  → authMiddleware   verifies the JWT from the `token` header and sets req.userId
  → orgAccess        loads the organization and checks that the user is its admin or a member
  → route handler    queries records scoped to that organization
```

Route handlers never look up a board or an issue by its ID alone. A board is found with `{ _id: boardId, orgId }`, and an issue with `{ _id: issueId, boardId }`. So even with valid IDs, a user can't read or change boards and issues that belong to an organization they aren't part of.

## Data model

| Collection | Fields |
|---|---|
| `users` | `username`, `email`, `password` (bcrypt hash) |
| `organizations` | `title`, `description`, `adminId` → user, `members` → [user] |
| `boards` | `title`, `orgId` → organization |
| `issues` | `title`, `boardId` → board, `status` (`next_up`, `in_progress`, `done`) |

## API reference

All routes except `/signup` and `/signin` require the header `token: <JWT>`. `organizationId` and `boardId` are sent in the JSON body, or in the query string for `GET` requests.

| Method | Route | Body / query | Who can call it |
|---|---|---|---|
| POST | `/signup` | `username`, `email`, `password` | anyone |
| POST | `/signin` | `username`, `password` | anyone; returns a JWT |
| POST | `/organization` | `title`, `description` (optional) | any signed-in user, who becomes the admin |
| GET | `/organization` | none | returns the organizations you administer |
| DELETE | `/organization` | `organizationId` | admin; also deletes its boards and issues |
| POST | `/member` | `organizationId`, `memberUserUsername` | admin or member |
| GET | `/member` | `organizationId` | admin |
| DELETE | `/member` | `organizationId`, `memberId` | admin |
| POST | `/board` | `organizationId`, `title` | admin or member |
| GET | `/board` | `organizationId` | admin or member |
| POST | `/issue` | `organizationId`, `boardId`, `title` | admin or member; new issues start as `next_up` |
| GET | `/issue` | `organizationId`, `boardId` | admin or member |
| PUT | `/issue` | `organizationId`, `boardId`, `issueId` | admin or member; moves the status one step forward |
| DELETE | `/issue` | `organizationId`, `boardId`, `issueId` | admin or member |

Example:

```bash
# Sign in as a seeded user and get a token
curl -X POST http://localhost:3000/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "ankul", "password": "Test@12345"}'

# Create a board (replace <JWT> and <organizationId>)
curl -X POST http://localhost:3000/board \
  -H "Content-Type: application/json" \
  -H "token: <JWT>" \
  -d '{"organizationId": "<organizationId>", "title": "Sprint 1"}'
```

## Running locally

Requirements: Node.js 18 or later, and a MongoDB database (MongoDB Atlas or a local instance).

```bash
git clone https://github.com/ankul0116/trello.git
cd trello
npm install
cp .env.example .env      # then fill in your own values
npm run dev:backend       # API at http://localhost:3000
```

Environment variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `PORT` | port for the API (defaults to 3000) |
| `JWT_SECRET` | secret used to sign tokens |
| `SALT_ROUNDS` | bcrypt cost factor (defaults to 10) |
| `MONGO_URL` | MongoDB connection string |

Sample data (optional; run once on an empty database):

```bash
node seed.js              # sample users and organizations (password: Test@12345)
node seedBoardsIssues.js  # sample boards and issues
```

Frontend (optional):

```bash
npm install --prefix frontend
npm run dev:frontend      # http://localhost:5173
```

The Vite dev server forwards requests from `/api` to the backend at `http://localhost:3000`.

## Project structure

```
index.js                 Express app and all routes
middleware.js            JWT authentication middleware
orgAccessMiddleware.js   organization membership check
models.js                Mongoose schemas and database connection
validation.js            Zod request schemas
seed.js                  sample users and organizations
seedBoardsIssues.js      sample boards and issues
frontend/                React demo client (AI-assisted)
```

## Known limitations

Things I would do differently today:

- All routes live in one large `index.js`. I'd split them into routes, controllers and services.
- Tokens never expire.
- Sign-in returns different errors for an unknown username and a wrong password, which reveals which usernames exist.
- The token is sent in a custom `token` header instead of the standard `Authorization: Bearer` header.
- Username uniqueness is checked in code only; there's no unique index in the database.
- Members can't list the organizations they belong to: `GET /organization` only returns the ones you administer.
- An issue's status can only move forward; there's no endpoint to move it back.
- There are no automated tests.

I'm applying these lessons in my current project, [RecallOS](https://github.com/ankul0116/personal-knowledge-engine).
