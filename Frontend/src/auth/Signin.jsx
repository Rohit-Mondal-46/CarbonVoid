import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
  return (
    <div className="auth-container">
      <SignIn path="/sign-in" routing="path" />
    </div>
  );
};

export default SignInPage;