
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AICVDemo from './components/AICVDemo';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SV from './components/SV';
import Malt from './components/malt';
import MA1_LT from './components/MA1_LT';
import DonUngTuyen from './components/DonUngTuyen';
import HoSoCaNhan from './components/HoSoCaNhan';
import TimViecLam from './components/TimViecLam';
import JobDetail from './components/JobDetail';
import ApplyJobModal from './components/ApplyJobModal';
import SuccessApply from './components/SuccessApply';
import BusinessDashboard from './components/BusinessDashboard';
import QuanLyTinTuyenDung from './components/QuanLyTinTuyenDung';
import DangTinMoi from './components/DangTinMoi';
import QuanLyUngVien from './components/QuanLyUngVien';
import { PricingModal, PaymentModal } from './components/SubscriptionModals';
import { backend } from './services/backendService';
import { User, Job } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'login' | 'register' | 'sv_dashboard' | 'exercise_library' | 'exercise_workspace' | 'applications_management' | 'personal_profile' | 'new_jobs' | 'job_detail' | 'success_apply' | 'business_dashboard' | 'business_job_management' | 'business_post_job' | 'business_candidate_management'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(backend.getCurrentUser());
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    const initDb = async () => {
      const jobs = backend.getJobs();
      if (jobs.length === 0) {
        setIsInitializing(true);
        await backend.initializeDatabase();
        setIsInitializing(false);
      }
    };
    initDb();
  }, []);

  useEffect(() => {
    if (currentUser && view === 'home') {
      setView(currentUser.role === 'student' ? 'sv_dashboard' : 'business_dashboard');
    }
  }, [currentUser]);

  const handleLoginSuccess = (role: 'student' | 'business', email: string) => {
    const user = backend.login(email, role);
    setCurrentUser(user);
    if (role === 'student') {
      setView('sv_dashboard');
    } else {
      setView('business_dashboard');
    }
  };

  const handleLogout = () => {
    backend.logout();
    setCurrentUser(null);
    setView('home');
  };

  const handleNavigateToPostJob = () => {
    if (!currentUser) return;
    setShowPricingModal(true);
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowPricingModal(false);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = (method: string) => {
    if (!currentUser || !selectedPlan) return;
    
    backend.upgradeSubscription(currentUser.id, selectedPlan.id, selectedPlan.duration);
    setCurrentUser(backend.getCurrentUser());
    setShowPaymentModal(false);
    alert(`Thanh toán thành công qua ${method}! Gói ${selectedPlan.name} đã được kích hoạt.`);
    setView('business_post_job');
  };

  const handleApplySubmit = async (cvContent: string, message: string, cvFileName: string) => {
    if (!currentUser || !selectedJobId) return;
    
    try {
      const application = await backend.createApplication(currentUser.id, selectedJobId, cvContent, cvFileName);
      
      // Update skills based on job category after applying
      const job = backend.getJobs().find(j => j.id === selectedJobId);
      if (job) {
        backend.updateUserSkills(currentUser.id, [job.category]);
      }

      setShowApplyModal(false);
      setCurrentApplication(application);
      setView('success_apply');
    } catch (error) {
      console.error("Application error:", error);
      alert("Đã có lỗi xảy ra khi nộp hồ sơ. Vui lòng thử lại.");
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
          <span className="material-icons-round text-primary text-5xl">psychology</span>
        </div>
        <h2 className="text-3xl font-black text-white mb-4 italic uppercase">Mind<span className="gradient-text">Trace</span> Database</h2>
        <p className="text-slate-400 max-w-md leading-relaxed animate-pulse">
          AI đang phân tích thị trường lao động và khởi tạo các cơ hội nghề nghiệp thực tế cho bạn...
        </p>
        <div className="mt-8 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  if (view === 'login') return (
    <LoginPage 
      onBack={() => setView('home')} 
      onNavigateToRegister={() => setView('register')}
      onLoginSuccess={handleLoginSuccess} 
    />
  );

  if (view === 'register') return (
    <RegisterPage 
      onBack={() => setView('home')} 
      onNavigateToLogin={() => setView('login')}
      onRegisterSuccess={handleLoginSuccess} 
    />
  );
  
  if (view === 'sv_dashboard' && currentUser) return (
    <SV 
      currentUser={currentUser}
      onLogout={handleLogout} 
      onStartPractice={() => setView('exercise_library')} 
      onNavigateToApplications={(appId) => {
        if (appId) {
          setSelectedApplicationId(appId);
        } else {
          setSelectedApplicationId(null);
        }
        setView('applications_management');
      }}
      onNavigateToProfile={() => setView('personal_profile')}
      onNavigateToNewJobs={() => setView('new_jobs')}
    />
  );

  if (view === 'applications_management' && currentUser) return (
    <DonUngTuyen 
      currentUser={currentUser}
      onBack={() => setView('sv_dashboard')}
      onLogout={handleLogout}
      onNavigateToExercises={() => setView('exercise_library')}
      onStartTest={(jobId, appId) => {
        setSelectedJobId(jobId);
        setSelectedApplicationId(appId || null);
        setSelectedExerciseId(null);
        setView('exercise_workspace');
      }}
      onNavigateToProfile={() => setView('personal_profile')}
      onNavigateToNewJobs={() => setView('new_jobs')}
      initialSelectedAppId={selectedApplicationId}
    />
  );

  if (view === 'exercise_library' && currentUser) return (
    <Malt 
      currentUser={currentUser}
      onBack={() => setView('sv_dashboard')} 
      onLogout={handleLogout} 
      onSelectExercise={(id) => {
        setSelectedExerciseId(id);
        setView('exercise_workspace');
      }}
      onNavigateToApplications={() => setView('applications_management')}
      onNavigateToProfile={() => setView('personal_profile')}
      onNavigateToNewJobs={() => setView('new_jobs')}
    />
  );

  if (view === 'exercise_workspace' && currentUser) return (
    <MA1_LT 
      exerciseId={selectedExerciseId || ''}
      jobId={!selectedExerciseId ? selectedJobId : undefined}
      applicationId={!selectedExerciseId ? selectedApplicationId : undefined}
      currentUser={currentUser}
      onBack={() => selectedExerciseId ? setView('exercise_library') : setView('applications_management')} 
    />
  );

  if (view === 'personal_profile' && currentUser) return (
    <HoSoCaNhan 
      currentUser={currentUser}
      onBack={() => setView('sv_dashboard')}
      onLogout={handleLogout}
      onNavigateToApplications={() => setView('applications_management')}
      onNavigateToExercises={() => setView('exercise_library')}
      onNavigateToNewJobs={() => setView('new_jobs')}
    />
  );

  if (view === 'new_jobs' && currentUser) return (
    <TimViecLam
      currentUser={currentUser}
      onBack={() => setView('sv_dashboard')}
      onLogout={handleLogout}
      onNavigateToApplications={() => setView('applications_management')}
      onNavigateToExercises={() => setView('exercise_library')}
      onNavigateToProfile={() => setView('personal_profile')}
      onSelectJob={(id) => {
        setSelectedJobId(id);
        setView('job_detail');
      }}
    />
  );

  if (view === 'job_detail' && currentUser) return (
    <>
      <JobDetail
        currentUser={currentUser}
        jobId={selectedJobId}
        onBack={() => setView('sv_dashboard')}
        onLogout={handleLogout}
        onNavigateToApplications={() => setView('applications_management')}
        onNavigateToExercises={() => setView('exercise_library')}
        onNavigateToProfile={() => setView('personal_profile')}
        onNavigateToNewJobs={() => setView('new_jobs')}
        onApply={() => setShowApplyModal(true)}
      />
      {showApplyModal && (
        <ApplyJobModal 
          currentUser={currentUser}
          job={(() => {
            const job = backend.getJobs().find(j => j.id === selectedJobId);
            return {
              id: selectedJobId || '',
              title: job?.title || "Vị trí không xác định",
              location: job?.location || "Địa điểm không xác định",
              type: "Toàn thời gian"
            };
          })()}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplySubmit}
        />
      )}
    </>
  );

  if (view === 'success_apply' && currentUser) return (
    <SuccessApply
      currentUser={currentUser}
      application={currentApplication}
      onBackToDashboard={() => setView('sv_dashboard')}
      onViewApplications={() => setView('applications_management')}
      onStartTest={() => {
        if (currentApplication) {
          setSelectedJobId(currentApplication.jobId);
          setSelectedApplicationId(currentApplication.id);
        }
        setSelectedExerciseId(null);
        setView('exercise_workspace');
      }}
    />
  );

  if (view === 'business_dashboard' && currentUser) return (
    <>
      <BusinessDashboard 
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateToJobManagement={() => setView('business_job_management')}
        onNavigateToPostJob={handleNavigateToPostJob}
        onNavigateToCandidateManagement={() => setView('business_candidate_management')}
      />
      {showPricingModal && (
        <PricingModal 
          currentUser={currentUser} 
          onClose={() => setShowPricingModal(false)}
          onSelectPlan={handleSelectPlan}
          onContinueFree={() => {
            if (backend.canPostJob(currentUser.id)) {
              setCurrentUser(backend.getCurrentUser());
              setShowPricingModal(false);
              setEditingJob(null);
              setView('business_post_job');
            } else {
              alert('Bạn đã hết lượt đăng tin miễn phí trong tháng này. Vui lòng nâng cấp gói để tiếp tục.');
            }
          }}
        />
      )}
      {showPaymentModal && selectedPlan && (
        <PaymentModal 
          plan={selectedPlan}
          onClose={() => {
            setShowPaymentModal(false);
            setShowPricingModal(true);
          }}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );

  if (view === 'business_job_management' && currentUser) return (
    <>
      <QuanLyTinTuyenDung
        currentUser={currentUser}
        onBack={() => setView('business_dashboard')}
        onLogout={handleLogout}
        onNavigateToPostJob={handleNavigateToPostJob}
        onEditJob={(job) => {
          setEditingJob(job);
          setView('business_post_job');
        }}
        onNavigateToCandidateManagement={() => setView('business_candidate_management')}
      />
      {showPricingModal && (
        <PricingModal 
          currentUser={currentUser} 
          onClose={() => setShowPricingModal(false)}
          onSelectPlan={handleSelectPlan}
          onContinueFree={() => {
            if (backend.canPostJob(currentUser.id)) {
              setCurrentUser(backend.getCurrentUser());
              setShowPricingModal(false);
              setEditingJob(null);
              setView('business_post_job');
            } else {
              alert('Bạn đã hết lượt đăng tin miễn phí trong tháng này. Vui lòng nâng cấp gói để tiếp tục.');
            }
          }}
        />
      )}
      {showPaymentModal && selectedPlan && (
        <PaymentModal 
          plan={selectedPlan}
          onClose={() => {
            setShowPaymentModal(false);
            setShowPricingModal(true);
          }}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );

  if (view === 'business_post_job' && currentUser) return (
    <DangTinMoi
      currentUser={currentUser}
      initialJob={editingJob}
      onBack={() => {
        setCurrentUser(backend.getCurrentUser());
        setEditingJob(null);
        setView('business_job_management');
      }}
      onLogout={handleLogout}
      onNavigateToCandidateManagement={() => setView('business_candidate_management')}
    />
  );

  if (view === 'business_candidate_management' && currentUser) return (
    <>
      <QuanLyUngVien
        currentUser={currentUser}
        onBack={() => setView('business_dashboard')}
        onLogout={handleLogout}
        onNavigateToJobManagement={() => setView('business_job_management')}
        onNavigateToPostJob={handleNavigateToPostJob}
      />
      {showPricingModal && (
        <PricingModal 
          currentUser={currentUser} 
          onClose={() => setShowPricingModal(false)}
          onSelectPlan={handleSelectPlan}
          onContinueFree={() => {
            if (backend.canPostJob(currentUser.id)) {
              setCurrentUser(backend.getCurrentUser());
              setShowPricingModal(false);
              setEditingJob(null);
              setView('business_post_job');
            } else {
              alert('Bạn đã hết lượt đăng tin miễn phí trong tháng này. Vui lòng nâng cấp gói để tiếp tục.');
            }
          }}
        />
      )}
      {showPaymentModal && selectedPlan && (
        <PaymentModal 
          plan={selectedPlan}
          onClose={() => {
            setShowPaymentModal(false);
            setShowPricingModal(true);
          }}
          onConfirm={handleConfirmPayment}
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} />
      <section className="relative pt-48 pb-36 overflow-hidden min-h-screen flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 network-mesh opacity-40"></div>
        <div className="glow-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-10">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            AI-Powered Recruitment Database Ready
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-12 leading-tight tracking-tight text-slate-100 uppercase italic">
            KẾT NỐI TRI THỨC <br/>
            <span className="gradient-text uppercase italic">Kiến tạo sự nghiệp</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            Nền tảng được vận hành bởi AI, tự động kết nối những kỹ năng thực tế nhất với nhu cầu doanh nghiệp.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button onClick={() => setView('login')} className="w-full sm:w-auto px-12 py-6 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all hover:scale-105 shadow-xl shadow-primary/20 group">
              Bắt đầu ứng tuyển
              <span className="material-icons-round text-xl group-hover:translate-x-1 transition-transform">school</span>
            </button>
          </div>
        </div>
      </section>
      <AICVDemo />
    </div>
  );
};

export default App;
