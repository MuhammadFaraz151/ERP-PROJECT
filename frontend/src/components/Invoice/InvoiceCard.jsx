import React, { useState } from 'react'
import axios from 'axios'
import { CheckCircle2, X, DollarSign } from 'lucide-react'

const InvoiceCard = ({data, onView, onRefresh, isDashboard = false}) => {
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
        <p className='text-sm text-blue-800'>{data?.invoiceNo}</p>
        <p className='text-sm'>{data?.customerName || data?.customer}</p>
        <p className='text-sm'>{formatted}</p>
        <p className='text-md  text-green-600'>{`RS. ${data?.grandTotal}`}</p>
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
                <div className='bg-[#020617] border border-white/10 rounded-xl p-6 w-[400px]'>
                    <div className='flex justify-between items-center border-b border-gray-700 pb-4'>
                        <h2 className='text-lg font-semibold text-white'>Record Payment</h2>
                        <button onClick={closePaymentModal} className='text-gray-400 hover:text-white'>
                            <X size={18} />
                        </button>
                    </div>
                    
                    <div className='mt-4'>
                        <p className='text-sm text-gray-400 mb-2'>Invoice: {data?.invoiceNo}</p>
                        <p className='text-sm text-gray-400 mb-2'>Customer: {data?.customerName || data?.customer?.name || data?.customer}</p>
                        <p className='text-sm text-amber-400 mb-4'>Remaining Amount: Rs. {Number(data?.remainingAmount).toLocaleString()}</p>
                        
                        <label className='text-sm text-gray-400 font-medium mb-1 block'>Payment Amount</label>
                        <input
                            type='number'
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder='Enter amount'
                            className='w-full p-2 bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white'
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
                            className='px-4 py-2 rounded-lg bg-[#1E293B] text-white hover:bg-[#334155] disabled:opacity-50'
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