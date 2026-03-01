import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../apiConfig";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
	const [data, setData] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
	};

	const sendEmailOnLogin = async () => {
		try {
			const emailUrl = `${API_BASE_URL}/send-email-on-login`;
			await axios.post(emailUrl);
			console.log("Email sent successfully");
		} catch (error) {
			console.error("Error sending email:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = `${API_BASE_URL}/api/auth`;
			const { data: res } = await axios.post(url, data);
			login(res.data); // Use AuthContext to set token
			sendEmailOnLogin();
			navigate("/");
		} catch (error) {
			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status <= 500
			) {
				setError(error.response.data.message);
			}
		}
	};

	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4">
			{/* Decorative blurred circles - Grayscale */}
			<div className="absolute top-20 left-20 w-72 h-72 bg-zinc-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
			<div className="absolute top-20 right-20 w-72 h-72 bg-zinc-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
			<div className="absolute -bottom-8 left-40 w-72 h-72 bg-white rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

			<div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl relative z-10">

				{/* Left Side (Form) */}
				<div className="w-full md:w-3/5 p-8 md:p-12">
					<h1 className="text-3xl font-extrabold text-white mb-8">Login to Your Account</h1>

					<form onSubmit={handleSubmit} className="flex flex-col">
						<input
							type="email"
							placeholder="Email"
							name="email"
							onChange={handleChange}
							value={data.email}
							required
							className="mb-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white/10 transition-all font-medium"
						/>
						<input
							type="password"
							placeholder="Password"
							name="password"
							onChange={handleChange}
							value={data.password}
							required
							className="mb-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white/10 transition-all font-medium"
						/>

						{error && (
							<div className="bg-red-500/20 text-red-200 py-3 px-4 rounded-xl mb-6 border border-red-500/50 text-sm">
								{error}
							</div>
						)}

						<div className="text-right mb-4">
							<Link to="/forgot-password" className="text-sm text-zinc-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
								Forgot Password?
							</Link>
						</div>

						<button
							type="submit"
							className="mt-4 bg-white text-black font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:bg-zinc-200 transition-all active:scale-[0.98]"
						>
							Sign In
						</button>
					</form>
				</div>

				{/* Right Side (CTA) */}
				<div className="w-full md:w-2/5 flex flex-col items-center justify-center p-8 md:p-12 bg-black/30 border-t md:border-t-0 md:border-l border-white/10 text-center">
					<h1 className="text-3xl font-bold text-white mb-4">New Here?</h1>
					<p className="text-gray-300 mb-8 max-w-xs">
						Join the UniFind community today and never lose track of your items again!
					</p>
					<Link to="/signup" className="w-full max-w-xs">
						<button
							type="button"
							className="w-full bg-white/10 text-white border border-white/20 font-bold py-4 px-8 rounded-xl hover:bg-white/20 hover:scale-[1.02] shadow-lg transition-all"
						>
							Sign Up Instead
						</button>
					</Link>
				</div>

			</div>
		</div>
	);
};

export default Login;
