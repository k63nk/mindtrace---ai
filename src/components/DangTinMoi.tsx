import React, { useState } from 'react';
import { User, Job } from '@/types';
import { backend } from '@/services/backendService';

interface DangTinMoiProps {
  currentUser: User;
  initialJob?: Job | null;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToCandidateManagement: () => void;
  onNavigateToProfile: () => void;
}

const DangTinMoi: React.FC<DangTinMoiProps> = ({ 
  currentUser, 
  initialJob,
  onBack, 
  onLogout,
  onNavigateToCandidateManagement,
  onNavigateToProfile
}) => {
  const [step, setStep] = useState(1);
  const [jobTitle, setJobTitle] = useState(initialJob?.title || '');
  const [companyName, setCompanyName] = useState(initialJob?.companyName || currentUser.name);
  const [deadlineDate, setDeadlineDate] = useState(initialJob?.deadline?.split(' ')[0] || '');
  const [deadlineTime, setDeadlineTime] = useState(initialJob?.deadline?.split(' ')[1] || '');
  const [location, setLocation] = useState(initialJob?.location || '');
  const [salary, setSalary] = useState(initialJob?.salary || '');
  const [jd, setJd] = useState(initialJob?.description || '');
  const [benefits, setBenefits] = useState(initialJob?.benefits || '');
  const [testAssignment, setTestAssignment] = useState(initialJob?.testAssignment || '');
  const [keywords, setKeywords] = useState<string[]>(initialJob?.requirements || ['ReactJS', 'Tailwind CSS', 'TypeScript']);
  const [minScore, setMinScore] = useState(initialJob?.minScore || 75);
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newKeyword.trim()) {
      if (!keywords.includes(newKeyword.trim())) {
        setKeywords([...keywords, newKeyword.trim()]);
      }
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleFinish = () => {
    if (!jobTitle || !companyName) {
      alert('Vui lòng điền đầy đủ thông tin cơ bản (Vị trí và Công ty)');
      return;
    }

    if (keywords.length === 0) {
      alert('⚠️ Bạn chưa thêm từ khóa yêu cầu! Vui lòng thêm ít nhất 1 từ khóa để AI có thể đánh giá CV.');
      return;
    }

    if (deadlineDate) {
      const deadline = new Date(`${deadlineDate} ${deadlineTime || '23:59'}`);
      const now = new Date();
      if (deadline < now) {
        alert('Hạn nộp hồ sơ không được sớm hơn thời điểm hiện tại.');
        return;
      }
    }

    const jobData = {
      title: jobTitle,
      companyName: currentUser.name,
      companyId: currentUser.id,
      description: jd,
      requirements: keywords,
      location: location,
      deadline: `${deadlineDate} ${deadlineTime}`,
      salary: salary,
      benefits: benefits,
      testAssignment: testAssignment,
      minScore: minScore,
      category: initialJob?.category || 'IT',
      tag: initialJob?.tag || 'PRO'
    };

    if (initialJob) {
      backend.updateJob(initialJob.id, jobData);
      alert('Cập nhật tin tuyển dụng thành công!');
    } else {
      backend.createJob(jobData);
      backend.decrementPostLimit(currentUser.id);
      alert('Đăng tin tuyển dụng thành công!');
    }
    onBack();
  };

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
            <button 
              onClick={onBack} // For now, back to management
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all text-left mt-1"
            >
              <span className="material-symbols-outlined">article</span>
              <span className="text-sm uppercase tracking-wider font-bold">Tin tuyển dụng</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-bold transition-all shadow-lg shadow-[#1392ec]/20 text-left mt-1">
              <span className="material-symbols-outlined">add_box</span>
              <span className="text-sm uppercase tracking-wider">Đăng tin mới</span>
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
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">
              {initialJob ? 'Chỉnh sửa tin tuyển dụng' : 'Tạo bài toán tuyển dụng mới'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              {initialJob ? 'Cập nhật thông tin và tiêu chí đánh giá' : 'Thiết lập quy trình đánh giá tự động bằng AI'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-[#1e293b] rounded-full relative transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
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
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Stepper */}
            <div className="relative flex items-center justify-between mb-12 px-10">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#1e293b] -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-[#1392ec] -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_10px_rgba(19,146,236,0.5)]" 
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              ></div>
              
              {[1, 2, 3].map((s) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                  <div className={`size-12 rounded-full flex items-center justify-center font-black text-lg ring-8 ring-[#0f172a] transition-all duration-300 ${
                    step >= s ? 'bg-[#1392ec] text-white shadow-lg shadow-[#1392ec]/30' : 'bg-[#1e293b] text-slate-500 border-2 border-[#334155]'
                  }`}>
                    {step > s ? <span className="material-symbols-outlined">check</span> : s}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step >= s ? 'text-[#1392ec]' : 'text-slate-600'}`}>
                    {s === 1 ? 'Thông tin' : s === 2 ? 'Tiêu chí AI' : 'Đề bài'}
                  </span>
                </div>
              ))}
            </div>

            {/* Form Steps */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {step === 1 && (
                <section className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-2.5 rounded-xl bg-[#1392ec]/10 text-[#1392ec]">
                      <span className="material-symbols-outlined">work</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Bước 1: Thông tin công việc</h3>
                  </div>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Tên vị trí tuyển dụng</label>
                        <input 
                          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-5 py-4 text-white focus:border-[#1392ec] outline-none transition-all placeholder:text-slate-700 font-bold" 
                          placeholder="Ví dụ: Senior Frontend Developer (React/Tailwind)" 
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Tên công ty</label>
                        <input 
                          className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-5 py-4 text-white focus:border-[#1392ec] outline-none transition-all placeholder:text-slate-700 font-bold" 
                          placeholder="Ví dụ: TechNova Global" 
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Hạn nộp (Ngày)</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">calendar_today</span>
                          <input 
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-12 pr-4 py-4 text-white focus:border-[#1392ec] outline-none transition-all font-bold uppercase text-xs tracking-widest" 
                            type="date"
                            value={deadlineDate}
                            onChange={(e) => setDeadlineDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Hạn nộp (Giờ)</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">schedule</span>
                          <input 
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-12 pr-4 py-4 text-white focus:border-[#1392ec] outline-none transition-all font-bold uppercase text-xs tracking-widest" 
                            type="time"
                            value={deadlineTime}
                            onChange={(e) => setDeadlineTime(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Địa điểm</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">location_on</span>
                          <input 
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-12 pr-4 py-4 text-white focus:border-[#1392ec] outline-none transition-all font-bold text-xs tracking-widest" 
                            placeholder="Ví dụ: TP. Hồ Chí Minh"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Mức lương</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">payments</span>
                          <input 
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl pl-12 pr-4 py-4 text-white focus:border-[#1392ec] outline-none transition-all font-bold text-xs tracking-widest" 
                            placeholder="Ví dụ: 15 - 20 Triệu VNĐ"
                            type="text"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Mô tả công việc (JD)</label>
                      <div className="bg-[#0f172a] border border-[#334155] rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 p-3 border-b border-[#334155] bg-[#1e293b]/50">
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                          <div className="w-px h-4 bg-[#334155] mx-2"></div>
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">link</span></button>
                        </div>
                        <textarea 
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-200 p-5 resize-none min-h-[150px] font-medium text-sm leading-relaxed" 
                          placeholder="Nhập chi tiết yêu cầu công việc, kỹ năng cần thiết..." 
                          rows={6}
                          value={jd}
                          onChange={(e) => setJd(e.target.value)}
                        ></textarea>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Quyền lợi và đãi ngộ</label>
                      <div className="bg-[#0f172a] border border-[#334155] rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 p-3 border-b border-[#334155] bg-[#1e293b]/50">
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                        </div>
                        <textarea 
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-200 p-5 resize-none min-h-[150px] font-medium text-sm leading-relaxed" 
                          placeholder="Nhập các quyền lợi, bảo hiểm, thưởng..." 
                          rows={6}
                          value={benefits}
                          onChange={(e) => setBenefits(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-2.5 rounded-xl bg-[#1392ec]/10 text-[#1392ec]">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Bước 2: Thiết lập tiêu chí AI</h3>
                  </div>
                  <div className="space-y-10">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Từ khóa kỹ năng (Keywords)</label>
                      <div className="flex flex-wrap gap-2 p-4 bg-[#0f172a] border border-[#334155] rounded-xl">
                        {keywords.map((kw) => (
                          <span key={kw} className="inline-flex items-center gap-2 bg-[#1392ec]/10 text-[#1392ec] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#1392ec]/20">
                            {kw} 
                            <button onClick={() => removeKeyword(kw)} className="material-symbols-outlined text-[14px] hover:text-white transition-colors">close</button>
                          </span>
                        ))}
                        <input 
                          className="bg-transparent border-none focus:ring-0 text-sm p-1 flex-1 min-w-[150px] text-white placeholder:text-slate-700 font-bold" 
                          placeholder="Thêm từ khóa..." 
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyDown={addKeyword}
                        />
                      </div>
                      <p className="text-[10px] text-slate-600 mt-3 italic font-bold uppercase tracking-widest">AI sẽ ưu tiên các CV có chứa các từ khóa này.</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-6">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Điểm CV tối thiểu</label>
                        <span className="text-[#1392ec] font-black text-3xl italic">{minScore}<span className="text-sm not-italic text-slate-600 ml-1">/100</span></span>
                      </div>
                      <input 
                        className="w-full h-2 bg-[#0f172a] rounded-full appearance-none cursor-pointer accent-[#1392ec] border border-[#334155]" 
                        max="100" 
                        min="0" 
                        type="range" 
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                      />
                      <div className="flex justify-between mt-4 text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">
                        <span>Lỏng lẻo</span>
                        <span>Chặt chẽ</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="bg-[#1e293b] rounded-2xl border border-[#334155] p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-2.5 rounded-xl bg-[#1392ec]/10 text-[#1392ec]">
                      <span className="material-symbols-outlined">upload_file</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Bước 3: Đề bài kiểm tra</h3>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Nội dung đề bài (Case Study)</label>
                      <div className="bg-[#0f172a] border border-[#334155] rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 p-3 border-b border-[#334155] bg-[#1e293b]/50">
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                          <button className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-slate-400"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                        </div>
                        <textarea 
                          className="w-full bg-transparent border-none focus:ring-0 text-slate-200 p-5 resize-none min-h-[250px] font-medium text-sm leading-relaxed" 
                          placeholder="Nhập chi tiết đề bài, các yêu cầu cần giải quyết và tiêu chí đánh giá..." 
                          rows={10}
                          value={testAssignment}
                          onChange={(e) => setTestAssignment(e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                    <div className="p-4 bg-[#1392ec]/5 border border-[#1392ec]/10 rounded-xl flex items-start gap-4">
                      <span className="material-symbols-outlined text-[#1392ec] text-sm mt-0.5">info</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Hệ thống sẽ tự động gửi đề bài này cho các ứng viên vượt qua vòng lọc CV.</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-10 border-t border-[#334155]">
                <button 
                  onClick={onBack}
                  className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-[#1e293b] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                  Hủy bỏ
                </button>
                <div className="flex items-center gap-4">
                  {step > 1 && (
                    <button 
                      onClick={() => setStep(step - 1)}
                      className="px-8 py-3.5 bg-[#1e293b] border border-[#334155] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-300 hover:border-[#1392ec]/50 transition-all"
                    >
                      Quay lại
                    </button>
                  )}
                  <button className="px-8 py-3.5 bg-[#1e293b] border border-[#334155] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-300 hover:border-[#1392ec]/50 transition-all">
                    Lưu bản nháp
                  </button>
                  <button 
                    onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
                    className="px-10 py-3.5 bg-[#1392ec] rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white hover:bg-[#1181d1] shadow-xl shadow-[#1392ec]/20 transition-all flex items-center gap-3 active:scale-[0.98]"
                  >
                    {step === 3 ? (initialJob ? 'Lưu thay đổi' : 'Hoàn tất & Đăng tin') : 'Tiếp tục'}
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
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

export default DangTinMoi;
