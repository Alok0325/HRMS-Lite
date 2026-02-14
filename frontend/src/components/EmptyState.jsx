export default function EmptyState({ icon = '📋', title, message, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-5 text-3xl">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
