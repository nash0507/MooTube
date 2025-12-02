import { Link, useLocation } from "wouter";
import { Home, History, BarChart2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "首頁" },
    { path: "/history", icon: History, label: "日記" },
    { path: "/stats", icon: BarChart2, label: "分析" },
    { path: "/settings", icon: Settings, label: "設定" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-8 pointer-events-auto shadow-2xl">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-all",
                    isActive && "fill-current"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
