import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import { useAuth } from './contexts/AuthContext';
import JobListings from './pages/JobListings';
import ShareExperience from './pages/ShareExperience';
import Blog from './pages/Blog';
import About from './pages/About';
import Debug from './pages/Debug';
import FloatingHomeButton from './components/FloatingHomeButton';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Companies from './pages/Companies';
import CompanyProfile from './pages/CompanyProfile';
import EmployerDashboard from './pages/EmployerDashboard';
import SkillAssessment from './pages/SkillAssessment';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/admin/login" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminLogin />
              <FloatingHomeButton />
            </motion.div>
          } />
          <Route path="/admin" element={
            user?.email === 'admin@work4all.com' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <AdminDashboard />
                <FloatingHomeButton />
              </motion.div>
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } />
          <Route path="/register" element={
            <Register />
          } />
          <Route path="/login" element={
            <Login />
          } />
          <Route path="/dashboard" element={
            user ? <Dashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/employer" element={
            user ? <EmployerDashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/profile" element={
            user ? <Profile /> : <Navigate to="/login" replace />
          } />
          <Route path="/jobs" element={
            <>
              <JobListings />
              <FloatingHomeButton />
            </>
          } />
          <Route path="/companies" element={
            <>
              <Companies />
              <FloatingHomeButton />
            </>
          } />
          <Route path="/companies/:id" element={
            <>
              <CompanyProfile />
              <FloatingHomeButton />
            </>
          } />
          <Route path="/share-experience" element={
            <>
              <ShareExperience />
              <FloatingHomeButton />
            </>
          } />
          <Route path="/blog" element={
            <>
              <Blog />
              <FloatingHomeButton />
            </>
          } />
          <Route path="/about" element={
            <>
              <About />
              <FloatingHomeButton />
            </>
          } />
          <Route path="/debug" element={
            <>
              <Debug />
              <FloatingHomeButton />
            </>
          } />
          <Route path="/skills" element={
            user ? <SkillAssessment /> : <Navigate to="/login" replace />
          } />
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen bg-white"
            >
              <Navbar />
              <Hero />
              <Features />
              <Footer />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;