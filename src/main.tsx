
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';

console.log('🚀 main.tsx starting...');

// Add error handling to page directly
const showError = (msg: string) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color: red; padding: 20px; font-size: 18px;">❌ Error: ${msg}</div>`;
  }
  console.error(msg);
};

try {
  const rootElement = document.getElementById('root');
  console.log('📍 Root element found:', !!rootElement);

  if (!rootElement) {
    showError('Root element not found');
    throw new Error("Could not find root element");
  }

  // Hide loading message
  const loadingMsg = document.querySelector('.emergency-message');
  if (loadingMsg) {
    loadingMsg.style.display = 'none';
  }

  console.log('✅ Creating React root...');
  const root = ReactDOM.createRoot(rootElement);

  console.log('✅ Rendering App...');
  root.render(<App />);

  console.log('✅ App rendered successfully!');
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);
  showError(msg);
}
