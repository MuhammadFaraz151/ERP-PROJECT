import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Package, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

const Refund = ({ theme }) => {
  const [invoiceNo, setInvoiceNo] = useState('')
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedItems, setSelectedItems] = useState({})
  const [customPrices, setCustomPrices] = useState({})
  const [refundAmount, setRefundAmount] = useState(0)
  const [manualRefundAmount, setManualRefundAmount] = useState('')
  const [isManualAmount, setIsManualAmount] = useState(false)
  const [refundSuccess, setRefundSuccess] = useState(false)
  const [allInvoices, setAllInvoices] = useState([])
  const [searchResults, setSearchResults] = useState([])

  const fetchAllInvoices = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/getInvoices")
      setAllInvoices(res.data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
    }
  }, [])

  useEffect(() => {
    fetchAllInvoices()
  }, [fetchAllInvoices])

  const handleInputChange = (e) => {
    const value = e.target.value
    setInvoiceNo(value)
    
    if (value.trim()) {
      const searchTerm = value.toLowerCase()
      const results = allInvoices.filter(invoice => 
        invoice?.invoiceNo?.toLowerCase().includes(searchTerm) ||
        invoice?.customer?.name?.toLowerCase().includes(searchTerm) ||
        invoice?.customerName?.toLowerCase().includes(searchTerm)
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const selectInvoice = (selectedInvoice) => {
    setInvoiceNo(selectedInvoice.invoiceNo)
    setSearchResults([])
    setError('')
    setManualRefundAmount('')
    setIsManualAmount(false)
    
    if (selectedInvoice?.remainingAmount > 0) {
      setError(
        `This invoice has a pending balance of Rs. ${selectedInvoice.remainingAmount.toLocaleString()}.`
      )
      setInvoice(null)
      return
    }

    setInvoice(selectedInvoice)
  }

  const handleItemSelection = (itemId, itemIndex, qty) => {
    setSelectedItems(prev => {
      const newSelectedItems = {
        ...prev,
        [itemIndex]: qty
      }
      
      // Reset to auto calculation when items change
      setIsManualAmount(false)
      setManualRefundAmount('')
      
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

  const handleManualRefundAmountChange = (value) => {
    setManualRefundAmount(value)
    const amount = Number(value) || 0
    setRefundAmount(amount)
    setIsManualAmount(true)

    // Calculate and update quantities based on the new total amount
    if (invoice && amount > 0) {
      const newSelectedItems = { ...selectedItems }
      let totalOriginalValue = 0

      // Calculate total value of currently selected items
      invoice.items.forEach((item, index) => {
        const currentQty = selectedItems[index] || 0
        if (currentQty > 0) {
          const customPrice = customPrices[index] || item.price
          totalOriginalValue += customPrice * currentQty
        }
      })

      // If there are selected items, calculate ratio and update quantities
      if (totalOriginalValue > 0) {
        const ratio = amount / totalOriginalValue

        invoice.items.forEach((item, index) => {
          const currentQty = selectedItems[index] || 0
          if (currentQty > 0) {
            const customPrice = customPrices[index] || item.price
            const newQty = Math.min(Math.round(currentQty * ratio * 10) / 10, item.qty)
            newSelectedItems[index] = newQty > 0 ? newQty : 0
          }
        })

        setSelectedItems(newSelectedItems)
      }
    }
  }

  const resetToAutoCalculation = () => {
    setIsManualAmount(false)
    setManualRefundAmount('')
    // Recalculate from selected items
    let total = 0
    if (invoice) {
      invoice.items.forEach((item, index) => {
        const refundQty = selectedItems[index] || 0
        if (refundQty > 0) {
          const customPrice = customPrices[index] || item.price
          const itemTotal = customPrice * refundQty
          total += itemTotal
        }
      })
    }
    setRefundAmount(total)
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

    // Reset to auto calculation when custom prices change
    setIsManualAmount(false)
    setManualRefundAmount('')

    setSelectedItems(prev => {
      // If no quantity is set for this item, automatically set it to original quantity
      const currentQty = prev[itemIndex] || 0
      const newSelectedItems = { ...prev }

      if (currentQty === 0 && price > 0) {
        // Auto-select the item with original quantity when price is entered
        const item = invoice?.items[itemIndex]
        if (item) {
          newSelectedItems[itemIndex] = item.qty
        }
      }

      let total = 0
      if (invoice) {
        invoice.items.forEach((item, index) => {
          const refundQty = newSelectedItems[index] || 0
          if (refundQty > 0) {
            const customPrice = index === itemIndex ? price : (customPrices[index] || item.price)
            const itemTotal = customPrice * refundQty
            total += itemTotal
          }
        })
      }
      setRefundAmount(total)
      return newSelectedItems
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
        refundAmount: isManualAmount ? Number(manualRefundAmount) : refundAmount,
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
        setManualRefundAmount('')
        setIsManualAmount(false)
        setRefundSuccess(false)
        setSearchResults([])
        fetchAllInvoices()
      }, 3000)
    } catch (error) {
      setError('Failed to process refund')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-6 min-h-screen ${theme === 'dark' ? 'bg-[#111827] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl font-bold mb-6'>Process Refund</h1>

        {/* Search Invoice */}
        <div className={`p-6 rounded-xl border mb-6 ${theme === 'dark' ? 'bg-[#1F2937] border-white/10' : 'bg-white border-gray-200'}`}>
          <label className={`text-sm mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Invoice Number or Customer Name</label>
          <div className='relative'>
            <input
              type='text'
              value={invoiceNo}
              onChange={handleInputChange}
              placeholder='Enter invoice number or customer name'
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 ${theme === 'dark' ? 'bg-[#111827] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
            {searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg max-h-60 overflow-y-auto z-10 ${theme === 'dark' ? 'bg-[#1F2937] border-white/20' : 'bg-white border-gray-200'}`}>
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    onClick={() => selectInvoice(result)}
                    className={`p-3 cursor-pointer border-b last:border-b-0 ${theme === 'dark' ? 'hover:bg-[#111827] border-white/10' : 'hover:bg-gray-50 border-gray-100'}`}
                  >
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{result.invoiceNo}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{result.customerName || result.customer?.name}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Rs. {result.grandTotal?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && (
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
            <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-[#1F2937] border-white/10' : 'bg-white border-gray-200'}`}>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h2 className='text-xl font-bold'>{invoice.invoiceNo}</h2>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Customer: {invoice.customerName}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div className='text-right'>
                  <p className='text-emerald-400 text-lg font-bold'>Rs. {invoice.grandTotal.toLocaleString()}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount</p>
                </div>
              </div>
            </div>

            {/* Items Selection */}
            <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-[#1F2937] border-white/10' : 'bg-white border-gray-200'}`}>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Package size={20} />
                Select Items to Refund
              </h3>
              <div className='space-y-3'>
                {invoice.items.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-[#111827] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <div className='flex justify-between items-center mb-3'>
                      <div>
                        <p className='font-medium'>{item?.name}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Original Qty: {item?.qty} | Original Price: Rs. {item?.price} | GST: Rs. {item?.gstAmount}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-emerald-400 font-medium'>Rs. {((item?.price || 0) * (item?.qty || 0)).toLocaleString()}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>+ GST: Rs. {((item?.gstAmount || 0) * (item?.qty || 0)).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 mb-3'>
                      <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Refund Quantity:</label>
                      <input
                        type='number'
                        step='0.1'
                        min='0'
                        max={item?.qty}
                        value={selectedItems[index] !== undefined ? selectedItems[index] : ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            handleItemSelection(item?._id, index, 0)
                          } else {
                            const qty = Math.min(Math.max(0, parseFloat(value) || 0), item?.qty)
                            handleItemSelection(item?._id, index, qty)
                          }
                        }}
                        className={`w-24 border rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/ {item?.qty}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Refund Price:</label>
                      <input
                        type='number'
                        min='0'
                        max={item?.price}
                        value={customPrices[index] !== undefined ? customPrices[index] : item?.price}
                        onChange={(e) => handleCustomPriceChange(index, e.target.value, item?.price)}
                        className={`w-24 border rounded px-3 py-2 focus:outline-none focus:border-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/ Rs. {item?.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Summary */}
            <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-[#1F2937] border-white/10' : 'bg-white border-gray-200'}`}>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <DollarSign size={20} />
                Refund Summary
              </h3>
              <div className='space-y-3'>
                <div className={`flex justify-between items-center p-4 rounded-lg border ${theme === 'dark' ? 'bg-[#111827] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Products Selected</span>
                  <span className='text-xl font-bold text-blue-400'>{getTotalSelectedProducts()}</span>
                </div>
                <div className={`flex justify-between items-center p-4 rounded-lg border ${theme === 'dark' ? 'bg-[#111827] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Refund Amount</span>
                  <div className='flex items-center gap-2'>
                    {isManualAmount ? (
                      <input
                        type='number'
                        min='0'
                        value={manualRefundAmount}
                        onChange={(e) => handleManualRefundAmountChange(e.target.value)}
                        className={`w-32 border rounded px-3 py-2 text-2xl font-bold text-emerald-400 focus:outline-none focus:border-blue-500 text-right ${theme === 'dark' ? 'bg-[#0F172A] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                    ) : (
                      <span className='text-2xl font-bold text-emerald-400'>Rs. {refundAmount.toLocaleString()}</span>
                    )}
                    <button
                      onClick={isManualAmount ? resetToAutoCalculation : () => setIsManualAmount(true)}
                      className='text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30 transition-colors'
                    >
                      {isManualAmount ? 'Auto' : 'Edit'}
                    </button>
                  </div>
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
          <div className={`p-8 rounded-xl border border-green-500/50 text-center ${theme === 'dark' ? 'bg-[#1F2937]' : 'bg-white'}`}>
            <div className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle size={32} className='text-green-500' />
            </div>
            <h2 className='text-2xl font-bold text-green-400 mb-2'>Refund Processed Successfully!</h2>
            <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Stock has been updated and invoice has been modified</p>
            <p className='text-emerald-400 font-medium'>Refund Amount: Rs. {refundAmount.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Refund