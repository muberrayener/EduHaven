import { Button } from "@/components/ui/button";
import axiosInstance from "@/utils/axios";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/contexts/ToastContext";

const backendUrl = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const hasLoggedIn = useRef(false);

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/auth/google`;
  };

  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    if (hasLoggedIn.current) return;

    console.log("Form submitted:", data);
    try {
      const url = `/auth/login`;
      const response = await axiosInstance.post(url, data);
      console.log(response.data);
      
      hasLoggedIn.current = true;
      reset();
      
      const { token, refreshToken } = response.data;

      if (token) {
        localStorage.setItem("token", token);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      window.dispatchEvent(new Event("tokenChanged"));
      toast.success("Login successful! Welcome back.");
      navigate("/");
    } catch (error) {
      hasLoggedIn.current = false;
      console.error(`Login failed:`, error.response?.data || error.message);
      toast.error(error.response?.data?.error || "An error occurred");
    }
  };

  return (
    <div className="space-y-8 ">
      <div className="text-center ">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-300 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>
      <Button
        onClick={handleGoogleLogin}
        variant="transparent"
        className="flex items-center justify-center gap-2 border border-gray-400 rounded-xl text-black dark:text-white hover:bg-white hover:dark:bg-black font-semibold p-2 text-lg w-full"
      >
        <img src="/GoogleIcon.svg" alt="Google sign-in" className="size-6" />
        <p>Continue with Google</p>
      </Button>

      {/* or  */}
      <div className="flex items-center my-6">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="mx-4 text-gray-500 font-medium text-sm">OR</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Email or Username
          </label>
          <div className="mt-3">
            <input
              id="identifier"
              type="text"
              placeholder="you@example.com or username"
              {...register("identifier", {
                required: "Email or Username is required",
              })}
              className="block w-full rounded-xl border border-gray-400 px-3 py-2 text-gray-900 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-transparent"
            />
            {errors.identifier && (
              <p className="text-red-500 text-sm mt-1">
                {errors.identifier.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Password{" "}
          </label>
          <div className="mt-3 relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...register("Password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="block w-full rounded-xl bg-transparent border border-gray-400 px-3 py-2 text-gray-900 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
            />
            <Button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-indigo-600"
              variant="transparent"
              size="icon"
            >
              {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
            </Button>
            {errors.Password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.Password.message}
              </p>
            )}
          </div>
          <div className="text-right mt-2 mb-4">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            disabled={isSubmitting || hasLoggedIn.current}
            variant="default"
            className={`w-full rounded-md py-2 px-4 font-semibold ${
              isSubmitting || hasLoggedIn.current
                ? "opacity-50 cursor-not-allowed bg-gray-400"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            }`}
          >
            {isSubmitting || hasLoggedIn.current ? "Submitting..." : "Log In"}
          </Button>
        </div>
      </form>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 text-center"
      >
        <Link
          className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          to="/auth/signup"
        >
          Do not have an account? Sign up
        </Link>
      </motion.div>
    </div>
  );
}

export default Login;