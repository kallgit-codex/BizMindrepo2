import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

const Dashboard = lazy(() => import("@/pages/dashboard"));
const BotDetail = lazy(() => import("@/pages/bot-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/bot/:id" component={BotDetail} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
