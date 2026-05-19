import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, User, ThumbsUp, History, PlaySquare, BarChart2, ShieldAlert } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Sidebar({ isOpen }) {
    const { status, userData } = useSelector((state) => state.auth);

    const activeStyle = "flex items-center gap-5 px-4 py-2.5 bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors";
    const inactiveStyle = "flex items-center gap-5 px-4 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg text-sm font-medium transition-colors";

    return (
        <aside className={`fixed top-14 left-0 bottom-0 ${isOpen ? 'w-60' : 'w-0 overflow-hidden'} bg-[#0f0f0f] border-r border-zinc-800 transition-all duration-300 z-40 py-3 px-2`}>
            <div className="flex flex-col gap-1">
                <NavLink to="/" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                    <Home className="w-5 h-5" />
                    <span>Home</span>
                </NavLink>

                <NavLink to="/trending" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                    <Compass className="w-5 h-5" />
                    <span>Trending</span>
                </NavLink>

                {status && (
                    <>
                        <div className="h-px bg-zinc-800 my-3 mx-2"></div>
                        <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">You</h3>

                        <NavLink to={`/c/${userData?.username}`} className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                            <User className="w-5 h-5" />
                            <span>Your Channel</span>
                        </NavLink>

                        <NavLink to="/liked-videos" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                            <ThumbsUp className="w-5 h-5" />
                            <span>Liked Videos</span>
                        </NavLink>

                        <NavLink to="/history" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                            <History className="w-5 h-5" />
                            <span>History</span>
                        </NavLink>

                        <NavLink to="/playlists" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                            <PlaySquare className="w-5 h-5" />
                            <span>Playlists</span>
                        </NavLink>

                        <div className="h-px bg-zinc-800 my-3 mx-2"></div>
                        <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Manage</h3>

                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                            <BarChart2 className="w-5 h-5" />
                            <span>Creator Studio</span>
                        </NavLink>

                        {userData?.isAdmin && (
                            <NavLink to="/admin" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                <span className="text-red-400 font-medium">Admin Panel</span>
                            </NavLink>
                        )}
                    </>
                )}
            </div>
        </aside>
    );
}
