import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard';
import { UserCheck, UserPlus, Film, Info } from 'lucide-react';

export default function Channel() {
    const { username } = useParams();
    const queryClient = useQueryClient();
    const { userData, status } = useSelector((state) => state.auth);

    // Fetch Channel Profile
    const { data: channel, isLoading: isChannelLoading, error: channelError } = useQuery({
        queryKey: ['channelProfile', username],
        queryFn: async () => {
            const res = await axiosInstance.get(`/users/c/${username}`);
            return res.data.message;
        }
    });

    // Fetch Channel Videos
    const { data: videos, isLoading: isVideosLoading } = useQuery({
        queryKey: ['channelVideos', channel?._id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/videos?userId=${channel._id}`);
            return res.data.message.docs;
        },
        enabled: !!channel?._id
    });

    // Toggle Subscription Mutation
    const toggleSubscriptionMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.post(`/subscriptions/c/${channel._id}`);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channelProfile', username] });
        }
    });

    if (isChannelLoading) {
        return (
            <div className="p-6 flex justify-center py-24">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (channelError || !channel) {
        return (
            <div className="p-6 text-center py-24">
                <h2 className="text-xl font-bold text-white mb-2">Channel Not Found</h2>
                <p className="text-zinc-500">The channel you are looking for does not exist or may have been deleted.</p>
                <Link to="/" className="text-red-500 hover:underline mt-4 inline-block font-semibold">Go Home</Link>
            </div>
        );
    }

    const isOwnChannel = status && userData?._id === channel._id;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            {/* Cover Image Banner */}
            <div className="w-full h-40 md:h-56 bg-gradient-to-r from-zinc-800 to-zinc-900 overflow-hidden relative border-b border-zinc-850">
                {channel.coverImage ? (
                    <img 
                        src={channel.coverImage} 
                        alt={`${channel.username} banner`} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-850 to-red-950/20" />
                )}
            </div>

            {/* Profile Info Header */}
            <div className="max-w-[1200px] mx-auto px-6 py-6 border-b border-zinc-850">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                    {/* Avatar */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-800 border-4 border-[#0f0f0f] shadow-xl overflow-hidden -mt-16 md:-mt-20 relative z-10 flex-shrink-0">
                        {channel.avatar ? (
                            <img src={channel.avatar} alt={channel.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-700 flex items-center justify-center font-bold text-4xl text-white">
                                {channel.username?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{channel.fullName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-2 gap-y-1 text-sm text-zinc-400">
                                <span className="font-semibold text-zinc-300">@{channel.username}</span>
                                <span>•</span>
                                <span>{channel.subscribersCount} subscribers</span>
                                <span>•</span>
                                <span>{channel.subscribedToCount} subscribed</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            {isOwnChannel ? (
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <Link 
                                        to="/customize-profile" 
                                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold text-xs transition-all shadow-md shadow-red-950/20"
                                    >
                                        Customize Profile
                                    </Link>
                                    <Link 
                                        to="/dashboard" 
                                        className="bg-zinc-800 hover:bg-zinc-750 text-zinc-200 px-5 py-2 rounded-full font-bold text-xs transition-all"
                                    >
                                        Creator Studio
                                    </Link>
                                </div>
                            ) : status ? (
                                <button
                                    onClick={() => toggleSubscriptionMutation.mutate()}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                                        channel.issubscribed
                                        ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                                        : 'bg-white hover:bg-zinc-200 text-black'
                                    }`}
                                >
                                    {channel.issubscribed ? (
                                        <>
                                            <UserCheck className="w-4 h-4" />
                                            <span>Subscribed</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>Subscribe</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all"
                                >
                                    Sign in to Subscribe
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Videos List Container */}
            <div className="max-w-[1200px] mx-auto px-6 py-8">
                <div className="flex items-center gap-2 border-b border-zinc-850 pb-4 mb-6">
                    <Film className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold">Videos</h2>
                </div>

                {isVideosLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 animate-pulse">
                                <div className="aspect-video bg-zinc-900 rounded-xl" />
                                <div className="h-4 bg-zinc-900 rounded w-3/4 mt-2" />
                                <div className="h-3 bg-zinc-900 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : !videos || videos.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
                        <Film className="w-12 h-12 text-zinc-700" />
                        <p className="text-zinc-400">This channel hasn't uploaded any videos yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
