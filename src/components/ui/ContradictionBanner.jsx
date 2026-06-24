import React from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable contradiction/validation feedback banner
 * severity: 'error' | 'warning' | 'info'
 */
export default function ContradictionBanner({ contradictions, onDismiss }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-2 mb-4"
      >
        {contradictions.map((c, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              c.severity === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : c.severity === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {c.severity === 'error' ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : c.severity === 'warning' ? (
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm flex-1">{c.message}</p>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}