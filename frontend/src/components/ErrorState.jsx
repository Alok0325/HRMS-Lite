export default function ErrorState({ message = 'Something went wrong', onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-2xl">
                ⚠️
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Oops!</h3>
            <p className="text-slate-500 text-sm mb-4 max-w-sm">{message}</p>
            {onRetry && (
                <button
                    className="px-5 py-2.5 bg-indigo-500 text-white rounded-lg font-medium text-sm hover:bg-indigo-600 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200"
                    onClick={onRetry}
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
