import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard';
import { User, Video, Search as SearchIcon, ArrowRight } from 'lucide-react';

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Query matching user accounts / channels
    const { data: channels, isLoading: channelsLoading } = useQuery({
        queryKey: ['searchChannels', query],
        queryFn: async () => {
            if (!query) return [];
            const res = await axiosInstance.get(`/users/search?query=${encodeURIComponent(query)}`);
            return res.data.message || [];
        },
        enabled: !!query
    });

    // Query matching videos
    const { data: videosData, isLoading: videosLoading } = useQuery({
        queryKey: ['searchVideos', query],
        queryFn: async () => {
            if (!query) return null;
            const res = await axiosInstance.get(`/videos?query=${encodeURIComponent(query)}`);
            return res.data.message;
        },
        enabled: !!query
    });

    const videos = videosData?.docs || [];
    const isLoading = channelsLoading || videosLoading;

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-24 bg-zinc-900 rounded-xl"></div>
                    <div className="h-24 bg-zinc-900 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="aspect-video bg-zinc-900 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    const hasResults = (channels && channels.length > 0) || (videos && videos.length > 0);

    if (!hasResults) {
        return (
            <div className="p-6 text-center py-28 text-zinc-500 max-w-md mx-auto">
                <SearchIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h2 className="text-lg font-bold text-white mb-2">No results found</h2>
                <p className="text-xs text-zinc-400">
                    We couldn't find any channels or videos matching "{query}". Try checking your spelling or using different keywords.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-10 min-h-screen bg-[#0f0f0f] text-white pb-20 animate-in fade-in duration-300">
            <div>
                <h1 className="text-xl font-black flex items-center gap-2">
                    <SearchIcon className="w-5 h-5 text-red-500" />
                    <span>Search Results for "{query}"</span>
                </h1>
            </div>

            {/* Channels Section */}
            {channels && channels.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-850 pb-2">
                        <User className="w-4 h-4 text-zinc-500" />
                        <span>Channels</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {channels.map((channel) => (
                            <div 
                                key={channel._id} 
                                className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl hover:border-zinc-800 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-850 border border-zinc-800 flex-shrink-0">
                                        {channel.avatar ? (
                                            <img src={channel.avatar} alt={channel.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-md font-bold text-zinc-400">
                                                {channel.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
                                            {channel.fullName}
                                        </h3>
                                        <p className="text-xs text-zinc-400 font-medium">@{channel.username}</p>
                                    </div>
                                </div>
                                <Link 
                                    to={`/c/${channel.username}`}
                                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/15 px-4 py-2 rounded-xl transition-all"
                                >
                                    <span>View Channel</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Videos Section */}
            {videos && videos.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-2 border-b border-zinc-850 pb-2">
                        <Video className="w-4 h-4 text-zinc-500" />
                        <span>Videos</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
