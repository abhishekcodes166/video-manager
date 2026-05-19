import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Search, Upload, Bell, User, LogOut, Video, Settings, Trash2, Heart, MessageSquare, UserPlus } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { logout } from '../store/authSlice';
import axiosInstance from '../api/axios';

export default function Navbar({ toggleSidebar }) {
    const { status, userData } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

    // Fetch Notifications
    const { data: notifications, refetch: refetchNotifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await axiosInstance.get('/notifications');
            return res.data.message || [];
        },
        enabled: status,
        refetchInterval: 15000 // poll notifications every 15s
    });

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId) => {
            await axiosInstance.patch(`/notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            refetchNotifications();
        }
    });

    // Clear all mutation
    const clearNotificationsMutation = useMutation({
        mutationFn: async () => {
            await axiosInstance.delete('/notifications/clear');
        },
        onSuccess: () => {
            refetchNotifications();
        }
    });

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/users/logout');
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] border-b border-zinc-800 flex items-center justify-between px-4 z-50">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleSidebar} 
                    className="p-2 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <Link to="/" className="flex items-center gap-1.5 text-red-500 font-bold text-xl tracking-tight">
                    <Video className="w-6 h-6 fill-current" />
                    <span className="text-white font-semibold">Video<span className="text-red-500">Manager</span></span>
                </Link>
            </div>

            {/* Middle Section */}
            <form onSubmit={handleSearchSubmit} className="flex flex-1 max-w-[600px] items-center mx-4">
                <div className="flex flex-1 items-center bg-zinc-900 border border-zinc-700 rounded-l-full px-4 py-1.5 focus-within:border-blue-500">
                    <input
                        type="text"
                        placeholder="Search event, fest, announcements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-white text-sm w-full"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-zinc-800 border-y border-r border-zinc-700 hover:bg-zinc-700 text-zinc-300 px-6 py-2.5 rounded-r-full cursor-pointer transition-colors"
                >
                    <Search className="w-4 h-4" />
                </button>
            </form>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {status ? (
                    <>
                        <Link 
                            to="/dashboard" 
                            className="p-2 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors"
                            title="Upload Video"
                        >
                            <Upload className="w-5 h-5" />
                        </Link>
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setShowNotificationsMenu(!showNotificationsMenu);
                                    setShowProfileMenu(false);
                                }}
                                className="p-2 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-600 text-[10px] font-black text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border border-zinc-950 scale-90 animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotificationsMenu && (
                                <div className="absolute right-0 mt-2 w-85 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex justify-between items-center px-4 py-3 border-b border-zinc-800 bg-zinc-950/40">
                                        <h3 className="font-extrabold text-xs">Notifications</h3>
                                        {notifications && notifications.length > 0 && (
                                            <button 
                                                onClick={() => clearNotificationsMutation.mutate()}
                                                disabled={clearNotificationsMutation.isPending}
                                                className="text-[10px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Clear All</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-850">
                                        {!notifications || notifications.length === 0 ? (
                                            <div className="p-8 text-center text-xs text-zinc-500 italic">
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            notifications.map((notif) => {
                                                const sender = notif.sender;
                                                const video = notif.video;
                                                
                                                let message = "";
                                                let icon = null;
                                                let linkTo = "";
                                                
                                                if (notif.type === "subscription") {
                                                    message = "subscribed to you";
                                                    icon = <UserPlus className="w-3 h-3 text-blue-500 fill-current" />;
                                                    linkTo = `/c/${sender?.username}`;
                                                } else if (notif.type === "like") {
                                                    message = `liked your video "${video?.title || 'Unknown Video'}"`;
                                                    icon = <Heart className="w-3 h-3 text-red-500 fill-current" />;
                                                    linkTo = `/watch/${video?._id}`;
                                                } else if (notif.type === "comment") {
                                                    message = `commented on your video "${video?.title || 'Unknown Video'}"`;
                                                    icon = <MessageSquare className="w-3 h-3 text-green-500 fill-current" />;
                                                    linkTo = `/watch/${video?._id}`;
                                                }

                                                return (
                                                    <div 
                                                        key={notif._id}
                                                        onClick={() => {
                                                            markAsReadMutation.mutate(notif._id);
                                                            setShowNotificationsMenu(false);
                                                            navigate(linkTo);
                                                        }}
                                                        className={`flex gap-3 p-3.5 items-start hover:bg-zinc-850 transition-colors cursor-pointer ${
                                                            !notif.isRead ? 'bg-zinc-950/20' : ''
                                                        }`}
                                                    >
                                                        {/* Avatar */}
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 relative">
                                                            {sender?.avatar ? (
                                                                <img src={sender.avatar} alt="sender avatar" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-zinc-750 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                                    {sender?.username?.[0]?.toUpperCase()}
                                                                </div>
                                                            )}
                                                            <span className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-850 p-0.5 rounded-full scale-75">
                                                                {icon}
                                                            </span>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs leading-normal text-zinc-300">
                                                                <span className="font-black text-white hover:text-red-400 transition-colors">
                                                                    {sender?.fullName || sender?.username}
                                                                </span>{" "}
                                                                {message}
                                                            </p>
                                                            <span className="text-[10px] text-zinc-500 mt-1 block">
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {/* Unread indicator */}
                                                        {!notif.isRead && (
                                                            <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden cursor-pointer"
                            >
                                {userData?.avatar ? (
                                    <img src={userData.avatar} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 mx-auto mt-1.5 text-white" />
                                )}
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg py-1 z-50">
                                    <Link
                                        to={`/c/${userData?.username}`}
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                                    >
                                        <User className="w-4 h-4" /> Profile
                                    </Link>
                                    <Link
                                        to="/customize-profile"
                                        onClick={() => setShowProfileMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                                    >
                                        <Settings className="w-4 h-4" /> Settings
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="border border-zinc-700 text-blue-500 px-4 py-1.5 rounded-full hover:bg-blue-500/10 font-medium text-sm transition-all"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    );
}
