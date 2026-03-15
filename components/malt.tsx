
import React, { useState, useEffect } from 'react';
// Import User type
import { User, PracticeExercise, ExerciseResult } from '../types';
import { backend } from '../services/backendService';

interface MaltProps {
  // Added missing currentUser property
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  onSelectExercise: (id: string) => void;
  onNavigateToApplications: () => void;
  // Added onNavigateToProfile to fix the error reported in App.tsx
  onNavigateToProfile: () => void;
  onNavigateToNewJobs: () => void;
}

const Malt: React.FC<MaltProps> = ({ currentUser, onBack, onLogout, onSelectExercise, onNavigateToApplications, onNavigateToProfile, onNavigateToNewJobs }) => {
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [completionFilter, setCompletionFilter] = useState<'all' | 'done' | 'todo'>('all');

  useEffect(() => {
    const data = backend.getExercises();
    setExercises(data);
    const userResults = backend.getExerciseResults(currentUser.id);
    setResults(userResults);
  }, [currentUser.id]);

  const getExerciseStatus = (exerciseId: string) => {
    const result = results.find(r => r.exerciseId === exerciseId);
    return result ? `${result.score}/100` : null;
  };

  const filteredExercises = exercises.filter(ex => {
    const status = getExerciseStatus(ex.id);
    if (completionFilter === 'done') return !!status;
    if (completionFilter === 'todo') return !status;
    return true;
  });

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
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-semibold text-left shadow-lg shadow-[#1392ec]/20">
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
            <h2 className="text-2xl font-bold text-white tracking-tight">Kho luyện tập AI</h2>
            <p className="text-sm text-slate-400">Nâng cao kỹ năng giải quyết tình huống thực tế với sự hỗ trợ của AI</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0f14]"></span>
            </button>
            {/* Use currentUser avatar */}
            <div 
              onClick={onNavigateToProfile}
              className="h-10 w-10 rounded-full bg-slate-700 bg-cover bg-center border border-slate-600 shadow-md cursor-pointer hover:border-[#1392ec] transition-all" 
              style={{ backgroundImage: `url('${currentUser.avatar}')` }}
            ></div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
          {/* Filters Section */}
          <section className="bg-[#111821] p-6 rounded-2xl border border-slate-800 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tìm kiếm đề tài</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
                  <input 
                    className="w-full bg-[#0a0f14] border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-[#1392ec] focus:ring-[#1392ec] text-slate-200 placeholder:text-slate-600 outline-none transition-all" 
                    placeholder="Nhập tên đề tài..." 
                    type="text"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Trạng thái bài làm</label>
                <div className="flex bg-[#0a0f14] p-1 rounded-xl border border-slate-700">
                  <button 
                    onClick={() => setCompletionFilter('all')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${completionFilter === 'all' ? 'bg-[#1392ec] text-white shadow-lg shadow-[#1392ec]/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Tất cả
                  </button>
                  <button 
                    onClick={() => setCompletionFilter('done')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${completionFilter === 'done' ? 'bg-[#1392ec] text-white shadow-lg shadow-[#1392ec]/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Đã làm
                  </button>
                  <button 
                    onClick={() => setCompletionFilter('todo')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${completionFilter === 'todo' ? 'bg-[#1392ec] text-white shadow-lg shadow-[#1392ec]/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Chưa làm
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Lĩnh vực</label>
                <select className="w-full bg-[#0a0f14] border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:border-[#1392ec] focus:ring-[#1392ec] text-slate-200 outline-none transition-all font-bold">
                  <option>Tất cả lĩnh vực</option>
                  <option>Marketing</option>
                  <option>IT & Software</option>
                  <option>Finance</option>
                  <option>Business Strategy</option>
                  <option>Engineering</option>
                  <option>UI/UX Design</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Công ty</label>
                <select className="w-full bg-[#0a0f14] border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:border-[#1392ec] focus:ring-[#1392ec] text-slate-200 outline-none transition-all font-bold">
                  <option>Tất cả công ty</option>
                  <option>Mindtrace</option>
                </select>
              </div>
            </div>
          </section>

          {/* Exercises Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredExercises.length > 0 ? filteredExercises.map((item, idx) => {
                const status = getExerciseStatus(item.id);
                return (
                  <div key={item.id} className="bg-[#111821] border border-slate-800 rounded-2xl overflow-hidden hover:border-[#1392ec]/50 transition-all flex flex-col group shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="h-40 bg-slate-800 relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('https://picsum.photos/seed/${idx + 50}/600/300')` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111821] to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-2.5 py-1 bg-${item.diffColor}-500/20 text-${item.diffColor}-500 text-[9px] font-black rounded-full border border-${item.diffColor}-500/30 backdrop-blur-md uppercase tracking-widest`}>
                          {item.difficulty}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black rounded uppercase tracking-wider">{item.tag}</span>
                        <span className="px-2 py-0.5 bg-slate-900/60 text-slate-300 text-[9px] font-black rounded flex items-center gap-1 border border-white/5 uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">schedule</span> {item.time}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đưa ra bởi:</span>
                          <span className="text-[10px] font-black text-white uppercase tracking-tight">{item.company}</span>
                        </div>
                        {item.assumption && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Giả định:</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight italic">{item.assumption}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1392ec] transition-colors leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-800/50">
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Trạng thái</p>
                          {status ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-500 font-black text-sm">Đã đạt: {status}</span>
                              <span className="material-symbols-outlined text-emerald-500 text-sm fill-1">verified</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic font-medium">Chưa thực hiện</span>
                          )}
                        </div>
                        <button 
                          onClick={() => onSelectExercise(item.id)}
                          className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shadow-lg ${
                            status 
                              ? 'bg-slate-800 text-[#1392ec] hover:bg-[#1392ec] hover:text-white' 
                              : 'bg-[#1392ec] text-white hover:bg-[#1181d1] shadow-[#1392ec]/20'
                          }`}
                        >
                          {status ? 'Làm lại' : 'Thử sức'}
                          <span className="material-symbols-outlined text-base">
                            {status ? 'refresh' : 'play_arrow'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-[#111821] rounded-3xl border border-slate-800 border-dashed">
                  <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">folder_off</span>
                  <h4 className="text-xl font-bold text-slate-400 uppercase tracking-tight">Không tìm thấy bài tập nào</h4>
                  <p className="text-sm text-slate-600 mt-2">Vui lòng thử thay đổi bộ lọc hoặc quay lại sau.</p>
                </div>
              )}
            </div>
          </section>

          {/* Bottom Banner */}
          <div className="bg-gradient-to-r from-[#1392ec]/20 to-blue-900/40 rounded-[2rem] p-8 border border-[#1392ec]/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1392ec]/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-[#1392ec]/10"></div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="hidden md:flex w-20 h-20 bg-[#1392ec]/20 rounded-2xl items-center justify-center backdrop-blur-md border border-[#1392ec]/30">
                <span className="material-symbols-outlined text-4xl text-[#1392ec] fill-1">auto_awesome</span>
              </div>
              <div>
                <h4 className="text-2xl font-black mb-2 text-white tracking-tight">Thử thách mới mỗi tuần!</h4>
                <p className="text-slate-300 max-w-lg text-sm font-medium">Chúng tôi liên tục cập nhật các bài toán thực tế để bạn rèn luyện tư duy thực chiến.</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 relative z-10">
              <button className="whitespace-nowrap bg-[#1392ec] text-white font-black px-8 py-3.5 rounded-2xl hover:bg-[#1181d1] transition-all shadow-xl shadow-[#1392ec]/20 uppercase text-xs tracking-widest">
                Đăng ký nhận thông báo
              </button>
              <p className="text-[10px] text-slate-500 italic font-bold">25 đề tài mới dự kiến vào thứ Hai tới</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Malt;
