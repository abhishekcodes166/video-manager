import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import axiosInstance from '../api/axios';
import { Video, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axiosInstance.post('/users/login', {
                username: identifier, // Backend controller maps username to email or username check
                password
            });
            dispatch(login(response.data.message.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col justify-center items-center px-4 relative">
            {/* Background Gradients */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-[420px] glass p-8 rounded-2xl relative z-10 shadow-2xl">
                <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-full text-red-500 mb-2">
                        <Video className="w-8 h-8 fill-current" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
                    <p className="text-sm text-zinc-400">Login to MNNIT Media Video Manager</p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Username or Email</label>
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-3 transition-colors">
                            <Mail className="w-5 h-5 text-zinc-500 mr-3" />
                            <input
                                type="text"
                                placeholder="Enter username or email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="bg-transparent border-none outline-none text-white text-sm w-full"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-3 transition-colors">
                            <Lock className="w-5 h-5 text-zinc-500 mr-3" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent border-none outline-none text-white text-sm w-full"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-red-500 hover:underline font-semibold">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
