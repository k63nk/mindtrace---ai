
import React, { useState } from 'react';
import { evaluateCVContent } from '@/services/geminiService';
import { AIScoreResult } from '@/types';

const AICVDemo: React.FC = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIScoreResult | null>(null);

  const handleEvaluate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const evaluation = await evaluateCVContent(content);
    setResult(evaluation);
    setLoading(false);
  };

  return (
    <section id="ai-demo" className="py-24 bg-slate-100 dark:bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
            Trải nghiệm công nghệ AI
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Đánh Giá CV <span className="gradient-text">Tức Thì</span></h2>
          <p className="text-slate-500 text-lg">Dán nội dung giới thiệu bản thân hoặc kinh nghiệm của bạn để xem AI chấm điểm.</p>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-2xl">
          <textarea
            className="w-full h-48 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-2xl p-6 focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:text-white placeholder-slate-400"
            placeholder="Dán nội dung CV hoặc kinh nghiệm làm việc tại đây..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <button
            onClick={handleEvaluate}
            disabled={loading || !content.trim()}
            className="mt-6 w-full py-4 bg-primary hover:bg-emerald-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang phân tích...
              </>
            ) : (
              <>
                <span className="material-icons-round">bolt</span>
                Chấm điểm CV bằng AI
              </>
            )}
          </button>

          {result && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center bg-primary/5">
                  <div className="text-center">
                    <span className="text-4xl font-black text-primary">{result.score}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Mind Score</p>
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="text-xl font-bold mb-2">Nhận xét của AI</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {result.feedback}
                  </p>
                  <h5 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Đề xuất cải thiện:</h5>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="material-icons-round text-primary text-lg">check_circle</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AICVDemo;
