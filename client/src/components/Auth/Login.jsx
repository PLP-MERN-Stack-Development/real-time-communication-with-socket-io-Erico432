import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../socket/socket';
import toast from 'react-hot-toast';

const Login = ({ onToggle }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const socket = getSocket();

      // Ensure socket is connected before emitting
      if (!socket.connected) {
        await new Promise((resolve) => {
          socket.on('connect', resolve);
          if (!socket.connected) {
            socket.connect();
          }
        });
      }

      socket.emit('auth:login', formData, (response) => {
        if (response.success) {
          login(response.user, response.token);
          toast.success('Login successful!');
        } else {
          toast.error(response.message || 'Login failed. Please try again.');
        }
        setLoading(false);
      });
    } catch (error) {
      toast.error('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Chat</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don't have an account?{' '}
          <span onClick={onToggle} className="toggle-link">
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
