import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    const links = [
        { to: '/', label: 'Dashboard', icon: '📊', end: true },
        { to: '/employees', label: 'Employees', icon: '👥' },
        { to: '/attendance', label: 'Attendance', icon: '📅' },
    ];

    return (
        <aside className="fixed top-0 left-0 w-64 h-screen bg-[#0f172a] flex flex-col z-50">
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    HR
                </div>
                <div>
                    <h1 className="text-white font-semibold text-base leading-tight">HRMS Lite</h1>
                    <p className="text-slate-500 text-xs">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 flex flex-col gap-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                ? 'bg-indigo-500/20 text-white'
                                : 'text-slate-400 hover:bg-[#1e293b] hover:text-white'
                            }`
                        }
                    >
                        <span className="text-lg w-6 text-center">{link.icon}</span>
                        <span>{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5">
                <p className="text-slate-500 text-xs">© 2026 HRMS Lite</p>
            </div>
        </aside>
    );
}
