# Live Polling System

A real-time polling application with chat functionality for teachers and students.

## Project Structure

```
livepolling/
├── frontend/          # React frontend application
│   ├── src/          # React components and logic
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── vite.config.js
├── backend/          # Node.js backend server
│   ├── index.js      # Socket.io server
│   └── package.json  # Backend dependencies
└── README.md
```

## Setup and Run

### Backend (Socket.io Server)
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5174

### Frontend (React App)
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:5173

## Features

- Real-time polling questions
- Live chat between teacher and students
- Student answer submission
- Live results display
- Role-based access (Teacher/Student)

## Usage

1. Start both backend and frontend servers
2. Open http://localhost:5173 in browser
3. Select Teacher or Student role
4. Use chat functionality via the chat bubble (💬)
5. Teachers can create polls, students can answer them