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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-indigo-50/80 via-slate-50/50 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20 mb-1">
            <Store className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              BillCart
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/60">
              Enterprise
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Smart Cloud Inventory, Billing & GST Compliance
          </p>
        </div>

        <Card className="border border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] rounded-2xl overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-3 pt-5 px-6 border-b border-slate-100 bg-slate-50/50">
              <TabsList className="grid w-full grid-cols-2 bg-slate-200/70 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-xs transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1.5" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-xs transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Create Account
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* LOGIN TAB */}
            <TabsContent value="login" className="m-0">
              <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="owner@store.com"
                        className="pl-9 h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                        Password
                      </Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9 h-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2.5 p-6 pt-0">
                  <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs h-10 text-sm transition-all"
                  >
                    {isLoggingIn ? "Signing in..." : "Sign In to Your Store"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={fillDemoCredentials}
                    className="w-full border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold h-9 gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Quick Fill Demo Credentials
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register" className="m-0">
              <form onSubmit={handleRegisterSubmit}>
                <CardContent className="space-y-3 p-6">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name" className="text-xs font-semibold text-slate-700">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-name"
                        placeholder="Dr. Ramesh Sharma"
                        className="pl-9 h-9 bg-white border-slate-200 text-slate-900 text-xs"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-xs font-semibold text-slate-700">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="ramesh@ayurveda.com"
                        className="pl-9 h-9 bg-white border-slate-200 text-slate-900 text-xs"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="reg-shop" className="text-xs font-semibold text-slate-700">
                        Store Name
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-shop"
                          placeholder="Lakshmi Ayurveda"
                          className="pl-9 h-9 bg-white border-slate-200 text-slate-900 text-xs"
                          value={registerData.shopName}
                          onChange={(e) => setRegisterData({ ...registerData, shopName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reg-phone" className="text-xs font-semibold text-slate-700">
                        Phone
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-phone"
                          placeholder="+91 98765 43210"
                          className="pl-9 h-9 bg-white border-slate-200 text-slate-900 text-xs"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="reg-pass" className="text-xs font-semibold text-slate-700">
                        Password *
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-pass"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 h-9 bg-white border-slate-200 text-slate-900 text-xs"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reg-confirm" className="text-xs font-semibold text-slate-700">
                        Confirm *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 h-9 bg-white border-slate-200 text-slate-900 text-xs"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs h-10 text-xs transition-all"
                  >
                    {isRegistering ? "Creating Account..." : "Create Account & Start Invoicing"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Security & Multi-tenant Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Encrypted JWT Sessions • Multi-Tenant Data Isolation Active</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
