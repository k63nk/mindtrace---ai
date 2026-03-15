
import React, { useEffect, useState } from 'react';
import { User, Application, Job } from '../types';
import { backend } from '../services/backendService';

interface DonUngTuyenProps {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToExercises: () => void;
  onStartTest: (jobId: string, appId?: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToNewJobs: () => void;
  initialSelectedAppId?: string | null;
}

const DonUngTuyen: React.FC<DonUngTuyenProps> = ({ currentUser, onBack, onLogout, onNavigateToExercises, onStartTest, onNavigateToProfile, onNavigateToNewJobs, initialSelectedAppId }) => {
  const [apps, setApps] = useState<Application[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [modalTimeLeft, setModalTimeLeft] = useState<number>(86400);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  useEffect(() => {
    if (selectedApp && selectedApp.selectedInterviewSlot) {
      setSelectedSlot(selectedApp.selectedInterviewSlot);
    } else {
      setSelectedSlot('');
    }
  }, [selectedApp]);

  useEffect(() => {
    const userApps = backend.getApplicationsByStudent(currentUser.id);
    
    // Filter to latest per job
    const latestAppsMap = new Map<string, Application>();
    userApps.forEach(app => {
      const existing = latestAppsMap.get(app.jobId);
      if (!existing || app.id > existing.id) {
        latestAppsMap.set(app.jobId, app);
      }
    });
    
    const jobs = backend.getJobs();
    const finalApps = Array.from(latestAppsMap.values()).reverse();
    setApps(finalApps);
    setAllJobs(jobs);

    if (initialSelectedAppId) {
      const appToSelect = finalApps.find(a => a.id === initialSelectedAppId);
      if (appToSelect) {
        setSelectedApp(appToSelect);
      }
    }
  }, [currentUser.id, initialSelectedAppId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedApp && selectedApp.status === 'CV_PASSED' && selectedApp.testStartTime) {
      const updateTimer = () => {
        const startTime = new Date(selectedApp.testStartTime!).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, 86400 - elapsed);
        setModalTimeLeft(remaining);
      };
      
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedApp]);

  const getJobDetails = (jobId: string) => {
    return allJobs.find(j => j.id === jobId);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
  };

  const getRemainingTime = (app: Application) => {
    if (!app.testStartTime) return 86400;
    const startTime = new Date(app.testStartTime).getTime();
    const now = new Date().getTime();
    const elapsed = Math.floor((now - startTime) / 1000);
    return Math.max(0, 86400 - elapsed);
  };

  const handleConfirmInterview = () => {
    if (!selectedApp || !selectedSlot) {
      alert('Vui lòng chọn một lịch phỏng vấn.');
      return;
    }

    const updated = backend.updateApplication(selectedApp.id, {
      status: 'INTERVIEW_CONFIRMED',
      selectedInterviewSlot: selectedSlot
    });

    if (updated) {
      const job = getJobDetails(selectedApp.jobId);
      backend.addNotification(
        job?.companyId || '',
        'Ứng viên xác nhận phỏng vấn',
        `Ứng viên ${currentUser.name} đã xác nhận phỏng vấn cho vị trí ${job?.title} vào lúc ${selectedSlot}.`,
        'success'
      );
      alert('Xác nhận phỏng vấn thành công!');
      setSelectedApp(updated);
      setApps(apps.map(a => a.id === updated.id ? updated : a));
    }
  };

  const handleRejectInterview = () => {
    if (!selectedApp) return;

    if (!confirm('Bạn có chắc chắn muốn từ chối lịch phỏng vấn này?')) return;

    const updated = backend.updateApplication(selectedApp.id, {
      status: 'INTERVIEW_REJECTED'
    });

    if (updated) {
      const job = getJobDetails(selectedApp.jobId);
      backend.addNotification(
        job?.companyId || '',
        'Ứng viên từ chối phỏng vấn',
        `Ứng viên ${currentUser.name} đã từ chối phỏng vấn cho vị trí ${job?.title}.`,
        'warning'
      );
      alert('Đã từ chối phỏng vấn.');
      setSelectedApp(updated);
      setApps(apps.map(a => a.id === updated.id ? updated : a));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f14] text-slate-100 font-display">
      {/* Sidebar */}
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
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Bảng điều khiển</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-semibold text-left shadow-lg shadow-[#1392ec]/20">
            <span className="material-symbols-outlined">work_history</span>
            <span className="text-sm">Đơn ứng tuyển</span>
          </button>
          <button 
            onClick={onNavigateToExercises}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left"
          >
            <span className="material-symbols-outlined">science</span>
            <span className="text-sm">Kho luyện tập AI</span>
          </button>
          <button 
            onClick={onNavigateToNewJobs}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left"
          >
            <span className="material-symbols-outlined">search</span>
            <span className="text-sm">Việc làm mới</span>
          </button>
          <button 
            onClick={onNavigateToProfile}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm">Hồ sơ cá nhân</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Cài đặt</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/10 transition-colors text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#0a0f14]">
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-[#0a0f14]/80 backdrop-blur-md border-b border-slate-800">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">Đơn ứng tuyển của {currentUser.name}</h2>
            <p className="text-sm text-slate-400">Bạn đang có {apps.length} đơn ứng tuyển trong hệ thống.</p>
          </div>
          <div className="flex items-center gap-4">
            <div 
              onClick={onNavigateToProfile}
              className="h-10 w-10 rounded-full bg-slate-700 bg-cover bg-center border border-slate-600 shadow-md cursor-pointer hover:border-[#1392ec] transition-all" 
              style={{ backgroundImage: `url('${currentUser.avatar}')` }}
            ></div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
          {apps.length === 0 ? (
            <div className="bg-[#111821] p-20 rounded-[2rem] border border-slate-800 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-slate-700 mb-6">description</span>
              <h3 className="text-2xl font-bold text-white mb-2">Chưa có đơn ứng tuyển nào</h3>
              <p className="text-slate-500 mb-8 max-w-sm">Hãy khám phá các cơ hội nghề nghiệp thực tế và bắt đầu xây dựng profile của bạn.</p>
              <button 
                onClick={onBack}
                className="bg-[#1392ec] text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#1392ec]/20"
              >
                Khám phá ngay
              </button>
            </div>
          ) : (
            <div className="bg-[#111821] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 border-b border-slate-800">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vị trí & Công ty</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Ngày ứng tuyển</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Điểm AI</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trạng thái</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {apps.map((app) => {
                      const job = getJobDetails(app.jobId);
                      return (
                        <tr key={app.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white mb-0.5 group-hover:text-[#1392ec] transition-colors leading-none">
                                {job?.title || "Vị trí không xác định"}
                              </span>
                              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                                {job?.companyName || "Công ty ẩn danh"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-xs text-slate-400 font-mono font-medium">{app.appliedDate}</span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                CV: {app.cvScore}%
                              </div>
                              {app.testScore !== undefined && (
                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg font-mono font-bold text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  Test: {app.testScore}/100
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              app.status === 'CV_PASSED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              app.status === 'HIRED' ? 'bg-emerald-600 text-white border-emerald-600' :
                              app.status === 'PASSED_TEST' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              app.status === 'INTERVIEW_CONFIRMED' ? 'bg-emerald-600 text-white border-emerald-600' :
                              app.status === 'INTERVIEW_REJECTED' ? 'bg-red-600 text-white border-red-600' :
                              app.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              app.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              app.status === 'TEST_SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}>
                              {app.status === 'CV_PASSED' ? 'Đã qua vòng CV' :
                               app.status === 'HIRED' ? 'Trúng tuyển' :
                               app.status === 'PASSED_TEST' ? 'Vượt qua vòng sơ tuyển' :
                               app.status === 'INTERVIEW_CONFIRMED' ? 'Đã xác nhận PV' :
                               app.status === 'INTERVIEW_REJECTED' ? 'Đã từ chối PV' :
                               app.status === 'FAILED' ? 'Trượt' :
                               app.status === 'REJECTED' ? 'CV không đạt' :
                               app.status === 'TEST_SUBMITTED' ? 'Đã nộp bài test' :
                               app.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => setSelectedApp(app)}
                              className="text-[10px] font-black text-[#1392ec] hover:underline flex items-center gap-1 ml-auto uppercase tracking-widest group/btn"
                            >
                              Xem chi tiết <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">chevron_right</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111821] border border-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <header className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-[#1392ec]/10 flex items-center justify-center text-[#1392ec]">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Chi tiết ứng tuyển</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Mã đơn: {selectedApp.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                {/* Job Info */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Thông tin vị trí</h4>
                  <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <h5 className="text-lg font-bold text-white mb-1">{getJobDetails(selectedApp.jobId)?.title}</h5>
                    <p className="text-sm text-[#1392ec] font-bold uppercase tracking-wider">{getJobDetails(selectedApp.jobId)?.companyName}</p>
                    <div className="flex items-center gap-4 mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {getJobDetails(selectedApp.jobId)?.location}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">payments</span> {getJobDetails(selectedApp.jobId)?.salary}</span>
                    </div>
                  </div>
                </section>

                {/* CV Section */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Hồ sơ đã nộp</h4>
                  <div className="p-4 bg-[#0a0f14] border border-slate-800 rounded-xl flex items-center justify-between group hover:border-[#1392ec]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{selectedApp.cvFileName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Đã tải lên ngày {selectedApp.appliedDate}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">download</span>
                    </button>
                  </div>
                </section>

                {/* AI Feedback */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Đánh giá từ AI</h4>
                  <div className="p-6 bg-[#1392ec]/5 border border-[#1392ec]/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-[#1392ec] uppercase tracking-widest">Điểm tương thích</span>
                      <span className="text-2xl font-black text-[#1392ec] italic">{selectedApp.cvScore}%</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedApp.aiFeedback}"</p>
                  </div>
                </section>

                {/* Test Section */}
                {selectedApp.status === 'CV_PASSED' && (
                  <section className="p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-orange-400">timer</span>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Thời gian làm bài còn lại</h4>
                      </div>
                      <span className="text-xl font-mono font-bold text-orange-400">{formatTime(modalTimeLeft)}</span>
                    </div>
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Chúc mừng! Bạn đã vượt qua vòng lọc CV. Hãy hoàn thành bài test chuyên môn để tiến vào vòng phỏng vấn.
                      </p>
                      <button 
                        onClick={() => onStartTest(selectedApp.jobId, selectedApp.id)}
                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                      >
                        Tiếp tục làm bài test
                      </button>
                    </div>
                  </section>
                )}

                {/* Final Result & Interview Section */}
                {(selectedApp.status === 'PASSED_TEST' || selectedApp.status === 'HIRED' || selectedApp.status === 'INTERVIEW_CONFIRMED' || selectedApp.status === 'INTERVIEW_REJECTED' || selectedApp.status === 'FAILED') && (
                  <section className={`p-6 rounded-2xl border ${selectedApp.status === 'FAILED' ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${selectedApp.status === 'FAILED' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {selectedApp.status === 'FAILED' ? 'cancel' : 'verified'}
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Kết quả đánh giá chuyên môn</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Điểm bài test</p>
                        <span className={`text-xl font-bold ${selectedApp.status === 'FAILED' ? 'text-red-500' : 'text-emerald-500'}`}>{selectedApp.testScore}/100</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 mb-6">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Phản hồi từ nhà tuyển dụng</p>
                      <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedApp.companyFeedback || 'Không có phản hồi cụ thể.'}"</p>
                    </div>

                    {selectedApp.status !== 'FAILED' && selectedApp.interviewSlots && selectedApp.interviewSlots.length > 0 && (
                      <div className="space-y-6">
                        <div className="p-4 bg-[#1392ec]/5 border border-[#1392ec]/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-[#1392ec] text-sm">location_on</span>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">Địa điểm: {selectedApp.interviewLocation}</p>
                          </div>
                          
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Chọn lịch phỏng vấn phù hợp:</p>
                          <div className="space-y-2">
                            {selectedApp.interviewSlots.map((slot, idx) => (
                              <label 
                                key={idx} 
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                  selectedSlot === slot 
                                  ? 'bg-[#1392ec]/20 border-[#1392ec] text-white' 
                                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                                } ${selectedApp.status !== 'PASSED_TEST' ? 'pointer-events-none opacity-80' : ''}`}
                              >
                                <input 
                                  type="radio" 
                                  name="interviewSlot" 
                                  value={slot} 
                                  checked={selectedSlot === slot}
                                  onChange={(e) => setSelectedSlot(e.target.value)}
                                  className="hidden"
                                />
                                <span className={`material-symbols-outlined text-sm ${selectedSlot === slot ? 'text-[#1392ec]' : 'text-slate-600'}`}>
                                  {selectedSlot === slot ? 'radio_button_checked' : 'radio_button_unchecked'}
                                </span>
                                <span className="text-xs font-bold">{slot}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {selectedApp.status === 'PASSED_TEST' && (
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={handleConfirmInterview}
                              className="py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Xác nhận phỏng vấn
                            </button>
                            <button 
                              onClick={handleRejectInterview}
                              className="py-4 bg-slate-800 text-red-500 border border-red-500/20 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                            >
                              <span className="material-symbols-outlined text-sm">cancel</span>
                              Từ chối
                            </button>
                          </div>
                        )}

                        {selectedApp.status === 'INTERVIEW_CONFIRMED' && (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest italic">
                              Bạn đã xác nhận phỏng vấn vào lúc: {selectedApp.selectedInterviewSlot}
                            </p>
                          </div>
                        )}

                        {selectedApp.status === 'INTERVIEW_REJECTED' && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            <p className="text-xs font-black text-red-500 uppercase tracking-widest italic">
                              Bạn đã từ chối lịch phỏng vấn này.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 text-center">
                      <p className={`text-lg font-black uppercase italic tracking-tight ${selectedApp.status === 'FAILED' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {selectedApp.status === 'FAILED' ? 'RẤT TIẾC, BẠN CHƯA PHÙ HỢP LẦN NÀY' : 
                         selectedApp.status === 'HIRED' ? 'CHÚC MỪNG! BẠN ĐÃ TRÚNG TUYỂN' :
                         'CHÚC MỪNG! BẠN VƯỢT QUA VÒNG SƠ TUYỂN'}
                      </p>
                    </div>
                  </section>
                )}

                {selectedApp.status === 'TEST_SUBMITTED' && (
                  <section className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-blue-400">pending_actions</span>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Đang chờ chấm điểm</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Bạn đã hoàn thành bài test chuyên môn. Nhà tuyển dụng đang xem xét và sẽ gửi kết quả cho bạn sớm nhất có thể.
                    </p>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonUngTuyen;
