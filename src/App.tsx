import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoginPage from '@/components/LoginPage';
import RegisterPage from '@/components/RegisterPage';
import SV from '@/components/SV';
import Malt from '@/components/malt';
import MA1_LT from '@/components/MA1_LT';
import DonUngTuyen from '@/components/DonUngTuyen';
import HoSoCaNhan from '@/components/HoSoCaNhan';
import TimViecLam from '@/components/TimViecLam';
import JobDetail from '@/components/JobDetail';
import ApplyJobModal from '@/components/ApplyJobModal';
import SuccessApply from '@/components/SuccessApply';
import BusinessDashboard from '@/components/BusinessDashboard';
import BusinessProfile from '@/components/BusinessProfile';
import QuanLyTinTuyenDung from '@/components/QuanLyTinTuyenDung';
import DangTinMoi from '@/components/DangTinMoi';
import QuanLyUngVien from '@/components/QuanLyUngVien';
import { PricingModal, PaymentModal, CandidatePricingModal } from '@/components/SubscriptionModals';
import { backend } from '@/services/backendService';
import { User, Job } from '@/types';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'login' | 'register' | 'sv_dashboard' | 'exercise_library' | 'exercise_workspace' | 'applications_management' | 'personal_profile' | 'new_jobs' | 'job_detail' | 'success_apply' | 'business_dashboard' | 'business_profile' | 'business_job_management' | 'business_post_job' | 'business_candidate_management'>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(backend.getCurrentUser());
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mindtrace_theme');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<any>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCandidatePricing, setShowCandidatePricing] = useState(false);
  const [showCandidatePayment, setShowCandidatePayment] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('mindtrace_theme', JSON.stringify(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  // Restore user session from localStorage on page load
  useEffect(() => {
    const savedUser = backend.getCurrentUser();
    if (savedUser && !currentUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  useEffect(() => {
    if (currentUser && view === 'home') {
      setView(currentUser.role === 'student' ? 'sv_dashboard' : 'business_dashboard');
    }
  }, [currentUser]);

  const handleLoginSuccess = (role: 'student' | 'business', email: string) => {
    // User was already logged in by LoginPage and saved to localStorage
    // Just retrieve from localStorage and update state
    const user = backend.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (role === 'student') {
        setView('sv_dashboard');
      } else {
        setView('business_dashboard');
      }
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
    if (currentUser?.role === 'business') {
      setShowPricingModal(false);
      setShowPaymentModal(true);
    } else {
      setShowCandidatePricing(false);
      setShowCandidatePayment(true);
    }
  };

  const handleConfirmPayment = (method: string) => {
    if (!currentUser || !selectedPlan) return;
    backend.upgradeUser(currentUser.id, selectedPlan.id, selectedPlan.duration);
    setCurrentUser(backend.getCurrentUser());
    setShowPaymentModal(false);
    setShowCandidatePayment(false);
    alert(`Thanh toán thành công qua ${method}! Gói ${selectedPlan.name} đã được kích hoạt.`);
    if (currentUser.role === 'business') {
      setView('business_post_job');
    }
  };

  const navigateToExercises = () => {
    setView('exercise_library');
    const isFreeTier = !currentUser?.subscriptionTier || currentUser.subscriptionTier === 'FREE';
    if (isFreeTier) {
      setShowCandidatePricing(true);
    }
  };

  const handleApplySubmit = async (cvContent: string, message: string, cvFileName: string) => {
    if (!currentUser || !selectedJobId) return;
    try {
      const application = await backend.createApplication(currentUser.id, selectedJobId, cvContent, cvFileName);
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
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: 'white' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', animation: 'bounce 2s infinite' }}>
          <span style={{ fontSize: '40px' }}>🧠</span>
        </div>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase' }}>MindTrace Database</h2>
        <p style={{ color: '#64748b', maxWidth: '448px', lineHeight: '1.5', animation: 'pulse 2s infinite' }}>
          AI đang phân tích thị trường lao động và khởi tạo các cơ hội nghề nghiệp thực tế cho bạn...
        </p>
      </div>
    );
  }

  if (view === 'login') return <LoginPage onBack={() => setView('home')} onNavigateToRegister={() => setView('register')} onLoginSuccess={handleLoginSuccess} />;
  if (view === 'register') return <RegisterPage onBack={() => setView('home')} onNavigateToLogin={() => setView('login')} onRegisterSuccess={handleLoginSuccess} />;
  
  if (view === 'sv_dashboard' && currentUser) return (
    <>
      <SV 
        currentUser={currentUser}
        onLogout={handleLogout} 
        onStartPractice={(id) => {
          if (currentUser.subscriptionTier === 'FREE') {
            navigateToExercises();
          } else {
            if (id === 'all') {
              navigateToExercises();
            } else {
              setSelectedExerciseId(id);
              setView('exercise_workspace');
            }
          }
        }} 
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
    </>
  );

  if (view === 'applications_management' && currentUser) return (
    <DonUngTuyen 
      currentUser={currentUser}
      onBack={() => setView('sv_dashboard')}
      onLogout={handleLogout}
      onNavigateToExercises={navigateToExercises}
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
    <>
      <Malt 
        currentUser={currentUser}
        onBack={() => setView('sv_dashboard')} 
        onLogout={handleLogout} 
        onSelectExercise={(id) => {
          if (id === 'upgrade') {
            setShowCandidatePricing(true);
            return;
          }
          const exercise = backend.getExercises().find(ex => ex.id === id);
          const isFreeTier = !currentUser.subscriptionTier || currentUser.subscriptionTier === 'FREE';
          if (exercise?.isPremium && isFreeTier) {
            setShowCandidatePricing(true);
            return;
          }
          setSelectedExerciseId(id);
          setView('exercise_workspace');
        }}
        onNavigateToApplications={() => setView('applications_management')}
        onNavigateToProfile={() => setView('personal_profile')}
        onNavigateToNewJobs={() => setView('new_jobs')}
        onNavigateToExercises={navigateToExercises}
      />
      {showCandidatePricing && (
        <CandidatePricingModal 
          onClose={() => setShowCandidatePricing(false)}
          onSelectPlan={handleSelectPlan}
          onContinueFree={() => setShowCandidatePricing(false)}
        />
      )}
    </>
  );

  if (view === 'exercise_workspace' && currentUser) return (
    <MA1_LT 
      exerciseId={selectedExerciseId || ''}
      jobId={!selectedExerciseId ? selectedJobId : undefined}
      applicationId={!selectedExerciseId ? selectedApplicationId : undefined}
      currentUser={currentUser}
      onBack={() => selectedExerciseId ? navigateToExercises() : setView('applications_management')} 
    />
  );

  if (view === 'personal_profile' && currentUser) return (
    <HoSoCaNhan 
      currentUser={currentUser}
      onBack={() => setView('sv_dashboard')}
      onLogout={handleLogout}
      onNavigateToApplications={() => setView('applications_management')}
      onNavigateToExercises={navigateToExercises}
      onNavigateToNewJobs={() => setView('new_jobs')}
    />
  );

  if (view === 'new_jobs' && currentUser) return (
    <TimViecLam
      currentUser={currentUser}
      onBack={() => setView('sv_dashboard')}
      onLogout={handleLogout}
      onNavigateToApplications={() => setView('applications_management')}
      onNavigateToExercises={navigateToExercises}
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
        onNavigateToExercises={navigateToExercises}
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
        onNavigateToProfile={() => setView('business_profile')}
      />
      {showPricingModal && (
        <PricingModal 
          currentUser={currentUser} 
          onClose={() => {
            setShowPricingModal(false);
            setIsLoadingView(true);
            setEditingJob(null);
            setTimeout(() => {
              setView('business_post_job');
              setIsLoadingView(false);
            }, 100);
          }}
          onSelectPlan={handleSelectPlan}
          onContinueFree={() => {
            setShowPricingModal(false);
            setIsLoadingView(true);
            setEditingJob(null);
            setTimeout(() => {
              setView('business_post_job');
              setIsLoadingView(false);
            }, 100);
          }}
        />
      )}
    </>
  );

  if (view === 'business_profile' && currentUser) return (
    <BusinessProfile
      currentUser={currentUser}
      onBack={() => setView('business_dashboard')}
      onLogout={handleLogout}
    />
  );

  if (view === 'business_job_management' && currentUser) return (
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
      onNavigateToProfile={() => setView('business_profile')}
    />
  );

  if (view === 'business_post_job' && currentUser) return (
    <DangTinMoi
      currentUser={currentUser}
      initialJob={editingJob}
      onBack={() => {
        setEditingJob(null);
        // Refresh user data after posting
        const updatedUser = backend.getCurrentUser();
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
        setView('business_job_management');
      }}
      onLogout={handleLogout}
      onNavigateToCandidateManagement={() => setView('business_candidate_management')}
      onNavigateToProfile={() => setView('business_profile')}
    />
  );

  if (view === 'business_candidate_management' && currentUser) return (
    <QuanLyUngVien
      currentUser={currentUser}
      onBack={() => setView('business_dashboard')}
      onLogout={handleLogout}
      onNavigateToJobManagement={() => setView('business_job_management')}
      onNavigateToPostJob={handleNavigateToPostJob}
      onNavigateToProfile={() => setView('business_profile')}
    />
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white' }}>
      <Navbar onLoginClick={() => setView('login')} onRegisterClick={() => setView('register')} />
      <section style={{ position: 'relative', paddingTop: '192px', paddingBottom: '144px', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ maxWidth: '1344px', width: '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0 16px', paddingBottom: '12px', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '40px' }}>
            <span style={{ display: 'flex', height: '8px', width: '8px', borderRadius: '9999px', backgroundColor: '#10b981', marginRight: '8px', animation: 'pulse 2s infinite' }}></span>
            AI-Powered Recruitment Database Ready
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '48px', lineHeight: '1.2', letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#f1f5f9' }}>
            KẾT NỐI TRI THỨC <br/>
            <span style={{ background: 'linear-gradient(to right, #10b981, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textTransform: 'uppercase' }}>Kiến tạo sự nghiệp</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '64px', maxWidth: '768px', margin: 'auto' }}>
            Nền tảng được vận hành bởi AI, tự động kết nối những kỹ năng thực tế nhất với nhu cầu doanh nghiệp.
          </p>
          <div>
            <button onClick={() => setView('login')} style={{ padding: '24px 48px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 20px 25px rgba(16, 185, 129, 0.2)', fontSize: '16px', border: 'none' }}>
              Bắt đầu ứng tuyển
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
