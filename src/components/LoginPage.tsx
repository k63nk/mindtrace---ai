
import React, { useState } from 'react';
import { backend } from '@/services/backendService';

interface LoginPageProps {
  onBack: () => void;
  onNavigateToRegister: () => void;
  onLoginSuccess: (role: 'student' | 'business', email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onNavigateToRegister, onLoginSuccess }) => {
  const [role, setRole] = useState<'student' | 'business'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    
    const user = backend.login(email.toLowerCase(), role, password);
    if (!user) {
      alert("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
      return;
    }
    
    onLoginSuccess(role, email.toLowerCase());
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-background-dark text-slate-100">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-secondary transition-colors group z-20"
      >
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        <span className="text-sm font-medium">Quay lại trang chủ</span>
      </button>

      <div className="absolute inset-0 network-mesh opacity-30"></div>
      <div className="glow-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50"></div>

      <div className="w-full max-w-[480px] relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-icons-round text-white text-3xl">psychology</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white uppercase italic">
            Mind<span className="gradient-text">Trace</span>
          </span>
        </div>

        <div className="login-card w-full p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white tracking-tight">Đăng nhập vào MindTrace</h1>

          <div className="grid grid-cols-2 p-1.5 bg-white/5 rounded-2xl mb-10">
            <button 
              onClick={() => setRole('student')}
              className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'student' 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Dành cho Sinh viên
            </button>
            <button 
              onClick={() => setRole('business')}
              className={`py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                role === 'business' 
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Dành cho Doanh nghiệp
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Email của bạn</label>
              <input 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-slate-600 outline-none" 
                placeholder="nhap-email-cua-ban@gmail.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-300">Mật khẩu</label>
                <a className="text-xs font-bold text-primary hover:text-emerald-400 transition-colors" href="#">Quên mật khẩu?</a>
              </div>
              <input 
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-slate-600 outline-none" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit"
              className={`w-full py-4 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl mt-2 ${
                role === 'student' ? 'bg-gradient-to-r from-primary to-secondary shadow-primary/10' : 'bg-gradient-to-r from-secondary to-blue-600 shadow-secondary/10'
              }`}
            >
              Đăng nhập bằng Email
            </button>
          </form>

          <div className="relative mt-8 mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative px-4 text-xs font-bold text-slate-500 bg-[#121212] uppercase tracking-widest">Hoặc tiếp tục với</span>
          </div>

          <button 
            type="button"
            onClick={() => onLoginSuccess(role, "google-auth-user@gmail.com")}
            className="w-full py-4 px-6 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Google
          </button>
        </div>

        <p className="mt-8 text-slate-400 font-medium">
          Chưa có tài khoản?
          <button onClick={onNavigateToRegister} className="text-primary font-bold hover:underline ml-1">Đăng ký ngay</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
