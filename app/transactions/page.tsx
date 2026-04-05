"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, CheckCircle, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

  if (!mounted) {
    return (
      <div className="w-full">
        <header className="w-full flex flex-col items-center justify-center py-1 bg-gradient-to-r from-red-600 to-yellow-500 shadow-lg">
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
      <header className="w-full flex flex-col items-center justify-center py-1 bg-gradient-to-r from-red-600 to-yellow-500 shadow-lg">
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

      {/* Back Button */}
      <div className="p-3 border-b border-white/10">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="text-white hover:bg-white/10 px-2 h-8"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Back
        </Button>
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
                className="flex items-center justify-between p-3 bg-zinc-900/50 border border-white/10 rounded-lg"
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
                <div className="text-right shrink-0 ml-3">
                  <div className="text-emerald-400 font-bold text-lg leading-none">
                    ₹{entry.amount.toFixed(2)}
                  </div>
                  <div className="text-[9px] text-zinc-500 uppercase font-medium mt-1">{entry.paymentMethod}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
