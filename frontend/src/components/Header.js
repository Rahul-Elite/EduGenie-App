import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { API_BASE_URL } from '../config';

function Header() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
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

  const mobileNavClass = (path) => {
    return location.pathname === path
      ? "text-base font-bold text-white py-2 px-3 bg-white/5 rounded-lg border-l-2 border-indigo-500"
      : "text-base font-medium text-slate-400 py-2 px-3 hover:text-white hover:bg-white/5 rounded-lg transition-all";
  };

  return (
    <header className="relative flex justify-between items-center px-6 md:px-16 h-20 bg-[#0b0a1f]/95 border-b border-white/10 backdrop-blur-md sticky top-0 z-50 w-full">
     
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

      
      <div className="hidden md:flex items-center gap-4">
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

      {/* Hamburger Menu Button */}
      <div className="flex md:hidden items-center">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-400 hover:text-white p-2 outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0b0a1f] border-b border-white/10 backdrop-blur-md px-6 py-6 flex flex-col gap-3 z-40 animate-in slide-in-from-top-5 duration-200 shadow-2xl shadow-black/60">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavClass('/')}>
            🏠 Home
          </Link>
          <Link to="/study" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavClass('/study')}>
            📚 Study
          </Link>
          <Link to="/test" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavClass('/test')}>
            ✏️ Test
          </Link>
          <Link to="/compiler" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavClass('/compiler')}>
            💻 Compiler
          </Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className={mobileNavClass('/about')}>
            ℹ️ About Us
          </Link>
          
          <div className="border-t border-white/10 pt-4 mt-2 flex flex-col gap-3">
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-400 hover:text-white py-2 px-3 transition"
              >
                Sign In
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-sm font-medium text-slate-400 hover:text-white py-2 px-3 text-left transition cursor-pointer"
              >
                Log Out
              </button>
            )}
            <Link
              to="/study"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-2.5 rounded-full font-semibold transition text-center shadow-sm w-full block"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;