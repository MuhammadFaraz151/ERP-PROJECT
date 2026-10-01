import React, { useState } from 'react'
import { X, Printer, DollarSign, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import './InvoicePreview.css'
import img from '../../assets/paid-stamp.png'

const pick = (obj, keys, fallback) => {
  for (const k of keys) {
    const v = obj?.[k]
    if (v !== undefined && v !== null && v !== "") return v
  }
  return fallback
}

const normalizeItems = (data) => {
  const raw = data?.items || data?.products || data?.lineItems || []
  return raw
    .filter(Boolean)
    .map((item, i) => {
      const name = pick(item, ["product", "name", "productName", "description", "title"], "")
      const qty = Number(pick(item, ["qnt", "quantity", "qty", "count"], 0)) || 0
      const unitCost = Number(pick(item, ["unitCost", "price", "unitPrice", "rate"], 0)) || 0
      const sellingPrice = Number(pick(item, ["sellingPrice", "price"], 0)) || 0
      const gst = Number(pick(item, ["gst", "GST", "taxRate"], 0)) || 0
      const gstAmount = Number(pick(item, ["gstAmount"], 0)) || (unitCost * (gst / 100))
      const total = Number(pick(item, ["total", "lineTotal", "amount"], sellingPrice * qty)) || sellingPrice * qty
      return { key: item._id || item.id || i, name, qty, price: unitCost, unitCost, sellingPrice, gst, gstAmount, total }
    })
   
    .filter((item) => item.name || item.qty > 0)
}

// Calculate total GST from normalized items
const calculateTotalGST = (items) => {
  return items.reduce((sum, item) => {
    const unitCost = Number(item.unitCost) || Number(item.price) || 0;
    const gstPercentage = Number(item.gst) || 0;
    const gstAmount = unitCost * (gstPercentage / 100);
    return sum + (gstAmount * item.qty);
  }, 0);
}

const InvoiceDetail = ({ data, onClose, onRefresh, theme }) => {
  if (!data) return null

  const items = normalizeItems(data)
  const totalGST = calculateTotalGST(items)
  const formattedDate = (data?.updatedAt || data?.createdAt || "")?.replace("T", " ").slice(0, 16)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handlePrint = () => {
    // Add print-specific styles to hide browser headers
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @page {
        margin: 0;
        size: auto;
      }
      @media print {
        body {
          margin: 0;
        }
      }
    `;
    document.head.appendChild(printStyle);
    
    window.print();
    
    // Remove the print style after printing
    setTimeout(() => {
      document.head.removeChild(printStyle);
    }, 1000);
  }

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setError("Please enter a valid payment amount")
      return
    }

    if (Number(paymentAmount) > Number(data?.remainingAmount)) {
      setError(`Payment cannot exceed remaining amount of ${data?.remainingAmount}`)
      return
    }

    setLoading(true)
    setError(null)
    try {
      await axios.post("http://localhost:5555/payRemaining", {
        invoiceId: data?._id,
        paymentAmount: Number(paymentAmount)
      })
      setSuccess("Payment recorded successfully")
      setPaymentAmount("")
      setTimeout(() => {
        setShowPaymentModal(false)
        setSuccess(null)
        if (onRefresh) onRefresh()
        onClose()
      }, 1500)
    } catch (error) {
      setError(error?.response?.data?.message || "Payment failed")
    } finally {
      setLoading(false)
    }
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setPaymentAmount("")
    setError(null)
    setSuccess(null)
  }

  return (
    <div className={`h-full w-full flex items-center justify-center fixed inset-0 z-50 ${theme === 'dark' ? 'bg-black/70 text-white' : 'bg-black/50 text-gray-900'}`}>
      <div className={`printable-invoice border rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto relative ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-white border-gray-200'}`}>

        <div className={`flex justify-between items-start border-b pb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className='flex items-center gap-4'>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-gray-100 border-gray-300'}`}>
              <img
                src={img}
                alt='MALIK KARYANA STORE Logo'
                className='w-full h-full object-cover'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-xl">🏪</span>';
                }}
              />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>MALIK KARYANA STORE</h2>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>QUALITY PRODUCTS • BETTER PRICES</p>
              <p className='text-xs text-blue-400 mt-1'>📞 030067937122</p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>📍 Lahore Road Sargodha</p>
            </div>
          </div>
          <div className='text-right'>
            <div className='flex items-center justify-end gap-2'>
              <span className={`inline-block text-xs px-3 py-1 rounded-full border no-print ${
                (data.status === 'Pending')
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'bg-green-500/10 border-green-500/40 text-green-400'
              }`}>
                {data.status || "Paid"}
              </span>
              <button onClick={onClose} type='button' className={`no-print ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                <X size={20} />
              </button>
            </div>
            <h1 className='text-xl font-bold mt-2'>{data.invoiceNo}</h1>
          </div>
        </div>

        <div className={`flex justify-between items-start border rounded-lg p-4 mt-5 ${theme === 'dark' ? 'bg-[#0A1022] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Billed To: {data.customerName || data.customer?.name || data.customer || "-"}</p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Payment via: {data.paymentMethod || data.payment || "-"}</p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date: {formattedDate || "-"}</p>
          </div>
          <div className='text-right'>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Status:</p>
            {Number(data.remainingAmount) > 0 ? (
              <p className='font-semibold text-amber-400 mt-1'>Pending</p>
            ) : (
              <p className='font-semibold text-green-400 mt-1'>Paid</p>
            )}
          </div>
        </div>

        <div className='mt-6'>
          <div className={`grid grid-cols-5 pb-3 border-b text-xs font-semibold ${theme === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
            <p>ITEM DESCRIPTION</p>
            <p className='text-right'>QTY</p>
            <p className='text-right'>SELLING PRICE</p>
            <p className='text-right'>GST AMOUNT</p>
            <p className='text-right'>TOTAL</p>
          </div>

          {items.length > 0 ? (
            items.map((item) => {
              const unitCost = Number(item.unitCost) || Number(item.price) || 0;
              const sellingPrice = Number(item.sellingPrice) || Number(item.price) || 0;
              const gstPercentage = Number(item.gst) || 0;
              const gstAmount = unitCost * (gstPercentage / 100);
              const totalPrice = sellingPrice * item.qty;
              const totalGSTAmount = gstAmount * item.qty;

              return (
                <div key={item.key} className={`grid grid-cols-5 py-3 border-b text-sm ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                  <p className='font-medium'>{item.name || "Item"}</p>
                  <p className='text-right'>{item.qty}</p>
                  <p className='text-right'>Rs. {sellingPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  <p className='text-right text-purple-400'>{gstAmount > 0 ? `Rs. ${totalGSTAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}</p>
                  <p className='text-right font-semibold'>Rs. {totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>
              );
            })
          ) : (
            <p className={`text-sm py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              No item details were saved for this invoice. Newly generated invoices will show full line items.
            </p>
          )}
        </div>

        <div className='flex flex-col items-end mt-5 gap-2'>
          <div className={`flex justify-between w-64 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>Subtotal (without GST):</p>
            <p>Rs. {Number(data.subtotal || (Number(data.grandTotal || 0) - totalGST)).toLocaleString()}</p>
          </div>
          <div className='flex justify-between w-64 text-sm text-purple-400'>
            <p>Total GST:</p>
            <p>Rs. {totalGST.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          <div className='flex justify-between w-64 text-sm text-green-400'>
            <p>Discount:</p>
            <p>-Rs. {Number(data.discount || 0).toLocaleString()}</p>
          </div>
          <div className={`flex justify-between w-64 border-t pt-3 mt-1 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className='text-base font-semibold'>Grand Total:</p>
            <p className='text-lg font-bold text-[#1FE39A]'>Rs. {Number(data.grandTotal || 0).toLocaleString()}</p>
          </div>
          {data.paidAmount !== undefined && (
            <div className='flex justify-between w-64 mt-2'>
              <p className='text-sm font-semibold text-blue-400'>Paid Amount:</p>
              <p className='text-sm font-bold text-blue-400'>Rs. {Number(data.paidAmount || 0).toLocaleString()}</p>
            </div>
          )}
          {Number(data.remainingAmount) > 0 && (
            <div className='flex justify-between w-64 mt-2'>
              <p className='text-sm font-semibold text-amber-400'>Remaining Amount:</p>
              <p className='text-sm font-bold text-amber-400'>Rs. {Number(data.remainingAmount).toLocaleString()}</p>
            </div>
          )}
          {data.hasRefund && (
            <div className='flex justify-between w-64 mt-2'>
              <p className='text-sm font-semibold text-red-400'>Total Refunded:</p>
              <p className='text-sm font-bold text-red-400'>Rs. {Number(data.totalRefunded || 0).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-3 mt-6'>
          <button onClick={handlePrint} type='button' className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 ${theme === 'dark' ? 'bg-[#1E293B] hover:bg-[#334155]' : 'bg-gray-700 hover:bg-gray-800'}`}>
            <Printer size={16} />
            Print / PDF
          </button>
          {Number(data.remainingAmount) > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              type='button'
              className='flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700'
            >
              <DollarSign size={16} />
              Pay Remaining
            </button>
          )}
          <button onClick={onClose} type='button' className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700'>
            Close
          </button>
        </div>
        
        {/* Stamp */}
        {Number(data.remainingAmount) === 0 ? (
          <div className='invoice-stamp stamp-paid'>
            <img src={img} alt='PAID' className='w-full h-full object-contain' onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('fallback');
              e.target.parentElement.innerHTML = 'PAID';
            }} />
          </div>
        ) : (
          <div className='invoice-stamp stamp-pending fallback'>PENDING</div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
            <div className={`border rounded-xl p-6 w-[400px] ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-white border-gray-200'}`}>
              <div className={`flex justify-between items-center border-b pb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Record Payment</h2>
                <button onClick={closePaymentModal} className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
                  <X size={18} />
                </button>
              </div>

              <div className='mt-4'>
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Invoice: {data?.invoiceNo}</p>
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Customer: {data?.customerName || data?.customer?.name || data?.customer}</p>
                <p className='text-sm text-amber-400 mb-4'>Remaining Amount: Rs. {Number(data?.remainingAmount).toLocaleString()}</p>

                <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Payment Amount</label>
                <input
                  type='number'
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder='Enter amount'
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  max={data?.remainingAmount}
                />

                {error && (
                  <div className='flex items-center gap-2 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2 mt-3'>
                    <p className='text-sm text-red-400'>{error}</p>
                  </div>
                )}

                {success && (
                  <div className='flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-lg px-3 py-2 mt-3'>
                    <CheckCircle2 size={16} className='text-green-400' />
                    <p className='text-sm text-green-400'>{success}</p>
                  </div>
                )}
              </div>

              <div className='flex justify-end gap-3 mt-6'>
                <button
                  onClick={closePaymentModal}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg disabled:opacity-50 ${theme === 'dark' ? 'bg-[#1E293B] text-white hover:bg-[#334155]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {loading ? "Processing..." : "Record Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoiceDetail
