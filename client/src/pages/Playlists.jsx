import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { PlaySquare, Plus, Trash2, FolderHeart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Playlists() {
    const { userData, status } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch User Playlists
    const { data: playlists, isLoading } = useQuery({
        queryKey: ['playlists', userData?._id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/playlists/user/${userData._id}`);
            return res.data.message || [];
        },
        enabled: !!userData?._id
    });

    // Create Playlist Mutation
    const createPlaylistMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await axiosInstance.post('/playlists', payload);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists', userData?._id] });
            setIsCreateModalOpen(false);
            setName('');
            setDescription('');
            setErrorMsg('');
        },
        onError: (err) => {
            setErrorMsg(err.response?.data?.message || 'Failed to create playlist');
        }
    });

    // Delete Playlist Mutation
    const deletePlaylistMutation = useMutation({
        mutationFn: async (playlistId) => {
            const res = await axiosInstance.delete(`/playlists/${playlistId}`);
            return res.data.message;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists', userData?._id] });
        }
    });

    const handleCreatePlaylist = (e) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            setErrorMsg('All fields are required');
            return;
        }
        createPlaylistMutation.mutate({ name, description });
    };

    if (!status) {
        return (
            <div className="p-6 text-center py-24 text-zinc-500">
                <PlaySquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Sign in to view playlists</h2>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">Keep track of your favorite videos by creating custom playlists.</p>
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
        <div className="p-6 max-w-[1200px] mx-auto min-h-screen bg-[#0f0f0f] text-white relative">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850 pb-4 mb-6">
                <div className="flex items-center gap-3">
                    <PlaySquare className="w-6 h-6 text-red-500" />
                    <h1 className="text-xl font-bold">Your Playlists</h1>
                    <span className="text-sm text-zinc-400">({playlists?.length || 0})</span>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer shadow-lg"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Playlist</span>
                </button>
            </div>

            {playlists?.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 flex flex-col items-center gap-3">
                    <FolderHeart className="w-12 h-12 text-zinc-700" />
                    <p className="text-zinc-400">You haven't created any playlists yet.</p>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-red-500 hover:underline font-semibold mt-2 cursor-pointer"
                    >
                        Create One Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {playlists?.map((playlist) => (
                        <div key={playlist._id} className="bg-zinc-900 border border-zinc-850 rounded-xl overflow-hidden group hover:border-zinc-750 transition-all flex flex-col justify-between">
                            <Link to={`/playlist/${playlist._id}`} className="p-5 flex-1 block">
                                <div className="aspect-video bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-850 mb-4 group-hover:scale-102 transition-transform duration-300">
                                    <div className="text-center">
                                        <PlaySquare className="w-8 h-8 text-zinc-500 mx-auto mb-1" />
                                        <span className="text-xs text-zinc-400 font-semibold">{playlist.videos?.length || 0} videos</span>
                                    </div>
                                </div>
                                <h3 className="font-bold text-white mb-1 truncate group-hover:text-red-400 transition-colors">{playlist.name}</h3>
                                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{playlist.description}</p>
                            </Link>
                            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-zinc-850/50">
                                <span className="text-[10px] text-zinc-500 font-medium">Created {new Date(playlist.createdAt).toLocaleDateString()}</span>
                                <button
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this playlist?")) {
                                            deletePlaylistMutation.mutate(playlist._id);
                                        }
                                    }}
                                    className="text-zinc-500 hover:text-red-500 p-1.5 rounded-full hover:bg-zinc-850 transition-all cursor-pointer"
                                    title="Delete Playlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Playlist Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
                            <h2 className="font-extrabold text-white">Create New Playlist</h2>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePlaylist} className="p-6 space-y-4">
                            {errorMsg && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg font-medium">
                                    {errorMsg}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Playlist Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter description"
                                    rows="3"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createPlaylistMutation.isPending}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    {createPlaylistMutation.isPending ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
