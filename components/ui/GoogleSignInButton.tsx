"use client";
import { Button } from "./button";
import { FcGoogle } from "react-icons/fc";

export function GoogleSignInButton() {
  const handleClick = () => {
    window.location.href = "/api/auth/google";
  };
  return (
    <Button type="button" variant="outline" className="w-full" onClick={handleClick}>
      <span className="mr-2 inline-flex items-center"><FcGoogle /></span>
      Sign in with Google
    </Button>
  );
}
