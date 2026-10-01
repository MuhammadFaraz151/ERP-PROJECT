import React, { useState } from 'react'
import axios from 'axios'
import { CheckCircle2, X, DollarSign } from 'lucide-react'

const InvoiceCard = ({data, onView, onRefresh, isDashboard = false, theme}) => {
    const formatted = data?.updatedAt ? data?.updatedAt.replace("T", " ").slice(0, 11) : "-"
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

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
    <>
        <p className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{data?.invoiceNo}</p>
        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data?.customerName || data?.customer}</p>
        <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatted}</p>
        <p className={`text-md text-green-600`}>{`RS. ${data?.grandTotal}`}</p>
        <p className={`text-sm font-semibold ${data?.status === 'Pending' ? 'text-amber-400' : 'text-green-400'}`}>{data?.status}</p>
       {!isDashboard? <div className='flex gap-2 items-center'>
            {onView && (
                <p onClick={onView} className='text-sm text-[#2563EB] cursor-pointer hover:underline'>View More</p>
            )}
            {!isDashboard && Number(data?.remainingAmount) > 0 && (
                <button 
                    onClick={() => setShowPaymentModal(true)}
                    className='flex items-center gap-1 text-sm bg-amber-500/20 text-amber-400 px-2 py-1 rounded hover:bg-amber-500/30 transition-colors'
                >
                    <DollarSign size={14} />
                    Pay
                </button>
            )}
        </div>:null}

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
                            className={`px-4 py-2 rounded-lg hover:disabled:opacity-50 ${theme === 'dark' ? 'bg-[#1E293B] text-white hover:bg-[#334155]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
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
    </>
  )
}

export default InvoiceCard