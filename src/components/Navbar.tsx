
import React from 'react';

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <nav className="fixed top-0 w-full z-50 nav-blur border-b border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #10b981, #0ea5e9)'}}>
            <span className="material-icons-round text-white text-2xl">psychology</span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight dark:text-white uppercase">
            Mind<span className="gradient-text">Trace</span>
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href="#">Trang chủ</a>
          <a className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href="#co-che">Cơ chế</a>
          <a className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href="#tinh-nang">Tính năng</a>
          <a className="hover:text-primary transition-colors text-slate-600 dark:text-slate-300" href="#ai-demo">AI Test</a>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onLoginClick}
            className="px-5 py-2 text-sm font-semibold transition-colors dark:text-slate-300 hover:text-emerald-400"
          >
            Đăng nhập
          </button>
          <button 
            onClick={onRegisterClick}
            className="px-6 py-2.5 text-white text-sm font-bold rounded-full hover:shadow-lg transition-all"
            style={{background: 'linear-gradient(90deg, #10b981, #0ea5e9)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'}}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
