import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  BarChart3,
  Store,
  Menu,
  Settings as SettingsIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/billing", icon: Receipt, label: "Billing" },
  { path: "/products", icon: Package, label: "Products" },
  { path: "/customers", icon: Users, label: "Customers" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
  { path: "/profile", icon: SettingsIcon, label: "Profile" },
];

const Logo: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
      <Store className="w-6 h-6 text-sidebar-primary-foreground" />
    </div>
    {!compact && (
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">
          LAKSHMI AYURVEDA Distributors
        </h1>
        <p className="text-xs text-sidebar-foreground/60">Inventory & Billing</p>
      </div>
    )}
  </div>
);

const NavItems: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const location = useLocation();

  return (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`nav-item ${isActive ? "nav-item-active" : ""}`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find((item) => item.path === location.pathname);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {currentPage?.label || "ShopBill"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              Sri Lakshmi Narayana Ayurveda
            </p>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border [&>button]:text-sidebar-foreground [&>button]:hover:bg-sidebar-accent [&>button]:opacity-100"
        >
          <SheetHeader className="p-6 border-b border-sidebar-border text-left">
            <SheetTitle className="text-sidebar-foreground font-normal">
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <nav className="p-4 space-y-1">
            <NavItems onNavigate={() => setMobileMenuOpen(false)} />
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50 text-center">
              © 2024 ShopBill v1.0
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <Logo />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItems />
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 text-center">
            © 2024 ShopBill v1.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-1 min-w-0 flex-1 transition-colors ${isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-[10px] font-medium truncate max-w-full px-0.5">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
