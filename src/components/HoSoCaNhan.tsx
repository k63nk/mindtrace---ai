
import React, { useEffect, useState } from 'react';
import { User } from '@/types';
import { backend } from '@/services/backendService';

interface HoSoCaNhanProps {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToApplications: () => void;
  onNavigateToExercises: () => void;
  onNavigateToNewJobs: () => void;
}

const HoSoCaNhan: React.FC<HoSoCaNhanProps> = ({ currentUser, onBack, onLogout, onNavigateToApplications, onNavigateToExercises, onNavigateToNewJobs }) => {
  const [userStats, setUserStats] = useState({ totalApplications: 0, avgScore: 0 });

  useEffect(() => {
    const stats = backend.getStudentStats(currentUser.id);
    setUserStats(stats);
  }, [currentUser.id]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f14] text-slate-100 font-display">
      <aside className="w-64 border-r border-slate-800 bg-[#111821] flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1392ec] rounded-lg flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic text-left">MindTrace</h1>
            <p className="text-[10px] text-[#1392ec] font-bold tracking-widest uppercase">Student Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button onClick={onBack} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Bảng điều khiển</span>
          </button>
          <button onClick={onNavigateToApplications} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">work_history</span>
            <span className="text-sm">Đơn ứng tuyển</span>
          </button>
          <button onClick={onNavigateToExercises} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">science</span>
            <span className="text-sm">Kho luyện tập AI</span>
          </button>
          <button onClick={onNavigateToNewJobs} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left">
            <span className="material-symbols-outlined">search</span>
            <span className="text-sm">Việc làm mới</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-semibold text-left">
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
        <header className="sticky top-0 z-10 bg-[#0a0f14]/80 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-[1400px] mx-auto px-8 py-8 flex flex-col md:flex-row items-center gap-8">
            <div className="h-28 w-28 rounded-2xl bg-slate-700 bg-cover bg-center border-4 border-[#1392ec]/20 shadow-2xl" style={{ backgroundImage: `url('${currentUser.avatar}')` }}></div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{currentUser.name}</h2>
              <p className="text-[#1392ec] font-bold text-sm uppercase tracking-widest mb-4">{currentUser.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="bg-[#111821] border border-slate-800 px-5 py-2.5 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Điểm AI trung bình</p>
                  <p className="text-xl font-black text-emerald-500">{userStats.avgScore}%</p>
                </div>
                <div className="bg-[#111821] border border-slate-800 px-5 py-2.5 rounded-2xl">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Bậc xếp hạng</p>
                  <p className="text-xl font-black text-white">{userStats.avgScore > 80 ? 'Master' : 'Beginner'}</p>
                </div>
              </div>
            </div>
            <button className="px-6 py-3 bg-[#1392ec] text-white font-black rounded-xl uppercase text-xs tracking-widest shadow-xl shadow-[#1392ec]/20">Xuất Profile AI</button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
          <section className="bg-[#111821] p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
             <h3 className="text-xl font-black text-white mb-6">Kỹ năng được AI nhận diện</h3>
             <div className="flex flex-wrap gap-3">
               {currentUser.skills && currentUser.skills.length > 0 ? (
                 currentUser.skills.map((skill, i) => (
                   <span key={i} className="px-4 py-2 bg-[#1392ec]/10 text-[#1392ec] border border-[#1392ec]/20 rounded-xl text-xs font-bold uppercase tracking-widest">{skill}</span>
                 ))
               ) : (
                 <p className="text-slate-500 text-sm italic">Chưa có kỹ năng nào được nhận diện. Hãy bắt đầu ứng tuyển hoặc làm bài test!</p>
               )}
             </div>
             
             <div className="mt-12 pt-8 border-t border-slate-800">
               <p className="text-slate-400 leading-relaxed font-medium italic">
                 "Dữ liệu hồ sơ này được đồng bộ trực tiếp từ hoạt động ứng tuyển của bạn. Mỗi bài test bạn nộp sẽ giúp MindTrace AI cập nhật chính xác hơn năng lực thực tế của bạn."
               </p>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HoSoCaNhan;
