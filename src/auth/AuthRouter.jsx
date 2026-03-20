import React, { useState } from 'react';
import Signin from './Signin/signin';
import Signup from './Signup/signup';

export default function AuthRouter() {
  const [isSignup, setIsSignup] = useState(false);
  return isSignup
    ? <Signup onSwitch={() => setIsSignup(false)} />
    : <Signin onSwitch={() => setIsSignup(true)} />;
}
