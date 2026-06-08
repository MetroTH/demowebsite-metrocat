import { Topbar } from "@/components/layout/topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { mockStats, mockConversations, mockAgents } from "@/lib/mock-data";
import { formatTime } from "@/lib/utils";
import {
  MessageSquare, CheckCircle2, Clock, Users,
  Phone, PhoneMissed, TrendingUp, ArrowUpRight
} from "lucide-react";
import { ChannelIcon } from "@/components/inbox/channel-icon";

const statCards = [
  { label: "Open Conversations", value: mockStats.openConversations, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
  { label: "Resolved Today", value: mockStats.resolvedToday, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", trend: "+8%" },
  { label: "Avg Response Time", value: `${mockStats.avgResponseTime}m`, icon: Clock, color: "text-purple-600", bg: "bg-purple-50", trend: "-2m" },
  { label: "Online Agents", value: `${mockStats.onlineAgents}/${mockStats.totalAgents}`, icon: Users, color: "text-orange-600", bg: "bg-orange-50", trend: "" },
  { label: "Calls Today", value: mockStats.callsToday, icon: Phone, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+3" },
  { label: "Missed Calls", value: mockStats.missedCalls, icon: PhoneMissed, color: "text-red-600", bg: "bg-red-50", trend: "-1" },
];

const statusVariant: Record<string, "default" | "warning" | "success" | "secondary"> = {
  open: "default", pending: "warning", resolved: "success", snoozed: "secondary",
};

export default function DashboardPage() {
  const recentConversations = mockConversations.slice(0, 5);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Dashboard" subtitle="Overview of today's activity" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardBody className="flex flex-col gap-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
                {stat.trend && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />{stat.trend}
                  </span>
                )}
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Conversations */}
          <div className="xl:col-span-2">
            <Card>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Recent Conversations</h2>
                <a href="/conversations" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
              <div className="divide-y divide-slate-50">
                {recentConversations.map((conv) => (
                  <div key={conv.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="relative">
                      <Avatar name={conv.contact.name} size="md" />
                      <ChannelIcon channel={conv.channel} className="absolute -bottom-0.5 -right-0.5 w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{conv.contact.name}</p>
                        <span className="text-xs text-slate-400 shrink-0">{formatTime(conv.updatedAt)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage?.content}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={statusVariant[conv.status]}>{conv.status}</Badge>
                      {conv.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Agent Status */}
          <div>
            <Card>
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Agent Status</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {mockAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar name={agent.name} size="md" status={agent.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{agent.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{agent.role}</p>
                    </div>
                    <Badge variant={agent.status === "online" ? "success" : agent.status === "busy" ? "destructive" : "secondary"}>
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Channel Distribution */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Channel Distribution Today</h2>
          </div>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { channel: "line" as const, count: 89, color: "bg-green-500" },
                { channel: "whatsapp" as const, count: 64, color: "bg-emerald-500" },
                { channel: "facebook" as const, count: 52, color: "bg-blue-500" },
                { channel: "voice" as const, count: 23, color: "bg-purple-500" },
                { channel: "sms" as const, count: 20, color: "bg-orange-500" },
              ].map((item) => {
                const total = 248;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.channel} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 capitalize">{item.channel}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
}
