import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    dispatch(logout());
    navigate('/');
  };

  const navClass = (path) => {
    return location.pathname === path
      ? "text-sm font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all scale-105"
      : "text-sm font-medium text-slate-400 hover:text-white transition-all";
  };

  return (
    <header className="flex justify-between items-center px-8 md:px-16 h-18 bg-[#0b0a1f]/95 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
     
      <Link to="/" className="flex items-center gap-2 group">
        <img
          src="/images/logo2.png"
          alt="EduGenie Logo"
          className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />

        <span className="text-xl md:text-2xl font-bold tracking-tight text-white leading-none">
          Edu
          <span className="ml-0.5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Genie
          </span>
        </span>
      </Link>

      
      <nav className="hidden md:flex items-center gap-7">
        <Link to="/" className={navClass('/')}>
          Home
        </Link>
        <Link to="/study" className={navClass('/study')}>
          Study
        </Link>
        <Link to="/test" className={navClass('/test')}>
          Test
        </Link>
        <Link to="/compiler" className={navClass('/compiler')}>
          Compiler
        </Link>
        <Link to="/about" className={navClass('/about')}>
          About Us
        </Link>
      </nav>

      
      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <Link
            to="/login"
            className="text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Sign In
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-slate-400 hover:text-white transition cursor-pointer"
          >
            Log Out
          </button>
        )}

        <Link
          to="/study"
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm px-5 py-1.5 rounded-full font-semibold transition shadow-sm"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}

export default Header;