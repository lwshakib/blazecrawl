"use client"

import { Logo } from "@/components/Logo"
import { Icon } from "@iconify/react"

export default function OverviewPage() {
  return (
    <div className="min-h-screen bg-black text-white font-jakarta">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-[#FFAB00]/10 bg-[#030303] z-20">
        <div className="p-6 border-b border-[#FFAB00]/10 flex items-center gap-2">
          <Logo className="w-6 h-6 text-[#FFAB00]" />
          <span className="font-semibold text-lg">BlazeCrawl</span>
        </div>
        
        <nav className="p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#FFAB00]/10 text-[#FFAB00] rounded-none">
            <Icon icon="solar:widget-linear" className="w-5 h-5" />
            <span className="text-sm font-medium">Overview</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-orange-50/60 hover:bg-white/5 transition-colors rounded-none">
            <Icon icon="solar:layers-linear" className="w-5 h-5" />
            <span className="text-sm font-medium">Crawlers</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-orange-50/60 hover:bg-white/5 transition-colors rounded-none">
            <Icon icon="solar:database-linear" className="w-5 h-5" />
            <span className="text-sm font-medium">Datasets</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-orange-50/60 hover:bg-white/5 transition-colors rounded-none">
            <Icon icon="solar:settings-linear" className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        <header className="h-20 border-b border-[#FFAB00]/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Dashboard Overview</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-semibold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Network Healthy
            </div>
            <button className="w-10 h-10 border border-[#FFAB00]/20 flex items-center justify-center hover:border-[#FFAB00] transition-colors">
              <Icon icon="solar:bell-linear" className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Active Nodes", value: "12", icon: "solar:server-linear", color: "text-[#FFAB00]" },
              { label: "Pages Scraped", value: "1.2M", icon: "solar:document-linear", color: "text-blue-400" },
              { label: "Success Rate", value: "99.9%", icon: "solar:check-circle-linear", color: "text-green-500" },
              { label: "Data Volume", value: "4.2 TB", icon: "solar:database-linear", color: "text-purple-400" },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-[#0F1A24] border border-[#FFAB00]/10 group hover:border-[#FFAB00]/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 bg-black/40 border border-[#FFAB00]/10 ${stat.color}`}>
                    <Icon icon={stat.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-orange-50/30 uppercase tracking-widest">LIVE</span>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-orange-50/50 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Activity Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 bg-[#0F1A24] border border-[#FFAB00]/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold">Crawl Performance</h3>
                <select className="bg-black border border-[#FFAB00]/20 text-xs px-2 py-1 outline-none">
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                </select>
              </div>
              <div className="h-64 flex items-center justify-center border border-dashed border-[#FFAB00]/10 opacity-30">
                <p className="text-xs font-mono">Chart placeholder - Analytics module pending</p>
              </div>
            </div>

            <div className="p-8 bg-[#0F1A24] border border-[#FFAB00]/10">
              <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  { user: "System", action: "Node Alpha Re-synced", time: "2m ago" },
                  { user: "Crawler", action: "New dataset: product_data_v2", time: "15m ago" },
                  { user: "Auth", action: "Successful login: admin@blaze.com", time: "1h ago" },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#FFAB00]/10 border border-[#FFAB00]/20 flex items-center justify-center">
                      <Icon icon="solar:user-linear" className="w-4 h-4 text-[#FFAB00]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{act.action}</p>
                      <p className="text-[10px] text-orange-50/40 mt-1">{act.time} • {act.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
