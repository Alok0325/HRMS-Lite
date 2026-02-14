import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Toast from '../components/Toast';

const PAGE_SIZE = 20;

export default function Attendance() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [markDate, setMarkDate] = useState(new Date().toISOString().slice(0, 10));
    const [attendance, setAttendance] = useState({});
    const [marking, setMarking] = useState(false);

    // View mode: 'mark' or 'view'
    const [viewMode, setViewMode] = useState('mark');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const [filterDate, setFilterDate] = useState('');

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await employeeApi.getAll();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async (empId, dateFilter) => {
        if (!empId) return;
        try {
            setRecordsLoading(true);
            const data = await attendanceApi.getByEmployee(empId, dateFilter || undefined);
            setAttendanceRecords(data);
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        } finally {
            setRecordsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee && viewMode === 'view') {
            fetchAttendance(selectedEmployee, filterDate);
        }
    }, [selectedEmployee, filterDate, viewMode]);

    // Filter employees by search
    const filteredEmployees = employees.filter(
        (emp) =>
            emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
            emp.department.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE);
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handleStatusChange = (employeeId, status) => {
        setAttendance((prev) => ({ ...prev, [employeeId]: status }));
    };

    const handleMarkAttendance = async () => {
        const entries = Object.entries(attendance);
        if (entries.length === 0) {
            setToast({ message: 'Please select attendance for at least one employee', type: 'error' });
            return;
        }

        try {
            setMarking(true);
            let successCount = 0;
            let errorMessages = [];

            for (const [employeeId, status] of entries) {
                try {
                    await attendanceApi.mark({ employee_id: employeeId, date: markDate, status });
                    successCount++;
                } catch (err) {
                    errorMessages.push(`${employeeId}: ${err.message}`);
                }
            }

            if (errorMessages.length > 0) {
                setToast({
                    message: `Marked ${successCount} of ${entries.length}. Errors: ${errorMessages.join(', ')}`,
                    type: 'error',
                });
            } else {
                setToast({ message: `Attendance marked for ${successCount} employee(s)`, type: 'success' });
                setAttendance({});
            }
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        } finally {
            setMarking(false);
        }
    };

    const selectedEmpData = employees.find((e) => e.employee_id === selectedEmployee);
    const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
    const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;
    const markedCount = Object.keys(attendance).length;

    if (loading) return <LoadingSpinner message="Loading attendance..." />;
    if (error) return <ErrorState message={error} onRetry={fetchEmployees} />;

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Attendance</h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage daily attendance records</p>
                </div>
                {/* Tab Toggle */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'mark'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        onClick={() => setViewMode('mark')}
                    >
                        ✏️ Mark Attendance
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'view'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        onClick={() => setViewMode('view')}
                    >
                        📋 View Records
                    </button>
                </div>
            </div>

            {employees.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <EmptyState
                        icon="👥"
                        title="No employees found"
                        message="Add employees first before marking attendance."
                    />
                </div>
            ) : viewMode === 'mark' ? (
                /* ===== MARK ATTENDANCE VIEW ===== */
                <>
                    {/* Date Picker + Stats Bar */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
                        <div className="flex items-end justify-between flex-wrap gap-4">
                            <div className="flex items-end gap-4 flex-wrap">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                                    <input
                                        className="w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                                        type="date"
                                        value={markDate}
                                        onChange={(e) => setMarkDate(e.target.value)}
                                    />
                                </div>
                                <div className="relative max-w-xs w-64">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                                    <input
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                                        type="text"
                                        placeholder="Search employees..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {markedCount > 0 && (
                                    <span className="text-xs text-slate-500">
                                        {markedCount} selected
                                    </span>
                                )}
                                <button
                                    className="px-6 py-2.5 bg-indigo-500 text-white rounded-lg font-medium text-sm hover:bg-indigo-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-200"
                                    onClick={handleMarkAttendance}
                                    disabled={marking || markedCount === 0}
                                >
                                    {marking ? 'Submitting...' : `Mark Attendance (${markedCount})`}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Employee List with Radio Buttons */}
                    {filteredEmployees.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <EmptyState
                                icon="🔍"
                                title="No results"
                                message={`No employees match "${search}".`}
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Employee</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Department</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Present</th>
                                            <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Absent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedEmployees.map((emp) => (
                                            <tr
                                                key={emp.employee_id}
                                                className={`transition-colors ${attendance[emp.employee_id]
                                                        ? attendance[emp.employee_id] === 'Present'
                                                            ? 'bg-emerald-50/60'
                                                            : 'bg-red-50/60'
                                                        : 'hover:bg-slate-50'
                                                    }`}
                                            >
                                                <td className="px-4 py-3.5 border-b border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                                            {emp.full_name.charAt(0)}
                                                        </span>
                                                        <div>
                                                            <div className="font-medium text-slate-700">{emp.full_name}</div>
                                                            <div className="text-xs text-slate-400 font-mono">{emp.employee_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 border-b border-slate-100">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                                        {emp.department}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 border-b border-slate-100 text-center">
                                                    <label className="inline-flex items-center justify-center cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name={`attendance-${emp.employee_id}`}
                                                            value="Present"
                                                            checked={attendance[emp.employee_id] === 'Present'}
                                                            onChange={() => handleStatusChange(emp.employee_id, 'Present')}
                                                            className="sr-only peer"
                                                        />
                                                        <span className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-base transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-600 group-hover:border-emerald-300">
                                                            ✓
                                                        </span>
                                                    </label>
                                                </td>
                                                <td className="px-4 py-3.5 border-b border-slate-100 text-center">
                                                    <label className="inline-flex items-center justify-center cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name={`attendance-${emp.employee_id}`}
                                                            value="Absent"
                                                            checked={attendance[emp.employee_id] === 'Absent'}
                                                            onChange={() => handleStatusChange(emp.employee_id, 'Absent')}
                                                            className="sr-only peer"
                                                        />
                                                        <span className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-base transition-all peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-600 group-hover:border-red-300">
                                                            ✕
                                                        </span>
                                                    </label>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                                    <span className="text-xs text-slate-500">
                                        Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                                        {Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)} of{' '}
                                        {filteredEmployees.length} employees
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            ← Prev
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${page === currentPage
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'text-slate-600 hover:bg-slate-200'
                                                    }`}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* ===== VIEW RECORDS MODE ===== */
                <>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-5">
                        <div className="flex items-end gap-4 flex-wrap">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee</label>
                                <select
                                    className="w-64 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                >
                                    <option value="">Select an employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.employee_id} value={emp.employee_id}>
                                            {emp.full_name} ({emp.employee_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Filter by Date</label>
                                <input
                                    className="w-48 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </div>
                            {filterDate && (
                                <button
                                    className="px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
                                    onClick={() => setFilterDate('')}
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedEmployee ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="p-6">
                                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-800">Attendance Records</h3>
                                        {selectedEmpData && (
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                {selectedEmpData.full_name} — {selectedEmpData.department}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                                            Present: {presentCount}
                                        </span>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                                            Absent: {absentCount}
                                        </span>
                                    </div>
                                </div>

                                {recordsLoading ? (
                                    <LoadingSpinner message="Loading records..." />
                                ) : attendanceRecords.length === 0 ? (
                                    <EmptyState
                                        icon="📅"
                                        title="No attendance records"
                                        message={
                                            filterDate
                                                ? 'No records found for this date. Try clearing the filter.'
                                                : 'No attendance has been marked for this employee yet.'
                                        }
                                    />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Date</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Day</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceRecords.map((record) => {
                                                    const date = new Date(record.date + 'T00:00:00');
                                                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                                                    const formattedDate = date.toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    });
                                                    return (
                                                        <tr key={record.id} className="hover:bg-indigo-50/50 transition-colors">
                                                            <td className="px-4 py-3.5 border-b border-slate-100 text-slate-700 font-medium">{formattedDate}</td>
                                                            <td className="px-4 py-3.5 border-b border-slate-100 text-slate-600">{dayName}</td>
                                                            <td className="px-4 py-3.5 border-b border-slate-100">
                                                                <span
                                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${record.status === 'Present'
                                                                            ? 'bg-emerald-50 text-emerald-600'
                                                                            : 'bg-red-50 text-red-600'
                                                                        }`}
                                                                >
                                                                    {record.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            <EmptyState
                                icon="👆"
                                title="Select an employee"
                                message="Choose an employee from the dropdown above to view their attendance records."
                            />
                        </div>
                    )}
                </>
            )}

            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
