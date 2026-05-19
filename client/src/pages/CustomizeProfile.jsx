import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { login } from '../store/authSlice';
import { User, Image, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function CustomizeProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData, status } = useSelector((state) => state.auth);

    // Form States
    const [fullName, setFullName] = useState(userData?.fullName || '');
    const [email, setEmail] = useState(userData?.email || '');
    const [username, setUsername] = useState(userData?.username || '');

    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Feedback States
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    
    const [mediaSuccess, setMediaSuccess] = useState('');
    const [mediaError, setMediaError] = useState('');

    const [passSuccess, setPassSuccess] = useState('');
    const [passError, setPassError] = useState('');

    // Update Text Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axiosInstance.patch('/users/update-account', payload);
            return res.data.message;
        },
        onSuccess: (data) => {
            dispatch(login(data));
            setProfileSuccess('Profile text details updated successfully!');
            setProfileError('');
        },
        onError: (err) => {
            setProfileError(err.response?.data?.message || 'Failed to update profile details');
            setProfileSuccess('');
        }
    });

    // Update Avatar Mutation
    const updateAvatarMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await axiosInstance.patch('/users/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.message;
        },
        onSuccess: (data) => {
            dispatch(login(data));
            setMediaSuccess('Avatar updated successfully!');
            setMediaError('');
            setAvatarFile(null);
        },
        onError: (err) => {
            setMediaError(err.response?.data?.message || 'Failed to upload avatar');
            setMediaSuccess('');
        }
    });

    // Update Cover Image Mutation
    const updateCoverMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('coverImage', file);
            const res = await axiosInstance.patch('/users/cover-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data.message;
        },
        onSuccess: (data) => {
            dispatch(login(data));
            setMediaSuccess('Cover banner updated successfully!');
            setMediaError('');
            setCoverFile(null);
        },
        onError: (err) => {
            setMediaError(err.response?.data?.message || 'Failed to upload cover banner');
            setMediaSuccess('');
        }
    });

    // Change Password Mutation
    const changePasswordMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axiosInstance.post('/users/change-password', payload);
            return res.data.message;
        },
        onSuccess: () => {
            setPassSuccess('Password updated successfully!');
            setPassError('');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        },
        onError: (err) => {
            setPassError(err.response?.data?.message || 'Failed to change password');
            setPassSuccess('');
        }
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        if (!fullName.trim() || !email.trim() || !username.trim()) {
            setProfileError('All text fields are required');
            return;
        }
        updateProfileMutation.mutate({ fullName, email, username });
    };

    const handleMediaSubmit = (e) => {
        e.preventDefault();
        if (!avatarFile && !coverFile) {
            setMediaError('Please select a file to update');
            return;
        }
        if (avatarFile) {
            updateAvatarMutation.mutate(avatarFile);
        }
        if (coverFile) {
            updateCoverMutation.mutate(coverFile);
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPassError('All password fields are required');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPassError('New passwords do not match');
            return;
        }
        changePasswordMutation.mutate({ oldpassword: oldPassword, newpassword: newPassword });
    };

    if (!status) {
        return (
            <div className="p-6 text-center py-24 text-zinc-500">
                <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Sign in to customize profile</h2>
                <button onClick={() => navigate('/login')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all inline-block mt-4">
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1000px] mx-auto min-h-screen bg-[#0f0f0f] text-white space-y-10 pb-20 animate-in fade-in duration-300">
            <div className="border-b border-zinc-850 pb-4">
                <h1 className="text-2xl font-extrabold tracking-tight">Customize Profile</h1>
                <p className="text-sm text-zinc-400 mt-1">Manage your channel details, images, and security settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Account Details Form */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2 className="text-md font-bold flex items-center gap-2 border-b border-zinc-800 pb-3">
                            <User className="w-4 h-4 text-red-500" />
                            <span>Account Details</span>
                        </h2>

                        {profileSuccess && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 font-medium">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{profileSuccess}</span>
                            </div>
                        )}
                        {profileError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 font-medium">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{profileError}</span>
                            </div>
                        )}

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-950/20"
                            >
                                {updateProfileMutation.isPending ? 'Updating...' : 'Save Account Details'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. Brand Media Form */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4">
                        <h2 className="text-md font-bold flex items-center gap-2 border-b border-zinc-800 pb-3">
                            <Image className="w-4 h-4 text-red-500" />
                            <span>Branding & Media</span>
                        </h2>

                        {mediaSuccess && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 font-medium">
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{mediaSuccess}</span>
                            </div>
                        )}
                        {mediaError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 font-medium">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{mediaError}</span>
                            </div>
                        )}

                        <form onSubmit={handleMediaSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Avatar Photo</label>
                                <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                                        <img src={userData?.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAvatarFile(e.target.files[0])}
                                        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 text-zinc-400 cursor-pointer w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Cover Banner Image</label>
                                <div className="flex flex-col gap-3 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                                    {userData?.coverImage && (
                                        <div className="w-full h-16 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                                            <img src={userData.coverImage} alt="cover" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setCoverFile(e.target.files[0])}
                                        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 text-zinc-400 cursor-pointer w-full"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={updateAvatarMutation.isPending || updateCoverMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-950/20"
                            >
                                {updateAvatarMutation.isPending || updateCoverMutation.isPending ? 'Uploading...' : 'Upload Selected Files'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 3. Change Password Form */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-6 rounded-2xl md:col-span-2">
                    <h2 className="text-md font-bold flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4">
                        <Lock className="w-4 h-4 text-red-500" />
                        <span>Security & Password Change</span>
                    </h2>

                    {passSuccess && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 font-medium mb-4">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{passSuccess}</span>
                        </div>
                    )}
                    {passError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 font-medium mb-4">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{passError}</span>
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors font-medium"
                            />
                        </div>
                        <div className="sm:col-span-3 pt-2">
                            <button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-red-950/20"
                            >
                                {changePasswordMutation.isPending ? 'Updating password...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
