import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { BarChart2, Video, Eye, ThumbsUp, Trash, ToggleLeft, ToggleRight, Upload, AlertCircle, Sparkles } from 'lucide-react';

export default function Dashboard() {
    const queryClient = useQueryClient();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [uploading, setUploading] = useState(false);

    // Fetch Stats
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['channelStats'],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/stats');
            return res.data.message;
        }
    });

    // Fetch Creator's Videos
    const { data: videos, isLoading: isVideosLoading } = useQuery({
        queryKey: ['channelVideos'],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/videos');
            return res.data.message;
        }
    });

    // Toggle Publish status
    const togglePublishMutation = useMutation({
        mutationFn: async (videoId) => {
            await axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channelVideos'] });
        }
    });

    // Delete Video status
    const deleteVideoMutation = useMutation({
        mutationFn: async (videoId) => {
            await axiosInstance.delete(`/videos/${videoId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channelVideos'] });
            queryClient.invalidateQueries({ queryKey: ['channelStats'] });
        }
    });

    // Upload Video Mutation
    const handleUploadVideo = async (e) => {
        e.preventDefault();
        setUploadError('');
        setUploading(true);

        if (!videoFile || !thumbnail) {
            setUploadError('Both video and thumbnail files are required');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoFile', videoFile);
        formData.append('thumbnail', thumbnail);

        try {
            await axiosInstance.post('/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsUploadModalOpen(false);
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setThumbnail(null);
            queryClient.invalidateQueries({ queryKey: ['channelVideos'] });
            queryClient.invalidateQueries({ queryKey: ['channelStats'] });
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Upload failed. Try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-red-500 fill-current" />
                        <span>Creator Studio</span>
                    </h1>
                    <p className="text-sm text-zinc-400">Manage your content and analyze channel performance.</p>
                </div>
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl cursor-pointer transition-colors shadow-lg shadow-red-600/10"
                >
                    <Upload className="w-4 h-4" />
                    <span>Upload Video</span>
                </button>
            </div>

            {/* Stats Cards */}
            {isStatsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-28 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Videos count */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Videos</span>
                            <span className="text-2xl font-bold">{stats?.totalVideos || 0}</span>
                        </div>
                    </div>

                    {/* Views count */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Views</span>
                            <span className="text-2xl font-bold">{stats?.totalViews || 0}</span>
                        </div>
                    </div>

                    {/* Subscribers count */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Subscribers</span>
                            <span className="text-2xl font-bold">{stats?.totalSubscribers || 0}</span>
                        </div>
                    </div>

                    {/* Likes count */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <ThumbsUp className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Total Likes</span>
                            <span className="text-2xl font-bold">{stats?.totalLikes || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Video List Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-zinc-800">
                    <h2 className="text-md font-bold">Uploaded Videos</h2>
                </div>

                {isVideosLoading ? (
                    <div className="p-6 text-center text-zinc-500">Loading videos...</div>
                ) : videos?.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500">
                        <p className="font-medium">No videos uploaded yet</p>
                        <p className="text-sm mt-1">Click the Upload button at the top to publish your first college video!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-zinc-400 font-semibold bg-zinc-950">
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Video Details</th>
                                    <th className="px-6 py-3.5">Views</th>
                                    <th className="px-6 py-3.5">Uploaded Date</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos?.map((video) => (
                                    <tr key={video._id} className="border-b border-zinc-800 hover:bg-zinc-850/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublishMutation.mutate(video._id)}
                                                className="cursor-pointer"
                                                title={video.isPublished ? "Unpublish Video" : "Publish Video"}
                                            >
                                                {video.isPublished ? (
                                                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                                        <ToggleRight className="w-6 h-6" /> Published
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-zinc-500 font-medium">
                                                        <ToggleLeft className="w-6 h-6" /> Draft
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 flex gap-3 items-center min-w-[300px]">
                                            <div className="w-16 aspect-video bg-zinc-950 border border-zinc-800 rounded overflow-hidden flex-shrink-0">
                                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-semibold text-white block truncate">{video.title}</span>
                                                <span className="text-xs text-zinc-500 block truncate">{video.description}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{video.views}</td>
                                        <td className="px-6 py-4">{new Date(video.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteVideoMutation.mutate(video._id)}
                                                className="p-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                                                title="Delete Video"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="w-full max-w-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Upload Video</h2>

                        {uploadError && (
                            <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{uploadError}</span>
                            </div>
                        )}

                        <form onSubmit={handleUploadVideo} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Video Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 outline-none rounded-xl px-4 py-2.5 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    placeholder="Enter description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 outline-none rounded-xl px-4 py-2.5 text-sm h-24 resize-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Video File</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 outline-none rounded-xl px-4 py-2.5 text-sm text-zinc-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Thumbnail Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbnail(e.target.files[0])}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 outline-none rounded-xl px-4 py-2.5 text-sm text-zinc-400"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-xl cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading to Cloudinary...' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
