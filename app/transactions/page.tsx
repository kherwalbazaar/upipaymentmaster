"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, CheckCircle, History, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Item {
  id: string
  name: string
  qty: number
  price: number
}

interface PaymentEntry {
  id: string
  createdAt: string
  date: string
  time: string
  amount: number
  vpa: string
  items: Item[]
  status: "pending" | "completed" | "failed"
  paymentMethod: string
}

const HISTORY_STORAGE_KEY = "kherwal_bazaar_payment_history_v1"

export default function AllTransactionsPage() {
  const [history, setHistory] = useState<PaymentEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (saved) {
        try {
          setHistory(JSON.parse(saved))
        } catch (e) {
          console.error("Failed to parse history", e)
        }
      }
    }
  }, [])

  // Calculate grand total
  const grandTotal = history.reduce((sum, entry) => sum + entry.amount, 0)

  // Calculate today's sales
  const today = new Date().toLocaleDateString("en-IN")
  const todaysSale = history
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.amount, 0)

  // Delete individual transaction
  const deleteTransaction = (id: string) => {
    const updatedHistory = history.filter(entry => entry.id !== id)
    setHistory(updatedHistory)
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
    }
  }

  // Clear all transactions
  const clearAllTransactions = () => {
    setHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY)
    }
    setIsClearConfirmOpen(false)
  }

  if (!mounted) {
    return (
      <div className="w-full">
        <header className="w-full flex flex-col items-center justify-center py-2 bg-gradient-to-r from-red-600 to-yellow-500 shadow-lg">
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">KHERWAL BAZAAR</h1>
          <p className="text-white/90 font-medium text-[10px] uppercase tracking-widest">
            Professional Billing & Payments
          </p>
        </header>
        <div className="grid grid-cols-2 gap-0 border-b border-white/10">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl p-3 text-center border-r border-white/10">
            <p className="text-emerald-400/70 text-[10px] font-medium uppercase tracking-wider mb-1">Grand Total</p>
            <p className="text-emerald-400 font-mono text-2xl font-bold">₹0.00</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl p-3 text-center">
            <p className="text-blue-400/70 text-[10px] font-medium uppercase tracking-wider mb-1">Today's Sale</p>
            <p className="text-blue-400 font-mono text-2xl font-bold">₹0.00</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="w-full flex flex-col items-center justify-center py-2 bg-gradient-to-r from-red-600 to-yellow-500 shadow-lg">
        <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">KHERWAL BAZAAR</h1>
        <p className="text-white/90 font-medium text-[10px] uppercase tracking-widest">
          Professional Billing & Payments
        </p>
      </header>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-0 border-b border-white/10">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl p-3 text-center border-r border-white/10">
          <p className="text-emerald-400/70 text-[10px] font-medium uppercase tracking-wider mb-1">Grand Total</p>
          <p className="text-emerald-400 font-mono text-2xl font-bold">₹{grandTotal.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl p-3 text-center">
          <p className="text-blue-400/70 text-[10px] font-medium uppercase tracking-wider mb-1">Today's Sale</p>
          <p className="text-blue-400 font-mono text-2xl font-bold">₹{todaysSale.toFixed(2)}</p>
        </div>
      </div>

      {/* Back Button and Clear All */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between gap-2">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="text-white hover:bg-white/10 px-2 h-8"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Button>
        {history.length > 0 && (
          <Button
            onClick={() => setIsClearConfirmOpen(true)}
            variant="ghost"
            className="text-red-400 hover:bg-red-500/10 px-2 h-8 text-xs"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Clear All
          </Button>
        )}
      </div>

      {/* Transaction List */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm flex items-center gap-2 text-blue-100 uppercase tracking-wider">
            <History className="w-4 h-4 text-blue-400" /> All Transactions ({history.length})
          </h2>
        </div>

        {history.length === 0 ? (
          <p className="text-center text-zinc-500 py-8 italic">No transactions found</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-lg group"
              >
                <div className="flex gap-3 items-center min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      {entry.paymentMethod} Payment
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] h-4 px-1 uppercase tracking-tighter font-medium">
                        Verified
                      </Badge>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {entry.date} {entry.time} • {entry.id.slice(0, 6).toUpperCase()}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {entry.items.length} item(s)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold text-lg leading-none">
                      ₹{entry.amount.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-zinc-500 uppercase font-medium mt-1">{entry.paymentMethod}</div>
                  </div>
                  <Button
                    onClick={() => deleteTransaction(entry.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Clear All Transactions?
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently delete all {history.length} transaction(s) from your device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsClearConfirmOpen(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={clearAllTransactions}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
