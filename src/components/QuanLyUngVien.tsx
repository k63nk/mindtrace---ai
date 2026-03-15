import React, { useState, useEffect } from 'react';
import { User, Application, Job, Notification, ApplicationStatus } from '@/types';
import { backend } from '@/services/backendService';
import NotificationCenter from './NotificationCenter';

interface QuanLyUngVienProps {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToJobManagement: () => void;
  onNavigateToPostJob: () => void;
  onNavigateToProfile: () => void;
}

const QuanLyUngVien: React.FC<QuanLyUngVienProps> = ({ 
  currentUser, 
  onBack, 
  onLogout, 
  onNavigateToJobManagement,
  onNavigateToPostJob,
  onNavigateToProfile
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [testScore, setTestScore] = useState<number>(0);
  const [evaluationStatus, setEvaluationStatus] = useState<'HIRED' | 'FAILED'>('HIRED');
  const [companyFeedback, setCompanyFeedback] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [interviewSlots, setInterviewSlots] = useState<string[]>(['']);
  const [interviewLocation, setInterviewLocation] = useState('');

  useEffect(() => {
    if (selectedApp) {
      setTestScore(selectedApp.testScore || 0);
      setEvaluationStatus((selectedApp.status === 'HIRED' || selectedApp.status === 'FAILED') ? selectedApp.status as 'HIRED' | 'FAILED' : 'HIRED');
      setCompanyFeedback(selectedApp.companyFeedback || '');
      setInterviewSlots(selectedApp.interviewSlots || ['']);
      setInterviewLocation(selectedApp.interviewLocation || '');
    }
  }, [selectedApp]);

  useEffect(() => {
    const allJobs = backend.getJobs();
    // Filter jobs for this company
    const companyJobs = allJobs.filter(j => j.companyId === currentUser.id);
    setJobs(companyJobs);

    const allApps = backend.getApplications();
    const companyJobIds = companyJobs.map(j => j.id);
    const companyApps = allApps.filter(app => companyJobIds.includes(app.jobId));
    
    // Filter to keep only the latest application per student per job to avoid clutter
    const latestAppsMap = new Map<string, Application>();
    companyApps.forEach(app => {
      const key = `${app.studentId}-${app.jobId}`;
      const existing = latestAppsMap.get(key);
      // Since IDs are timestamp-based (app_...), higher ID means newer
      if (!existing || app.id > existing.id) {
        latestAppsMap.set(key, app);
      }
    });

    setApplications(Array.from(latestAppsMap.values()).reverse());

    setNotifications(backend.getNotifications(currentUser.id));
  }, [currentUser.id]);

  // Also refresh on mount to ensure latest data
  useEffect(() => {
    const allJobs = backend.getJobs();
    const companyJobs = allJobs.filter(j => j.companyId === currentUser.id);
    setJobs(companyJobs);

    const allApps = backend.getApplications();
    const companyJobIds = companyJobs.map(j => j.id);
    const companyApps = allApps.filter(app => companyJobIds.includes(app.jobId));
    
    const latestAppsMap = new Map<string, Application>();
    companyApps.forEach(app => {
      const key = `${app.studentId}-${app.jobId}`;
      const existing = latestAppsMap.get(key);
      if (!existing || app.id > existing.id) {
        latestAppsMap.set(key, app);
      }
    });

    setApplications(Array.from(latestAppsMap.values()).reverse());
    setNotifications(backend.getNotifications(currentUser.id));
  }, []);

  const waitingCount = applications.filter(app => app.status === 'TEST_SUBMITTED').length;
  const totalCandidates = applications.length;
  const avgAIScore = applications.length > 0 
    ? Math.round(applications.reduce((acc, curr) => acc + curr.cvScore, 0) / applications.length) 
    : 0;

  const handleMarkAsRead = (id: string) => {
    backend.markNotificationAsRead(id);
    setNotifications(backend.getNotifications(currentUser.id));
  };

  const getJobTitle = (jobId: string) => {
    return jobs.find(j => j.id === jobId)?.title || 'Vị trí ẩn';
  };

  const getStudentInfo = (studentId: string) => {
    const user = backend.getUserById(studentId);
    if (user) {
      const names = user.name.split(' ');
      const initial = names.length > 1 ? names[0][0] + names[names.length - 1][0] : user.name.substring(0, 2).toUpperCase();
      return {
        name: user.name,
        email: user.email,
        initial: initial
      };
    }
    return {
      name: 'Ứng viên MindTrace',
      email: 'candidate@mindtrace.ai',
      initial: 'MT'
    };
  };

  const downloadFile = (fileName: string) => {
    // Create a mock blob and download it
    const blob = new Blob(["Mock content for " + fileName], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSendResult = () => {
    if (!selectedApp) return;

    let finalStatus: ApplicationStatus = evaluationStatus;
    
    // If it was TEST_SUBMITTED and business says HIRED, it means PASSED_TEST (initial pass)
    if (selectedApp.status === 'TEST_SUBMITTED' && evaluationStatus === 'HIRED') {
      finalStatus = 'PASSED_TEST';
    }

    const updatedApp = backend.updateApplication(selectedApp.id, {
      status: finalStatus,
      testScore: testScore,
      companyFeedback: companyFeedback,
      interviewSlots: finalStatus === 'PASSED_TEST' ? interviewSlots.filter(s => s.trim() !== '') : undefined,
      interviewLocation: finalStatus === 'PASSED_TEST' ? interviewLocation : undefined
    });

    if (updatedApp) {
      // Notify student
      const job = jobs.find(j => j.id === selectedApp.jobId);
      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType: 'success' | 'info' | 'warning' = 'info';

      if (finalStatus === 'PASSED_TEST') {
        notificationTitle = 'Chúc mừng! Bạn vượt qua vòng sơ tuyển';
        notificationMessage = `Doanh nghiệp ${job?.companyName} đã gửi kết quả cho vị trí ${job?.title}. Trạng thái: VƯỢT QUA VÒNG SƠ TUYỂN. Vui lòng chọn lịch phỏng vấn.`;
        notificationType = 'success';
      } else if (finalStatus === 'HIRED') {
        notificationTitle = 'Chúc mừng! Bạn đã trúng tuyển';
        notificationMessage = `Chúc mừng! Bạn đã trúng tuyển vào vị trí ${job?.title} tại ${job?.companyName}.`;
        notificationType = 'success';
      } else {
        notificationTitle = 'Kết quả ứng tuyển';
        notificationMessage = `Rất tiếc, doanh nghiệp ${job?.companyName} đã gửi kết quả cho vị trí ${job?.title}. Trạng thái: KHÔNG PHÙ HỢP.`;
        notificationType = 'info';
      }

      backend.addNotification(
        selectedApp.studentId,
        notificationTitle,
        notificationMessage,
        notificationType
      );

      alert('Đã gửi kết quả thành công!');
      setSelectedApp(null);
      
      // Refresh list with latest filter
      const allApps = backend.getApplications();
      const companyJobIds = jobs.map(j => j.id);
      const companyApps = allApps.filter(app => companyJobIds.includes(app.jobId));
      
      const latestAppsMap = new Map<string, Application>();
      companyApps.forEach(app => {
        const key = `${app.studentId}-${app.jobId}`;
        const existing = latestAppsMap.get(key);
        if (!existing || app.id > existing.id) {
          latestAppsMap.set(key, app);
        }
      });
      setApplications(Array.from(latestAppsMap.values()).reverse());
    }
  };

  const filteredApps = applications.filter(app => {
    // Tab filter
    if (activeFilter === 'waiting' && app.status !== 'TEST_SUBMITTED') return false;
    
    // Job filter
    if (selectedJobFilter !== 'all' && app.jobId !== selectedJobFilter) return false;
    
    // Status filter
    if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const student = getStudentInfo(app.studentId);
      const jobTitle = getJobTitle(app.jobId);
      const query = searchQuery.toLowerCase();
      return student.name.toLowerCase().includes(query) || 
             student.email.toLowerCase().includes(query) || 
             jobTitle.toLowerCase().includes(query);
    }
    
    return true;
  });

  return (
    <div className="bg-[#0f172a] text-slate-100 antialiased h-screen flex overflow-hidden font-display">
      {/* Left Navigation Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-[#1e293b] border-r border-[#334155] flex flex-col h-full">
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
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-bold transition-all shadow-lg shadow-[#1392ec]/20 text-left mt-1">
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm uppercase tracking-wider">Quản lý ứng viên</span>
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
        {/* Header Section */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#0f172a] border-b border-[#334155] flex-shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-[#1e293b] border-none rounded-lg focus:ring-2 focus:ring-[#1392ec]/50 text-sm transition-all placeholder:text-slate-600 text-slate-200 font-medium" 
                placeholder="Tìm kiếm ứng viên, vị trí..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Page Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Quản lý Ứng tuyển</h2>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Theo dõi hành trình và đánh giá ứng viên với sự hỗ trợ của AI.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-xl bg-[#1e293b] border border-[#334155] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all text-slate-300">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Xuất báo cáo
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-[#1392ec] text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1392ec]/20 hover:brightness-110 transition-all">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Thêm ứng viên
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Tổng ứng viên</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black text-white italic">{totalCandidates.toLocaleString()}</h3>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+12.5%</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Đang chờ duyệt</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black text-white italic">{waitingCount}</h3>
                  <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">Ổn định</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Mời phỏng vấn</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black text-white italic">{applications.filter(a => a.status === 'HIRED').length}</h3>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">+4%</span>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-[#1e293b] border border-[#334155] shadow-xl">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Điểm AI trung bình</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black text-white italic">{avgAIScore}<span className="text-sm not-italic text-slate-600 ml-1">/100</span></h3>
                  <div className="flex gap-1">
                    <span className="size-2 rounded-full bg-[#1392ec]"></span>
                    <span className="size-2 rounded-full bg-[#1392ec]"></span>
                    <span className="size-2 rounded-full bg-[#1392ec]/30"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center bg-[#1e293b] rounded-xl p-1 border border-[#334155]">
                <button 
                  onClick={() => setActiveFilter('all')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeFilter === 'all' ? 'bg-[#233948] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setActiveFilter('waiting')}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 ${activeFilter === 'waiting' ? 'bg-[#233948] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Đang chờ chấm test
                  {waitingCount > 0 && (
                    <span className="bg-[#1392ec] text-white size-5 rounded-full flex items-center justify-center text-[8px] font-black">
                      {waitingCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="h-8 w-px bg-[#334155] hidden md:block"></div>
              <select 
                className="bg-[#1e293b] border-[#334155] rounded-xl text-[10px] font-black uppercase tracking-widest px-5 py-2.5 focus:ring-[#1392ec] outline-none text-slate-300 cursor-pointer"
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
              >
                <option value="all">Tất cả vị trí</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
              <select 
                className="bg-[#1e293b] border-[#334155] rounded-xl text-[10px] font-black uppercase tracking-widest px-5 py-2.5 focus:ring-[#1392ec] outline-none text-slate-300 cursor-pointer"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="all">Mọi trạng thái</option>
                <option value="APPLIED">Mới ứng tuyển</option>
                <option value="CV_PASSED">Vượt qua CV</option>
                <option value="TEST_SUBMITTED">Đã nộp bài test</option>
                <option value="HIRED">Đã tuyển</option>
                <option value="FAILED">Đã loại</option>
              </select>
            </div>

            {/* Candidate Table Card */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a]/30 border-b border-[#334155] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Ứng viên</th>
                      <th className="px-8 py-5">Vị trí</th>
                      <th className="px-8 py-5">AI CV Score</th>
                      <th className="px-8 py-5">Trạng thái</th>
                      <th className="px-8 py-5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredApps.map((app, i) => {
                      const student = getStudentInfo(app.studentId);
                      return (
                        <tr key={app.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-[#1392ec]/10 flex items-center justify-center text-[#1392ec] font-black text-xs shadow-lg border border-[#1392ec]/20">{student.initial}</div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-[#1392ec] transition-colors">{student.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{getJobTitle(app.jobId)}</td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-1.5 bg-[#0f172a] rounded-full overflow-hidden border border-slate-800">
                                <div className={`h-full rounded-full transition-all duration-1000 ${app.cvScore > 80 ? 'bg-emerald-500' : 'bg-[#1392ec]'}`} style={{ width: `${app.cvScore}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-white">{app.cvScore}/100</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-2">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                app.status === 'HIRED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                app.status === 'INTERVIEW_CONFIRMED' ? 'bg-emerald-600 text-white border-emerald-600' :
                                app.status === 'INTERVIEW_REJECTED' ? 'bg-red-600 text-white border-red-600' :
                                app.status === 'TEST_SUBMITTED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                app.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {app.status === 'TEST_SUBMITTED' ? 'Đang chờ chấm test' : 
                                 app.status === 'HIRED' ? 'Vượt qua vòng sơ tuyển' : 
                                 app.status === 'INTERVIEW_CONFIRMED' ? 'Đã xác nhận PV' :
                                 app.status === 'INTERVIEW_REJECTED' ? 'Đã từ chối PV' :
                                 app.status === 'FAILED' ? 'Trượt' :
                                 app.status}
                              </span>
                              {app.status === 'INTERVIEW_CONFIRMED' && app.selectedInterviewSlot && (
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                  Lịch: {app.selectedInterviewSlot}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => setSelectedApp(app)}
                              className="text-[10px] font-black text-[#1392ec] uppercase tracking-widest hover:underline"
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="px-8 py-5 bg-[#0f172a]/20 border-t border-[#334155] flex items-center justify-between">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hiển thị {filteredApps.length} ứng viên</p>
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

            {/* Footer Note */}
            <div className="bg-[#1392ec]/5 rounded-2xl p-8 border border-[#1392ec]/20 flex items-start gap-6 shadow-xl">
              <div className="p-3 rounded-xl bg-[#1392ec]/10 text-[#1392ec]">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <div>
                <h4 className="text-sm font-black text-[#1392ec] uppercase tracking-widest">Tối ưu hóa bởi AI</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
                  Hệ thống AI vừa cập nhật điểm CV cho 12 ứng viên mới dựa trên bộ tiêu chuẩn kỹ năng mới nhất. 
                  Hãy kiểm tra các ứng viên có điểm trên 85 để tiến hành phỏng vấn ngay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluation Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1e293b] border border-[#334155] rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <header className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-[#1392ec]/10 flex items-center justify-center text-[#1392ec]">
                    <span className="material-symbols-outlined">person_search</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Đánh giá ứng viên</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ứng tuyển vị trí: {getJobTitle(selectedApp.jobId)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side: Info & Files */}
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Thông tin ứng viên</h4>
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="size-14 rounded-2xl bg-[#1392ec]/10 flex items-center justify-center text-[#1392ec] font-black text-xl border border-[#1392ec]/20">
                          {getStudentInfo(selectedApp.studentId).initial}
                        </div>
                        <div>
                          <h5 className="text-lg font-bold text-white">{getStudentInfo(selectedApp.studentId).name}</h5>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{getStudentInfo(selectedApp.studentId).email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Điểm CV AI</p>
                          <p className="text-xl font-black text-[#1392ec] italic">{selectedApp.cvScore}/100</p>
                        </div>
                        <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ngày nộp</p>
                          <p className="text-sm font-bold text-white">{selectedApp.appliedDate}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Tài liệu đính kèm</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl flex items-center justify-between group hover:border-[#1392ec]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="size-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined">picture_as_pdf</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{selectedApp.cvFileName}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Hồ sơ CV</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => downloadFile(selectedApp.cvFileName)}
                          className="p-2 text-slate-500 hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      </div>

                      {selectedApp.testSubmission && (
                        <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl flex items-center justify-between group hover:border-orange-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="size-10 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                              <span className="material-symbols-outlined">assignment</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{selectedApp.testSubmission}</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Bài làm Test</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => downloadFile(selectedApp.testSubmission)}
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined">download</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Side: Evaluation Form */}
                <div className="space-y-8">
                  <section>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Chấm điểm & Đánh giá</h4>
                    <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-8">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-xs font-black text-white uppercase tracking-widest">Điểm bài test (0 - 100)</label>
                          <span className="text-2xl font-black text-[#1392ec] italic">{testScore}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={testScore} 
                          onChange={(e) => setTestScore(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#1392ec]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-black text-white uppercase tracking-widest block mb-4">Quyết định tuyển dụng</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setEvaluationStatus('HIRED')}
                            className={`py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all flex items-center justify-center gap-2 ${
                              evaluationStatus === 'HIRED' 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/10' 
                              : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {selectedApp.status === 'INTERVIEW_CONFIRMED' ? 'Trúng tuyển' : 'Vượt qua vòng sơ tuyển'}
                          </button>
                          <button 
                            onClick={() => setEvaluationStatus('FAILED')}
                            className={`py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all flex items-center justify-center gap-2 ${
                              evaluationStatus === 'FAILED' 
                              ? 'bg-red-500/20 border-red-500 text-red-500 shadow-lg shadow-red-500/10' 
                              : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Trượt
                          </button>
                        </div>
                      </div>

                      {selectedApp.status === 'INTERVIEW_CONFIRMED' && selectedApp.selectedInterviewSlot && (
                        <div className="p-6 bg-[#1392ec]/10 border border-[#1392ec]/20 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-[#1392ec]/20 flex items-center justify-center text-[#1392ec]">
                              <span className="material-symbols-outlined">event_available</span>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Ứng viên đã xác nhận lịch phỏng vấn</h4>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-black text-[#1392ec] uppercase tracking-[0.2em] mb-1">Thời gian:</p>
                              <p className="text-lg font-black text-emerald-500 italic tracking-tight">
                                {selectedApp.selectedInterviewSlot}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Địa điểm:</p>
                              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                                {selectedApp.interviewLocation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {evaluationStatus === 'HIRED' && selectedApp.status !== 'INTERVIEW_CONFIRMED' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-black text-white uppercase tracking-widest">Lịch hẹn phỏng vấn</label>
                              <button 
                                onClick={() => setInterviewSlots([...interviewSlots, ''])}
                                className="text-[10px] font-black text-[#1392ec] uppercase tracking-widest hover:underline"
                              >
                                + Thêm lịch
                              </button>
                            </div>
                            {interviewSlots.map((slot, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input 
                                  type="text"
                                  value={slot}
                                  onChange={(e) => {
                                    const newSlots = [...interviewSlots];
                                    newSlots[idx] = e.target.value;
                                    setInterviewSlots(newSlots);
                                  }}
                                  placeholder="Ví dụ: 09:00 - 25/02/2026"
                                  className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl p-4 focus:border-[#1392ec] outline-none transition-all text-sm font-medium text-slate-200"
                                />
                                {interviewSlots.length > 1 && (
                                  <button 
                                    onClick={() => setInterviewSlots(interviewSlots.filter((_, i) => i !== idx))}
                                    className="p-4 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                  >
                                    <span className="material-symbols-outlined">delete</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-black text-white uppercase tracking-widest block">Địa điểm phỏng vấn</label>
                            <input 
                              type="text"
                              value={interviewLocation}
                              onChange={(e) => setInterviewLocation(e.target.value)}
                              placeholder="Ví dụ: Tòa nhà TechNova, Quận 1 hoặc Google Meet"
                              className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-4 focus:border-[#1392ec] outline-none transition-all text-sm font-medium text-slate-200"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-black text-white uppercase tracking-widest block">Nhận xét từ doanh nghiệp</label>
                        <textarea 
                          className="w-full bg-[#0f172a] border border-slate-800 rounded-xl p-4 focus:border-[#1392ec] outline-none transition-all text-sm font-medium text-slate-200" 
                          rows={4}
                          placeholder="Nhập nhận xét chi tiết cho ứng viên..."
                          value={companyFeedback}
                          onChange={(e) => setCompanyFeedback(e.target.value)}
                        ></textarea>
                      </div>

                      <button 
                        onClick={handleSendResult}
                        className="w-full py-4 bg-[#1392ec] text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-[#1392ec]/20 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">send</span>
                        Gửi kết quả đánh giá
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuanLyUngVien;
