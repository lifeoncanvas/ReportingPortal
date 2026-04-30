import React, { useState } from 'react';
import Signin from './Signin/signin';
import Signup from './Signup/signup';
import InviteSignup from './InviteSignup/InviteSignup';
import ForgotPassword from './ForgotPassword/ForgotPassword';

export default function AuthRouter() {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot-password'
  
  const search = new URLSearchParams(window.location.search);
  const token = search.get('token');

  if (window.location.pathname === '/invite' && token) {
     return <InviteSignup token={token} />;
  }

  if (view === 'forgot-password' || window.location.pathname === '/forgot') {
    return <ForgotPassword onBack={() => {
      if (window.location.pathname === '/forgot') window.history.pushState({}, '', '/login');
      setView('login');
    }} />;
  }

  if (view === 'signup') {
    return <Signup onSwitch={() => setView('login')} />;
  }

  return (
    <Signin 
      onSwitch={() => setView('signup')} 
      onForgotPassword={() => setView('forgot-password')}
    />
  );
}
