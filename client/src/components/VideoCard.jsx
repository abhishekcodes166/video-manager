import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export default function VideoCard({ video }) {
    const formatViews = (views) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views;
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    const owner = video.ownerDetails?.[0] || video.owner;

    return (
        <div className="flex flex-col gap-2 group cursor-pointer">
            {/* Thumbnail */}
            <Link to={`/watch/${video._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/85 text-xs font-semibold px-2 py-0.5 rounded text-white tracking-wider">
                    {formatDuration(video.duration)}
                </span>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-10 h-10 text-white fill-current" />
                </div>
            </Link>

            {/* Details */}
            <div className="flex gap-3 px-1">
                {/* Channel Avatar */}
                <Link to={`/c/${owner?.username}`} className="w-9 h-9 rounded-full bg-zinc-850 overflow-hidden flex-shrink-0">
                    {owner?.avatar ? (
                        <img src={owner.avatar} alt={owner.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                            {owner?.username?.[0]?.toUpperCase()}
                        </div>
                    )}
                </Link>

                {/* Video Info */}
                <div className="flex flex-col flex-1 min-w-0">
                    <Link to={`/watch/${video._id}`} className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                        {video.title}
                    </Link>
                    <Link to={`/c/${owner?.username}`} className="text-xs text-zinc-400 hover:text-white mt-1 transition-colors truncate">
                        {owner?.fullName || owner?.username}
                    </Link>
                    <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1.5 font-medium">
                        <span>{formatViews(video.views)} views</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-650"></span>
                        <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
