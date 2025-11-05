import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';
import { useData } from '../contexts/DataContext';
import { UserRole } from '../types';

const navLinks = [
  { to: '/', text: 'Início', icon: ICONS.home },
  { to: '/oportunidades', text: 'Oportunidades', icon: ICONS.briefcase },
  { to: '/clientes', text: 'Clientes', icon: ICONS.clients },
  { to: '/tarefas', text: 'Tarefas', icon: ICONS.tasks },
];

const adminLinks = [
    { to: '/vendedores', text: 'Vendedores', icon: ICONS.clients }
]

const logoUrl = "data:image/svg+xml,%3csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='40' height='40' rx='8' fill='%233b82f6'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='24' font-weight='bold' fill='white' dy='.1em'%3eG%3c/text%3e%3c/svg%3e";

const Sidebar: React.FC = () => {
    const { currentUser } = useData();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const isAdminOrManager = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;
    
    const navItems = [...navLinks, ...(isAdminOrManager ? adminLinks : [])];

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-md shadow"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? ICONS.close : ICONS.menu}
            </button>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 p-4 flex flex-col transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex z-20`}>
                <div className="flex items-center mb-8">
                    <img src={logoUrl} alt="G-SalesCRM Logo" className="h-10 w-10 mr-2 rounded-md object-cover" />
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                        <span className="text-primary-600 dark:text-primary-400">G-Sales</span> CRM
                    </h1>
                </div>

                <nav className="flex-1">
                    <ul>
                        {navItems.map((link) => (
                            <li key={link.to}>
                                <NavLink
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `flex items-center p-3 my-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                            isActive ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300 font-semibold' : ''
                                        }`
                                    }
                                    onClick={() => setSidebarOpen(false)} // Close on mobile navigation
                                >
                                    <span className="w-6 h-6 mr-3">{link.icon}</span>
                                    {link.text}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;