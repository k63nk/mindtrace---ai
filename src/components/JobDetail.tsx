import React, { useState, useEffect } from 'react';
import { User, Job } from '@/types';
import { backend } from '@/services/backendService';

interface JobDetailProps {
  currentUser: User;
  jobId: string | null;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToApplications: () => void;
  onNavigateToExercises: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNewJobs: () => void;
  onApply: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({
  currentUser,
  jobId,
  onBack,
  onLogout,
  onNavigateToApplications,
  onNavigateToExercises,
  onNavigateToProfile,
  onNavigateToNewJobs,
  onApply
}) => {
  const [activeTab, setActiveTab] = useState<'jd' | 'req' | 'process'>('jd');
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (jobId) {
      const allJobs = backend.getJobs();
      const foundJob = allJobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
      }
    }
  }, [jobId]);

  if (!job) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0f14] text-white">
        <div className="text-center">
          <div className="size-12 border-4 border-[#1392ec] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải thông tin việc làm...</p>
        </div>
      </div>
    );
  }

  const logoUrl = job.id === 'job_japanese' ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDgla8pYNa6rgVD9M_YqabKRV15fKfoZUHcCGsCsaMvUKAaFa6uRekZnPiiT5r1Czj-D6FoemPJfHaI6euMskN-04egyfmiMt60djxGIKsWaagZvLTC7uIojo0xcAVBwiTfK4aZv-zkMWj9NqiSDOZeBFNSVMu--0IcCSZpNiUnz1sqw-_x2bK0W4YELcbSwHA2XwphI1r-SV9ZL5dSPDCS-VEIYzCB3rfNHSPQR7Ql_vRWZDRl__XhhDhd5_8EHNibrTbDW-ft6xA" : 
                  job.id === 'job_music' ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDIPSrOXnw5kzHdTKg2AETh5NS2CI1WSZhA4YadN1-EW3XjhR8ropC5xOImYzMU7M61VTNbljL-02BeT8RfYFa6epKahVQL7MtOUPNboPAGrleN-xGZwsMrSLTOAx14XKn5580B93s8MfdH4iOl6bZxCgyZLgavXWclSqIdRL8_Lw8yfzMt1dgQZFMgizmKztr4JNB9GEBEJEXAfQSQE-73n8wHMJXcMQy18VwjI4YkEEd1BgSKAtiWZxVqllPthfp86wHwvDTF4aI" :
                  `https://api.dicebear.com/7.x/initials/svg?seed=${job.companyName}`;

  const processSteps = [
    { step: 1, title: "Nộp CV & AI chấm điểm", desc: "Hệ thống AI sẽ phân tích CV và phản hồi kết quả phù hợp ngay trong 5 phút.", icon: "description" },
    { step: 2, title: "Làm bài Test thực tế", desc: "Thử thách kỹ năng chuyên môn thông qua bài thi online được thiết kế riêng.", icon: "psychology" },
    { step: 3, title: "Phỏng vấn", desc: "Trao đổi trực tiếp với bộ phận nhân sự và quản lý chuyên môn.", icon: "forum" }
  ];

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
          <button 
            onClick={onNavigateToApplications}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left"
          >
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
      <main className="flex-1 overflow-y-auto bg-[#0a0f14] custom-scrollbar">
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4 bg-[#0a0f14]/80 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={onNavigateToNewJobs} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-white tracking-tight leading-none">Chi tiết việc làm</h2>
              <p className="text-xs text-slate-400 mt-1">{job.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div 
              onClick={onNavigateToProfile}
              className="h-10 w-10 rounded-full bg-slate-700 bg-cover bg-center border border-slate-600 shadow-md cursor-pointer hover:border-[#1392ec] transition-all" 
              style={{ backgroundImage: `url('${currentUser.avatar}')` }}
            ></div>
          </div>
        </header>

        <div className="p-8 max-w-[1200px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <button onClick={onBack} className="hover:text-[#1392ec] transition-colors">Trang chủ</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <button onClick={onNavigateToNewJobs} className="hover:text-[#1392ec] transition-colors">Việc làm</button>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-slate-300 font-medium">{job.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Hero Section */}
              <section className="bg-[#111821] rounded-2xl p-6 sm:p-8 border border-slate-800 overflow-hidden relative group shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1392ec]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
                  <div className="size-24 sm:size-32 rounded-xl bg-[#0a0f14] border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      alt={job.companyName} 
                      className="w-full h-full object-contain opacity-80 p-2" 
                      src={logoUrl}
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full uppercase tracking-wider border border-emerald-500/20">Đang tuyển</span>
                      {job.isHot && <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded-full uppercase tracking-wider border border-orange-500/20">Hot Job</span>}
                      <span className="px-3 py-1 bg-[#1392ec]/10 text-[#1392ec] text-[10px] font-bold rounded-full uppercase tracking-wider border border-[#1392ec]/20">Toàn thời gian</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight uppercase italic">{job.title}</h1>
                    <p className="text-base text-slate-400 font-bold uppercase tracking-wide">{job.companyName}</p>
                    <div className="flex flex-wrap gap-y-2 gap-x-6 pt-2">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[#1392ec] text-sm">location_on</span>
                        <span className="text-xs font-medium">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[#1392ec] text-sm">payments</span>
                        <span className="text-xs font-bold text-slate-200">{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-symbols-outlined text-[#1392ec] text-sm">event_available</span>
                        <span className="text-xs font-medium">Hạn nộp: {job.deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 gap-8 overflow-x-auto whitespace-nowrap">
                <button 
                  onClick={() => setActiveTab('jd')}
                  className={`px-2 pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'jd' ? 'border-[#1392ec] text-[#1392ec]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Mô tả công việc
                </button>
                <button 
                  onClick={() => setActiveTab('req')}
                  className={`px-2 pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'req' ? 'border-[#1392ec] text-[#1392ec]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Quyền lợi & Yêu cầu
                </button>
                <button 
                  onClick={() => setActiveTab('process')}
                  className={`px-2 pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'process' ? 'border-[#1392ec] text-[#1392ec]' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                  Quy trình ứng tuyển
                </button>
              </div>

              {/* Tab Content */}
              <div className="space-y-12 pb-20">
                {activeTab === 'jd' && (
                  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-[#1392ec] rounded-full"></div>
                      <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Mô tả công việc (JD)</h2>
                    </div>
                    <div className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                      {job.description}
                    </div>
                  </section>
                )}

                {activeTab === 'req' && (
                  <section className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {job.benefits && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1 h-6 bg-[#1392ec] rounded-full"></div>
                          <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Quyền lợi & Đãi ngộ</h2>
                        </div>
                        <div className="text-slate-400 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                          {job.benefits}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {activeTab === 'process' && (
                  <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-[#1392ec] rounded-full"></div>
                      <h2 className="text-xl font-black text-white tracking-tight uppercase italic">Quy trình ứng tuyển</h2>
                    </div>
                    <div className="relative pl-10 space-y-10 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                      {processSteps.map((step, i) => (
                        <div key={i} className="relative">
                          <div className={`absolute -left-[35px] top-0 size-8 rounded-full flex items-center justify-center text-xs font-black z-10 shadow-lg ${i === 0 ? 'bg-[#1392ec] text-white shadow-[#1392ec]/20' : 'bg-[#111821] border-2 border-[#1392ec] text-[#1392ec]'}`}>{step.step}</div>
                          <h4 className="text-white font-black text-sm uppercase tracking-widest mb-2">{step.title}</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Apply Card */}
                <div className="bg-[#111821] rounded-2xl p-6 border border-slate-800 shadow-2xl shadow-[#1392ec]/5">
                  <button 
                    onClick={onApply}
                    className="w-full py-4 bg-[#1392ec] text-white font-black rounded-xl hover:bg-[#1181d1] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4 group uppercase text-xs tracking-widest shadow-xl shadow-[#1392ec]/20"
                  >
                    <span>Ứng tuyển ngay</span>
                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">send</span>
                  </button>
                  <button className="w-full py-3 bg-[#0a0f14] border border-slate-800 text-slate-400 font-black rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest">
                    <span className="material-symbols-outlined text-lg">bookmark</span>
                    <span>Lưu tin tuyển dụng</span>
                  </button>
                  <div className="mt-8 pt-6 border-t border-slate-800 space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chia sẻ tin tuyển dụng</p>
                    <div className="flex gap-3">
                      <button className="size-10 rounded-xl bg-[#0a0f14] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#1392ec] hover:border-[#1392ec]/50 transition-all">
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                      </button>
                      <button className="size-10 rounded-xl bg-[#0a0f14] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#1392ec] hover:border-[#1392ec]/50 transition-all">
                        <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                      </button>
                      <button className="size-10 rounded-xl bg-[#0a0f14] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#1392ec] hover:border-[#1392ec]/50 transition-all">
                        <span className="material-symbols-outlined text-xl">link</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Card */}
                <div className="bg-[#111821] rounded-2xl p-6 border border-slate-800 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-12 rounded-xl bg-white p-2 shrink-0 border border-slate-800">
                      <img 
                        alt={job.companyName} 
                        className="w-full h-full object-contain" 
                        src={logoUrl}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-xs uppercase tracking-widest">{job.companyName}</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Doanh nghiệp đối tác</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">
                    MindTrace kết nối bạn với những doanh nghiệp hàng đầu, nơi bạn có thể phát huy tối đa năng lực chuyên môn.
                  </p>
                  <button className="w-full py-2.5 text-[#1392ec] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#1392ec]/10 rounded-xl transition-all border border-[#1392ec]/20">
                    Xem trang công ty
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;
