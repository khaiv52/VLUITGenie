import { SignIn } from "@clerk/clerk-react";
import React from "react";
import "./signInPage.css";

function SignInPage() {
  return (
    <div className="signInPage">
      <SignIn path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard/chats" />
    </div>
  );
}

export default SignInPage;
