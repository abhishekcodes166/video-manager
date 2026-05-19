import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RouteGuard({ requireAdmin = false }) {
    const { status, userData } = useSelector((state) => state.auth);

    if (!status) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !userData?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
