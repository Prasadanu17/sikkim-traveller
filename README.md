# 🏔️ Sikkim Traveller

Sikkim Traveller is a full-stack web application designed for travel planning, permits, itinerary generation, and operations management for travel in Sikkim.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide React, React Router v7.
- **Backend**: Express.js, Node.js (ES Modules), Zod, Helmet, Winston Logger.
- **Database & Services**: Prisma ORM (with built-in simulated in-memory database fallback for rapid development without local PostgreSQL requirements), Supabase, Razorpay integration, Open-Meteo API.

---

## 📋 Prerequisites

Before running the application, ensure you have installed:
- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher

---

## ⚙️ Environment Configuration

### 1. Frontend Configuration (`.env`)
Copy `.env.example` to `.env` in the root folder (optional):
```bash
cp .env.example .env
```
Default mode runs in **Mock Mode** (`VITE_CUSTOMER_API_MOCK_MODE=true`), allowing you to test UI features seamlessly without needing a live backend connection. Set mock toggles to `false` when connecting to the local backend server.

### 2. Backend Configuration (`backend/.env`)
The backend is pre-configured with a `.env` file (`backend/.env`). 
> **Note**: If a live PostgreSQL database URL is not provided or valid, the backend automatically falls back to an **In-Memory Simulated Database** so all API routes remain fully functional for local development.

---

## 🚀 How to Run the Project

You can run both the **Backend** and **Frontend** concurrently in separate terminal windows.

### 1️⃣ Step 1: Install Dependencies

**Install Frontend Dependencies (Root Directory):**
```bash
npm install
```

**Install Backend Dependencies (`backend` Directory):**
```bash
cd backend
npm install
cd ..
```

---

### 2️⃣ Step 2: Start the Backend API Server

Open a terminal window and execute:

```bash
cd backend
npm run dev
```

- The API server will start on **`http://localhost:3001`**.
- Health check available at: `http://localhost:3001/health`

---

### 3️⃣ Step 3: Start the Frontend Dev Server

Open a second terminal window (in the project root) and execute:

```bash
npm run dev
```

- The Vite frontend server will start at **`http://localhost:5173`** (or **`http://localhost:5174`** if 5173 is in use).
- Open the URL in your browser to interact with the application.

---

## 📜 Available NPM Scripts

### Frontend Scripts (Root Directory)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Build production-ready bundle to `/dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run Oxlint linter checks |

### Backend Scripts (`/backend` Directory)
| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server with `nodemon` auto-reload |
| `npm start` | Run production server with `node` |
| `npm test` | Run test suite with `vitest` |
| `npm run db:generate` | Generate Prisma client artifacts |
| `npm run db:migrate` | Run database migrations (Dev) |
| `npm run db:seed` | Seed database with initial data |

---

## 🧪 Verifying the Setup

1. **Verify Backend Health**:
   ```bash
   curl http://localhost:3001/health
   # Expected Output: {"status":"HEALTHY","timestamp":"..."}
   ```

2. **Verify Frontend**:
   Navigate to `http://localhost:5173` (or `http://localhost:5174`) in your web browser.
