import React, { useState } from 'react';
import { User } from '@/types';
import { backend } from '@/services/backendService';
import NotificationCenter from './NotificationCenter';

interface BusinessDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onNavigateToJobManagement: () => void;
  onNavigateToPostJob: () => void;
  onNavigateToCandidateManagement: () => void;
  onNavigateToProfile: () => void;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ 
  currentUser, 
  onLogout, 
  onNavigateToJobManagement, 
  onNavigateToPostJob,
  onNavigateToCandidateManagement,
  onNavigateToProfile
}) => {
  const [notifications, setNotifications] = useState(backend.getNotifications(currentUser.id));
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const allJobs = backend.getJobs();
  const companyJobs = allJobs.filter(j => j.companyId === currentUser.id);
  const companyJobIds = companyJobs.map(j => j.id);
  
  const allApps = backend.getApplications();
  const companyApps = allApps.filter(app => companyJobIds.includes(app.jobId));
  
  const totalCandidates = companyApps.length;
  const hiredCount = companyApps.filter(a => a.status === 'HIRED').length;
  const failedCount = companyApps.filter(a => a.status === 'FAILED').length;
  const totalPosts = companyJobs.length;
  const passRate = totalCandidates > 0 ? Math.round((hiredCount / totalCandidates) * 100) : 0;

  // Calculate applications per month for the chart
  const getAppsPerMonth = () => {
    const counts = new Array(7).fill(0);
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    
    companyApps.forEach(app => {
      // appliedDate is DD/MM/YYYY
      const parts = app.appliedDate.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        if (year === now.getFullYear()) {
          // Map to the 7 months shown in chart (ending with current month)
          const monthDiff = currentMonth - month;
          if (monthDiff >= 0 && monthDiff < 7) {
            counts[6 - monthDiff]++;
          }
        }
      }
    });
    return counts;
  };

  const chartData = getAppsPerMonth();
  const maxChartVal = Math.max(...chartData, 1);

  // Get top jobs based on application count
  const topJobs = companyJobs
    .map(job => {
      const jobApps = allApps.filter(a => a.jobId === job.id);
      const hired = jobApps.filter(a => a.status === 'HIRED').length;
      const passRate = jobApps.length > 0 ? Math.round((hired / jobApps.length) * 100) : 0;
      return {
        ...job,
        appCount: jobApps.length,
        passRate
      };
    })
    .sort((a, b) => b.appCount - a.appCount)
    .slice(0, 3);

  const handleMarkAsRead = (id: string) => {
    backend.markNotificationAsRead(id);
    setNotifications(backend.getNotifications(currentUser.id));
  };

  return (
    <div className="bg-[#0f172a] text-slate-100 antialiased h-screen flex overflow-hidden font-display">
      {/* Left Navigation Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#1e293b] border-r border-[#334155] flex flex-col h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1392ec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1392ec]/20">
            <span className="material-symbols-outlined text-2xl font-bold">psychology</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#1392ec] leading-none uppercase italic">MindTrace</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Recruit Pro</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="py-4">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Menu chính</p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-bold transition-all shadow-lg shadow-[#1392ec]/20 text-left">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm uppercase tracking-wider">Tổng quan</span>
            </button>
            <button 
              onClick={onNavigateToJobManagement}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left mt-1"
            >
              <span className="material-symbols-outlined">article</span>
              <span className="text-sm uppercase tracking-wider font-bold">Tin tuyển dụng</span>
            </button>
            <button 
              onClick={onNavigateToPostJob}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left mt-1"
            >
              <span className="material-symbols-outlined">add_box</span>
              <span className="text-sm uppercase tracking-wider font-bold">Đăng tin mới</span>
            </button>
            <button 
              onClick={onNavigateToCandidateManagement}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left mt-1"
            >
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm uppercase tracking-wider font-bold">Quản lý ứng viên</span>
            </button>
          </div>
          <div className="py-4 border-t border-slate-800">
            <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Hỗ trợ & Cài đặt</p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left">
              <span className="material-symbols-outlined">analytics</span>
              <span className="text-sm uppercase tracking-wider font-bold">Báo cáo chi tiết</span>
            </button>
            <button 
              onClick={onNavigateToProfile}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left mt-1"
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm uppercase tracking-wider font-bold">Cài đặt doanh nghiệp</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/10 transition-all text-left mt-1"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm uppercase tracking-wider font-bold">Đăng xuất</span>
            </button>
          </div>
        </nav>
        {/* Company Footer Info */}
        <div className="p-4 border-t border-[#334155] bg-[#0f172a]/50">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-slate-700 bg-cover bg-center border border-slate-600" style={{ backgroundImage: `url('${currentUser.avatar}')` }}></div>
            <div className="overflow-hidden">
              <p className="text-xs font-black uppercase tracking-tight truncate text-white">{currentUser.name}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#1392ec]">Gói Enterprise</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0f172a]">
        {/* Header Section */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#0f172a] border-b border-[#334155] flex-shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-[#1e293b] border-none rounded-lg focus:ring-2 focus:ring-[#1392ec]/50 text-sm transition-all placeholder:text-slate-600 text-slate-200 font-medium" 
                placeholder="Tìm kiếm ứng viên, tin tuyển dụng..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter 
              notifications={notifications} 
              onMarkAsRead={handleMarkAsRead} 
            />
            <button className="p-2 text-slate-400 hover:bg-[#1e293b] rounded-full transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="h-8 w-px bg-[#334155] mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black uppercase tracking-tight text-white group-hover:text-[#1392ec] transition-colors">{currentUser.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Quản trị viên</p>
              </div>
              <div 
                className="size-9 rounded-full bg-slate-700 bg-cover bg-center border-2 border-[#1392ec] shadow-lg shadow-[#1392ec]/10" 
                style={{ backgroundImage: `url('${currentUser.avatar}')` }}
              ></div>
            </div>
          </div>
        </header>

        {/* Main Scrollable Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Page Title Area */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Chào buổi sáng, {currentUser.name}</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Đây là báo cáo hoạt động tuyển dụng tính đến hôm nay.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-5 py-2.5 rounded-xl bg-[#1e293b] border border-[#334155] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all text-slate-300">
                <span className="material-symbols-outlined text-sm">download</span>
                Xuất báo cáo
              </button>
              <button 
                onClick={onNavigateToPostJob}
                className="px-5 py-2.5 rounded-xl bg-[#1392ec] text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1392ec]/20 hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Đăng tin mới
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Candidates */}
            <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +0%
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tổng ứng tuyển</p>
              <h3 className="text-4xl font-black mt-2 text-white italic">{totalCandidates.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">So với tháng trước</p>
            </div>
            {/* AI Pass Rate */}
            <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-xs">trending_up</span> +0%
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tỷ lệ Pass (AI)</p>
              <h3 className="text-4xl font-black mt-2 text-white italic">{passRate}%</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Dựa trên {totalCandidates} hồ sơ đã duyệt</p>
            </div>
            {/* Open Positions */}
            <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                  <span className="material-symbols-outlined">work</span>
                </div>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Vị trí đang mở</p>
              <h3 className="text-4xl font-black mt-2 text-white italic">{companyJobs.filter(j => j.tag !== 'CLOSED').length.toString().padStart(2, '0')}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Trên tổng số {totalPosts} chiến dịch</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-8 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Phân tích ứng viên theo thời gian</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Theo dõi lưu lượng ứng tuyển vào các vị trí</p>
              </div>
              <div className="inline-flex p-1 bg-[#0f172a] rounded-xl border border-[#334155]">
                <button className="px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-[#1392ec] transition-all text-slate-500">Tuần</button>
                <button className="px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg bg-[#1e293b] text-[#1392ec] shadow-lg transition-all">Tháng</button>
                <button className="px-5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-[#1392ec] transition-all text-slate-500">Năm</button>
              </div>
            </div>
            {/* Chart Mockup */}
            <div className="relative h-[300px] w-full mt-4 flex items-end justify-between gap-6 px-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full h-px bg-slate-800/50"></div>
                ))}
              </div>
              {chartData.map((count, i) => {
                const height = (count / maxChartVal) * 100;
                return (
                  <div key={i} className="relative flex-1 bg-[#1392ec]/20 hover:bg-[#1392ec]/40 rounded-t-xl transition-all group" style={{ height: `${height}%` }}>
                    {i === 6 && <div className="absolute inset-0 bg-[#1392ec] rounded-t-xl shadow-lg shadow-[#1392ec]/20"></div>}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 shadow-xl whitespace-nowrap">
                      {count} Ứng viên
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (6 - i));
                const monthName = `Tháng ${d.getMonth() + 1}`;
                const isCurrent = i === 6;
                return (
                  <span key={i} className={isCurrent ? "text-[#1392ec]" : ""}>
                    {monthName}{isCurrent ? " (Hiện tại)" : ""}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Table Section */}
          <div className="p-8 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Vị trí đang tuyển dụng hiệu quả nhất</h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Xếp hạng dựa trên tỷ lệ chuyển đổi và số lượng ứng viên</p>
              </div>
              <button className="text-[#1392ec] text-[10px] font-black uppercase tracking-widest hover:underline">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                    <th className="pb-5 pl-2">Vị trí</th>
                    <th className="pb-5">Phòng ban</th>
                    <th className="pb-5">Ứng viên</th>
                    <th className="pb-5">Hiệu quả</th>
                    <th className="pb-5 text-right pr-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {topJobs.length > 0 ? topJobs.map((job, i) => {
                    const colors = ["#1392ec", "#f59e0b", "#a855f7"];
                    const color = colors[i % colors.length];
                    const initials = job.title.substring(0, 2).toUpperCase();
                    return (
                      <tr key={job.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="py-5 pl-2">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl flex items-center justify-center font-black text-xs shadow-lg" style={{ backgroundColor: `${color}20`, color: color }}>{initials}</div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-[#1392ec] transition-colors">{job.title}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Cập nhật gần đây</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">{job.category}</td>
                        <td className="py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{job.appCount}</span>
                            <span className="text-[9px] font-black uppercase text-emerald-500">+0%</span>
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-1.5 bg-[#0f172a] rounded-full overflow-hidden border border-slate-800">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${job.passRate}%`, backgroundColor: job.passRate > 80 ? '#10b981' : job.passRate > 60 ? '#1392ec' : '#64748b' }}></div>
                            </div>
                            <span className="text-[10px] font-black text-white">{job.passRate}%</span>
                          </div>
                        </td>
                        <td className="py-5 text-right pr-2">
                          <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-all">
                            <span className="material-symbols-outlined text-xl">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu tuyển dụng</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessDashboard;
