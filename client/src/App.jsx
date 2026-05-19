import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from './api/axios';
import { login, logout } from './store/authSlice';

// Components
import Layout from './components/Layout';
import RouteGuard from './components/RouteGuard';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Watch from './pages/Watch';
import Channel from './pages/Channel';
import Dashboard from './pages/Dashboard';
import Playlist from './pages/Playlist';
import Search from './pages/Search';
import Admin from './pages/Admin';
import LikedVideos from './pages/LikedVideos';
import History from './pages/History';
import Playlists from './pages/Playlists';
import CustomizeProfile from './pages/CustomizeProfile';

export default function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    axiosInstance.get('/users/current-user')
      .then((res) => {
        dispatch(login(res.data.message));
      })
      .catch(() => {
        dispatch(logout());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center flex-col gap-4">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm animate-pulse">Initializing Video Manager...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Routes with Navbar/Sidebar Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:videoId" element={<Watch />} />
          <Route path="/c/:username" element={<Channel />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist/:playlistId" element={<Playlist />} />

          {/* Protected Routes */}
          <Route element={<RouteGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Added standard YouTube features routes */}
            <Route path="/liked-videos" element={<LikedVideos />} />
            <Route path="/history" element={<History />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/customize-profile" element={<CustomizeProfile />} />
            <Route path="/trending" element={<div className="p-6">Trending feed placeholder</div>} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<RouteGuard requireAdmin={true} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
