import { Link, useLocation } from "wouter";
import { Home, TrendingUp, User } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Home",
    },
    {
      path: "/reports",
      icon: TrendingUp,
      label: "Reports",
    },
    {
      path: "/settings",
      icon: User,
      label: "Settings",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-sm mx-auto">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path === "/reports" && (location === "/monthly" || location === "/share")) ||
              (item.path === "/settings" && (location === "/privacy" || location === "/contact"));
            
            return (
              <Link key={item.path} href={item.path}>
                <button className="relative flex flex-col items-center justify-center w-20 h-full">
                  <item.icon 
                    className={`w-6 h-6 mb-1 transition-colors stroke-2 ${
                      isActive 
                        ? "text-black dark:text-white fill-none" 
                        : "text-gray-400 dark:text-gray-600 fill-none"
                    }`}
                    strokeWidth={2}
                  />
                  <span 
                    className={`text-xs transition-colors ${
                      isActive 
                        ? "text-black dark:text-white font-medium" 
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}