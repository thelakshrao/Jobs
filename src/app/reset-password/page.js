import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* Left Side: Hero Section */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/hero.png')" }} 
      >
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10">
          <img src="/logo.png" alt="Logo" className="w-16 h-16" />
          <div className="mt-20 space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Stop Struggling.<br />
              <span className="text-blue-400">Start Working.</span>
            </h2>
            <div className="space-y-4 text-gray-200 italic border-l-2 border-blue-400 pl-4">
              <p>"Your skill is your passport. We help you use it anywhere in the world."</p>
              <p>"Every great career begins with one brave step across a border."</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-300">
          © 2026 Jobs Abroad. All rights reserved.
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#121212]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-semibold">Login</h1>
            <p className="text-gray-400 mt-2">Reset your password for <span className="text-white">raolaksh6@gmail.com</span></p>
          </div>

          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">New Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 group-focus-within:text-red-500 transition-colors">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.set)}
                  placeholder="Enter your password"
                  className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg py-3 px-10 focus:outline-none focus:border-red-500 transition-all text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01]"
            >
              <span>Save Password</span>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Don't have an account? <a href="#" className="text-blue-500 hover:underline">Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;