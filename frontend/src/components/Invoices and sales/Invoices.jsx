import axios from 'axios'
import React, { useEffect, useState, useCallback } from 'react'
import InvoiceCard from '../Invoice/InvoiceCard'
import InvoiceDetail from '../Invoice/InvoiceDetail'
import { Search } from 'lucide-react'

const Invoices = () => {
    const [data,setdata]=useState(null)
    const [selected,setselected]=useState(null)
    const [searchTerm,setSearchTerm]=useState("")
    const getInvoices=useCallback(async()=>{
        try {
            const res=await axios.get("http://localhost:5555/getInvoices")
           setdata(res.data)
        } catch (error) {
            console.error("Error fetching invoices:", error)
            setdata([])
        }
    },[])
   useEffect(()=>{
    getInvoices()
   },[getInvoices])

   const filteredData = data?.filter(invoice =>
    invoice?.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase())
   )
   const rev=filteredData?.reduce((sum,acc)=>sum+(acc?.grandTotal || 0),0)
  
  return (
    <div className='p-5'>

      {/* Ledger summary card */}
      <div className='flex justify-between items-center bg-[#162032] border border-white/7 rounded-xl p-6 mb-4'>
        <div>
          <h2 className='text-white text-xl font-bold'>Sales & Invoicing Ledger</h2>
          <p className='text-gray-400 text-sm mt-1'>Complete chronological log of all generated invoices and payments.</p>
        </div>
        <div className='text-right'>
          <p className='text-gray-400 text-sm'>Total Recorded Revenue</p>
          <p className='text-[#1FE39A] text-2xl font-bold'>Rs. {rev?.toLocaleString() ?? 0}</p>
        </div>
      </div>

      {/* Search bar */}
      <div className='bg-[#020617] border border-white/7 rounded-xl p-4 mb-4'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
          <input
            type='text'
            placeholder='Search by invoice number...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-[#0F172A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
        </div>
      </div>

      <div className='grid bg-[#020617]  p-7 mb-4 grid-cols-6 text-white gap-4 items-center border rounded-xl border-white/8  mt-6'>
 <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Invoice ID</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Customer</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Date</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Amount</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Status</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Action</p>

                {filteredData?.map((k)=><InvoiceCard key={k?._id} data={k} onView={()=>setselected(k)} onRefresh={getInvoices}></InvoiceCard>)}
            </div>

      {selected && <InvoiceDetail data={selected} onClose={()=>setselected(null)} onRefresh={getInvoices} />}
    </div>
  )
}

export default Invoices