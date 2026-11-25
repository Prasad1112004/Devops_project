# Smart Logistics & Delivery Management System

A full-stack logistics management web application built with React, Node.js/Express, and MySQL.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Recharts + Leaflet + Lucide Icons
- **Backend:** Node.js + Express REST API
- **Database:** MySQL with connection pooling
- **Auth:** JWT + bcrypt

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### 1. Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE smart_logistics;"

# Run schema
mysql -u root -p smart_logistics < database/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # Edit DB credentials
npm install
node src/scripts/seed.js    # Seed demo data
npm run dev                 # Starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

## Demo Credentials (password: `Password123!`)

| Role     | Email                   |
|----------|-------------------------|
| Admin    | admin@logitrack.com     |
| Driver   | ravi@logitrack.com      |
| Customer | john@customer.com       |

## Features

- JWT Authentication with role-based access (Admin / Driver / Customer)
- Shipment management with unique tracking IDs
- Live tracking map with OpenStreetMap + Leaflet
- Analytics dashboard with Recharts
- Route optimization (nearest-neighbor algorithm)
- Notification center
- Dark / Light mode
- Mobile-first responsive design
