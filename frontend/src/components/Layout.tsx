import React, { useState } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  CreditCard,
  Package,
  Layers,
  Truck,
  RotateCcw,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  User as UserIcon,
  Store,
  Menu,
  LogOut,
  Bell,
  Search,
  Plus,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: {
    path: string;
    icon: React.ElementType;
    label: string;
    badge?: string | number;
  }[];
}

const Logo: React.FC<{ compact?: boolean; shopName?: string }> = ({ compact, shopName }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-sm shrink-0">
      <Store className="w-5 h-5 text-white" />
    </div>
    {!compact && (
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
            BillCart
          </span>
          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200/60 leading-none">
            PRO
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-1 font-medium">
          {shopName || "Enterprise Billing"}
        </p>
      </div>
    )}
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products, getLowStockProducts } = useApp();

  const lowStockCount = getLowStockProducts ? getLowStockProducts().length : 0;

  const navGroups: NavGroup[] = [
    {
      title: "CORE",
      items: [
        { path: "/", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/billing", icon: Receipt, label: "Billing & POS" },
        { path: "/invoices", icon: FileText, label: "Invoice History" },
        { path: "/transactions", icon: CreditCard, label: "Transactions" },
      ],
    },
    {
      title: "INVENTORY",
      items: [
        { path: "/products", icon: Package, label: "Products" },
        {
          path: "/inventory",
          icon: Layers,
          label: "Stock & Inventory",
          badge: lowStockCount > 0 ? lowStockCount : undefined,
        },
        { path: "/purchases", icon: Truck, label: "Purchases" },
        { path: "/returns", icon: RotateCcw, label: "Returns" },
      ],
    },
    {
      title: "RELATIONS & INSIGHTS",
      items: [
        { path: "/customers", icon: Users, label: "Customers" },
        { path: "/reports", icon: BarChart3, label: "Reports & Analytics" },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        { path: "/settings", icon: SettingsIcon, label: "Settings" },
        { path: "/profile", icon: UserIcon, label: "Store Profile" },
      ],
    },
  ];

  // All flat items for mobile & title lookups
  const allNavItems = navGroups.flatMap((g) => g.items);
  const currentItem = allNavItems.find(
    (item) => item.path === location.pathname || (item.path !== "/" && location.pathname.startsWith(item.path))
  );

  // If user is on login page, render children directly without main app layout
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const renderNavLinks = (onNavigate?: () => void) => (
    <div className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col shrink-0 z-30 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <Logo shopName={user?.shopName} />
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-6">
          {renderNavLinks()}
        </nav>

        {/* User Account Footer Card */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/60 m-2 rounded-xl border">
          {user ? (
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate font-medium">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center">
              BillCart Multi-Tenant SaaS
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Left: Mobile trigger & Breadcrumb/Page title */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {currentItem?.label || "BillCart"}
              </h2>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>{user?.shopName || "BillCart Store"}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  System Online
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick actions, notifications, user avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Bill Shortcut */}
            <Button
              size="sm"
              onClick={() => navigate("/billing")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold gap-1.5 text-xs h-9 px-3.5 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Invoice</span>
            </Button>

            {/* Low Stock Alert Bell */}
            <Link to="/inventory">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 relative"
                title={`${lowStockCount} items need restocking`}
              >
                <Bell className="w-4 h-4" />
                {lowStockCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {lowStockCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 p-1 pl-2 gap-2 rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="text-xs font-semibold hidden md:inline max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-md">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <p className="text-[11px] text-indigo-600 font-medium truncate">{user.shopName}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserIcon className="w-4 h-4 mr-2 text-slate-500" />
                    Store Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon className="w-4 h-4 mr-2 text-slate-500" />
                    System Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-600 focus:text-rose-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-white text-slate-800 border-r border-slate-200 flex flex-col justify-between"
        >
          <div>
            <SheetHeader className="p-5 border-b border-slate-200 text-left">
              <SheetTitle>
                <Logo shopName={user?.shopName} />
              </SheetTitle>
            </SheetHeader>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
              {renderNavLinks(() => setMobileMenuOpen(false))}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-1 px-2 flex justify-around items-center shadow-lg">
        {[
          { path: "/", icon: LayoutDashboard, label: "Home" },
          { path: "/billing", icon: Receipt, label: "Bill" },
          { path: "/products", icon: Package, label: "Products" },
          { path: "/customers", icon: Users, label: "Customers" },
          { path: "/reports", icon: BarChart3, label: "Reports" },
        ].map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-4 h-4 mb-0.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

