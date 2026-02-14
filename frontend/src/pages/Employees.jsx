import { useState, useEffect } from 'react';
import { employeeApi } from '../api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const initialForm = { employee_id: '', full_name: '', email: '', department: '' };

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState('');

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

    useEffect(() => {
        fetchEmployees();
    }, []);

    const validateForm = () => {
        const errors = {};
        if (!form.employee_id.trim()) errors.employee_id = 'Employee ID is required';
        if (!form.full_name.trim()) errors.full_name = 'Full name is required';
        if (!form.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = 'Enter a valid email address';
        }
        if (!form.department.trim()) errors.department = 'Department is required';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            setSubmitting(true);
            await employeeApi.create(form);
            setShowAddModal(false);
            setForm(initialForm);
            setFormErrors({});
            setToast({ message: 'Employee added successfully!', type: 'success' });
            fetchEmployees();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await employeeApi.delete(deleteTarget.employee_id);
            setDeleteTarget(null);
            setToast({ message: 'Employee deleted successfully', type: 'success' });
            fetchEmployees();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const closeModal = () => {
        setShowAddModal(false);
        setForm(initialForm);
        setFormErrors({});
    };

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase()) ||
            emp.department.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSpinner message="Loading employees..." />;
    if (error) return <ErrorState message={error} onRetry={fetchEmployees} />;

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Employees</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your organization's employee records</p>
                </div>
                <button
                    className="px-5 py-2.5 bg-indigo-500 text-white rounded-lg font-medium text-sm hover:bg-indigo-600 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200"
                    onClick={() => setShowAddModal(true)}
                >
                    + Add Employee
                </button>
            </div>

            {/* Search bar */}
            {employees.length > 0 && (
                <div className="flex items-center gap-4 flex-wrap mb-6">
                    <div className="relative max-w-xs w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                        <input
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <span className="text-xs text-slate-400">
                        {filteredEmployees.length} of {employees.length} employees
                    </span>
                </div>
            )}

            {/* Content */}
            {employees.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <EmptyState
                        icon="👥"
                        title="No employees yet"
                        message="Start by adding your first employee to the system."
                        action={
                            <button
                                className="px-5 py-2.5 bg-indigo-500 text-white rounded-lg font-medium text-sm hover:bg-indigo-600 transition-all"
                                onClick={() => setShowAddModal(true)}
                            >
                                + Add Employee
                            </button>
                        }
                    />
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <EmptyState
                        icon="🔍"
                        title="No results found"
                        message={`No employees match "${search}". Try a different search term.`}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Employee ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Full Name</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Email</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Department</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b-2 border-slate-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-indigo-50/50 transition-colors">
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                {emp.employee_id}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                                                    {emp.full_name.charAt(0)}
                                                </span>
                                                <span className="font-medium text-slate-700">{emp.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100 text-slate-600">{emp.email}</td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                                                {emp.department}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 border-b border-slate-100">
                                            <button
                                                className="px-3.5 py-1.5 bg-red-500 text-white rounded-md font-medium text-xs hover:bg-red-600 transition-colors"
                                                onClick={() => setDeleteTarget(emp)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={closeModal}
                title="Add New Employee"
                footer={
                    <>
                        <button
                            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-5 py-2 bg-indigo-500 text-white rounded-lg font-medium text-sm hover:bg-indigo-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Adding...' : 'Add Employee'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    {[
                        { name: 'employee_id', label: 'Employee ID', placeholder: 'e.g., EMP001' },
                        { name: 'full_name', label: 'Full Name', placeholder: 'e.g., Alok Prajapati' },
                        { name: 'email', label: 'Email Address', placeholder: 'e.g., alok@company.com', type: 'email' },
                        { name: 'department', label: 'Department', placeholder: 'e.g., Engineering' },
                    ].map((field) => (
                        <div className="mb-4" key={field.name}>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                            <input
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all placeholder:text-slate-400"
                                name={field.name}
                                type={field.type || 'text'}
                                value={form[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                            />
                            {formErrors[field.name] && (
                                <p className="text-xs text-red-500 mt-1">{formErrors[field.name]}</p>
                            )}
                        </div>
                    ))}
                </form>
            </Modal>

            {/* Confirm Delete */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Employee"
                message={
                    deleteTarget
                        ? `Are you sure you want to delete "${deleteTarget.full_name}" (${deleteTarget.employee_id})? All associated attendance records will also be removed.`
                        : ''
                }
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />

            {/* Toast */}
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}
        </div>
    );
}
