import React, { useState } from 'react';
import { User } from '@/types';
import { backend } from '@/services/backendService';

interface BusinessProfileProps {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
}

const BusinessProfile: React.FC<BusinessProfileProps> = ({ currentUser, onBack, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    avatar: currentUser.avatar || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    backend.updateUser(currentUser.id, formData);
    alert('Cập nhật thông tin doanh nghiệp thành công!');
    setIsEditing(false);
  };

  return (
    <div className="bg-[#0f172a] text-slate-100 antialiased h-screen flex overflow-hidden font-display">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-[#1e293b] border-r border-[#334155] flex flex-col h-full">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1392ec] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#1392ec]/20">
            <span className="material-symbols-outlined text-2xl font-bold">psychology</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#1392ec] leading-none uppercase italic">MindTrace</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">Recruit Pro</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm uppercase tracking-wider font-bold">Tổng quan</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-bold transition-all shadow-lg shadow-[#1392ec]/20 text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm uppercase tracking-wider">Cài đặt doanh nghiệp</span>
          </button>
        </nav>
        <div className="p-4 border-t border-[#334155]">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/10 transition-all text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm uppercase tracking-wider font-bold">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0f172a]">
        {/* Header */}
        <header className="h-16 flex items-center px-8 bg-[#0f172a] border-b border-[#334155] flex-shrink-0">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Cài đặt Doanh nghiệp</h2>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-3xl">
            {/* Profile Card */}
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-8 shadow-2xl mb-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tight">Thông tin công ty</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Quản lý thứ thông tin chủ yếu của doanh nghiệp</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2.5 bg-[#1392ec] text-white font-bold rounded-lg uppercase text-xs tracking-widest shadow-lg shadow-[#1392ec]/20 hover:brightness-110 transition-all"
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              {/* Profile Avatar */}
              <div className="flex items-center gap-8 mb-10 pb-10 border-b border-[#334155]">
                <div className="size-32 rounded-2xl bg-slate-700 bg-cover bg-center border-4 border-[#1392ec]/20 shadow-xl flex-shrink-0" 
                  style={{ backgroundImage: `url('${formData.avatar}')` }}>
                </div>
                <div className="flex-1">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Tên công ty</p>
                  <h4 className="text-2xl font-black text-white mb-4">{formData.name}</h4>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Email: {formData.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Tên công ty */}
                <div>
                  <label className="text-xs font-black text-white uppercase tracking-widest block mb-2">Tên công ty</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-600 focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-black text-white uppercase tracking-widest block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-600 focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="text-xs font-black text-white uppercase tracking-widest block mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+84 900 000 000"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-600 focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  />
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="text-xs font-black text-white uppercase tracking-widest block mb-2">Địa chỉ công ty</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Ví dụ: 123 Phố Huế, Quận Hoàn Kiếm, Hà Nội"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-600 focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  />
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-10 pt-8 border-t border-[#334155] flex gap-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-[#10b981] text-white font-black rounded-lg uppercase text-sm tracking-widest shadow-lg shadow-[#10b981]/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">check</span>
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-slate-700 text-white font-black rounded-lg uppercase text-sm tracking-widest hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                    Hủy
                  </button>
                </div>
              )}
            </div>

            {/* Additional Info Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Gói cộc</p>
                  <span className="text-2xl material-symbols-outlined text-[#1392ec]">verified</span>
                </div>
                <h4 className="text-xl font-black text-white">Enterprise</h4>
                <p className="text-slate-400 text-xs font-bold leading-relaxed mt-4">Gói cộc cao cấp với đầy đủ tính năng và hỗ trợ 24/7</p>
              </div>

              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Tin tuyển dụng còn lại</p>
                  <span className="text-2xl material-symbols-outlined text-amber-500">newspaper</span>
                </div>
                <h4 className="text-xl font-black text-white">{currentUser.postLimit || 10}</h4>
                <p className="text-slate-400 text-xs font-bold leading-relaxed mt-4">Số tin tuyển dụng bạn có thể đăng trong tháng này</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessProfile;
