import React, { useState } from 'react';
import Signin from './Signin/signin';
import InviteSignup from './InviteSignup/InviteSignup';
import ForgotPassword from './ForgotPassword/ForgotPassword';

export default function AuthRouter() {
  const [view, setView] = useState('login'); // 'login', 'forgot-password'
  
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

  return (
    <Signin 
      onSwitch={() => { 
        alert('Public registrations have been disabled by the Administrator. You must receive an invitation link from an Admin to create an account.'); 
      }} 
      onForgotPassword={() => setView('forgot-password')}
    />
  );
}
