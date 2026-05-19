import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Video, User, Mail, Lock, Image as ImageIcon, Camera, AlertCircle } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!avatar) {
            setError('Avatar image is required');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('fullName', fullName);
        formData.append('password', password);
        formData.append('avatar', avatar);
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        try {
            await axiosInstance.post('/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col justify-center items-center px-4 py-12 relative">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-[480px] glass p-8 rounded-2xl relative z-10 shadow-2xl">
                <div className="flex flex-col items-center gap-2 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-full text-red-500 mb-2">
                        <Video className="w-8 h-8 fill-current" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
                    <p className="text-sm text-zinc-400">Join MNNIT Media Video Manager</p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* File Uploads (Avatar & Cover Image) */}
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="relative w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center overflow-hidden group">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-6 h-6 text-zinc-500" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Upload</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Avatar (Required)</span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-3 transition-colors">
                            <User className="w-5 h-5 text-zinc-500 mr-3" />
                            <input
                                type="text"
                                placeholder="Abhishek Jha"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-transparent border-none outline-none text-white text-sm w-full"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Username</label>
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-3 transition-colors">
                            <User className="w-5 h-5 text-zinc-500 mr-3" />
                            <input
                                type="text"
                                placeholder="abhishekcodes166"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-transparent border-none outline-none text-white text-sm w-full"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-3 transition-colors">
                            <Mail className="w-5 h-5 text-zinc-500 mr-3" />
                            <input
                                type="email"
                                placeholder="abhishek@mnnit.ac.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Cover Image (Optional)</label>
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-3 transition-colors">
                            <ImageIcon className="w-5 h-5 text-zinc-500 mr-3" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverImageChange}
                                className="bg-transparent border-none outline-none text-white text-sm w-full text-zinc-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl cursor-pointer transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-red-500 hover:underline font-semibold">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
