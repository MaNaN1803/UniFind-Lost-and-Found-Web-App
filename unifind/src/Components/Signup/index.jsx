import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../../apiConfig";

const Signup = () => {
	const [data, setData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		phoneNumber: "",
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleChange = ({ currentTarget: input }) => {
		setData({ ...data, [input.name]: input.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const url = `${API_BASE_URL}/api/user`;
			const { data: res } = await axios.post(url, data);
			navigate("/login");
			console.log(res.message);
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
			<div className="absolute top-20 right-20 w-72 h-72 bg-zinc-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
			<div className="absolute bottom-20 left-20 w-72 h-72 bg-zinc-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

			<div className="flex flex-col-reverse md:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl relative z-10">

				{/* Left Side (CTA) */}
				<div className="w-full md:w-2/5 flex flex-col items-center justify-center p-8 md:p-12 bg-black/30 border-t md:border-t-0 md:border-r border-white/10 text-center">
					<h1 className="text-3xl font-bold text-white mb-4">Welcome Back!</h1>
					<p className="text-gray-300 mb-8 max-w-xs">
						To keep connected with us please login with your personal information.
					</p>
					<Link to="/login" className="w-full max-w-xs">
						<button
							type="button"
							className="w-full bg-white/10 text-white border border-white/20 font-bold py-4 px-8 rounded-xl hover:bg-white/20 hover:scale-[1.02] shadow-lg transition-all"
						>
							Sign In Instead
						</button>
					</Link>
				</div>

				{/* Right Side (Form) */}
				<div className="w-full md:w-3/5 p-8 md:p-12">
					<h1 className="text-3xl font-extrabold text-white mb-8">Create Your Account</h1>

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col md:flex-row gap-4">
							<input
								type="text"
								placeholder="First Name"
								name="firstName"
								onChange={handleChange}
								value={data.firstName}
								required
								className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white/10 transition-all font-medium"
							/>
							<input
								type="text"
								placeholder="Last Name"
								name="lastName"
								onChange={handleChange}
								value={data.lastName}
								required
								className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white/10 transition-all font-medium"
							/>
						</div>

						<input
							type="text"
							placeholder="Phone Number (Optional)"
							name="phoneNumber"
							onChange={handleChange}
							value={data.phoneNumber}
							className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white/10 transition-all font-medium"
						/>

						<input
							type="email"
							placeholder="Email"
							name="email"
							onChange={handleChange}
							value={data.email}
							required
							className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white/10 transition-all font-medium"
						/>
						<input
							type="password"
							placeholder="Password"
							name="password"
							onChange={handleChange}
							value={data.password}
							required
							className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white/10 transition-all font-medium"
						/>

						{error && (
							<div className="bg-red-500/20 text-red-200 py-3 px-4 rounded-xl mt-2 border border-red-500/50 text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							className="mt-6 bg-white text-black font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all active:scale-[0.98]"
						>
							Sign Up
						</button>
					</form>
				</div>

			</div>
		</div>
	);
};

export default Signup;