import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import './SplitAuth.css';

function Login() {
  useEffect(() => {
    document.title = 'Login';
  }, []);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(loginSuccess({
          user: data.user
        }));
        alert('Login successful!');
        navigate('/'); 
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-page-wrapper">
     
      <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, fontWeight: 'bold', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Home
      </Link>

      <div className="split-container">
        <div className="split-form-panel">
          <h2>Sign in</h2>

          {error && <div className="error-badge">{error}</div>}

          <form onSubmit={onSubmit}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="Email"
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Password"
            />
            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot your password?</a>
            <button type="submit" className="split-btn-primary" disabled={loading}>
              {loading ? 'WAIT...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <div className="split-gradient-panel">
          <h2>Hello, Friend!</h2>
          <p>Enter your personal details and start journey with us</p>
          <Link to="/signup" className="split-link">
            <button type="button" className="split-btn-outline">SIGN UP</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
