import React, { useEffect, useState } from 'react';
import { User, Job } from '@/types';
import { backend } from '@/services/backendService';

interface TimViecLamProps {
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToApplications: () => void;
  onNavigateToExercises: () => void;
  onNavigateToProfile: () => void;
  onSelectJob: (id: string) => void;
}

const TimViecLam: React.FC<TimViecLamProps> = ({ 
  currentUser, 
  onBack, 
  onLogout, 
  onNavigateToApplications, 
  onNavigateToExercises, 
  onNavigateToProfile,
  onSelectJob
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('Tất cả địa điểm');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả ngành nghề');
  const [salaryFilter, setSalaryFilter] = useState('Tất cả mức lương');

  useEffect(() => {
    setJobs(backend.getJobs());
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === 'Tất cả địa điểm' || job.location.includes(locationFilter);
    
    const matchesCategory = categoryFilter === 'Tất cả ngành nghề' || job.category === categoryFilter;
    
    let matchesSalary = true;
    if (salaryFilter !== 'Tất cả mức lương') {
      if (salaryFilter === 'Thỏa thuận') {
        matchesSalary = job.salary === 'Thỏa thuận';
      } else if (salaryFilter === 'Dưới 10 triệu') {
        const val = parseFloat(job.salary.replace(/[^0-9.]/g, ''));
        matchesSalary = !isNaN(val) && val < 10;
      } else if (salaryFilter === '10 - 20 triệu') {
        const val = parseFloat(job.salary.replace(/[^0-9.]/g, ''));
        matchesSalary = !isNaN(val) && val >= 10 && val <= 20;
      } else if (salaryFilter === 'Trên 20 triệu') {
        const val = parseFloat(job.salary.replace(/[^0-9.]/g, ''));
        matchesSalary = !isNaN(val) && val > 20;
      }
    }

    return matchesSearch && matchesLocation && matchesCategory && matchesSalary;
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
          <button 
            onClick={onNavigateToExercises}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-left"
          >
            <span className="material-symbols-outlined">science</span>
            <span className="text-sm">Kho luyện tập AI</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1392ec] text-white font-semibold text-left shadow-lg shadow-[#1392ec]/20">
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
            <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">Tìm kiếm việc làm mới</h2>
            <p className="text-sm text-slate-400">Khám phá các cơ hội nghề nghiệp phù hợp với bạn.</p>
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
          <section className="mb-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#111821] p-4 rounded-2xl shadow-xl border border-slate-800">
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-widest">Địa điểm</label>
                <div className="relative">
                  <span className="material-icons-round text-slate-400 text-sm absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">location_on</span>
                  <select 
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 rounded-xl border border-transparent hover:border-[#1392ec]/50 focus:border-[#1392ec] outline-none transition-all cursor-pointer text-sm text-slate-200 appearance-none"
                  >
                    <option value="Tất cả địa điểm">Tất cả địa điểm</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Tây Ninh">Tây Ninh</option>
                  </select>
                  <span className="material-icons-round text-slate-400 text-sm absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-widest">Ngành nghề</label>
                <div className="relative">
                  <span className="material-icons-round text-slate-400 text-sm absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">work_outline</span>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 rounded-xl border border-transparent hover:border-[#1392ec]/50 focus:border-[#1392ec] outline-none transition-all cursor-pointer text-sm text-slate-200 appearance-none"
                  >
                    <option value="Tất cả ngành nghề">Tất cả ngành nghề</option>
                    <option value="IT">Công nghệ thông tin</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Tài chính</option>
                    <option value="Design">Thiết kế</option>
                    <option value="Business">Kinh doanh</option>
                  </select>
                  <span className="material-icons-round text-slate-400 text-sm absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-widest">Mức lương</label>
                <div className="relative">
                  <span className="material-icons-round text-slate-400 text-sm absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">payments</span>
                  <select 
                    value={salaryFilter}
                    onChange={(e) => setSalaryFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 rounded-xl border border-transparent hover:border-[#1392ec]/50 focus:border-[#1392ec] outline-none transition-all cursor-pointer text-sm text-slate-200 appearance-none"
                  >
                    <option value="Tất cả mức lương">Tất cả mức lương</option>
                    <option value="Dưới 10 triệu">Dưới 10 triệu</option>
                    <option value="10 - 20 triệu">10 - 20 triệu</option>
                    <option value="Trên 20 triệu">Trên 20 triệu</option>
                    <option value="Thỏa thuận">Thỏa thuận</option>
                  </select>
                  <span className="material-icons-round text-slate-400 text-sm absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-400 mb-1 ml-1 uppercase tracking-widest">Tìm kiếm</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-xl border border-transparent group-hover:border-[#1392ec]/50 transition-all">
                  <span className="material-icons-round text-slate-400 text-sm">search</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-slate-200 placeholder-slate-500" 
                    placeholder="Tên công việc, công ty..." 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-[#00DC82] text-[#0B0F1A] font-bold rounded-full hover:shadow-[0_0_20px_rgba(0,220,130,0.4)] transition-all">
                <span className="material-icons-round text-lg">shuffle</span>
                Tìm kiếm ngẫu nhiên
              </button>
              <div className="h-6 w-[1px] bg-slate-800 mx-2"></div>
              <button className="px-5 py-2 rounded-full border border-slate-800 text-slate-300 hover:border-[#00DC82] hover:text-[#00DC82] transition-all text-sm font-medium">Hà Nội</button>
              <button className="px-5 py-2 rounded-full border border-slate-800 text-slate-300 hover:border-[#00DC82] hover:text-[#00DC82] transition-all text-sm font-medium">TP. Hồ Chí Minh</button>
              <button className="px-5 py-2 rounded-full border border-slate-800 text-slate-300 hover:border-[#00DC82] hover:text-[#00DC82] transition-all text-sm font-medium">Đà Nẵng</button>
              <button className="px-5 py-2 rounded-full border border-slate-800 text-slate-300 hover:border-[#00DC82] hover:text-[#00DC82] transition-all text-sm font-medium">Miền Bắc</button>
              <button className="px-5 py-2 rounded-full border border-slate-800 text-slate-300 hover:border-[#00DC82] hover:text-[#00DC82] transition-all text-sm font-medium">Miền Nam</button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-[#111821] rounded-3xl border border-dashed border-slate-800">
                <span className="material-icons-round text-4xl text-slate-600 mb-4">search_off</span>
                <p className="text-slate-400 font-medium">Không tìm thấy công việc nào phù hợp với tiêu chí của bạn.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('Tất cả địa điểm');
                    setCategoryFilter('Tất cả ngành nghề');
                    setSalaryFilter('Tất cả mức lương');
                  }}
                  className="mt-4 text-[#1392ec] text-sm font-bold hover:underline"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => (
              <div key={job.id} className="group relative bg-[#111821] rounded-2xl border border-slate-800 p-5 hover:border-[#00DC82] transition-all duration-300 hover:shadow-2xl hover:shadow-[#00DC82]/5">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-900/10 transition-colors">
                    <span className="material-icons-round text-xl">favorite_border</span>
                  </button>
                </div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      alt={job.companyName} 
                      className="w-10 h-10 object-contain" 
                      src={job.id === 'job_japanese' ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDgla8pYNa6rgVD9M_YqabKRV15fKfoZUHcCGsCsaMvUKAaFa6uRekZnPiiT5r1Czj-D6FoemPJfHaI6euMskN-04egyfmiMt60djxGIKsWaagZvLTC7uIojo0xcAVBwiTfK4aZv-zkMWj9NqiSDOZeBFNSVMu--0IcCSZpNiUnz1sqw-_x2bK0W4YELcbSwHA2XwphI1r-SV9ZL5dSPDCS-VEIYzCB3rfNHSPQR7Ql_vRWZDRl__XhhDhd5_8EHNibrTbDW-ft6xA" : 
                           job.id === 'job_music' ? "https://lh3.googleusercontent.com/aida-public/AB6AXuDIPSrOXnw5kzHdTKg2AETh5NS2CI1WSZhA4YadN1-EW3XjhR8ropC5xOImYzMU7M61VTNbljL-02BeT8RfYFa6epKahVQL7MtOUPNboPAGrleN-xGZwsMrSLTOAx14XKn5580B93s8MfdH4iOl6bZxCgyZLgavXWclSqIdRL8_Lw8yfzMt1dgQZFMgizmKztr4JNB9GEBEJEXAfQSQE-73n8wHMJXcMQy18VwjI4YkEEd1BgSKAtiWZxVqllPthfp86wHwvDTF4aI" :
                           `https://api.dicebear.com/7.x/initials/svg?seed=${job.companyName}`}
                    />
                  </div>
                  <div className="pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      {job.tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${job.tag === 'HOT' ? 'bg-red-500/10 text-red-500' : 'bg-[#00DC82]/10 text-[#00DC82]'}`}>{job.tag}</span>}
                      {job.isHot && <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">GẤP</span>}
                    </div>
                    <h3 className="font-bold text-lg leading-tight text-white group-hover:text-[#00DC82] transition-colors cursor-pointer">{job.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{job.companyName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  <div className="px-3 py-1 bg-slate-800/50 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="material-icons-round text-sm text-slate-400">payments</span>
                    {job.salary}
                  </div>
                  <div className="px-3 py-1 bg-slate-800/50 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <span className="material-icons-round text-sm text-slate-400">location_on</span>
                    {job.location}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">Hạn nộp: {job.deadline}</span>
                  <button onClick={() => onSelectJob(job.id)} className="text-sm font-bold text-[#00DC82] group-hover:underline">Ứng tuyển ngay</button>
                </div>
              </div>
            )))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2">
            <button className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center hover:border-[#00DC82] text-slate-400 transition-colors">
              <span className="material-icons-round">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-[#00DC82] text-[#0B0F1A] font-bold">1</button>
            <button className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center hover:border-[#00DC82] text-slate-300 transition-colors font-medium">2</button>
            <button className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center hover:border-[#00DC82] text-slate-300 transition-colors font-medium">3</button>
            <span className="mx-2 text-slate-500">...</span>
            <button className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center hover:border-[#00DC82] text-slate-300 transition-colors font-medium">12</button>
            <button className="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center hover:border-[#00DC82] text-slate-400 transition-colors">
              <span className="material-icons-round">chevron_right</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimViecLam;
