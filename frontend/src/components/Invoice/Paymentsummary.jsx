import { CheckCircle2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setinfoo } from '../../store and slices/infoSlice'

const PaymentSummary = ({info,setInvoice,customer, theme}) => {

  const dispatch=useDispatch()
  const[payment,setpayment]=useState("Bank Transfer")
  const [discount,setdiscount]=useState("")
  const [total,settotal]=useState(0)
  const [paidAmount,setPaidAmount]=useState("")
  const [error,seterror]=useState("")
  
  // Calculate total (selling prices)
  const totalWithGST = (info?.items || []).reduce((sum, item) => {
    const sellingPrice = Number(item.price) || 0;
    return sum + (sellingPrice * Number(item.qnt || 0));
  }, 0)

  // Calculate total GST amount
  const totalGSTAmount = (info?.items || []).reduce((sum, item) => {
    const unitCost = Number(item.unitCost) || Number(item.price) || 0;
    const gstPercentage = Number(item.gst) || 0;
    const gstAmount = unitCost * (gstPercentage / 100);
    return sum + (gstAmount * Number(item.qnt || 0));
  }, 0)

  // Calculate subtotal without GST (total price - total GST)
  const subtotalWithoutGST = totalWithGST - totalGSTAmount

  const subtotal = totalWithGST || 0
  
  // Auto-calculate remaining amount
  const remainingAmount = Math.max(0, (totalWithGST - Number(discount || 0)) - Number(paidAmount || 0))


  const updateItems=async()=>{
    try {
      const validItems = (info?.items || []).filter(k => k.productId && Number(k.qnt) > 0)
      if(validItems.length === 0) return false;
      const results = await Promise.all(validItems.map((k) =>
        axios.put("http://localhost:5555/updateStock",{
          _id:k.productId,
          stock:Number(k.qnt)
        })
      ));
      const allUpdated = results.every(res => res.status === 200)
      return allUpdated;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const businessUpdate=async()=>{
  try {
    await axios.put("http://localhost:5555/updateCustomer", {
      _id:customer._id,
      business: (Number(customer?.business) || 0) + total
    })
  } catch (error) {
    console.log(error)
  }
}

  const validate=()=>{
    if(!customer || !customer._id){
      seterror("Please select a customer first")
      return false;
    }
    if(!info?.items?.length || info.items.every(item => !item.productId)){
      seterror("Please add at least one product first")
      return false;
    }
    seterror("")
    return true;
  }

  const generateInvoice=async()=>{
    const cleanInfo = {
      ...info,
      items: (info?.items || []).filter(item => item.productId && Number(item.qnt) > 0)
    }
    const finalTotal = totalWithGST - Number(discount || 0);
    const finalRemaining = finalTotal - Number(paidAmount || 0);
    dispatch(setinfoo({info: cleanInfo, payment, subtotal: subtotalWithoutGST, totalGST: totalGSTAmount, total: finalTotal, discount: Number(discount || 0), paidAmount: Number(paidAmount || 0), remainingAmount: finalRemaining, date: new Date().toLocaleString()}))
    setInvoice(true)
    
    // Auto-save invoice to backend
    try {
      const res = await axios.post("http://localhost:5555/invoice", {
        customer: customer._id,
        customerName: customer.name,
        items: cleanInfo.items.map((item) => {
          const unitCost = Number(item.unitCost) || 0;
          const sellingPrice = Number(item.price) || 0;
          const gstPercentage = Number(item.gst) || 0;
          const gstAmount = unitCost * (gstPercentage / 100);
          
          return {
            productId: item.productId,
            product: item.product,
            name: item.product,
            productName: item.product,
            description: item.product,
            price: unitCost,
            sellingPrice: sellingPrice,
            unitCost: unitCost,
            qnt: Number(item.qnt) || 0,
            quantity: Number(item.qnt) || 0,
            qty: Number(item.qnt) || 0,
            gst: gstPercentage,
            gstAmount: gstAmount,
            total: sellingPrice * (Number(item.qnt) || 0),
          };
        }),
        subtotal: subtotalWithoutGST,
        totalGST: totalGSTAmount,
        discount: Number(discount || 0),
        grandTotal: totalWithGST - Number(discount || 0),
        paymentMethod: payment,
        paidAmount: Number(paidAmount || 0),
        remainingAmount: (totalWithGST - Number(discount || 0)) - Number(paidAmount || 0),
      });
      
      // Update Redux with the saved invoice data including real invoice number
      const finalTotal = totalWithGST - Number(discount || 0);
      const finalRemaining = finalTotal - Number(paidAmount || 0);
      dispatch(setinfoo({
        info: cleanInfo,
        payment,
        subtotal: subtotalWithoutGST,
        totalGST: totalGSTAmount,
        total: finalTotal,
        discount: Number(discount || 0),
        paidAmount: Number(paidAmount || 0),
        remainingAmount: finalRemaining,
        date: new Date().toLocaleString(),
        invoiceNo: res.data.invoice.invoiceNo,
        savedInvoice: res.data.invoice
      }));
    } catch (error) {
      console.log("Auto-save error:", error);
    }
  }

  const handleClick=async()=>{
    if(!validate()) return;

    const stockUpdated = await updateItems();
    if(!stockUpdated){
      seterror("Failed to update stock, invoice not generated")
      return;
    }

    generateInvoice();
  }

  useEffect(() => {
    settotal(totalWithGST - Number(discount || 0))
  }, [totalWithGST, discount])

  return (
    <div className={`invoice p-6 rounded-xl w-[420px] border ${theme === 'dark' ? 'bg-[#020617] text-white border-white/7' : 'bg-white text-gray-900 border-gray-200'}`}>
      <h1 className={`text-lg font-semibold border-b pb-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>Payment Summary</h1>

      {error && (
        <div className='mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
          {error}
        </div>
      )}

      <div className='flex justify-between items-center mt-4'>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Subtotal:</p>
        <p className='text-sm font-semibold'>{`Rs.${subtotal}`}</p>
      </div>

      <div className='flex justify-between items-center mt-4'>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total GST:</p>
        <p className='text-sm font-semibold text-purple-400'>{`Rs.${totalGSTAmount.toLocaleString()}`}</p>
      </div>



      <div className='flex justify-between items-center mt-4'>
        <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor='discount'>Discount (PKR):</label>
        <input
          id='discount'
          type='number'
          value={discount}
          onChange={(e)=>setdiscount(e.target.value)}
          placeholder='0'
          className={`p-2 w-[110px] text-right border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        />
      </div>

      <div className='flex flex-col mt-4'>
        <label className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor='paymentMethod'>Payment Method</label>
        <select
          id='paymentMethod'
          value={payment}
          onChange={(e)=>setpayment(e.target.value)}
          className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        >
          <option value='Bank Transfer'>Bank Transfer</option>
          <option value='Cash'>Cash</option>
          <option value='Card'>Card</option>
        </select>
      </div>

      <div className='flex justify-between items-center mt-4'>
        <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor='paidAmount'>Paid Payment (PKR):</label>
        <input
          id='paidAmount'
          type='number'
          value={paidAmount}
          onChange={(e)=>{
            const val = e.target.value
            if(val !== "" && Number(val) > total){
              setPaidAmount(total)
            } else {
              setPaidAmount(val)
            }
          }}
          placeholder='0'
          className={`p-2 w-[110px] text-right border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        />
      </div>

      <div className='flex justify-between items-center mt-4'>
        <label className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Remaining Payment (PKR):</label>
        <p className='text-sm font-semibold text-amber-400'>Rs.{remainingAmount.toLocaleString()}</p>
      </div>

      <div className={`flex justify-between items-center border-t mt-5 pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <p className='text-base font-semibold'>Grand Total:</p>
        <p className='text-lg font-bold text-[#1FE39A]'>Rs.{total}</p>
      </div>

      <button onClick={handleClick}
        type='button' className='flex no-print items-center justify-center gap-2 w-full mt-5 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700'
    >
        <CheckCircle2 size={18} />
        Generate Invoice
      </button>
    </div>
  )
}

export default PaymentSummary