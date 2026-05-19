import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import VideoCard from '../components/VideoCard';
import { PlaySquare, Trash2, ArrowLeft } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Playlist() {
    const { playlistId } = useParams();
    const queryClient = useQueryClient();
    const { userData } = useSelector((state) => state.auth);

    // Fetch Playlist Details
    const { data: playlist, isLoading, error } = useQuery({
        queryKey: ['playlist', playlistId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/playlists/${playlistId}`);
            return res.data.message;
        }
    });

    // Remove Video mutation
    const removeVideoMutation = useMutation({
        mutationFn: async (videoId) => {
            const res = await axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
        }
    });

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center py-24">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="p-6 text-center py-24">
                <h2 className="text-xl font-bold text-white mb-2">Playlist Not Found</h2>
                <p className="text-zinc-500">The playlist you are trying to access does not exist or may have been deleted.</p>
                <Link to="/playlists" className="text-red-500 hover:underline mt-4 inline-block font-semibold">Back to Playlists</Link>
            </div>
        );
    }

    const isOwner = userData?._id === playlist.owner;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className="max-w-[1200px] mx-auto px-6 py-8">
                {/* Back button */}
                <Link to="/playlists" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm font-semibold transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Playlists</span>
                </Link>

                {/* Playlist Info Header */}
                <div className="flex flex-col md:flex-row gap-6 items-start border-b border-zinc-850 pb-8 mb-8">
                    <div className="w-full md:w-64 aspect-video bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                        <PlaySquare className="w-12 h-12 text-red-500 relative z-20" />
                        <span className="absolute bottom-3 right-3 text-xs text-white font-bold bg-black/85 px-2 py-0.5 rounded z-20 tracking-wider">
                            {playlist.videos?.length || 0} VIDEOS
                        </span>
                    </div>

                    <div className="flex-1 space-y-3">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{playlist.name}</h1>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{playlist.description}</p>
                        <div className="text-xs text-zinc-500 font-medium">
                            Created on {new Date(playlist.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Videos List */}
                <div>
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span>Videos</span>
                        <span className="text-sm text-zinc-500 font-semibold">({playlist.videos?.length || 0})</span>
                    </h2>

                    {playlist.videos?.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center gap-2">
                            <PlaySquare className="w-10 h-10 text-zinc-700" />
                            <p className="text-zinc-400">This playlist is empty.</p>
                            <Link to="/" className="text-red-500 hover:underline font-semibold mt-2 text-sm">Add some videos</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {playlist.videos?.map((video, index) => (
                                video && (
                                    <div key={video._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-850 p-4 rounded-xl transition-all">
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="text-sm text-zinc-500 font-bold w-4 text-right hidden sm:inline">{index + 1}</span>
                                            <div className="w-32 aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-850 flex-shrink-0">
                                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <Link to={`/watch/${video._id}`} className="font-semibold text-white hover:text-red-400 transition-colors line-clamp-1 text-sm block">
                                                    {video.title}
                                                </Link>
                                                <span className="text-xs text-zinc-400 block mt-1">
                                                    {video.owner?.fullName || video.owner?.username}
                                                </span>
                                            </div>
                                        </div>

                                        {isOwner && (
                                            <button
                                                onClick={() => {
                                                    if (confirm("Remove this video from the playlist?")) {
                                                        removeVideoMutation.mutate(video._id);
                                                    }
                                                }}
                                                className="text-zinc-500 hover:text-red-500 p-2 rounded-full hover:bg-zinc-800 transition-all cursor-pointer flex-shrink-0 self-end sm:self-auto"
                                                title="Remove Video"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
