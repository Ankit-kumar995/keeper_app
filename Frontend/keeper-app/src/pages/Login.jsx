import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";

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
    /* 
      Premium dotted-grid pattern background to make the login card pop 
      and match modern, secure digital vault aesthetics.
    */
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-md w-full max-w-md border border-slate-200">
        
        {/* Keeper Premium Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-neutral-950 flex items-center justify-center text-yellow-400 font-black text-2xl shadow-sm mb-3">
            K
          </div>
          <h1 className="text-2xl font-black text-slate-955 leading-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider leading-none mt-1">Sign in to your Keeper vault</p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-yellow-400/15 focus:border-yellow-400 text-sm"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition focus:ring-4 focus:ring-yellow-400/15 focus:border-yellow-400 text-sm"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {/* Premium CTA Button in Deep Black & Yellow highlights */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-neutral-950 hover:bg-neutral-900 text-yellow-400 border border-yellow-500/20 py-3.5 rounded-2xl font-bold transition shadow-md shadow-neutral-950/10 flex justify-center items-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Login to Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Or continue with</span>
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