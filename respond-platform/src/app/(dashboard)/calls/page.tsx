import { Topbar } from "@/components/layout/topbar";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, Clock, Voicemail } from "lucide-react";

const callLog = [
  { id: 1, name: "อรุณ สว่างใจ", phone: "081-234-5678", type: "inbound", status: "answered", duration: "3:05", time: "11:00", agent: "สมชาย" },
  { id: 2, name: "นคร พัฒนา", phone: "062-345-6789", type: "inbound", status: "missed", duration: "-", time: "10:45", agent: "-" },
  { id: 3, name: "สุดา นุ่มนวล", phone: "094-567-8901", type: "outbound", status: "answered", duration: "7:22", time: "10:15", agent: "วาณี" },
  { id: 4, name: "Unknown", phone: "083-456-7890", type: "inbound", status: "voicemail", duration: "1:12", time: "09:30", agent: "-" },
  { id: 5, name: "ปิยะ เจริญดี", phone: "089-876-5432", type: "outbound", status: "missed", duration: "-", time: "09:00", agent: "ประยุทธ์" },
];

const statusConfig = {
  answered: { icon: Phone, color: "text-green-600", label: "Answered", badge: "success" as const },
  missed: { icon: PhoneMissed, color: "text-red-600", label: "Missed", badge: "destructive" as const },
  voicemail: { icon: Voicemail, color: "text-orange-500", label: "Voicemail", badge: "warning" as const },
};

export default function CallsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Calls" subtitle="Voice call history and management" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Phone, label: "Total Calls Today", value: 23, color: "bg-blue-50 text-blue-600" },
            { icon: PhoneIncoming, label: "Inbound", value: 15, color: "bg-green-50 text-green-600" },
            { icon: PhoneOutgoing, label: "Outbound", value: 8, color: "bg-purple-50 text-purple-600" },
            { icon: PhoneMissed, label: "Missed", value: 3, color: "bg-red-50 text-red-600" },
          ].map((s) => (
            <Card key={s.label}>
              <CardBody className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Call History</h2>
            <Button variant="outline" size="sm"><Phone className="w-3.5 h-3.5" />Make a Call</Button>
          </div>
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Caller", "Phone", "Type", "Status", "Duration", "Time", "Agent", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {callLog.map((call) => {
                  const cfg = statusConfig[call.status as keyof typeof statusConfig];
                  return (
                    <tr key={call.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={call.name} size="sm" />
                          <span className="text-sm font-medium text-slate-900">{call.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.phone}</td>
                      <td className="px-4 py-3">
                        {call.type === "inbound"
                          ? <span className="flex items-center gap-1 text-xs text-green-600"><PhoneIncoming className="w-3.5 h-3.5" />Inbound</span>
                          : <span className="flex items-center gap-1 text-xs text-purple-600"><PhoneOutgoing className="w-3.5 h-3.5" />Outbound</span>}
                      </td>
                      <td className="px-4 py-3"><Badge variant={cfg.badge}>{cfg.label}</Badge></td>
                      <td className="px-4 py-3 text-sm text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />{call.duration}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{call.time}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{call.agent}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm"><Phone className="w-3.5 h-3.5" />Call back</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
