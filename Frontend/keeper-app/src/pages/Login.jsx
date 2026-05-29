import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

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
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden select-none">
      
      {/* 
        Full-Screen Cyber-Security Vault Background 
        Matches the Keeper asset protection theme using deep dark tones and soft tech light patterns.
      */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1920" 
          alt="Keeper Encryption Mesh Background" 
          className="w-full h-full object-cover filter brightness-[0.20] contrast-[1.10]"
        />
        {/* Yellow-gold soft ambient light and dark mask */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/90 to-neutral-950"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      {/* Login Section Glass Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] w-full max-w-md border border-white/20 transition-all duration-300">
        
        {/* Keeper Premium Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-13 h-13 rounded-2xl bg-neutral-950 flex items-center justify-center text-yellow-400 font-black text-2xl shadow-lg mb-3 border border-yellow-500/10">
              K
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-neutral-950 p-0.5 rounded-md border border-white">
              <ShieldCheck size={10} strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight mt-1">Welcome Back</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-1.5">Sign in to your Keeper vault</p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-yellow-400/15 focus:border-yellow-400 text-sm placeholder-slate-400"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-yellow-400/15 focus:border-yellow-400 text-sm placeholder-slate-400"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Premium CTA Button in Deep Black & Yellow highlights */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-neutral-950 hover:bg-neutral-900 text-yellow-400 border border-yellow-500/20 py-3.5 rounded-2xl font-bold transition shadow-md shadow-neutral-950/25 flex justify-center items-center gap-2 text-sm mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Login to Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider whitespace-nowrap">Or continue with</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Official Google Login styled with matching black theme */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
            theme="filled_black" // Fits perfectly with our Black & Yellow design system
            size="large"
            shape="pill"
            width="350px"
          />
        </div>

        {/* Footer Link redirecting to Register view */}
        <p className="text-center text-slate-500 text-xs">
          Don’t have an account?{" "}
          <Link to="/register" className="text-yellow-600 font-bold hover:text-yellow-500 transition hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;