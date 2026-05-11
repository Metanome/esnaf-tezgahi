import { AlertTriangleIcon } from './Icons'

/**
 * A simple inline modal confirm dialog.
 * Usage: <ConfirmDialog
 *   open={open}
 *   title="Delete Product?"
 *   message="This cannot be undone."
 *   onConfirm={handleConfirm}
 *   onCancel={() => setOpen(false)}
 *   danger
 * />
 */
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
      <div className="card w-full max-w-sm space-y-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 ${danger ? 'text-red-400' : 'text-amber-400'}`}>
            <AlertTriangleIcon size={20} />
          </span>
          <div>
            <h3 className="text-slate-100 font-semibold">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-1 border-t border-slate-800">
          <button onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              danger
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
