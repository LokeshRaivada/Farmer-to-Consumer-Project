# Farmer-to-Consumer Direct Market Platform

A full-stack MERN (MongoDB, Express, React, Node) application that connects farmers directly with consumers for fair pricing and fresh produce.

## 🚀 Key Features
- **Farmer Dashboard**: Product CRUD and real-time inventory tracking.
- **Consumer Marketplace**: Search, filter, and buy from nearby farms.
- **Admin Panel**: User analytics and price trend visualization (Chart.js).
- **Multi-language Support**: Seamless toggle between English and Telugu.
- **Premium Design**: Modern Glassmorphism UI with Slate/Emerald palette.
- **Location-Aware**: Shows farmers based on geographical distance.

## 🛠️ Tech Stack
- **Frontend**: Vite, React, Framer Motion, Lucide-React, Chart.js.
- **Backend**: Node.js, Express, Mongoose (MongoDB Atlas).
- **Auth**: JWT-based role authentication.

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (for MONGODB_URI)

### 2. Backend Setup
1. Open terminal and navigate to `backend/`.
2. Install dependencies: `npm install`.
3. Update `.env` with your **MONGODB_URI** and **JWT_SECRET**.
4. Seed the database (Optional, to populate sample data):
   ```bash
   node seed.js
   ```
5. Run server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open another terminal and navigate to `frontend/`.
2. Install dependencies: `npm install`.
3. Run development server:
   ```bash
   npm run dev
   ```
4. Access the platform at: `http://localhost:3000`

---

## 🏗️ Project Structure
```bash
Farmer Project/
├── backend/
│   ├── models/        # Mongoose Schema Definitions
│   ├── routes/        # Express API Endpoints
│   ├── middleware/    # Auth and Access Control
│   ├── seed.js        # Data Seeding Script
│   └── server.js      # Entry Point
└── frontend/
    ├── src/
    │   ├── context/   # Auth & Language Management
    │   ├── pages/     # Feature Pages (Dashboards, Store)
    │   ├── App.jsx    # Routing and Navigation
    │   └── index.css  # Premium Design Tokens
    └── vite.config.js # Proxy and Port Setup
```

## 🧪 Testing Credentials (after node seed.js)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@farmer.com | password123 |
| Farmer | farmer@farmer.com | password123 |
| Consumer | consumer@farmer.com | password123 |

Enjoy bridging the gap between farms and homes! 🌾🥕
