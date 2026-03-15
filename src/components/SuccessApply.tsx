import React, { useState, useEffect } from 'react';
import { User, Application } from '@/types';

interface SuccessApplyProps {
  currentUser: User;
  application: Application | null;
  onBackToDashboard: () => void;
  onViewApplications: () => void;
  onStartTest: () => void;
}

const SuccessApply: React.FC<SuccessApplyProps> = ({ 
  currentUser, 
  application, 
  onBackToDashboard, 
  onViewApplications,
  onStartTest
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI analysis time for better UX
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isAnalyzing || !application) {
    return (
      <div className="min-h-screen bg-[#0a0f14] flex flex-col text-slate-100 font-display">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-800 px-6 md:px-10 py-3 bg-[#0a0f14]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="text-[#1392ec]">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h2 className="text-white text-xl font-black leading-tight tracking-tight uppercase italic">MindTrace</h2>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="max-w-[640px] w-full bg-[#111821] rounded-2xl shadow-2xl border border-slate-800 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#1392ec]/20 rounded-full blur-2xl"></div>
                <div className="relative bg-[#1392ec] text-white rounded-full p-6 shadow-lg shadow-[#1392ec]/30">
                  <span className="material-symbols-outlined !text-6xl animate-pulse">cloud_sync</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase italic">Đang phân tích hồ sơ...</h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-md mx-auto font-medium">
              Hệ thống AI của <span className="text-[#1392ec] font-bold">MindTrace</span> đang đánh giá CV của bạn dựa trên yêu cầu công việc.
            </p>

            <div className="bg-[#0a0f14]/50 rounded-2xl p-6 mb-8 border border-slate-800">
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1392ec]/20 border-t-[#1392ec]"></div>
                <div className="text-center">
                  <p className="text-white font-black text-lg mb-1 uppercase tracking-tight">
                    Đang chấm điểm CV...
                  </p>
                  <div className="flex items-center justify-center gap-2 text-slate-500 font-bold bg-[#111821] px-4 py-2 rounded-full shadow-sm border border-slate-800">
                    <span className="material-symbols-outlined text-base text-[#1392ec]">schedule</span>
                    <span className="text-xs uppercase tracking-widest">Ước tính: 2-3 giây</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isPassed = application.status === 'CV_PASSED';

  return (
    <div className="min-h-screen bg-[#0a0f14] flex flex-col text-slate-100 font-display">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-800 px-6 md:px-10 py-3 bg-[#0a0f14]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="text-[#1392ec]">
            <span className="material-symbols-outlined text-3xl">psychology</span>
          </div>
          <h2 className="text-white text-xl font-black leading-tight tracking-tight uppercase italic">MindTrace</h2>
        </div>
        <div className="flex gap-3">
          <div 
            className="h-10 w-10 rounded-full bg-slate-700 bg-cover bg-center border border-slate-600 shadow-md" 
            style={{ backgroundImage: `url('${currentUser.avatar}')` }}
          ></div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-[720px] w-full bg-[#111821] rounded-3xl shadow-2xl border border-slate-800 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
          {/* Result Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className={`absolute inset-0 ${isPassed ? 'bg-emerald-500/20' : 'bg-red-500/20'} rounded-full blur-2xl`}></div>
              <div className={`relative ${isPassed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'} text-white rounded-full p-6 shadow-lg`}>
                <span className="material-symbols-outlined !text-6xl">
                  {isPassed ? 'verified' : 'cancel'}
                </span>
              </div>
            </div>
          </div>

          {/* Result Message */}
          <h1 className={`text-3xl md:text-4xl font-black mb-4 uppercase italic ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPassed ? 'Chúc mừng! Bạn đã vượt qua vòng CV' : 'Rất tiếc, hồ sơ chưa phù hợp'}
          </h1>
          
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 bg-[#0a0f14] px-6 py-3 rounded-2xl border border-slate-800 mb-6">
              <span className="text-slate-500 font-black uppercase tracking-widest text-xs">Điểm tương thích AI:</span>
              <span className={`text-3xl font-black italic ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {application.cvScore}<span className="text-sm not-italic opacity-50">/100</span>
              </span>
            </div>
            
            <div className="bg-[#0a0f14]/50 rounded-2xl p-6 border border-slate-800 text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#1392ec] text-lg">comment</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nhận xét từ MindTrace AI</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                "{application.aiFeedback}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isPassed ? (
              <button 
                onClick={onStartTest}
                className="flex-1 px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 uppercase text-sm tracking-widest active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">edit_note</span>
                Làm bài test ngay
              </button>
            ) : (
              <button 
                onClick={onBackToDashboard}
                className="flex-1 px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">search</span>
                Tìm việc làm khác
              </button>
            )}
            
            <button 
              onClick={onViewApplications}
              className="px-8 py-4 bg-[#0a0f14] hover:bg-slate-800 text-slate-400 font-black rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-800 uppercase text-xs tracking-widest"
            >
              Xem đơn ứng tuyển
            </button>
          </div>
          
          {isPassed && (
            <p className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">
              Hạn nộp bài test: 24h kể từ bây giờ
            </p>
          )}
        </div>
      </main>

      <div className="h-32 w-full opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 100%, ${isPassed ? '#10b981' : '#ef4444'}, transparent 70%)` }}>
      </div>
    </div>
  );
};

export default SuccessApply;
