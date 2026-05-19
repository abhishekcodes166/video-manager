import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard';
import { History as HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function History() {
    const { status } = useSelector((state) => state.auth);

    const { data: historyVideos, isLoading } = useQuery({
        queryKey: ['watchHistory'],
        queryFn: async () => {
            const res = await axiosInstance.get('/users/history');
            return res.data.message || [];
        },
        enabled: !!status
    });

    if (!status) {
        return (
            <div className="p-6 text-center py-24 text-zinc-500">
                <HistoryIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Sign in to view watch history</h2>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">Keep track of the videos you watch by signing into your account.</p>
                <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all inline-block">
                    Sign In
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center py-24">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1200px] mx-auto min-h-screen bg-[#0f0f0f] text-white">
            <div className="flex items-center gap-3 border-b border-zinc-850 pb-4 mb-6">
                <HistoryIcon className="w-6 h-6 text-red-500" />
                <h1 className="text-xl font-bold">Watch History</h1>
                <span className="text-sm text-zinc-400">({historyVideos?.length || 0})</span>
            </div>

            {historyVideos?.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
                    <HistoryIcon className="w-12 h-12 text-zinc-700" />
                    <p className="text-zinc-400">Your watch history is empty.</p>
                    <Link to="/" className="text-red-500 hover:underline font-semibold mt-2">Start Watching Videos</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {historyVideos?.map((video) => (
                        video && <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
}
