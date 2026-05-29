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
        Themed with Indigo-Slate colors to perfectly align with the Dashboard color palette.
      */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1920" 
          alt="Keeper Secure Digital Network" 
          className="w-full h-full object-cover filter brightness-[0.20] contrast-[1.10]"
        />
        {/* Soft Indigo Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/85 to-slate-950"></div>
        {/* Glowing Ambient Light Orbs matching Dashboard indicators */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none"></div>
      </div>

      {/* Login Section Glass Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.3)] w-full max-w-md border border-white/20 transition-all duration-300">
        
        {/* Keeper Dashboard-Themed Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-13 h-13 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-md mb-3 border border-indigo-400/20">
              K
            </div>
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-0.5 rounded-md border border-white shadow-sm">
              <ShieldCheck size={10} strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight mt-1">Welcome Back</h1>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider leading-none mt-1.5">Sign in to your Keeper vault</p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 text-sm placeholder-slate-400"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 text-sm placeholder-slate-400"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Premium CTA Button in Deep Indigo */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/10 py-3.5 rounded-2xl font-semibold transition shadow-md shadow-indigo-600/15 flex justify-center items-center gap-2 text-sm mt-2"
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

        {/* Official Google Login styled with matching clean theme */}
        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Login Failed")}
            theme="outline" // Sleek, clean and fits perfectly with the Indigo Dashboard system
            size="large"
            shape="pill"
            width="350px"
          />
        </div>

        {/* Footer Link redirecting to Register view */}
        <p className="text-center text-slate-500 text-xs">
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