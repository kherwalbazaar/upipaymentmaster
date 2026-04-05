"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2, QrCode, CheckCircle, History, X, IndianRupee, ChevronLeft, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  paymentMethod: string // added payment method field
}

const DEFAULT_UPI_VPA = "9583252256-3@axl"
const DEFAULT_PAYEE_NAME = "KHERWAL BAZAAR"
const HISTORY_STORAGE_KEY = "kherwal_bazaar_payment_history_v1"

export function BillingDashboard() {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [history, setHistory] = useState<PaymentEntry[]>([])
  const [itemName, setItemName] = useState("")
  const [itemQty, setItemQty] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [isQuantityPopupOpen, setIsQuantityPopupOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load history on mount (client-side only to prevent hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (saved) {
          setHistory(JSON.parse(saved))
        }
      } catch (e) {
        console.error("[v0] Failed to parse history", e)
        setError("Failed to load history")
      }
    }
  }, [])

  // Show loading state during hydration - use same structure as final render
  if (!mounted) {
    return (
      <div className="w-full">
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
            <p className="text-emerald-400 font-mono text-2xl font-bold">₹0.00</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl p-3 text-center">
            <p className="text-blue-400/70 text-[10px] font-medium uppercase tracking-wider mb-1">Today's Sale</p>
            <p className="text-blue-400 font-mono text-2xl font-bold">₹0.00</p>
          </div>
        </div>

        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`
  }

  const addItemWithQty = (qty: number) => {
    if (!itemPrice) return

    const newItem: Item = {
      id: generateId(),
      name: "Garments",
      qty: qty,
      price: Number.parseFloat(itemPrice),
    }

    setItems([newItem, ...items])
    setItemPrice("")
  }

  const handleBackspace = () => {
    setItemPrice(prev => prev.slice(0, -1))
  }

  const handleArrowClick = () => {
    if (!itemPrice.trim()) {
      alert("Please enter a price first")
      return
    }
    setIsQuantityPopupOpen(true)
  }

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemPrice) return

    const newItem: Item = {
      id: generateId(),
      name: itemName.trim() || "Garments",
      qty: itemQty ? Number.parseInt(itemQty) : 1,
      price: Number.parseFloat(itemPrice),
    }

    setItems([newItem, ...items])
    setItemName("")
    setItemQty("")
    setItemPrice("")
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const grandTotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)

  // Calculate today's total sales
  const today = new Date().toLocaleDateString("en-IN")
  const todaysSale = history
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.amount, 0)

  // Calculate grand total (all time sales)
  const allTimeTotal = history.reduce((sum, entry) => sum + entry.amount, 0)

  const generateQr = () => {
    if (grandTotal <= 0) return

    const params = new URLSearchParams({
      pa: DEFAULT_UPI_VPA,
      pn: DEFAULT_PAYEE_NAME,
      am: grandTotal.toFixed(2),
      cu: "INR",
    })
    const upiUrl = `upi://pay?${params.toString()}`

    // Using a QR code generation API for the preview
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiUrl)}`)
    setIsQrModalOpen(true)
  }

  const markAsPaid = () => {
    if (items.length === 0) return

    const now = new Date()
    const newEntry: PaymentEntry = {
      id: generateId(),
      createdAt: now.toISOString(),
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      amount: grandTotal,
      vpa: DEFAULT_UPI_VPA,
      items: [...items],
      status: "completed",
      paymentMethod: "PhonePay",
    }

    const updatedHistory = [newEntry, ...history]
    setHistory(updatedHistory)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
    }

    // Clear items and close popup immediately
    setItems([])
    setIsQrModalOpen(false)
    
    // Show success message
    setSuccessMessage(`Payment of ₹${grandTotal.toFixed(2)} recorded successfully!`)
    setIsSuccessOpen(true)
  }

  const markAsCashPaid = () => {
    if (items.length === 0) return

    const now = new Date()
    const newEntry: PaymentEntry = {
      id: generateId(),
      createdAt: now.toISOString(),
      date: now.toLocaleDateString("en-IN"),
      time: now.toLocaleTimeString("en-IN"),
      amount: grandTotal,
      vpa: "CASH",
      items: [...items],
      status: "completed",
      paymentMethod: "Cash",
    }

    const updatedHistory = [newEntry, ...history]
    setHistory(updatedHistory)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
    }

    // Clear items immediately
    setItems([])
    
    // Show success message
    setSuccessMessage(`Cash payment of ₹${grandTotal.toFixed(2)} recorded successfully!`)
    setIsSuccessOpen(true)
  }

  const clearHistory = () => {
    setIsClearConfirmOpen(true)
  }

  const confirmClearHistory = () => {
    setHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HISTORY_STORAGE_KEY)
    }
    setIsClearConfirmOpen(false)
  }

  return (
    <div className="w-full">
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
          <p className="text-emerald-400 font-mono text-2xl font-bold">₹{allTimeTotal.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl p-3 text-center">
          <p className="text-blue-400/70 text-[10px] font-medium uppercase tracking-wider mb-1">Today's Sale</p>
          <p className="text-blue-400 font-mono text-2xl font-bold">₹{todaysSale.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 px-0">
        {/* Quick Add Section */}
        <Card className="bg-gradient-to-br from-pink-500/20 to-emerald-500/20 backdrop-blur-xl border-white/10 shadow-xl overflow-hidden rounded-none border-x-0 border-b-0">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-emerald-500/10 pointer-events-none" />
          <CardContent className="relative z-10 py-1">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  onArrowClick={handleArrowClick}
                  className="!border-white !border-2 bg-black/40 text-white placeholder:text-zinc-400 focus:border-emerald-500/50 h-15 pl-12 text-4xl font-bold [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-0">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((qty) => (
                  <Button
                    key={qty}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setItemPrice(prev => prev + qty.toString())}
                    className="bg-black/40 border-white/20 text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 h-15 font-bold border"
                    style={{ fontSize: '35px' }}
                  >
                    {qty}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setItemPrice(prev => prev + ".")}
                  className="bg-black/40 border-white/20 text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 h-15 font-bold border"
                  style={{ fontSize: '35px' }}
                >
                  .
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setItemPrice(prev => prev + "0")}
                  className="bg-black/40 border-white/20 text-white hover:bg-emerald-500/20 hover:border-emerald-500/50 h-15 font-bold border"
                  style={{ fontSize: '35px' }}
                >
                  0
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackspace}
                  className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50 h-15 font-bold border"
                  style={{ fontSize: '35px' }}
                >
                  ⌫
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Bill Section */}
        {items.length > 0 && (
          <Card className="bg-zinc-900/50 backdrop-blur-xl border-white/10 shadow-2xl rounded-none border-x-0 border-t-0 border-b-0">
            <CardContent className="p-0 w-full overflow-x-hidden">
              <div className="w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-zinc-300 font-bold border-r border-white/5 w-[5%] px-2">
                        S.No
                      </TableHead>
                      <TableHead className="text-zinc-300 font-bold border-r border-white/5 px-2">Item</TableHead>
                      <TableHead className="text-zinc-300 font-bold border-r border-white/5 text-center w-[8%] px-2">
                        Qty
                      </TableHead>
                      <TableHead className="text-zinc-300 font-bold border-r border-white/5 text-right w-[12%] px-2">
                        ₹
                      </TableHead>
                      <TableHead className="text-zinc-300 font-bold border-r border-white/5 text-right w-[12%] px-2">
                        Total
                      </TableHead>
                      <TableHead className="text-zinc-300 font-bold text-center w-[12%] px-2">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="text-zinc-400 font-mono border-r border-white/5 py-2 px-2">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-white border-r border-white/5 py-2 px-2">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-center text-zinc-300 border-r border-white/5 py-2 px-2">
                          {item.qty}
                        </TableCell>
                        <TableCell className="text-right text-zinc-300 border-r border-white/5 py-2 px-2">
                          ₹{item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-emerald-400 font-bold border-r border-white/5 py-2 px-2">
                          ₹{(item.qty * item.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center py-2 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all h-7 px-2 text-xs rounded"
                            aria-label="Delete item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total row like excel */}
                    <TableRow className="bg-emerald-500/5 hover:bg-emerald-500/5 font-bold">
                      <TableCell colSpan={4} className="text-right text-white border-r border-white/5 py-2 px-2">
                        Total Amount:
                      </TableCell>
                      <TableCell className="text-right text-emerald-400 text-xl border-r border-white/5 py-2 px-2">
                        ₹{grandTotal.toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-2 border-t border-white/5">
              <Button
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white border-0 shadow-lg shadow-emerald-900/20 rounded h-14 font-bold text-lg"
                onClick={markAsCashPaid}
                disabled={items.length === 0}
              >
                <IndianRupee className="w-5 h-5 mr-2" /> Cash Pay
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-900/20 rounded h-14 font-bold text-lg"
                onClick={generateQr}
                disabled={items.length === 0}
              >
                <QrCode className="w-5 h-5 mr-2 text-blue-400" /> QR Pay
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Recent Activity Section */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-none border-x-0 border-t-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-4 border-b border-white/5 bg-zinc-800/80 backdrop-blur-sm pb-0">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100 uppercase tracking-wider">
              <History className="w-4 h-4 text-blue-400" /> Receive Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 h-5 px-2 text-[10px] rounded"
            >
              Clear History
            </Button>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            {history.length === 0 ? (
              <p className="text-center text-zinc-500 py-4 italic">No receive activity tracked yet</p>
            ) : (
              <>
                <div className="space-y-1 divide-y divide-white/5 w-full overflow-x-hidden">
                  {history.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-2 bg-black/30 hover:bg-black/40 transition-all"
                    >
                      <div className="flex gap-3 items-center min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            {entry.paymentMethod} Payment
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] h-4 px-1 uppercase tracking-tighter font-medium">
                              Verified
                            </Badge>
                          </div>
                          <div className="text-[9px] text-zinc-500 font-mono">
                            {entry.date} {entry.time} • {entry.id.slice(0, 6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-emerald-400 font-bold text-base leading-none">
                          ₹{entry.amount.toFixed(2)}
                        </div>
                        <div className="text-[9px] text-zinc-500 uppercase font-medium mt-0.5">{entry.paymentMethod}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* See All Button */}
                <div className="p-3 border-t border-white/5">
                  <Button
                    onClick={() => window.location.href = '/transactions'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-blue-900/20 rounded h-10 font-bold"
                  >
                    <History className="w-4 h-4 mr-2" /> See All Transactions ({history.length})
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-tr from-blue-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center w-full h-screen">
          {/* Close Button */}
          <button
            onClick={() => setIsQrModalOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center gap-8 p-4">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">SCAN TO PAY</h1>
              <p className="text-zinc-400 text-lg">{DEFAULT_PAYEE_NAME}</p>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-2xl">
                {qrCodeUrl && (
                  <img src={qrCodeUrl || "/placeholder.svg"} alt="UPI QR Code" className="w-[300px] h-[300px]" />
                )}
              </div>
              <div className="text-center">
                <p className="text-zinc-400 text-sm mb-2">Amount to Pay</p>
                <p className="text-5xl font-bold text-emerald-400">₹{grandTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 py-6 text-lg font-bold rounded-lg"
                onClick={markAsPaid}
              >
                <CheckCircle className="w-5 h-5 mr-2" /> Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {isQuantityPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center w-full h-screen">
          {/* Close Button */}
          <button
            onClick={() => setIsQuantityPopupOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
            aria-label="Close quantity popup"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Popup Content */}
          <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-xl font-bold text-white">Select Quantity</h3>
              <div className="text-center">
                <p className="text-zinc-400 text-sm mb-1">Price per item</p>
                <p className="text-2xl font-bold text-emerald-400">₹{itemPrice}</p>
              </div>

              {/* Quantity Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full">
                {[1, 2, 3, 4].map((qty) => (
                  <Button
                    key={qty}
                    onClick={() => {
                      addItemWithQty(qty)
                      setIsQuantityPopupOpen(false)
                    }}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 h-12 text-lg font-bold rounded-lg"
                    >
                    {qty}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() => setIsQuantityPopupOpen(false)}
                variant="outline"
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 h-10 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Dialog */}
      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Clear All History?
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
              onClick={confirmClearHistory}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            <DialogTitle className="text-center text-emerald-400 text-xl">
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-300 mt-2">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setIsSuccessOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
