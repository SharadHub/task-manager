# TaskFlow — Full-Stack Productivity Dashboard

A complete task management and productivity tracking app built with **Next.js**, **Express**, **MongoDB**, and **Node.js**.

---

## Features

- ✅ **Task Management** — Create, edit, delete tasks with title, description, priority, labels, due date
- 📁 **Projects** — Organize tasks into color-coded projects with progress tracking
- ⏱ **Time Tracking** — Built-in per-task timer with live elapsed display
- 📊 **Dashboard** — Real-time overview: total/completed/in-progress/pending counts
- 📈 **Analytics** — 30-day trends, priority breakdown, label usage, time by project
- 🕐 **History** — Full task log grouped by date with timestamps
- 🔍 **Filters** — Search, filter by status/priority/project, sort multiple ways
- 🎯 **Productivity Insights** — Completion rate, weekly average, best day, average time/task

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| Charts | Recharts |
| Backend | Express.js + Node.js |
| Database | MongoDB + Mongoose |
| HTTP Client | Axios |

---

## Project Structure

```
taskflow/
├── server/                 # Express API
│   ├── index.js            # Entry point
│   ├── models/
│   │   ├── Task.js
│   │   └── Project.js
│   ├── routes/
│   │   ├── tasks.js
│   │   ├── projects.js
│   │   └── stats.js
│   └── package.json
│
└── client/                 # Next.js App
    ├── app/
    │   ├── layout.js
    │   ├── page.js
    │   └── globals.css
    ├── components/
    │   ├── Sidebar.js
    │   ├── Dashboard.js
    │   ├── TasksView.js
    │   ├── TaskCard.js
    │   ├── TaskModal.js
    │   ├── ProjectsView.js
    │   ├── HistoryView.js
    │   ├── AnalyticsView.js
    │   └── StatCard.js
    ├── lib/
    │   ├── api.js
    │   └── utils.js
    └── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & setup server

```bash
cd taskflow/server
cp .env.example .env
# Edit .env — set your MONGO_URI
npm install
npm start
# Server runs on http://localhost:5000
```

### 2. Setup client

```bash
cd taskflow/client
cp .env.local.example .env.local
# Edit .env.local if your server runs on a different port
npm install
npm run dev
# Client runs on http://localhost:3000
```

---

## API Reference

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (supports `?status=`, `?priority=`, `?project=`, `?search=`) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/timer/start` | Start time tracker |
| POST | `/api/tasks/:id/timer/stop` | Stop time tracker |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects with task counts |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/overview` | Total, completed, pending, time tracked |
| GET | `/api/stats/daily?days=14` | Daily completion trend |
| GET | `/api/stats/priority` | Priority breakdown |
| GET | `/api/stats/recent` | Recently completed tasks |
| GET | `/api/stats/labels` | Label usage counts |
| GET | `/api/stats/time-by-project` | Time tracked per project |

---

## Task Schema

```json
{
  "title": "string (required)",
  "description": "string",
  "status": "pending | in_progress | completed | archived",
  "priority": "low | medium | high | urgent",
  "labels": ["string"],
  "project": "ObjectId (ref: Project)",
  "timeSpent": "number (seconds)",
  "timerRunning": "boolean",
  "timerStartedAt": "Date",
  "startedAt": "Date",
  "completedAt": "Date",
  "dueDate": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Deployment Tips

- **MongoDB Atlas** — Replace `MONGO_URI` with your Atlas connection string
- **Vercel** (client) — Set `NEXT_PUBLIC_API_URL` to your deployed server URL  
- **Railway / Render** (server) — Set `MONGO_URI` and `PORT` env vars
- Enable CORS for your production domain in `server/index.js`

---

## Double-click to edit

On the Tasks view, **double-click any task card** to open the edit modal.
