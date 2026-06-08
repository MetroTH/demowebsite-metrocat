"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard, MessageSquare, Users, Phone, Settings,
  Zap, BarChart2, ChevronDown, Plus, Hash, Bot
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/conversations", icon: MessageSquare, label: "Inbox", badge: 6 },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/calls", icon: Phone, label: "Calls" },
  { href: "/automation", icon: Bot, label: "Automation" },
  { href: "/reports", icon: BarChart2, label: "Reports" },
];

const settingsItems = [
  { href: "/settings/telephony", icon: Phone, label: "Telephony" },
  { href: "/settings/channels", icon: Hash, label: "Channels" },
  { href: "/settings/team", icon: Users, label: "Team" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  currentAgent?: { name: string; status: "online" | "busy" | "away" | "offline" };
}

export function Sidebar({ currentAgent = { name: "สมชาย ใจดี", status: "online" } }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 bg-slate-900 text-slate-300 h-full shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-white text-lg">InboxPro</span>
      </div>

      {/* New Conversation */}
      <div className="px-3 py-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-slate-700 text-white" : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Settings Section */}
        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Settings</p>
        </div>
        {settingsItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-slate-700 text-white" : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Agent Status */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Avatar name={currentAgent.name} size="sm" status={currentAgent.status} />
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentAgent.name}</p>
            <p className={cn("text-xs capitalize", {
              "text-green-400": currentAgent.status === "online",
              "text-red-400": currentAgent.status === "busy",
              "text-yellow-400": currentAgent.status === "away",
              "text-slate-400": currentAgent.status === "offline",
            })}>● {currentAgent.status}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
