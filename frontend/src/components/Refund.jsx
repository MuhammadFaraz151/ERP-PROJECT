import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Package, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

const Refund = () => {
  const [invoiceNo, setInvoiceNo] = useState('')
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedItems, setSelectedItems] = useState({})
  const [customPrices, setCustomPrices] = useState({})
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundSuccess, setRefundSuccess] = useState(false)

  const searchInvoice = async () => {
    if (!invoiceNo.trim()) {
      setError('Please enter an invoice number')
      return
    }

    setLoading(true)
    setError('')
    setInvoice(null)
    setSelectedItems({})
    setCustomPrices({})
    setRefundAmount(0)
    setRefundSuccess(false)

    try {
      const res = await axios.get(`http://localhost:5555/getInvoice/${invoiceNo}`)

      if (res.data?.remainingAmount > 0) {
        setError(
          `This invoice has a pending balance of Rs. ${res.data.remainingAmount.toLocaleString()}.`
        )
        setInvoice(null)
        return
      }

      setInvoice(res.data)
    } catch (error) {
      setError('Invoice not found or invalid')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemSelection = (itemId, itemIndex, qty) => {
    setSelectedItems(prev => {
      const newSelectedItems = {
        ...prev,
        [itemIndex]: qty
      }
      

      let total = 0
      if (invoice) {
        invoice.items.forEach((item, index) => {
          const refundQty = newSelectedItems[index] || 0
          if (refundQty > 0) {
            const customPrice = customPrices[index] || item.price
            const itemTotal = customPrice * refundQty
            total += itemTotal
          }
        })
      }
      setRefundAmount(total)
      
      return newSelectedItems
    })
  }

  const handleCustomPriceChange = (itemIndex, newPrice, originalPrice) => {
    const price = Number(newPrice) || 0
    if (price > originalPrice) {
      return 
    }
    
    setCustomPrices(prev => ({
      ...prev,
      [itemIndex]: price
    }))
    

    setSelectedItems(prev => {
      let total = 0
      if (invoice) {
        invoice.items.forEach((item, index) => {
          const refundQty = prev[index] || 0
          if (refundQty > 0) {
            const customPrice = index === itemIndex ? price : (customPrices[index] || item.price)
            const itemTotal = customPrice * refundQty
            total += itemTotal
          }
        })
      }
      setRefundAmount(total)
      return prev
    })
  }

 
  const getTotalSelectedProducts = () => {
    let total = 0
    Object.values(selectedItems).forEach(qty => {
      total += qty
    })
    return total
  }

  const processRefund = async () => {
    if (Object.keys(selectedItems).length === 0) {
      setError('Please select at least one item to refund')
      return
    }

    if (invoice?.remainingAmount > 0) {
      setError('Refunds are not allowed on invoices with a pending balance')
      return
    }

    setLoading(true)
    setError('')

    try {
      const refundData = {
        invoiceNo: invoice.invoiceNo,
        items: selectedItems,
        customPrices: customPrices,
        refundAmount: refundAmount,
        customerName: invoice.customerName
      }

      await axios.post('http://localhost:5555/processRefund', refundData)
      setRefundSuccess(true)
      setTimeout(() => {
        setInvoice(null)
        setInvoiceNo('')
        setSelectedItems({})
        setCustomPrices({})
        setRefundAmount(0)
        setRefundSuccess(false)
      }, 3000)
    } catch (error) {
      setError('Failed to process refund')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-6 bg-[#111827] min-h-screen text-white'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-bold mb-6'>Process Refund</h1>

        {/* Search Invoice */}
        <div className='bg-[#1F2937] p-6 rounded-xl border border-white/10 mb-6'>
          <label className='text-gray-400 text-sm mb-2 block'>Invoice Number</label>
          <div className='flex gap-3'>
            <input
              type='text'
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder='Enter invoice number (e.g., INV-001)'
              className='flex-1 bg-[#111827] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500'
              onKeyPress={(e) => e.key === 'Enter' && searchInvoice()}
            />
            <button
              onClick={searchInvoice}
              disabled={loading}
              className='bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors'
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && !invoice && (
            <div className='flex items-center gap-2 mt-3 text-red-400 text-sm'>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Invoice Details */}
        {invoice && !refundSuccess && (
          <div className='space-y-6'>
            {/* Invoice Info */}
            <div className='bg-[#1F2937] p-6 rounded-xl border border-white/10'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h2 className='text-xl font-bold'>{invoice.invoiceNo}</h2>
                  <p className='text-gray-400 text-sm mt-1'>Customer: {invoice.customerName}</p>
                  <p className='text-gray-400 text-sm'>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div className='text-right'>
                  <p className='text-emerald-400 text-lg font-bold'>Rs. {invoice.grandTotal.toLocaleString()}</p>
                  <p className='text-gray-400 text-sm'>Total Amount</p>
                </div>
              </div>
            </div>

            {/* Items Selection */}
            <div className='bg-[#1F2937] p-6 rounded-xl border border-white/10'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Package size={20} />
                Select Items to Refund
              </h3>
              <div className='space-y-3'>
                {invoice.items.map((item, index) => (
                  <div key={index} className='bg-[#111827] p-4 rounded-lg border border-white/10'>
                    <div className='flex justify-between items-center mb-3'>
                      <div>
                        <p className='font-medium'>{item?.name}</p>
                        <p className='text-gray-400 text-sm'>
                          Original Qty: {item?.qty} | Original Price: Rs. {item?.price} | GST: Rs. {item?.gstAmount}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-emerald-400 font-medium'>Rs. {((item?.price || 0) * (item?.qty || 0)).toLocaleString()}</p>
                        <p className='text-gray-500 text-xs'>+ GST: Rs. {((item?.gstAmount || 0) * (item?.qty || 0)).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 mb-3'>
                      <label className='text-gray-400 text-sm'>Refund Quantity:</label>
                      <input
                        type='number'

                        max={item?.qty}
                        value={selectedItems[index] !== undefined ? selectedItems[index] : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            handleItemSelection(item?._id, index, 0)
                          } else {
                            const qty = Math.min(Math.max(0, parseInt(value) || 0), item?.qty)
                            handleItemSelection(item?._id, index, qty)
                          }
                        }}
                        className='w-24 bg-[#0F172A] border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500'
                      />
                      <span className='text-gray-500 text-sm'>/ {item?.qty}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <label className='text-gray-400 text-sm'>Refund Price:</label>
                      <input
                        type='number'
                        min='0'
                        max={item?.price}
                        value={customPrices[index] !== undefined ? customPrices[index] : item?.price}
                        onChange={(e) => handleCustomPriceChange(index, e.target.value, item?.price)}
                        className='w-24 bg-[#0F172A] border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500'
                      />
                      <span className='text-gray-500 text-sm'>/ Rs. {item?.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Summary */}
            <div className='bg-[#1F2937] p-6 rounded-xl border border-white/10'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <DollarSign size={20} />
                Refund Summary
              </h3>
              <div className='space-y-3'>
                <div className='flex justify-between items-center p-4 bg-[#111827] rounded-lg border border-white/10'>
                  <span className='text-gray-400'>Products Selected</span>
                  <span className='text-xl font-bold text-blue-400'>{getTotalSelectedProducts()}</span>
                </div>
                <div className='flex justify-between items-center p-4 bg-[#111827] rounded-lg border border-white/10'>
                  <span className='text-gray-400'>Total Refund Amount</span>
                  <span className='text-2xl font-bold text-emerald-400'>Rs. {refundAmount.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={processRefund}
                disabled={loading }
                className='mt-4 w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {loading ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {refundSuccess && (
          <div className='bg-[#1F2937] p-8 rounded-xl border border-green-500/50 text-center'>
            <div className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle size={32} className='text-green-500' />
            </div>
            <h2 className='text-2xl font-bold text-green-400 mb-2'>Refund Processed Successfully!</h2>
            <p className='text-gray-400 mb-2'>Stock has been updated and invoice has been modified</p>
            <p className='text-emerald-400 font-medium'>Refund Amount: Rs. {refundAmount.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Refund