# Business Profit Tracker - Frontend

React-based frontend for the Business Profit Tracking System with modern UI and 3D animations.

## Features

- ✅ Modern glassmorphic UI with 3D animated backgrounds
- ✅ JWT-based authentication with first-login password setup
- ✅ Real-time profit tracking dashboard
- ✅ Project and product management
- ✅ Two-step payment verification system
- ✅ Revenue tracking by project
- ✅ Payment due management
- ✅ Responsive design for all devices

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **@react-three/fiber** - 3D graphics with Three.js
- **Lucide React** - Icon library

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The app will start on `http://localhost:5173` (or next available port)

## Pages Overview

### Public Pages
- **Login** - User authentication
- **Setup Password** - First-time password change

### Main Pages
- **Dashboard** - Main hub with member cards and projects
- **Profile** - User profile and settings
- **Project Detail** - Detailed project view with products
- **Transactions** - Complete transaction history ledger

### Menu Pages (Hamburger menu in top right)
- **Revenue Verification** - Verify payments received from sellers
- **My Revenue** - View your 25% revenue share from each project
- **Payment Due** - Manage payments owed to other members

## Revenue Distribution Model

When a product is sold for ₹1000:
- **Seller receives**: ₹250 (25% immediately added to profit)
- **Seller owes**: ₹250 to each of the other 3 members
- **Each member receives**: ₹250 (after payment verification)

## Key Features

### 1. Revenue Verification
- View all active projects
- See products sold by other members
- Verify when you receive your 25% share
- Payment is added to your profit upon verification

### 2. My Revenue
- Track your revenue share from each project
- See breakdown of all sold products
- View only your 25% share (not total selling price)

### 3. Payment Due
- View products you sold in each project
- See payment obligations to each member
- Mark payments as paid when transferred
- Other members verify to clear your dues

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

