import axios from 'axios'
import React, { useEffect, useState, useCallback } from 'react'
import InvoiceCard from '../Invoice/InvoiceCard'
import InvoiceDetail from '../Invoice/InvoiceDetail'
import { Search } from 'lucide-react'

const Invoices = ({theme}) => {
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
    invoice?.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice?.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
   )
   const rev=filteredData?.reduce((sum,acc)=>sum+(acc?.grandTotal || 0),0)
  
  return (
    <div className='p-5'>

      {/* Ledger summary card */}
      <div className={`flex justify-between items-center border rounded-xl p-6 mb-4 ${theme === 'dark' ? 'bg-[#162032] border-white/7' : 'bg-white border-gray-200'}`}>
        <div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sales & Invoicing Ledger</h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Complete chronological log of all generated invoices and payments.</p>
        </div>
        <div className='text-right'>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Recorded Revenue</p>
          <p className='text-2xl font-bold text-[#1FE39A]'>Rs. {rev?.toLocaleString() ?? 0}</p>
        </div>
      </div>

      {/* Search bar */}
      <div className={`border rounded-xl p-4 mb-4 ${theme === 'dark' ? 'bg-[#020617] border-white/7' : 'bg-white border-gray-200'}`}>
        <div className='relative'>
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
          <input
            type='text'
            placeholder='Search by invoice number or customer name...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
        </div>
      </div>

      <div className={`grid p-7 mb-4 grid-cols-6 gap-4 items-center border rounded-xl mt-6 ${theme === 'dark' ? 'bg-[#020617] text-white border-white/8' : 'bg-white text-gray-900 border-gray-200'}`}>
 <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Invoice ID</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Customer</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Date</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Amount</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Status</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Action</p>

                {filteredData?.map((k)=><InvoiceCard key={k?._id} data={k} onView={()=>setselected(k)} onRefresh={getInvoices} theme={theme}></InvoiceCard>)}
            </div>

      {selected && <InvoiceDetail data={selected} onClose={()=>setselected(null)} onRefresh={getInvoices} theme={theme} />}
    </div>
  )
}

export default Invoices