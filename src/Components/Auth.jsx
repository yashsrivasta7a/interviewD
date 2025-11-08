import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = ({ onAuthSuccess }) => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  // If the user is authenticated and we have an onAuthSuccess callback, call it
  React.useEffect(() => {
    if (isAuthenticated && onAuthSuccess) {
      onAuthSuccess();
    }
  }, [isAuthenticated, onAuthSuccess]);

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleSignOut = () => {
    logout({ returnTo: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-violet-200 to-pink-200">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <Brain className="w-12 h-12 mx-auto text-violet-600" />
            <CardTitle className="text-2xl font-bold mt-4">Welcome to Interview.D</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={handleLogin}
                >
                  Sign In with Auth0
                </Button>
                <p className="text-center text-sm text-gray-600">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-lg">Welcome, {user.name || user.email}!</p>
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
                <Link to="/">
                  <Button className="w-full">Go to Home</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;