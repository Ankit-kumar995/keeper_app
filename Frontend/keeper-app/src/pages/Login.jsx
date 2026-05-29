import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Shield, 
  Cloud 
} from "lucide-react";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Password hide/show state

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      await loginWithGoogle(response);
      navigate("/dashboard");
    } catch (err) {
      alert("Google authentication failed");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-4 md:p-6 overflow-hidden select-none bg-slate-950">
      
      {/* 
        Full-Screen Cyber-Security Vault Background (Rich Neon Blue/Purple Mesh)
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1920" 
          alt="Keeper Secure Digital Network" 
          className="w-full h-full object-cover filter brightness-[0.25] contrast-[1.10]"
        />
        {/* Glowing Ambient light highlights matching the vault image */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950"></div>
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px]"></div>
      </div>

      {/* Spacing element for center-alignment */}
      <div className="hidden md:block h-6"></div>

      {/* Main Login Card (Image Design Match) */}
      <div className="relative z-10 bg-white p-8 md:p-10 rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] w-full max-w-[440px] border border-slate-100/50 transition-all duration-300 my-auto">
        
        {/* Brand Logo & Welcome Text */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {/* Elegant K Logo matching the glowing shield */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-blue-400/20">
              K
            </div>
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-md border border-white shadow-md">
              <ShieldCheck size={11} strokeWidth={3} />
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mt-3">Welcome Back</h1>
          <p className="text-xs text-slate-400 font-semibold tracking-wide leading-none mt-1.5">
            Sign in to your <span className="text-indigo-600 font-bold">Keeper</span> vault
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Address Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white text-sm placeholder-slate-400 font-medium text-slate-800"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password Input with Visibility Eye Toggle */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full pl-11 pr-11 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white text-sm placeholder-slate-400 font-medium text-slate-800"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {/* Dynamic eye visibility icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Indigo-to-Purple Gradient Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white py-3.5 rounded-2xl font-bold transition shadow-lg shadow-indigo-600/20 flex justify-center items-center gap-2 text-sm mt-3 border border-indigo-400/10 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Lock size={15} strokeWidth={2.5} />
                <span>Login to Account</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider whitespace-nowrap">Or continue with</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* Google Authentication pill button matching outline theme */}
        <div className="flex justify-center mb-5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
            theme="outline" 
            size="large"
            shape="pill"
            width="350px"
          />
        </div>

        {/* Footer Link redirecting to Signup view */}
        <p className="text-center text-slate-400 text-xs font-semibold">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition hover:underline">
            Create one
          </Link>
        </p>
      </div>

      {/* 
        PREMIUM SYSTEM LIVE METRICS / FOOTER BADGES (Image Replicated)
      */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 border-t border-slate-800/60 pt-4 pb-2 text-[11px] text-slate-400">
        
        {/* Metric 1 */}
        <div className="flex items-center gap-3 justify-center md:justify-start">
          <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800/80 flex items-center justify-center text-indigo-400">
            <Shield size={14} />
          </div>
          <div>
            <p className="font-bold text-slate-200">Bank-Level Security</p>
            <p className="text-[10px] text-slate-500 font-semibold">256-bit AES encryption</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800/80 flex items-center justify-center text-indigo-400">
            <Lock size={14} />
          </div>
          <div>
            <p className="font-bold text-slate-200">Zero Knowledge</p>
            <p className="text-[10px] text-slate-500 font-semibold">We never see your data</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center gap-3 justify-center md:justify-end">
          <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800/80 flex items-center justify-center text-indigo-400">
            <Cloud size={14} />
          </div>
          <div>
            <p className="font-bold text-slate-200">Always Available</p>
            <p className="text-[10px] text-slate-500 font-semibold">Decentralized cloud access</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;