import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
  return (
    <div className="auth-container">
      <SignUp path="/sign-up" routing="path" />
    </div>
  );
};

export default SignUpPage;