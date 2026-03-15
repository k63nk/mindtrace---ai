
import React, { useState } from 'react';
import { User } from '@/types';
import { backend } from '@/services/backendService';

interface PricingModalProps {
  currentUser: User;
  onClose: () => void;
  onSelectPlan: (plan: { id: 'BASIC' | 'PRO' | 'ENTERPRISE'; name: string; price: string; duration: number }) => void;
  onContinueFree: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ currentUser, onClose, onSelectPlan, onContinueFree }) => {
  const plans: Array<{ id: 'BASIC' | 'PRO' | 'ENTERPRISE'; name: string; price: string; duration: number; desc: string; isPopular?: boolean; savings?: string }> = [
    { id: 'BASIC', name: 'Gói 1 tháng', price: '700.000 VND', duration: 1, desc: 'Phù hợp tuyển dụng ngắn hạn' },
    { id: 'PRO', name: 'Gói 3 tháng', price: '1.800.000 VND', duration: 3, desc: 'Tối ưu cho doanh nghiệp vừa', isPopular: true, savings: '300.000 VND' },
    { id: 'ENTERPRISE', name: 'Gói 1 năm', price: '6.800.000 VND', duration: 12, desc: 'Tiết kiệm tối đa chi phí', savings: '1.600.000 VND' },
  ];

  const totalLimit = currentUser.monthlyPostLimit ?? 3;
  const postsRemaining = currentUser.postsRemaining ?? 3;
  const usedCount = totalLimit - postsRemaining;
  const canContinueFree = postsRemaining > 0;
  const progressPercent = (usedCount / totalLimit) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#102218] border border-[#2d4a3a] rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#1392ec]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#1392ec]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <header className="p-8 border-b border-[#2d4a3a] bg-slate-900/20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1392ec]/10 text-[#1392ec] text-[9px] font-black uppercase tracking-widest mb-4 border border-[#1392ec]/20">
                Hạn mức tuyển dụng
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight leading-tight mb-2">
                Nâng cấp gói dịch vụ
              </h3>
              <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
                Bản miễn phí cho phép đăng tối đa <span className="text-[#1392ec] font-bold">3 tin tuyển dụng</span> mỗi tháng.
              </p>
            </div>

            {/* Usage Tracker */}
            <div className="w-full md:w-64 bg-slate-900/50 p-4 rounded-2xl border border-[#2d4a3a] backdrop-blur-sm">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Số lượt đã dùng</span>
                <span className="text-lg font-black text-[#1392ec] italic">
                  {usedCount}/{totalLimit} <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest not-italic ml-1">tin</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-[#1392ec] rounded-full shadow-[0_0_15px_rgba(19,146,236,0.5)] transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <button onClick={onClose} className="absolute top-6 right-6 px-3 py-1 hover:bg-slate-800 rounded-lg text-slate-500 transition-all hover:text-white text-[10px] font-black uppercase tracking-widest">
            Đóng
          </button>
        </header>

        <div className="p-8 relative z-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-6 transition-all relative group ${
                  plan.isPopular 
                  ? 'bg-slate-900/40 border-[#1392ec] shadow-[0_0_30px_rgba(19,146,236,0.15)]' 
                  : 'bg-slate-900/20 border-[#2d4a3a] hover:border-[#1392ec]/50'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1392ec] text-white text-[8px] font-black uppercase px-4 py-1 rounded-full tracking-widest shadow-lg shadow-[#1392ec]/20">
                    Phổ biến nhất
                  </div>
                )}
                
                <div className="mb-4">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{plan.name}</h4>
                  <p className="text-slate-500 text-[10px] font-medium">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white italic tracking-tight">{plan.price.split(' ')[0]}</span>
                    <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">VND</span>
                  </div>
                  {plan.savings ? (
                    <p className="text-[9px] text-[#1392ec] font-black uppercase tracking-widest mt-1 italic">Tiết kiệm {plan.savings}</p>
                  ) : (
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1 italic">Thanh toán mỗi tháng</p>
                  )}
                </div>

                <ul className="flex-1 space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    Đăng tin không giới hạn
                  </li>
                  <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    {plan.id === 'BASIC' ? 'Hỗ trợ 24/7' : 'Ưu tiên hiển thị tin'}
                  </li>
                  <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    {plan.id === 'ENTERPRISE' ? 'Quản lý riêng biệt' : 'Lọc ứng viên AI'}
                  </li>
                </ul>

                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-black uppercase text-[9px] tracking-[0.2em] transition-all border ${
                    plan.isPopular 
                    ? 'bg-[#1392ec] text-white border-[#1392ec] hover:brightness-110' 
                    : 'bg-transparent text-[#1392ec] border-[#1392ec]/30 hover:bg-[#1392ec]/10 hover:border-[#1392ec]'
                  }`}
                >
                  Chọn gói này
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#2d4a3a] flex flex-col items-center gap-4">
            <button
              onClick={() => onSelectPlan(plans[1])}
              className="w-full max-w-sm py-4 bg-[#1392ec] text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-[#1392ec]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              Thanh toán ngay
            </button>
            
            {canContinueFree && (
              <button
                onClick={onContinueFree}
                className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] transition-all py-1"
              >
                Tiếp tục sử dụng bản miễn phí
              </button>
            )}
            {!canContinueFree && (
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] py-1">
                Bạn đã hết lượt đăng tin miễn phí. Vui lòng nâng cấp để tiếp tục.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PaymentModalProps {
  plan: { id: 'BASIC' | 'PRO' | 'ENTERPRISE'; name: string; price: string; duration: number };
  onClose: () => void;
  onConfirm: (method: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, onClose, onConfirm }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('zalopay');

  const methods = [
    { id: 'zalopay', name: 'ZALO PAY' },
    { id: 'mbbank', name: 'MB BANK' },
    { id: 'card', name: 'THẺ TÍN DỤNG HOẶC THẺ GHI NỢ' },
  ];

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + plan.duration);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1e293b] border border-[#334155] rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        <header className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="px-3 py-1 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors text-[10px] font-black uppercase tracking-widest">
              Quay lại
            </button>
            <div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Thanh toán</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{plan.name} - {plan.price}</p>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Phương thức thanh toán</p>
            <div className="space-y-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between ${
                    selectedMethod === method.id 
                    ? 'bg-[#1392ec]/10 border-[#1392ec] text-white shadow-lg shadow-[#1392ec]/10' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-5 rounded-full border-2 border-current flex items-center justify-center">
                      {selectedMethod === method.id && <div className="size-2.5 rounded-full bg-current"></div>}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">{method.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời hạn sử dụng đến</p>
              <p className="text-sm font-black text-white italic">{expiryDate.toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tổng thanh toán</p>
              <p className="text-xl font-black text-[#1392ec] italic">{plan.price}</p>
            </div>
          </div>

          <button
            onClick={() => onConfirm(selectedMethod)}
            className="w-full py-4 bg-[#1392ec] text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:brightness-110 transition-all shadow-xl shadow-[#1392ec]/20 flex items-center justify-center gap-2"
          >
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

interface CandidatePricingModalProps {
  onClose: () => void;
  onSelectPlan: (plan: { id: 'BASIC' | 'PRO' | 'ENTERPRISE'; name: string; price: string; duration: number }) => void;
  onContinueFree: () => void;
}

export const CandidatePricingModal: React.FC<CandidatePricingModalProps> = ({ onClose, onSelectPlan, onContinueFree }) => {
  const plans: Array<{ id: 'BASIC' | 'PRO' | 'ENTERPRISE'; name: string; price: string; duration: number; desc: string; isPopular?: boolean; savings?: string; features: string[] }> = [
    { 
      id: 'BASIC', 
      name: 'Gói 1 tháng', 
      price: '300.000 VND', 
      duration: 1, 
      desc: 'Phù hợp ôn luyện ngắn hạn',
      features: ['Toàn bộ kho đề bài thực tế', 'AI phân tích nâng cao']
    },
    { 
      id: 'PRO', 
      name: 'Gói 3 tháng', 
      price: '750.000 VND', 
      duration: 3, 
      desc: 'Tối ưu cho sinh viên sắp ra trường', 
      isPopular: true, 
      savings: '150.000 VND',
      features: ['Toàn bộ kho đề bài thực tế', 'AI phân tích nâng cao', 'Tham gia Workshop hướng nghiệp độc quyền']
    },
    { 
      id: 'ENTERPRISE', 
      name: 'Gói 1 năm', 
      price: '2.500.000 VND', 
      duration: 12, 
      desc: 'Tiết kiệm tối đa chi phí', 
      savings: '1.100.000 VND',
      features: ['Toàn bộ kho đề bài thực tế', 'AI phân tích nâng cao', 'Ưu tiên hồ sơ tới doanh nghiệp', 'Tham gia Workshop độc quyền']
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0a1a12] border border-[#13ec6d]/20 rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl relative custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-[110] size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all group"
        >
          <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
        </button>
        
        <div className="p-6 md:p-10 flex flex-col">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-[#13ec6d]/10 text-[#13ec6d] text-[9px] font-black uppercase tracking-widest mb-2 border border-[#13ec6d]/20">
              Dành cho sinh viên & ứng viên
            </span>
            <h1 className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-r from-[#13ec6d] via-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase italic tracking-tight">
              Nâng cấp tài khoản Premium
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-xs font-medium">
              Mở khóa toàn bộ tiềm năng nghề nghiệp của bạn với bộ công cụ AI thông minh và dữ liệu thực tế từ các doanh nghiệp hàng đầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <div className="bg-[#193324]/40 backdrop-blur-md border border-[#326748]/30 p-4 rounded-xl flex items-start gap-3 group hover:border-[#13ec6d]/50 transition-all">
              <div className="size-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[#13ec6d] shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-[#13ec6d]/10">
                <span className="material-symbols-outlined text-lg">corporate_fare</span>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-0.5 text-white">Đề bài sát thực tế</h3>
                <p className="text-slate-400 leading-relaxed text-[10px]">Tiếp cận kho thư viện bài kiểm tra năng lực, case study từ các tập đoàn hàng đầu.</p>
              </div>
            </div>
            <div className="bg-[#193324]/40 backdrop-blur-md border border-[#326748]/30 p-4 rounded-xl flex items-start gap-3 group hover:border-blue-500/50 transition-all">
              <div className="size-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                <span className="material-symbols-outlined text-lg">psychology</span>
              </div>
              <div>
                <h3 className="text-sm font-bold mb-0.5 text-white">Phản hồi từ AI</h3>
                <p className="text-slate-400 leading-relaxed text-[10px]">Nhận đánh giá chuyên sâu về tư duy và đề xuất lộ trình học tập cá nhân hóa.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative rounded-xl p-5 flex flex-col border transition-all duration-300 ${
                  plan.isPopular 
                  ? 'bg-gradient-to-b from-[#193324]/60 to-[#0a1a12] border-[#13ec6d] shadow-[0_0_20px_-10px_rgba(19,236,109,0.3)] transform scale-105 z-10' 
                  : 'bg-[#193324]/40 border-[#326748]/30 hover:border-[#13ec6d]/50'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#13ec6d] text-[#0a1a12] px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                    Phổ biến nhất
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                    {plan.id === 'ENTERPRISE' && (
                      <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest">Tiết kiệm nhất</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-white italic">{plan.price.split(' ')[0]}</span>
                    <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">VND/{plan.id === 'BASIC' ? 'tháng' : plan.id === 'PRO' ? '3 tháng' : 'năm'}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] text-slate-300">
                      <span className={`material-symbols-outlined text-sm ${plan.id === 'ENTERPRISE' ? 'text-blue-400' : 'text-[#13ec6d]'}`}>
                        {plan.isPopular ? 'verified' : 'check_circle'}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-2.5 rounded-lg font-black uppercase text-[9px] tracking-[0.1em] transition-all shadow-lg ${
                    plan.isPopular 
                    ? 'bg-[#13ec6d] text-[#0a1a12] hover:brightness-110 shadow-[#13ec6d]/20' 
                    : 'bg-[#193324]/60 text-white border border-[#326748]/50 hover:bg-[#193324]/80'
                  }`}
                >
                  Chọn gói này
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center space-y-4">
            <button 
              onClick={onContinueFree}
              className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold underline underline-offset-4 uppercase tracking-widest"
            >
              Tiếp tục dùng bản miễn phí
            </button>
            
            <div className="flex justify-center">
              <button 
                onClick={onClose}
                className="px-5 py-1 rounded-full border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 transition-all text-[8px] font-black uppercase tracking-widest"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
