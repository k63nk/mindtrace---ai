
import React, { useState, useEffect, useRef } from 'react';
import { evaluatePracticeSolution } from '@/services/geminiService';
import { backend } from '@/services/backendService';
import { User } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

interface MA1_LTProps {
  onBack: () => void;
  exerciseId: string;
  jobId?: string | null;
  applicationId?: string | null;
  currentUser: User;
}

const MA1_LT: React.FC<MA1_LTProps> = ({ onBack, exerciseId, jobId, applicationId, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(86400); // 24 giờ = 86400 giây
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [exercise, setExercise] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [draftName, setDraftName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (exerciseId) {
      const foundExercise = backend.getExercises().find(e => e.id === exerciseId);
      setExercise(foundExercise);
    }
  }, [exerciseId]);

  useEffect(() => {
    if (jobId) {
      const foundJob = backend.getJobs().find(j => j.id === jobId);
      setJob(foundJob);

      const apps = backend.getApplicationsByStudent(currentUser.id);
      
      // If applicationId is provided, use it. Otherwise, find the best match.
      let app = null;
      if (applicationId) {
        app = apps.find(a => a.id === applicationId);
      } else {
        // Fallback: find the one with CV_PASSED status for this job
        app = apps.find(a => a.jobId === jobId && a.status === 'CV_PASSED');
        // If still not found, just find any for this job
        if (!app) app = apps.find(a => a.jobId === jobId);
      }

      if (app) {
        setApplication(app);
        
        // Timer logic - strictly based on testStartTime from backend
        if (app.testStartTime) {
          const startTime = new Date(app.testStartTime).getTime();
          const now = new Date().getTime();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, 86400 - elapsed);
          setTimeLeft(remaining);
        } else {
          // Fallback if somehow missing, but backend should have set it
          setTimeLeft(86400);
        }

        // Load draft if exists (mocking file as name for demo)
        if (app.draftSolution) {
          setDraftName(app.draftSolution);
        }
      }
    }
  }, [jobId, currentUser.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, '0')).join(':');
  };

  const extractPDFText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 20); pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
            .trim();
          
          if (pageText.length > 0) {
            fullText += pageText + '\n';
          }
        } catch (pageError) {
          console.warn(`⚠️ Lỗi đọc trang ${pageNum}:`, pageError);
          continue;
        }
      }
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('PDF không chứa text hoặc không thể trích xuất nội dung.');
      }
      
      return fullText;
    } catch (error) {
      console.error('❌ Lỗi extract PDF:', error);
      throw new Error(
        error instanceof Error 
          ? `Lỗi đọc PDF: ${error.message}` 
          : 'Không thể đọc nội dung PDF. Vui lòng kiểm tra file PDF của bạn.'
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setDraftName(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveDraft = () => {
    if (application) {
      backend.updateApplication(application.id, { 
        draftSolution: selectedFile ? selectedFile.name : application.draftSolution 
      });
      alert('Đã lưu bản nháp thành công!');
    }
  };

  const handleSubmit = async () => {
    console.log('Submitting test...', { selectedFile, draftName, application, job, exercise });
    
    if (!selectedFile && !draftName) {
      alert('Vui lòng chọn tệp tin bài làm trước khi nộp.');
      return;
    }

    const isJobTest = !!jobId;
    const targetTitle = isJobTest ? job?.title : exercise?.title;
    const targetCompany = isJobTest ? job?.companyName : exercise?.company;

    if (!targetTitle) {
      console.error('Missing target info', { application, job, exercise });
      alert('Lỗi: Không tìm thấy thông tin bài tập. Vui lòng thử lại.');
      return;
    }

    setIsEvaluating(true);
    try {
      const fileName = selectedFile ? selectedFile.name : draftName;
      
      if (isJobTest && application && job) {
        // For job tests, we don't use AI grading. The business will grade it.
        // Update application status to TEST_SUBMITTED
        const updated = backend.updateApplication(application.id, {
          status: 'TEST_SUBMITTED',
          testSubmission: fileName || 'Unknown_File.pdf',
          testScore: 0, // Reset or leave at 0 until business grades
          companyFeedback: '', // Clear any previous feedback
        });

        if (!updated) {
          throw new Error('Failed to update application in backend');
        }

        // Notify business user
        backend.addNotification(
          job.companyId, 
          'Ứng viên nộp bài test', 
          `Ứng viên ${currentUser.name} đã nộp bài làm cho vị trí ${job.title}. Vui lòng kiểm tra và chấm điểm.`,
          'info'
        );

        // Notify student
        backend.addNotification(
          currentUser.id,
          'Nộp bài test thành công',
          `Bạn đã nộp bài test cho vị trí ${job.title}. Vui lòng đợi doanh nghiệp chấm điểm và phản hồi.`,
          'success'
        );

        // Show a success message instead of evaluation result
        alert('Nộp bài test thành công! Vui lòng đợi kết quả từ doanh nghiệp.');
        onBack();
      } else if (exerciseId) {
        // AI Grading for practice exercises - Extract PDF text first
        let solutionContent = '';
        
        if (selectedFile) {
          // Read actual PDF content
          console.log('📖 Đang đọc file PDF:', selectedFile.name);
          solutionContent = await extractPDFText(selectedFile);
          console.log('✅ Đã trích xuất text từ PDF, độ dài:', solutionContent.length);
        } else if (draftName) {
          // Use draft name as fallback
          solutionContent = `Bài làm từ file: ${draftName}`;
        }
        
        if (!solutionContent || solutionContent.trim().length === 0) {
          throw new Error('Không thể đọc nội dung file. Vui lòng kiểm tra lại file PDF của bạn.');
        }

        // Call AI evaluation with actual PDF content
        console.log('🤖 Gửi yêu cầu đánh giá đến AI...');
        const result = await evaluatePracticeSolution(
          targetTitle,
          solutionContent
        );

        console.log('✅ AI đã chấm bài:', result);
        setEvaluationResult(result);

        // Practice exercise logic
        backend.saveExerciseResult({
          exerciseId,
          studentId: currentUser.id,
          score: result.score,
          feedback: result.feedback,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          recommendations: result.recommendations,
          completedDate: new Date().toLocaleDateString('vi-VN')
        });

        // Notify student
        backend.addNotification(
          currentUser.id,
          'Luyện tập hoàn tất',
          `Bạn đã hoàn thành bài luyện tập "${targetTitle}" với số điểm ${result.score}/100.`,
          'success'
        );

        // Update skills based on exercise category
        if (result.score >= 50) {
          backend.updateUserSkills(currentUser.id, [exercise?.category || 'General']);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert('❌ ' + errorMsg);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f14] text-slate-100 font-display">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf"
      />

      {/* Evaluation Result Modal */}
      {evaluationResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#111821] border border-slate-800 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="p-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Chúc mừng bạn đã hoàn thành!</h3>
                  <p className="text-xs font-bold text-[#00DC82] uppercase tracking-widest mt-2">MindTrace AI đã hoàn tất chấm điểm bài làm của bạn</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="size-24 rounded-full border-4 border-[#00DC82] flex items-center justify-center bg-[#00DC82]/10 shadow-[0_0_20px_rgba(0,220,130,0.3)]">
                    <span className="text-4xl font-black text-[#00DC82] italic">{evaluationResult.score}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Điểm đạt được</span>
                </div>
              </div>

              <div className="mb-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                <p className="text-sm text-slate-300 leading-relaxed italic whitespace-pre-wrap">{evaluationResult.feedback}</p>
              </div>

              <div className="space-y-8">
                <section>
                  <h4 className="text-sm font-black text-[#1392ec] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">thumb_up</span> Điểm mạnh ({evaluationResult.strengths.length})
                  </h4>
                  <div className="space-y-3">
                    {evaluationResult.strengths.map((s: string, i: number) => (
                      <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-3">
                        <span className="text-emerald-500 font-bold text-lg mt-0.5">✓</span>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">thumb_down</span> Điểm cần cải thiện ({evaluationResult.weaknesses.length})
                  </h4>
                  <div className="space-y-3">
                    {evaluationResult.weaknesses.map((w: string, i: number) => {
                      const isCritical = w.includes('[CRITICAL]');
                      const isImportant = w.includes('[IMPORTANT]');
                      const bgColor = isCritical ? 'bg-red-600/10 border-red-600/40' : isImportant ? 'bg-orange-500/10 border-orange-500/40' : 'bg-red-500/5 border-red-500/20';
                      const iconColor = isCritical ? 'text-red-600' : isImportant ? 'text-orange-500' : 'text-red-400';
                      const icon = isCritical ? '🚨' : isImportant ? '⚠️' : '!';
                      
                      return (
                        <div key={i} className={`p-4 ${bgColor} rounded-xl flex gap-3`}>
                          <span className={`font-bold text-lg mt-0.5 ${iconColor}`}>{icon}</span>
                          <p className="text-sm text-slate-300 font-medium leading-relaxed">{w}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h4 className="text-sm font-black text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">lightbulb</span> Đề xuất từ chuyên gia ({evaluationResult.recommendations.length})
                  </h4>
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6 space-y-4">
                    {evaluationResult.recommendations.map((r: string, i: number) => {
                      // Extract emoji if it's at the start (📚 🎯 📊 ⚙️ ⚠️ 🔄 💬 🚨 [ƯU TIÊN])
                      const priorityMatch = r.match(/^\[ƯU TIÊN\]/);
                      const isPriority = !!priorityMatch;
                      const text = r.replace(/^\[ƯU TIÊN\]\s*/, '');
                      
                      return (
                        <div key={i} className={`flex gap-3 items-start ${ isPriority ? 'bg-orange-500/20 p-3 rounded-lg border border-orange-400/30' : ''}`}>
                          <span className={`${ isPriority ? 'text-orange-400 font-bold text-lg' : 'material-symbols-outlined text-orange-400 text-sm'} mt-0.5 shrink-0`}>
                            { isPriority ? '⭐' : 'auto_awesome' }
                          </span>
                          <p className={`${ isPriority ? 'text-sm font-bold text-orange-300' : 'text-sm text-slate-300'} leading-relaxed`}>{text}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="pt-6 flex justify-center">
                  <button 
                    onClick={() => {
                      setEvaluationResult(null);
                      onBack();
                    }}
                    className="px-12 py-4 bg-[#00DC82] text-[#0B0F1A] rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(0,220,130,0.4)] transition-all shadow-xl"
                  >
                    Hoàn tất & Quay lại Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isEvaluating && !evaluationResult && (
        <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-[#0a0f14]/95 backdrop-blur-md">
          <div className="flex flex-col items-center gap-8">
            <div className="relative size-32">
              <div className="absolute inset-0 border-4 border-[#1392ec]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#1392ec] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-[#1392ec]">psychology</span>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">
                MindTrace AI Đang Chấm Bài
              </h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Vui lòng đợi trong giây lát...
              </p>
              
              <div className="pt-4">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-[#1392ec] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#1392ec] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#1392ec] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar Workspace */}
      <aside className="w-64 border-r border-slate-800 bg-[#111821] flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
          <div className="w-10 h-10 bg-[#1392ec] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#1392ec]/20">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic leading-none">MindTrace</h1>
            <p className="text-[10px] text-[#1392ec] font-bold tracking-widest uppercase mt-1">Student Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button onClick={onBack} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-all group">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-sm font-medium">Trở lại thư viện</span>
          </button>
          <div className="pt-8 pb-3 px-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tiến độ bài làm</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1392ec]/10 text-[#1392ec] border border-[#1392ec]/20">
              <span className="material-symbols-outlined text-sm">upload_file</span>
              <span className="text-xs font-bold uppercase tracking-wider">Nộp bài giải PDF</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="text-xs font-bold uppercase tracking-wider">Hoàn tất & Nộp</span>
            </div>
          </div>
        </nav>
        <div className="mt-auto p-4 border-t border-slate-800 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Cài đặt</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/10 transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Workspace Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-[#0a0f14] border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Làm bài: {job ? job.title : (exercise ? exercise.title : 'Đang tải...')}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đề tài: {job ? job.category : (exercise ? exercise.category : '...')}</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đơn vị: {job ? job.companyName : (exercise ? exercise.company : '...')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
              <span className="material-symbols-outlined text-orange-400 animate-pulse">timer</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">Thời gian còn lại</span>
                <span className="text-xl font-mono font-bold text-orange-400">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-700 bg-cover bg-center border border-slate-600 shadow-lg" style={{backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky')`}}></div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column: Brief */}
          <div className="w-1/2 border-r border-slate-800 overflow-y-auto p-12 bg-[#111821]/30">
            <div className="max-w-2xl ml-auto">
              <section className="mb-10">
                <h3 className="text-sm font-bold text-[#1392ec] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span> Nội dung đề bài
                </h3>
                <div className="bg-[#111821] border border-slate-800 rounded-xl p-8 space-y-4">
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {job ? job.testAssignment : (exercise ? exercise.description : 'Đang tải nội dung đề bài...')}
                  </div>
                  {!job && !exercise && (
                    <ul className="space-y-4 pt-2">
                      <li className="flex gap-3 text-sm text-slate-400">
                        <span className="text-red-500 font-bold">•</span>
                        <span>Giao diện lựa chọn nhà mạng chiếm quá nhiều không gian.</span>
                      </li>
                      <li className="flex gap-3 text-sm text-slate-400">
                        <span className="text-red-500 font-bold">•</span>
                        <span>Thiếu các gợi ý mệnh giá dựa trên lịch sử nạp tiền của người dùng.</span>
                      </li>
                      <li className="flex gap-3 text-sm text-slate-400">
                        <span className="text-red-500 font-bold">•</span>
                        <span>Thông báo lỗi khi nhập sai số điện thoại chưa thực sự trực quan.</span>
                      </li>
                    </ul>
                  )}
                </div>
              </section>

              <section className="mb-10">
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">target</span> Mục tiêu cần đạt được
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-emerald-500">speed</span>
                      <h4 className="font-bold text-white text-sm">Tối ưu quy trình</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Giảm ít nhất 2 thao tác (click/tap) trong luồng nạp tiền tiêu chuẩn.</p>
                  </div>
                  <div className="p-5 bg-[#1392ec]/5 border border-[#1392ec]/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-[#1392ec]">analytics</span>
                      <h4 className="font-bold text-white text-sm">Tăng tỷ lệ chuyển đổi</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Đề xuất giải pháp UI/UX giúp tăng tỷ lệ hoàn tất nạp tiền thêm 15%.</p>
                  </div>
                  <div className="p-5 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-orange-400">lightbulb</span>
                      <h4 className="font-bold text-white text-sm">Tính đột phá</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Áp dụng AI để cá nhân hóa các gói cước/khuyến mãi cho từng tập khách hàng.</p>
                  </div>
                </div>
              </section>

              <div className="p-5 bg-slate-800/40 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-500 italic">Lưu ý: Bạn có thể trình bày dưới dạng file PDF proposal hoặc file thiết kế (Figma link trong file PDF).</p>
              </div>
            </div>
          </div>

          {/* Right Column: Submission Portal */}
          <div className="w-1/2 overflow-y-auto p-12 flex flex-col bg-[#0a0f14]">
            <div className="max-w-2xl mr-auto w-full flex-1 flex flex-col">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-2">Trình bày bài giải</h3>
                <p className="text-xs font-medium text-[#1392ec] bg-[#1392ec]/10 border border-[#1392ec]/20 px-3 py-1.5 rounded-lg inline-block">
                  Yêu cầu: Trình bày thành file PDF từ 3-5 trang, dung lượng tối đa 50MB
                </p>
              </div>

              {/* Upload Box */}
              <div 
                onClick={triggerFileInput}
                className="flex-1 flex flex-col bg-[#111821] border-2 border-dashed border-slate-700 rounded-[2.5rem] p-12 items-center justify-center text-center transition-all hover:border-[#1392ec]/50 group mb-8 cursor-pointer"
              >
                <div className="w-20 h-20 bg-[#1392ec]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl text-[#1392ec]">
                    {(selectedFile || draftName) ? 'check_circle' : 'upload_file'}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">
                  {(selectedFile || draftName) ? 'Tệp tin đã chọn' : 'Tải lên tệp tin bài làm'}
                </h4>
                <p className="text-sm text-slate-500 mb-8 max-w-sm font-medium">
                  {selectedFile ? selectedFile.name : (draftName ? `${draftName} (Bản nháp)` : 'Hỗ trợ định dạng PDF. Dung lượng tối đa 50MB.')}
                </p>
                <button 
                  className="bg-[#1392ec] text-white px-10 py-3.5 rounded-xl font-bold hover:bg-[#1181d1] transition-all shadow-xl shadow-[#1392ec]/20 flex items-center gap-2 uppercase text-xs tracking-widest"
                >
                  <span className="material-symbols-outlined text-lg">
                    {(selectedFile || draftName) ? 'sync' : 'add'}
                  </span>
                  {(selectedFile || draftName) ? 'Chọn tệp khác' : 'Chọn tệp tin'}
                </button>
              </div>

              {/* AI Suggestion Box */}
              <div className="mt-auto p-6 bg-[#1392ec]/5 border border-[#1392ec]/20 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1392ec]/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#1392ec] text-2xl fill-1">auto_awesome</span>
                </div>
                <div>
                  <p className="text-xs text-[#1392ec] font-black uppercase tracking-[0.15em] mb-1">MindTrace AI Gợi ý</p>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    Đừng quên đính kèm các User Flow so sánh giữa giao diện cũ và mới để hội đồng giám khảo dễ dàng đánh giá sự cải tiến của bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="px-12 py-6 border-t border-slate-800 bg-[#111821] flex items-center justify-end">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSaveDraft}
              className="px-8 py-3.5 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
            >
              Lưu nháp
            </button>
            <button 
              onClick={handleSubmit}
              className="px-12 py-3.5 bg-[#1392ec] text-white rounded-xl font-bold hover:bg-[#1181d1] transition-all shadow-xl shadow-[#1392ec]/30 flex items-center gap-2 text-xs uppercase tracking-widest"
            >
              Nộp bài
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default MA1_LT;
