import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await dashboardApi.getSummary();
            setSummary(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;
    if (error) return <ErrorState message={error} onRetry={fetchSummary} />;

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const statCards = [
        { label: 'Total Employees', value: summary.total_employees, icon: '👥', color: 'indigo', border: 'border-t-indigo-500' },
        { label: 'Present Today', value: summary.present_today, icon: '✅', color: 'emerald', border: 'border-t-emerald-500' },
        { label: 'Absent Today', value: summary.absent_today, icon: '❌', color: 'red', border: 'border-t-red-500' },
        { label: 'Not Marked', value: summary.not_marked_today, icon: '⏳', color: 'amber', border: 'border-t-amber-500' },
    ];

    const iconBgs = {
        indigo: 'bg-indigo-50',
        emerald: 'bg-emerald-50',
        red: 'bg-red-50',
        amber: 'bg-amber-50',
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your HR overview for {today}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className={`bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-t-[3px] ${card.border}`}
                    >
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 ${iconBgs[card.color]}`}>
                            {card.icon}
                        </div>
                        <div className="text-3xl font-bold text-slate-800 leading-none mb-1">{card.value}</div>
                        <div className="text-sm text-slate-500 font-medium">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-6">
                        <h3 className="text-base font-semibold text-slate-800 mb-4">Department Breakdown</h3>
                        {summary.department_breakdown.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-6">No departments yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Department</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Employees</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.department_breakdown.map((dept) => (
                                            <tr key={dept.department} className="hover:bg-indigo-50/50 transition-colors">
                                                <td className="px-4 py-3 border-b border-slate-100 font-medium text-slate-700">{dept.department}</td>
                                                <td className="px-4 py-3 border-b border-slate-100">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                                        {dept.count}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attendance Summary */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="p-6">
                        <h3 className="text-base font-semibold text-slate-800 mb-4">Attendance Summary</h3>
                        {summary.attendance_summary.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-6">No attendance records yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Employee</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Dept</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Present</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.attendance_summary.map((item) => (
                                            <tr key={item.employee_id} className="hover:bg-indigo-50/50 transition-colors">
                                                <td className="px-4 py-3 border-b border-slate-100">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                                            {item.full_name.charAt(0)}
                                                        </span>
                                                        <div>
                                                            <div className="font-medium text-slate-700">{item.full_name}</div>
                                                            <div className="text-xs text-slate-400">{item.employee_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-b border-slate-100 text-slate-600">{item.department}</td>
                                                <td className="px-4 py-3 border-b border-slate-100">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                                                        {item.present_days} days
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
