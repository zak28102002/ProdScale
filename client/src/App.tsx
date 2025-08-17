import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { Link } from "wouter";
import BottomNav from "@/components/bottom-nav";
import Home from "@/pages/home";
import MonthlyReport from "@/pages/monthly-report";
import SocialSharing from "@/pages/social-sharing";
import ProUpgrade from "@/pages/pro-upgrade";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Privacy from "@/pages/privacy";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const showFloatingButtons = location === "/";
  const showBottomNav = !["/share", "/pro"].includes(location);

  return (
    <>
      {showFloatingButtons && (
        <>
          <ThemeToggle />
          <Link href="/pro">
            <Button 
              variant="ghost" 
              size="sm"
              className="fixed top-4 left-4 z-50 bg-gray-800 dark:bg-gray-200 text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full w-12 h-12 p-0 border border-gray-600 dark:border-gray-300"
            >
              <Crown className="w-5 h-5" />
            </Button>
          </Link>
        </>
      )}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/monthly" component={MonthlyReport} />
        <Route path="/share" component={SocialSharing} />
        <Route path="/pro" component={ProUpgrade} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <TooltipProvider>
            <div className="max-w-sm mx-auto bg-white dark:bg-black min-h-screen shadow-xl">
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
