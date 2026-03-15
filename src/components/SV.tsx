
import React, { useState, useEffect } from 'react';
import { User, Application, Job, Notification } from '@/types';
import { backend } from '@/services/backendService';
import NotificationCenter from './NotificationCenter';

interface SVProps {
  currentUser: User;
  onLogout: () => void;
  onStartPractice: (practiceId: string) => void;
  onNavigateToApplications: (appId?: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToNewJobs: () => void;
}

const SV: React.FC<SVProps> = ({ currentUser, onLogout, onStartPractice, onNavigateToApplications, onNavigateToProfile, onNavigateToNewJobs }) => {
  const [stats, setStats] = useState({ totalApplications: 0, passedCount: 0, interviewCount: 0, avgScore: 0, recentApps: [] as Application[] });
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const userStats = backend.getStudentStats(currentUser.id);
    const jobs = backend.getJobs();
    const notifs = backend.getNotifications(currentUser.id);
    setStats(userStats);
    setAllJobs(jobs);
    setNotifications(notifs);
  }, [currentUser.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    backend.markNotificationAsRead(id);
    setNotifications(backend.getNotifications(currentUser.id));
  };

  const getJobTitle = (jobId: string) => allJobs.find(j => j.id === jobId)?.title || "Vị trí tuyển dụng";
  const getCompanyName = (jobId: string) => allJobs.find(j => j.id === jobId)?.companyName || "Công ty đối tác";

  const latestJobs = allJobs.slice(0, 3);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f14] text-slate-100 font-display">
      <aside className="w-64 border-r border-slate-800 bg-[#111821] flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1392ec] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#1392ec]/20">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic text-left">MindTrace</h1>
            <p className="text-[10px] text-[#1392ec] font-bold tracking-widest uppercase">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-semibold text-left shadow-lg">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Bảng điều khiển</span>
          </button>
          <button onClick={onNavigateToApplications} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">work_history</span>
            <span className="text-sm">Đơn ứng tuyển</span>
          </button>
          <button onClick={() => onStartPractice('all')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">science</span>
            <span className="text-sm">Kho luyện tập AI</span>
          </button>
          <button onClick={onNavigateToNewJobs} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">search</span>
            <span className="text-sm">Việc làm mới</span>
          </button>
          <button onClick={onNavigateToProfile} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm">Hồ sơ cá nhân</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/10 transition-colors text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#0a0f14]">
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-[#0a0f14]/80 backdrop-blur-md border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">Chào mừng, {currentUser.name}!</h2>
            <p className="text-sm text-slate-400">Tài khoản: {currentUser.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter 
              notifications={notifications} 
              onMarkAsRead={handleMarkAsRead} 
            />
            <div onClick={onNavigateToProfile} className="h-10 w-10 rounded-full bg-slate-700 bg-cover bg-center border border-slate-600 shadow-md cursor-pointer" style={{ backgroundImage: `url('${currentUser.avatar}')` }}></div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111821] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tổng đơn ứng tuyển</p>
              <h4 className="text-4xl font-black text-white">{stats.totalApplications}</h4>
            </div>
            <div className="bg-[#111821] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Điểm AI trung bình</p>
              <h4 className="text-4xl font-black text-emerald-500">{stats.avgScore}%</h4>
            </div>
            <div className="bg-[#111821] p-6 rounded-2xl border border-slate-800 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vòng phỏng vấn</p>
              <h4 className="text-4xl font-black text-[#1392ec]">{stats.interviewCount}</h4>
            </div>
          </div>

          {/* Section: Đơn ứng tuyển gần đây */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#1392ec] rounded-full"></span>
                Ứng tuyển gần đây
              </h3>
              <button onClick={onNavigateToApplications} className="text-[#1392ec] text-sm font-semibold hover:underline">Xem tất cả</button>
            </div>

            {stats.recentApps.length === 0 ? (
              <div className="bg-[#111821] p-12 rounded-3xl border border-dashed border-slate-800 text-center">
                <p className="text-slate-500">Bạn chưa có hoạt động ứng tuyển nào gần đây.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {stats.recentApps.map((app: any) => (
                  <div 
                    key={app.id} 
                    onClick={() => onNavigateToApplications(app.id)}
                    className="bg-[#111821] p-6 rounded-[2rem] border border-slate-800 shadow-xl group cursor-pointer hover:border-[#1392ec]/50 transition-all"
                  >
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      app.status === 'CV_PASSED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                      app.status === 'TEST_SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      app.status === 'HIRED' ? 'bg-emerald-600 text-white border-emerald-600' :
                      app.status === 'INTERVIEW_CONFIRMED' ? 'bg-emerald-600 text-white border-emerald-600' :
                      app.status === 'INTERVIEW_REJECTED' ? 'bg-red-600 text-white border-red-600' :
                      app.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    } mb-4 inline-block`}>
                      {app.status === 'CV_PASSED' ? 'Đã qua vòng CV' : 
                       app.status === 'TEST_SUBMITTED' ? 'Đã nộp bài test' :
                       app.status === 'HIRED' ? 'Vượt qua vòng sơ tuyển' :
                       app.status === 'INTERVIEW_CONFIRMED' ? 'Đã xác nhận PV' :
                       app.status === 'INTERVIEW_REJECTED' ? 'Đã từ chối PV' :
                       app.status === 'FAILED' ? 'Trượt' :
                       app.status}
                    </span>
                    <h4 className="font-bold text-white mb-1 group-hover:text-[#1392ec] transition-colors">{getJobTitle(app.jobId)}</h4>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-4">{getCompanyName(app.jobId)}</p>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-900/50 rounded-xl border border-slate-800">
                       <span className="text-[10px] text-slate-400 font-black uppercase">AI Score</span>
                       <span className="text-sm font-black text-emerald-500">{app.cvScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section: Việc làm mới nhất */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                Việc làm mới nhất
              </h3>
              <button onClick={onNavigateToNewJobs} className="text-[#1392ec] text-sm font-semibold hover:underline">Xem tất cả</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestJobs.map((job) => (
                <div key={job.id} className="bg-[#111821] p-6 rounded-[2rem] border border-slate-800 shadow-xl group hover:border-emerald-500/50 transition-all cursor-pointer" onClick={onNavigateToNewJobs}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.companyName}`} 
                        alt={job.companyName} 
                        className="size-8"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{job.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{job.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs text-slate-500">location_on</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.location}</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{job.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SV;
