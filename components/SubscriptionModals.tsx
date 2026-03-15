
import React, { useState } from 'react';
import { User } from '../types';
import { backend } from '../services/backendService';

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
            
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onContinueFree}
                disabled={!canContinueFree}
                className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all py-1 ${
                  canContinueFree 
                  ? 'text-slate-500 hover:text-white' 
                  : 'text-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                Tiếp tục sử dụng bản miễn phí
              </button>
              {!canContinueFree && (
                <p className="text-[8px] text-amber-500/70 font-bold uppercase tracking-widest animate-pulse">
                  Hạn mức sẽ được làm mới vào ngày 01 tháng sau
                </p>
              )}
            </div>
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
