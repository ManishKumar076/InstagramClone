# Instagram Clone

A full-stack Instagram-style social app built with React, Vite, Redux Toolkit, Express, MongoDB, and Socket.IO.

## Features

- User signup, login, logout, and cookie-based authentication
- Profile view and profile editing with avatar upload
- Create, view, like, dislike, comment on, delete, and bookmark posts
- Suggested users and follow/unfollow flows
- Real-time chat with Socket.IO
- Protected frontend routes with persisted auth state

## Tech Stack

- Frontend: React 19, Vite, React Router, Redux Toolkit, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Realtime: Socket.IO
- Media uploads: Cloudinary + Multer
- Auth: JWT stored in HTTP-only cookies

## Project Structure

```text
frontend/
  src/
    components/
    hooks/
    redux/
    lib/

backend/
  controllers/
  middlewares/
  models/
  routes/
  socket/
  utils/
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
MONGO_URI=
LOCAL_MONGO_URI=mongodb://localhost:27017/instagram_clone
PORT=8000
SECRET_KEY=your_jwt_secret_here
CLOUD_NAME=
API_KEY=
API_SECRET=
FRONTEND_ORIGIN=http://localhost:5173
```

Optional frontend env:

```env
VITE_SOCKET_URL=http://localhost:8000
```

## Installation

Install dependencies in both apps:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Available Scripts

Backend:

- `npm run dev` - start the API server with nodemon
- `npm run seed` - seed sample data

Frontend:

- `npm run dev` - start the Vite dev server
- `npm run build` - create a production build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

## API Overview

User routes:

- `POST /api/v1/user/register`
- `POST /api/v1/user/login`
- `GET /api/v1/user/logout`
- `GET /api/v1/user/:id/profile`
- `POST /api/v1/user/profile/edit`
- `GET /api/v1/user/suggested`
- `POST /api/v1/user/followorunfollow/:id`

Post routes:

- `POST /api/v1/post/addpost`
- `GET /api/v1/post/all`
- `GET /api/v1/post/userpost/all`
- `POST /api/v1/post/:id/like`
- `POST /api/v1/post/:id/dislike`
- `POST /api/v1/post/:id/comment`
- `GET /api/v1/post/:id/comment/all`
- `DELETE /api/v1/post/delete/:id`
- `POST /api/v1/post/:id/bookmark`

Message routes:

- `POST /api/v1/message/send`
- `GET /api/v1/message/conversation/:id`

## Notes

- `backend/.env` is intentionally not committed.
- `node_modules` and frontend build output are ignored.
- For image uploads to work, configure valid Cloudinary credentials.

## Future Improvements

- Add stories/reels support
- Add notifications persistence
- Add tests for API and UI flows
- Add deployment guides for frontend and backend
