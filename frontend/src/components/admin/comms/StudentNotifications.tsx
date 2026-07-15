"use client";
import { useState } from "react";
import { Send, Users, Filter, Mail, Bell, MessageSquare } from "lucide-react";

type Channel = "in-app" | "email" | "sms";

const audiences = [
  { id: "all", label: "All Students", count: 24815 },
  { id: "shortlisted", label: "Shortlisted (Round 2)", count: 3120 },
  { id: "disbursed", label: "Disbursed Recipients", count: 842 },
  { id: "pending-docs", label: "Pending Documents", count: 512 },
  { id: "maharashtra", label: "Zone · Maharashtra", count: 2840 },
  { id: "karnataka", label: "Zone · Karnataka", count: 1620 },
];

const templates = [
  { id: "t1", label: "Application Approved", body: "Congratulations {{name}}! Your scholarship application has been approved." },
  { id: "t2", label: "Documents Missing", body: "Hi {{name}}, please upload your latest income certificate to continue." },
  { id: "t3", label: "Disbursement Alert", body: "₹{{amount}} has been credited to your account on {{date}}." },
];

const history = [
  { id: "h1", title: "Round 2 Interview Schedule", audience: "Shortlisted (Round 2)", sent: "2h ago", channel: "in-app", reach: 3120, opened: 71 },
  { id: "h2", title: "Merit List Published", audience: "All Students", sent: "Yesterday", channel: "email", reach: 24815, opened: 42 },
  { id: "h3", title: "Bank details verification", audience: "Disbursed Recipients", sent: "3 days ago", channel: "sms", reach: 842, opened: 88 },
];

const channelIcon = { "in-app": Bell, email: Mail, sms: MessageSquare };

export default function StudentNotifications() {
  const [aud, setAud] = useState("shortlisted");
  const [channels, setChannels] = useState<Channel[]>(["in-app", "email"]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const target = audiences.find((a) => a.id === aud)!;
  const toggleChannel = (c: Channel) =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Send className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Compose Notification</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-slate-500 flex items-center gap-1"><Users className="h-3 w-3" /> Audience</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {audiences.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAud(a.id)}
                  className={
                    "rounded-full border px-3 py-1.5 text-[11.5px] transition " +
                    (aud === a.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")
                  }
                >
                  {a.label} <span className="opacity-60 ml-1">{a.count.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500">Quick Templates</label>
            <div className="mt-1.5 grid grid-cols-1 md:grid-cols-3 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTitle(t.label); setBody(t.body); }}
                  className="text-left rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 p-2.5 transition"
                >
                  <p className="text-[12px] font-medium text-slate-800">{t.label}</p>
                  <p className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-2">{t.body}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Message body — use {{name}}, {{amount}}, {{date}} as placeholders"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500">Channels</label>
            <div className="mt-1.5 flex gap-2">
              {(["in-app", "email", "sms"] as Channel[]).map((c) => {
                const Icon = channelIcon[c];
                const on = channels.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleChannel(c)}
                    className={
                      "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium capitalize transition " +
                      (on ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")
                    }
                  >
                    <Icon className="h-3.5 w-3.5" /> {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-[11.5px] text-slate-500">
              Sending to <span className="font-semibold text-slate-800">{target.count.toLocaleString()}</span> students · {channels.length} channel(s)
            </p>
            <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition shadow-sm">
              <Send className="h-3.5 w-3.5" /> Send Notification
            </button>
          </div>
        </div>
      </div>

      <div className="xl:col-span-1 rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80">
          <h3 className="text-sm font-semibold text-slate-900">Recent Sends</h3>
          <Filter className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <ul className="divide-y divide-slate-100">
          {history.map((h) => {
            const Icon = channelIcon[h.channel as Channel];
            return (
              <li key={h.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-900 truncate">{h.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{h.audience} · {h.sent}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10.5px] text-slate-500">
                      <span>Reach {h.reach.toLocaleString()}</span>
                      <span className="text-emerald-600 font-medium">{h.opened}% opened</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

