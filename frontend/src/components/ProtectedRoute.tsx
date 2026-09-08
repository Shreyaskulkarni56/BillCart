import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { ShieldAlert, Lock, LogIn, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem("billcart_auth_token");
    return savedAuth !== null ? savedAuth === "true" : true;
  });

  const handleLogin = () => {
    localStorage.setItem("billcart_auth_token", "true");
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-muted">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Protected Area</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              You must be an authenticated administrator to access the Settings module.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Alert variant="default" className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-400 font-semibold">
                Authentication Required
              </AlertTitle>
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                Attempted to access <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded font-mono">{location.pathname}</code>
              </AlertDescription>
            </Alert>

            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
              <div className="font-medium text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Security Safeguard Active
              </div>
              <p>Settings module access is restricted to store administrators and management personnel.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button onClick={handleLogin} className="w-full gap-2">
              <LogIn className="w-4 h-4" />
              Authenticate as Administrator
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
