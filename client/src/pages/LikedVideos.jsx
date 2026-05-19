import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard';
import { ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function LikedVideos() {
    const { status } = useSelector((state) => state.auth);

    const { data: likedItems, isLoading } = useQuery({
        queryKey: ['likedVideos'],
        queryFn: async () => {
            const res = await axiosInstance.get('/likes/videos');
            return res.data.message || [];
        },
        enabled: !!status
    });

    if (!status) {
        return (
            <div className="p-6 text-center py-24 text-zinc-500">
                <ThumbsUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Sign in to view liked videos</h2>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">Keep track of all the videos you like by signing into your account.</p>
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
                <ThumbsUp className="w-6 h-6 text-red-500 fill-current" />
                <h1 className="text-xl font-bold">Liked Videos</h1>
                <span className="text-sm text-zinc-400">({likedItems?.length || 0})</span>
            </div>

            {likedItems?.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
                    <ThumbsUp className="w-12 h-12 text-zinc-700" />
                    <p className="text-zinc-400">You haven't liked any videos yet.</p>
                    <Link to="/" className="text-red-500 hover:underline font-semibold mt-2">Explore Videos</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {likedItems?.map((item) => (
                        item.video && <VideoCard key={item._id} video={item.video} />
                    ))}
                </div>
            )}
        </div>
    );
}
