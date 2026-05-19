import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} />
            <main className={`pt-14 ${isSidebarOpen ? 'pl-60' : 'pl-0'} transition-all duration-300 min-h-screen`}>
                <Outlet />
            </main>
        </div>
    );
}
