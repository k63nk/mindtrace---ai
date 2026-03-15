import React, { useState } from 'react';
import { User, Job } from '@/types';
import * as pdfjsLib from 'pdfjs-dist';

// Set proper worker path from node_modules
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

interface ApplyJobModalProps {
  currentUser: User;
  job: {
    id: string;
    title: string;
    location: string;
    type: string;
  };
  onClose: () => void;
  onSubmit: (cvContent: string, message: string, cvFileName: string) => void | Promise<void>;
}

const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ currentUser, job, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('🔍 Bắt đầu đọc PDF:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ Đã load buffer, kích thước:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('✅ Đã load PDF, số trang:', pdf.numPages);
      
      let fullText = '';
      let pageCount = 0;
      
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
            .trim();
          
          if (pageText.length > 0) {
            fullText += pageText + '\n';
            pageCount++;
            console.log(`✅ Trang ${pageNum}: ${pageText.substring(0, 50)}...`);
          }
        } catch (pageError) {
          console.warn(`⚠️ Lỗi đọc trang ${pageNum}:`, pageError);
          continue; // Skip this page, continue to next
        }
      }
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('PDF không chứa text hoặc không thể trích xuất nội dung.');
      }
      
      console.log('✅ Hoàn thành đọc PDF. Tổng text:', fullText.length, 'ký tự');
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
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Vui lòng chọn tệp PDF.');
        return;
      }
      setIsUploading(true);
      setPdfFile(file);
      // Simulate upload delay
      setTimeout(() => {
        setFileName(file.name);
        setIsUploading(false);
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    if (!fileName || !pdfFile) {
      alert('Vui lòng tải lên CV của bạn.');
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('📤 Bắt đầu nộp CV...');
      // Extract real text from PDF
      const cvContent = await extractTextFromPDF(pdfFile);
      
      if (!cvContent || cvContent.trim().length === 0) {
        alert('❌ Lỗi: File PDF không chứa text hoặc không thể đọc. Vui lòng kiểm tra lại file PDF của bạn.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('✅ Đã trích xuất CV thành công');
      // Send extracted content to parent component for AI evaluation
      await onSubmit(cvContent, message, fileName);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Không thể xử lý PDF';
      console.error('❌ Lỗi submit:', errorMsg);
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0f14]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-[#111821] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#1392ec]/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-[#1392ec]">description</span>
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight italic">Nộp hồ sơ ứng tuyển</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-white rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {/* Job Info */}
          <div className="mb-8 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Bạn đang ứng tuyển vị trí</p>
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic leading-tight">{job.title}</h1>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#1392ec]">schedule</span> {job.type}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-[#1392ec]">location_on</span> {job.location}</span>
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-6">
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all group cursor-pointer ${
                fileName ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#1392ec]/30 hover:border-[#1392ec] hover:bg-[#1392ec]/5'
              }`}
              onClick={() => document.getElementById('cv-upload')?.click()}
            >
              <input 
                type="file" 
                id="cv-upload" 
                className="hidden" 
                accept=".pdf"
                onChange={handleFileChange}
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-[#1392ec]/20 border-t-[#1392ec] rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-[#1392ec] uppercase tracking-widest">Đang tải lên...</p>
                </div>
              ) : fileName ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{fileName}</p>
                    <p className="text-xs text-emerald-500 font-black uppercase tracking-widest mt-1">Đã chọn thành công</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-[#1392ec]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[#1392ec] text-3xl">upload_file</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">Kéo và thả CV vào đây hoặc <span className="text-[#1392ec] hover:underline">nhấn để chọn tệp</span></p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Định dạng hỗ trợ duy nhất: <span className="text-slate-300">PDF</span> (Tối đa 5MB)</p>
                  </div>
                </>
              )}
            </div>

            {/* Additional Details Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lời nhắn đến nhà tuyển dụng (không bắt buộc)</label>
              <textarea 
                className="w-full bg-[#0a0f14] border border-slate-800 rounded-xl p-4 focus:border-[#1392ec] outline-none transition-all placeholder:text-slate-700 text-sm font-medium text-slate-200" 
                placeholder="Hãy chia sẻ ngắn gọn vì sao bạn phù hợp với vị trí này..." 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="px-8 py-6 bg-[#0a0f14]/50 border-t border-slate-800 flex flex-col gap-4 shrink-0">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full ${isSubmitting ? 'bg-slate-700' : 'bg-[#1392ec] hover:bg-[#1181d1]'} text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-[#1392ec]/20 flex items-center justify-center gap-2 uppercase text-xs tracking-widest active:scale-[0.98]`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Đang xử lý hồ sơ...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">send</span>
                Nộp CV ngay
              </>
            )}
          </button>
          <p className="text-[9px] text-center text-slate-500 font-bold px-10 leading-relaxed">
            Bằng cách nhấn "Nộp CV ngay", bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi. Thông tin của bạn sẽ được chuyển trực tiếp đến bộ phận nhân sự.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ApplyJobModal;
