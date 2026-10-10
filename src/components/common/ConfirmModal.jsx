import {
    AlertTriangle,
    X,
    Loader2,
} from "lucide-react";

function ConfirmModal({
    open,
    title = "Confirm Action",
    description = "Are you sure you want to continue?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
}) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    if (!loading) {
                        onCancel?.();
                    }
                }
            }}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertTriangle
                                size={21}
                            />
                        </div>

                        <div>
                            <h2
                                id="confirm-modal-title"
                                className="text-lg font-semibold text-slate-900"
                            >
                                {title}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {description}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading && (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        )}

                        {loading
                            ? "Deleting..."
                            : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
