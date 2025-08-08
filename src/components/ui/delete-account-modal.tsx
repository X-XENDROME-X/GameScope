'use client'

import { useState } from 'react'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  userEmail?: string
}

export function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting, 
  userEmail 
}: DeleteAccountModalProps) {
  const [step, setStep] = useState(1)
  const [confirmText, setConfirmText] = useState('')
  const [isConfirmTextValid, setIsConfirmTextValid] = useState(false)

  const handleConfirmTextChange = (value: string) => {
    setConfirmText(value)
    // Trim whitespace and check for exact match (supports both typing and pasting)
    setIsConfirmTextValid(value.trim() === 'DELETE')
  }

  const handleConfirm = async () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2 && isConfirmTextValid) {
      await onConfirm()
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setStep(1)
      setConfirmText('')
      setIsConfirmTextValid(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Delete Account
          </h2>
          {!isDeleting && (
            <button
              onClick={handleClose}
              title="Close dialog"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200 font-medium">
                  ⚠️ This action cannot be undone!
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Deleting your account will permanently remove:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Your profile and account information
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    All your favorite games ({userEmail && 'saved data'})
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Your gaming preferences and statistics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    All session data and login history
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Account:</strong> {userEmail}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200 font-medium text-center">
                  🔥 FINAL CONFIRMATION REQUIRED
                </p>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 text-center">
                To confirm account deletion, please type <strong>DELETE</strong> below:
              </p>
              
              <div className="space-y-2">
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => handleConfirmTextChange(e.target.value)}
                  onPaste={(e) => {
                    // Allow paste events to work normally
                    setTimeout(() => {
                      const target = e.currentTarget
                      if (target && target.value !== undefined) {
                        const pastedValue = target.value
                        handleConfirmTextChange(pastedValue)
                      }
                    }, 0)
                  }}
                  placeholder="Type DELETE here"
                  disabled={isDeleting}
                  className={`w-full px-4 py-3 border rounded-lg text-center font-mono text-lg focus:outline-none focus:ring-2 transition-colors ${
                    isConfirmTextValid
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500'
                  }`}
                />
                {confirmText && !isConfirmTextValid && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    Please type "DELETE" exactly (case sensitive)
                  </p>
                )}
                {isConfirmTextValid && (
                  <p className="text-sm text-green-600 dark:text-green-400 text-center">
                    ✓ Confirmation text is correct
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={isDeleting || (step === 2 && !isConfirmTextValid)}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              step === 1 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : step === 1 ? (
              'Continue'
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
