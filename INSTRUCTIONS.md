# Project Setup & Running Instructions

Your project has been upgraded to a Full Stack application (MERN Stack).

## 1. Backend Server
The backend runs on **port 5000** and connects to a specific local MongoDB database (`shopease`).

- **Location**: `backend/`
- **Status**: Currently running in the background.
- **Manual Start**:
  ```bash
  cd backend
  npm run dev
  ```
- **Seeding Data**: To reset/populate the database with dummy data:
  ```bash
  npm run seed
  ```

## 2. Frontend Application
The frontend runs on **port 8080** and proxies API requests to the backend.

- **Location**: `frontend/`
- **Status**: You should **RESTART** your frontend server to apply the new proxy configuration.
- **Manual Start**:
  ```bash
  cd frontend
  npm run dev
  ```

## 3. verify
1. Ensure MongoDB is running locally.
2. Check `backend/.env` if you need to change the database URI.
3. Open the app in your browser. Data is now fetched from the database!
