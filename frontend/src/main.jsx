import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ProjectDetail from './pages/ProjectDetail'
import SetupPassword from './pages/SetupPassword'
import Transactions from './pages/Transactions'
import CurrentProjects from './pages/CurrentProjects'
import Revenue from './pages/Revenue'
import PaymentDue from './pages/PaymentDue'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/current-projects" element={<CurrentProjects />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/payment-due" element={<PaymentDue />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(107, 31, 31, 0.3)',
              backdropFilter: 'blur(10px)',
            },
          }} 
        />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
