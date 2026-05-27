import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Attempt to register the user via AuthContext
      await register(
        formData.name,
        formData.email,
        formData.password
      );

      // If successful, navigate to the dashboard
      navigate("/dashboard");
    } catch (error) {
      // Print detailed error logs in the browser console (F12)
      console.error("Detailed Registration Error:", error);

      // Retrieve the exact error message sent from the backend API
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      
      // Display the actual cause of failure to the user in a popup
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md space-y-5"
      >
        <h2 className="text-3xl font-bold text-center">
          Create Account
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full border border-slate-200 p-3 rounded-xl"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border border-slate-200 p-3 rounded-xl"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border border-slate-200 p-3 rounded-xl"
          required
        />

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold">
          Register
        </button>

        <p className="text-sm text-center text-slate-500">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-indigo-600 font-semibold"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;