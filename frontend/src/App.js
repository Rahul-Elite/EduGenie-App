import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { loginSuccess, logout, setCheckingAuth } from './redux/authSlice';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Study from './components/Study';
import AboutUs from './components/AboutUs';
import ProtectedRoute from './components/ProtectedRoute';
import History from './components/History';
import Test from './components/Test';
import Compiler from './components/Compiler';
import { API_BASE_URL } from './config';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.isVerified) {
          dispatch(loginSuccess({ user: data.user }));
        } else {
          dispatch(logout());
        }
      } catch (err) {
        dispatch(logout());
      } finally {
        dispatch(setCheckingAuth(false));
      }
    };
    
    checkAuth();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<AboutUs />} />
        
        {/* Protected Routes */}
        <Route path="/study" element={<ProtectedRoute><Study /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><Test /></ProtectedRoute>} />
        <Route path="/compiler" element={<ProtectedRoute><Compiler /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
