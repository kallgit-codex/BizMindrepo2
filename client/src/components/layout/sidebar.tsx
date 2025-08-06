import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Bot, BarChart3, Layers, Plug, Settings, User } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3, current: location === "/" },
    { name: "My Bots", href: "/bots", icon: Bot, current: location.startsWith("/bot") },
    { name: "Templates", href: "/templates", icon: Layers, current: location === "/templates" },
    { name: "Integrations", href: "/integrations", icon: Plug, current: location === "/integrations" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-white">BotFlow</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                  item.current
                    ? "text-primary bg-primary/10"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}>
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
              <User className="text-slate-600 dark:text-slate-300 h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Demo User</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">demo@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
