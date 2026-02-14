export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fade-in"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center px-6 py-8">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-2xl">
                        🗑️
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {title || 'Confirm Delete'}
                    </h3>
                    <p className="text-slate-500 text-sm">{message || 'Are you sure? This action cannot be undone.'}</p>
                    <div className="flex justify-center gap-3 mt-6">
                        <button
                            className="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-5 py-2.5 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
