import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../socket/socket';
import toast from 'react-hot-toast';

const Register = ({ onToggle }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

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

      socket.emit('auth:register', formData, (response) => {
        if (response.success) {
          login(response.user, response.token);
          toast.success('Registration successful!');
        } else {
          toast.error(response.message || 'Registration failed. Please try again.');
        }
        setLoading(false);
      });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            minLength={3}
          />
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
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account?{' '}
          <span onClick={onToggle} className="toggle-link">
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
