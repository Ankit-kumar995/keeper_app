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
  EyeOff 
} from "lucide-react";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none bg-slate-950">
      
      {/* 
        Full-Screen Cyber-Security Vault Background.
        Local image ('/login-bg.png') will load if you save your uploaded screenshot in the public folder.
        Otherwise, it falls back to a high-quality sci-fi matrix mesh background.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/login-bg.png" 
          alt="Keeper Secure Digital Network" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to high-quality abstract tech background if the local image is not found in public folder
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1920";
          }}
        />
        {/* Soft layout blending overlay */}
        <div className="absolute inset-0 bg-slate-950/20"></div>
      </div>

      {/* Main Login Card - Replicated Exactly from Image (No Bottom Badges) */}
      <div className="relative z-10 bg-white p-8 md:p-10 rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] w-full max-w-[430px] border border-slate-100/50 transition-all duration-300">
        
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-blue-400/20">
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
          
          {/* Email Input */}
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

          {/* Password Input with Visibility Toggle */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full pl-11 pr-11 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 focus:bg-white text-sm placeholder-slate-400 font-medium text-slate-800"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Gradient Submit Button with Lock Icon */}
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

        {/* Google Login Component */}
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

        {/* Sign up Redirect */}
        <p className="text-center text-slate-400 text-xs font-semibold">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;