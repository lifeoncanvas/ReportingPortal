import React, { useState } from 'react';
import Signin from './Signin/signin';
import InviteSignup from './InviteSignup/InviteSignup';

export default function AuthRouter() {
  const [isSignup, setIsSignup] = useState(false);
  
  const search = new URLSearchParams(window.location.search);
  const token = search.get('token');

  if (window.location.pathname === '/invite' && token) {
     return <InviteSignup token={token} />;
  }

  return <Signin onSwitch={() => { 
     alert('Public registrations have been disabled by the Administrator. You must receive an invitation link from an Admin to create an account.'); 
  }} />;
}
