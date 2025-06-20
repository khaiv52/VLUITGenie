import { SignIn } from "@clerk/clerk-react";
import "./signInPage.css";
import { useEffect, useState } from "react";

function SignInPage() {
  const [redirectUrl, setRedirectUrl] = useState(null);

  useEffect(() => {
    const cameFromChat = sessionStorage.getItem("cameFromChat");

    if (cameFromChat) {
      setRedirectUrl("/dashboard/chats");
      sessionStorage.removeItem("cameFromChat");
    } else {
      setRedirectUrl("/");
    }
  }, []);

  if (redirectUrl === null) return null;

  return (
    <div className="signInPage">
      <SignIn
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl={redirectUrl}
      />
    </div>
  );
}

export default SignInPage;
