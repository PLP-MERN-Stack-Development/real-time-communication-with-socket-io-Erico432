import React, { useState } from 'react';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page">
      {isLogin ? (
        <Login onToggle={() => setIsLogin(false)} />
      ) : (
        <Register onToggle={() => setIsLogin(true)} />
      )}
    </div>
  );
};

export default AuthPage;
