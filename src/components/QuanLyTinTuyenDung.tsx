import React, { useState, useEffect } from 'react';
import { User, Job } from '@/types';
import { backend } from '@/services/backendService';

interface QuanLyTinTuyenDungProps {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToPostJob: () => void;
  onEditJob: (job: Job) => void;
  onNavigateToCandidateManagement: () => void;
  onNavigateToProfile: () => void;
}

const QuanLyTinTuyenDung: React.FC<QuanLyTinTuyenDungProps> = ({ 
  currentUser, 
  onBack, 
  onLogout, 
  onNavigateToPostJob,
  onEditJob,
  onNavigateToCandidateManagement,
  onNavigateToProfile
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Fetch jobs every time component renders to ensure latest data from localStorage
  const refreshJobs = () => {
    const allJobs = backend.getJobs();
    const companyJobs = allJobs.filter(j => j.companyId === currentUser.id);
    setJobs(companyJobs);
  };

  useEffect(() => {
    refreshJobs();
  }, [currentUser.id]);

  // Also refresh when component mounts (in case data changed from other sources)
  useEffect(() => {
    refreshJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return job.tag !== 'CLOSED'; // Simplified logic
    if (activeTab === 'closed') return job.tag === 'CLOSED';
    if (activeTab === 'draft') return job.tag === 'DRAFT';
    return true;
  });

  const allApps = backend.getApplications();
  const companyApps = allApps.filter(app => jobs.some(j => j.id === app.jobId));
  const totalCandidates = companyApps.length;
  const hiredCount = companyApps.filter(a => a.status === 'HIRED').length;
  const openJobsCount = jobs.filter(j => j.tag !== 'CLOSED').length;
  const avgPassRate = totalCandidates > 0 ? Math.round((hiredCount / totalCandidates) * 100) : 0;

  return (
    <div className="bg-[#0f172a] text-slate-100 antialiased h-screen flex overflow-hidden font-display">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#1e293b] border-r border-[#334155] flex flex-col h-full shrink-0">
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
            <button 
              onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm uppercase tracking-wider font-bold">Tổng quan</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-bold transition-all shadow-lg shadow-[#1392ec]/20 text-left mt-1">
              <span className="material-symbols-outlined">article</span>
              <span className="text-sm uppercase tracking-wider">Tin tuyển dụng</span>
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0f172a]">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#0f172a] border-b border-[#334155] flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">Quản lý Tin tuyển dụng</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Theo dõi và tối ưu hóa quy trình tuyển dụng của bạn</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-[#1e293b] rounded-full relative transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
            </button>
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

        {/* Main Body Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
            {/* Action Bar & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex p-1 bg-[#1e293b] rounded-xl border border-[#334155] w-fit">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'all' ? 'bg-[#233948] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setActiveTab('active')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'active' ? 'bg-[#233948] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Đang tuyển
                </button>
                <button 
                  onClick={() => setActiveTab('closed')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'closed' ? 'bg-[#233948] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Đã đóng
                </button>
                <button 
                  onClick={() => setActiveTab('draft')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'draft' ? 'bg-[#233948] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Nháp
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
                  <input 
                    className="pl-10 pr-4 py-2.5 bg-[#1e293b] border border-[#334155] rounded-xl text-xs font-medium focus:border-[#1392ec] outline-none min-w-[320px] transition-all placeholder:text-slate-700 text-slate-200" 
                    placeholder="Tìm tên vị trí..." 
                    type="text"
                  />
                </div>
                <button 
                  onClick={onNavigateToPostJob}
                  className="flex items-center gap-2 bg-[#1392ec] hover:bg-[#1181d1] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#1392ec]/20"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Đăng tin mới
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a]/30 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Tên vị trí</th>
                      <th className="px-8 py-5">Ngày đăng</th>
                      <th className="px-8 py-5">Hạn nộp</th>
                      <th className="px-8 py-5">Ứng tuyển</th>
                      <th className="px-8 py-5 text-center">Phễu (Pass / Fail)</th>
                      <th className="px-8 py-5 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredJobs.map((job, i) => {
                      const jobApps = allApps.filter(a => a.jobId === job.id);
                      const passCount = jobApps.filter(a => a.status === 'HIRED').length;
                      const failCount = jobApps.filter(a => a.status === 'FAILED').length;
                      const totalJobApps = jobApps.length;
                      const passPercent = totalJobApps > 0 ? Math.round((passCount / totalJobApps) * 100) : 0;
                      const failPercent = totalJobApps > 0 ? Math.round((failCount / totalJobApps) * 100) : 0;

                      return (
                        <tr key={job.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white group-hover:text-[#1392ec] transition-colors">{job.title}</span>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`size-2 rounded-full ${job.tag === 'HOT' ? 'bg-emerald-500' : job.tag === 'CLOSED' ? 'bg-red-500' : 'bg-slate-500'}`}></span>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${job.tag === 'HOT' ? 'text-emerald-500' : job.tag === 'CLOSED' ? 'text-red-400' : 'text-slate-500'}`}>
                                  {job.tag === 'HOT' ? 'Đang tuyển' : job.tag === 'CLOSED' ? 'Hết hạn' : 'Công khai'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{job.postedDate || '12/02/2026'}</td>
                          <td className={`px-8 py-6 text-xs font-bold uppercase tracking-wider text-slate-400`}>{job.deadline}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-white">{totalJobApps}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-36 h-2 bg-[#0f172a] rounded-full flex overflow-hidden border border-slate-800">
                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${passPercent}%` }}></div>
                                <div className="h-full bg-red-400" style={{ width: `${failPercent}%` }}></div>
                              </div>
                              <div className="flex justify-between w-36 text-[9px] font-black uppercase tracking-widest">
                                <span className="text-emerald-500">{passCount} Pass</span>
                                <span className="text-red-400">{failCount} Fail</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              <button 
                                onClick={() => onEditJob(job)}
                                className="p-2 text-slate-500 hover:text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg transition-all" 
                                title="Sửa tin"
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button 
                                onClick={() => setSelectedJob(job)}
                                className={`ml-2 px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all bg-[#0f172a] text-slate-300 hover:bg-slate-800 border border-[#334155]`}
                              >
                                Chi tiết
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="px-8 py-5 bg-[#0f172a]/20 border-t border-[#334155] flex items-center justify-between">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hiển thị 1-4 của 12 bài đăng</p>
                <div className="flex items-center gap-2">
                  <button className="size-8 flex items-center justify-center rounded-lg border border-[#334155] text-slate-500 hover:bg-slate-800 transition-colors disabled:opacity-30" disabled>
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button className="size-8 flex items-center justify-center rounded-lg bg-[#1392ec] text-white text-xs font-black shadow-lg shadow-[#1392ec]/20">1</button>
                  <button className="size-8 flex items-center justify-center rounded-lg border border-[#334155] text-slate-500 hover:bg-slate-800 text-xs font-black transition-colors">2</button>
                  <button className="size-8 flex items-center justify-center rounded-lg border border-[#334155] text-slate-500 hover:bg-slate-800 text-xs font-black transition-colors">3</button>
                  <button className="size-8 flex items-center justify-center rounded-lg border border-[#334155] text-slate-500 hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recruitment Stats Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tổng ứng tuyển</h4>
                  <span className="material-symbols-outlined text-[#1392ec] bg-[#1392ec]/10 p-1.5 rounded-lg">groups</span>
                </div>
                <p className="text-4xl font-black text-white italic">{totalCandidates}</p>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span> ↑ 0% so với tháng trước
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tỷ lệ Pass (AI)</h4>
                  <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg">verified</span>
                </div>
                <p className="text-4xl font-black text-white italic">{avgPassRate}%</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Dựa trên {totalCandidates} hồ sơ đã duyệt</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vị trí đang mở</h4>
                  <span className="material-symbols-outlined text-slate-500 bg-slate-800 p-1.5 rounded-lg">work</span>
                </div>
                <p className="text-4xl font-black text-white italic">{openJobsCount.toString().padStart(2, '0')}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Trên tổng số {jobs.length} chiến dịch</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e293b] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[#334155] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-[#334155] flex items-start justify-between bg-[#0f172a]/50">
              <div className="flex gap-6">
                <div className="size-16 rounded-2xl bg-white flex items-center justify-center shadow-xl shrink-0">
                  <img src={currentUser.avatar} alt="logo" className="size-10 rounded-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">{selectedJob.title}</h3>
                  <p className="text-sm font-bold text-[#1392ec] uppercase tracking-widest mt-2">{currentUser.name}</p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                      <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                      <span className="material-symbols-outlined text-xs text-slate-400">payments</span>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{selectedJob.salary}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                      <span className="material-symbols-outlined text-xs text-red-500">event</span>
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Hạn: {selectedJob.deadline}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-10">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">description</span> Mô tả công việc
                    </h4>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {selectedJob.description}
                    </div>
                  </section>

                  {selectedJob.benefits && (
                    <section>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">redeem</span> Quyền lợi & Đãi ngộ
                      </h4>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedJob.benefits}
                      </div>
                    </section>
                  )}

                  {selectedJob.testAssignment && (
                    <section className="p-6 rounded-2xl bg-[#0f172a] border border-[#334155]">
                      <h4 className="text-[10px] font-black text-[#1392ec] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">assignment</span> Đề bài kiểm tra (Case Study)
                      </h4>
                      <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap font-medium italic">
                        {selectedJob.testAssignment}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#334155] space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Tiêu chí AI</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requirements.map((req, idx) => (
                          <span key={idx} className="px-2 py-1 bg-[#1392ec]/10 text-[#1392ec] text-[9px] font-black uppercase tracking-widest rounded border border-[#1392ec]/20">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Điểm CV tối thiểu</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1392ec]" style={{ width: `${selectedJob.minScore || 75}%` }}></div>
                        </div>
                        <span className="text-sm font-black text-white italic">{selectedJob.minScore || 75}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Trạng thái AI</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Hệ thống AI đã sẵn sàng quét hồ sơ cho vị trí này dựa trên các từ khóa và điểm số bạn đã thiết lập.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#334155] bg-[#0f172a]/50 flex justify-end gap-4">
              <button 
                onClick={() => setSelectedJob(null)}
                className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-all"
              >
                Đóng
              </button>
              <button 
                onClick={() => onEditJob(selectedJob)}
                className="px-8 py-2.5 bg-[#1392ec] rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#1181d1] shadow-xl shadow-[#1392ec]/20 transition-all"
              >
                Chỉnh sửa tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuanLyTinTuyenDung;
