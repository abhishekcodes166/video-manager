import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { ThumbsUp, Send, Trash, Edit3, MessageSquare, FolderPlus, PlaySquare, X, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Watch() {
    const { videoId } = useParams();
    const queryClient = useQueryClient();
    const { userData, status } = useSelector((state) => state.auth);
    const [newComment, setNewComment] = useState('');
    
    // Playlist Modal States
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [showCreatePlaylistForm, setShowCreatePlaylistForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

    // Fetch Video Details
    const { data: video, isLoading: isVideoLoading } = useQuery({
        queryKey: ['video', videoId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/videos/${videoId}`);
            return res.data.message;
        }
    });

    // Fetch Comments
    const { data: commentsData, isLoading: isCommentsLoading } = useQuery({
        queryKey: ['comments', videoId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/comments/${videoId}`);
            return res.data.message.docs;
        }
    });

    // Check if video is liked
    const { data: likeStatus } = useQuery({
        queryKey: ['likeStatus', videoId],
        queryFn: async () => {
            if (!status) return { isLiked: false };
            const res = await axiosInstance.get('/likes/videos');
            const likedList = res.data.message || [];
            const isLiked = likedList.some(item => item.video?._id === videoId);
            return { isLiked };
        },
        enabled: !!status
    });

    // Toggle Like Mutation
    const toggleLikeMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.post(`/likes/toggle/v/${videoId}`);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['likeStatus', videoId] });
        }
    });

    // Fetch Creator Profile for Subscription status
    const { data: channelProfile } = useQuery({
        queryKey: ['channelProfile', video?.owner?.username],
        queryFn: async () => {
            const res = await axiosInstance.get(`/users/c/${video.owner.username}`);
            return res.data.message;
        },
        enabled: !!video?.owner?.username
    });

    // Toggle Subscription Mutation
    const toggleSubscriptionMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosInstance.post(`/subscriptions/c/${video.owner?._id}`);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['channelProfile', video?.owner?.username] });
        }
    });

    // Add Comment Mutation
    const addCommentMutation = useMutation({
        mutationFn: async (content) => {
            const res = await axiosInstance.post(`/comments/${videoId}`, { content });
            return res.data.message;
        },
        onSuccess: () => {
            setNewComment('');
            queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
        }
    });

    // Delete Comment Mutation
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId) => {
            await axiosInstance.delete(`/comments/c/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
        }
    });

    // Fetch User Playlists for Add/Remove Video checks
    const { data: userPlaylists } = useQuery({
        queryKey: ['playlists', userData?._id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/playlists/user/${userData._id}`);
            return res.data.message || [];
        },
        enabled: !!userData?._id && isPlaylistModalOpen
    });

    // Add to Playlist Mutation
    const addToPlaylistMutation = useMutation({
        mutationFn: async (playlistId) => {
            const res = await axiosInstance.patch(`/playlists/add/${videoId}/${playlistId}`);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists', userData?._id] });
        }
    });

    // Remove from Playlist Mutation
    const removeFromPlaylistMutation = useMutation({
        mutationFn: async (playlistId) => {
            const res = await axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists', userData?._id] });
        }
    });

    // Create Playlist and Add Video Mutation
    const createPlaylistAndAddMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axiosInstance.post('/playlists', payload);
            const playlist = res.data.message;
            await axiosInstance.patch(`/playlists/add/${videoId}/${playlist._id}`);
            return playlist;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists', userData?._id] });
            setShowCreatePlaylistForm(false);
            setNewPlaylistName('');
            setNewPlaylistDescription('');
        }
    });

    const handleAddComment = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment.trim());
        }
    };

    if (isVideoLoading) {
        return (
            <div className="p-6 flex justify-center py-24">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!video) {
        return <div className="p-6 text-center text-zinc-500">Video not found.</div>;
    }

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
            {/* Left Side: Video & Details */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Video Player */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 shadow-lg">
                    <video 
                        src={video.videoFile} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                    />
                </div>

                {/* Video Info */}
                <div className="flex flex-col gap-3">
                    <h1 className="text-xl font-bold text-white leading-snug">{video.title}</h1>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            {/* Owner Avatar */}
                            <Link to={`/c/${video.owner?.username}`} className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                {video.owner?.avatar ? (
                                    <img src={video.owner.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center font-bold text-white">
                                        {video.owner?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </Link>
                            <div className="mr-3">
                                <Link to={`/c/${video.owner?.username}`} className="font-semibold text-white block hover:text-red-400 transition-colors">
                                    {video.owner?.fullName || video.owner?.username}
                                </Link>
                                <span className="text-xs text-zinc-400 block mt-0.5">
                                    {channelProfile ? `${channelProfile.subscribersCount} subscribers` : 'Creator'}
                                </span>
                            </div>

                            {/* Subscribe button */}
                            {status && userData?._id !== video.owner?._id ? (
                                <button
                                    onClick={() => toggleSubscriptionMutation.mutate()}
                                    className={`px-4 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
                                        channelProfile?.issubscribed
                                        ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                                        : 'bg-white hover:bg-zinc-200 text-black'
                                    }`}
                                >
                                    {channelProfile?.issubscribed ? 'Subscribed' : 'Subscribe'}
                                </button>
                            ) : !status ? (
                                <Link
                                    to="/login"
                                    className="px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all"
                                >
                                    Subscribe
                                </Link>
                            ) : null}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => toggleLikeMutation.mutate()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer ${
                                    likeStatus?.isLiked 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300'
                                }`}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                <span>Like</span>
                            </button>
                            {status && (
                                <button 
                                    onClick={() => setIsPlaylistModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-sm transition-all cursor-pointer"
                                >
                                    <FolderPlus className="w-4 h-4" />
                                    <span>Save</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Description Box */}
                    <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed shadow-sm">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold mb-2">
                            <span>{video.views} views</span>
                            <span>•</span>
                            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="whitespace-pre-line">{video.description || "No description provided."}</p>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-4 flex flex-col gap-6">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                        <MessageSquare className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-bold">Comments</h2>
                    </div>

                    {/* New Comment Input */}
                    {status ? (
                        <form onSubmit={handleAddComment} className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                {userData?.avatar && <img src={userData.avatar} alt="my avatar" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a public comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-red-500 outline-none rounded-xl px-4 py-2.5 text-sm"
                                    required
                                />
                                <button 
                                    type="submit" 
                                    className="p-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-white cursor-pointer transition-colors shadow-md shadow-red-600/10"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-sm text-zinc-500 italic">Please <Link to="/login" className="text-blue-500 hover:underline">sign in</Link> to post comments.</p>
                    )}

                    {/* Comments List */}
                    <div className="space-y-4">
                        {isCommentsLoading ? (
                            <p className="text-zinc-500 text-sm">Loading comments...</p>
                        ) : commentsData?.length === 0 ? (
                            <p className="text-zinc-500 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            commentsData?.map((comment) => (
                                <div key={comment._id} className="flex gap-3 group items-start">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                                        {comment.owner?.avatar ? (
                                            <img src={comment.owner.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                                                {comment.owner?.username?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-white truncate">{comment.owner?.fullName || comment.owner?.username}</span>
                                            <span className="text-[10px] text-zinc-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-zinc-300 mt-1">{comment.content}</p>
                                    </div>

                                    {/* Action items like delete */}
                                    {status && userData?._id === comment.owner?._id && (
                                        <button
                                            onClick={() => deleteCommentMutation.mutate(comment._id)}
                                            className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            title="Delete Comment"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Related Videos Placeholder */}
            <div className="flex flex-col gap-4">
                <h2 className="text-md font-bold text-zinc-300 border-b border-zinc-800 pb-2">Up Next</h2>
                <div className="text-zinc-500 text-sm italic py-4">No recommended videos available.</div>
            </div>
            {/* Playlist Modal */}
            {isPlaylistModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-white">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800">
                            <h2 className="font-extrabold text-sm text-white">Save to playlist...</h2>
                            <button 
                                onClick={() => setIsPlaylistModalOpen(false)}
                                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-5 max-h-60 overflow-y-auto space-y-3">
                            {userPlaylists?.length === 0 ? (
                                <p className="text-zinc-500 text-xs italic">No playlists created yet.</p>
                            ) : (
                                userPlaylists?.map(playlist => {
                                    const isAdded = playlist.videos?.some(v => v._id === videoId || v === videoId);
                                    return (
                                        <label key={playlist._id} className="flex items-center gap-3 cursor-pointer text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
                                            <input 
                                                type="checkbox"
                                                checked={isAdded}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        addToPlaylistMutation.mutate(playlist._id);
                                                    } else {
                                                        removeFromPlaylistMutation.mutate(playlist._id);
                                                    }
                                                }}
                                                className="w-4.5 h-4.5 accent-red-600 rounded bg-zinc-950 border-zinc-800"
                                            />
                                            <span className="truncate">{playlist.name}</span>
                                        </label>
                                    );
                                })
                            )}
                        </div>

                        {showCreatePlaylistForm ? (
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (newPlaylistName.trim()) {
                                        createPlaylistAndAddMutation.mutate({
                                            name: newPlaylistName,
                                            description: newPlaylistDescription || "Default description"
                                        });
                                    }
                                }}
                                className="p-5 border-t border-zinc-800 bg-zinc-950 space-y-3"
                            >
                                <input 
                                    type="text"
                                    placeholder="Name"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                                    required
                                />
                                <input 
                                    type="text"
                                    placeholder="Description"
                                    value={newPlaylistDescription}
                                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                                />
                                <div className="flex justify-end gap-2 text-[10px]">
                                    <button 
                                        type="button"
                                        onClick={() => setShowCreatePlaylistForm(false)}
                                        className="text-zinc-400 hover:text-white px-3 py-1.5 font-bold transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={createPlaylistAndAddMutation.isPending}
                                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setShowCreatePlaylistForm(true)}
                                className="w-full py-3 px-5 border-t border-zinc-800 hover:bg-zinc-850 flex items-center justify-center gap-2 text-xs font-bold text-red-500 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create new playlist</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
