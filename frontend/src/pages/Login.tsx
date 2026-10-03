import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, LogIn, UserPlus, Sparkles, Lock, Mail, User as UserIcon, Phone, Building2, KeyRound } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    phone: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoggingIn(true);
    try {
      await login(loginData);
      toast.success("Welcome back to BillCart!");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsRegistering(true);
    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        shopName: registerData.shopName,
        phone: registerData.phone,
      });
      toast.success("Account created successfully!");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const fillDemoCredentials = () => {
    setLoginData({
      email: "admin@billcart.com",
      password: "password123",
    });
    toast.info("Demo credentials filled! Click 'Sign In' to proceed.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-2">
            <Store className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            BillCart
          </h1>
          <p className="text-slate-400 text-sm">
            Smart Inventory & Multi-Tenant Billing System
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl text-slate-100">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 border border-slate-700">
                <TabsTrigger value="login" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* LOGIN TAB */}
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-slate-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="owner@store.com"
                        className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-slate-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 h-10"
                  >
                    {isLoggingIn ? "Signing in..." : "Sign In to Your Store"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={fillDemoCredentials}
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Fill Demo Account Credentials
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit}>
                <CardContent className="space-y-3.5 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-name" className="text-slate-300 text-xs">Full Name *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-name"
                        placeholder="John Doe"
                        className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-slate-300 text-xs">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-shop" className="text-slate-300 text-xs">Store / Business Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-shop"
                          placeholder="My Medical Store"
                          className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 text-xs"
                          value={registerData.shopName}
                          onChange={(e) => setRegisterData({ ...registerData, shopName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-phone" className="text-slate-300 text-xs">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-phone"
                          placeholder="+91..."
                          className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 text-xs"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-pass" className="text-slate-300 text-xs">Password *</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-pass"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-confirm" className="text-slate-300 text-xs">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 h-9 bg-slate-800/50 border-slate-700 text-white"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3">
                  <Button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25 h-10"
                  >
                    {isRegistering ? "Creating Account..." : "Create Account & Start Billing"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500">
          Secure JWT Authentication • Multi-Tenant Data Isolation Enabled
        </p>
      </div>
    </div>
  );
};

export default Login;
