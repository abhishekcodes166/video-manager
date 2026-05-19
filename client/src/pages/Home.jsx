import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard';
import { AlertCircle } from 'lucide-react';

export default function Home() {
    const { data: videosData, isLoading, error } = useQuery({
        queryKey: ['videos'],
        queryFn: async () => {
            const response = await axiosInstance.get('/videos');
            return response.data.message.docs;
        }
    });

    if (isLoading) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold mb-6 text-zinc-200">Recommended</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-3 animate-pulse">
                            <div className="aspect-video bg-zinc-800 rounded-xl"></div>
                            <div className="flex gap-3 px-1">
                                <div className="w-9 h-9 rounded-full bg-zinc-800 flex-shrink-0"></div>
                                <div className="flex flex-col flex-1 gap-2">
                                    <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                                    <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center my-12">
                <div className="max-w-md mx-auto flex flex-col items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl">
                    <AlertCircle className="w-10 h-10" />
                    <h2 className="text-lg font-bold">Failed to load content</h2>
                    <p className="text-sm text-zinc-400">Something went wrong while fetching recommended videos. Try refreshing or check your connection.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-6 text-zinc-200">Recommended</h1>
            {videosData?.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <p className="text-lg font-medium">No videos found</p>
                    <p className="text-sm mt-1">Be the first to upload media content for MNNIT!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {videosData?.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
}
