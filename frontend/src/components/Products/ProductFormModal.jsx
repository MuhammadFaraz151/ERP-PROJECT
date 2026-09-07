import { AlertCircle, Loader2, X } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const ProductFormModal = ({title, formData, SetformData, err, loading, onClose, onSubmit}) => {
  const [query,setquery]=useState("")
  const [suggestion,setsuggestion]=useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5555/allCategories")
        setCategories(res.data.map(cat => cat.name))
      } catch (error) {
        console.log("Error fetching categories:", error)
        setCategories(["snacks", "drinks", "cakes", "creams"])
      }
    }
    fetchCategories()
  }, [])

  const filtered=categories.filter((k)=>
        k.includes(query.toLowerCase())
  )

  const handleSuggestion=(e)=>{
    const value = e.target.value
    setquery(value)
    
    setsuggestion(value.length > 0)
  }

  const handleCat=(k)=>{
    SetformData({
      ...formData,
      category:k
    })
    setquery(k)
    setsuggestion(false)
  }

  const gstAmount = (Number(formData.unitCost || 0) * Number(formData.GST || 0)) / 100
  const totalCostWithGST = Number(formData.unitCost || 0) + gstAmount
  const profit = Number(formData.sellingPrice || 0) - totalCostWithGST

  return (
    <div className='h-full w-full  text-white flex items-center justify-center bg-black/70 fixed inset-0'>
  <form onSubmit={onSubmit} className='bg-[#020617] p-6 rounded-xl w-[420px] border border-white/10 shadow-xl shadow-black/40'>
    <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
      <h1 className='text-lg font-semibold'>{title}</h1>
      <button onClick={onClose} type='button' className='text-gray-400 hover:text-white'>
        <X size={18} />
      </button>
    </div>

    <div className='grid relative grid-cols-2 gap-4'>
      <div className='flex flex-col justify-start mt-4 col-span-2'>
        <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='name'>Product Name</label>
        <input value={formData.name} onChange={(e)=>SetformData({
          ...formData,
          name:e.target.value
        })} id='name' type='text' className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500' />
      </div>

      <div className='flex flex-col justify-start mt-4 col-span-2 relative '>
        <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='category'>Category</label>
        <input  value={formData.category} onChange={(e)=>{SetformData({
          ...formData,
          category:e.target.value});handleSuggestion(e)}} id='category' type='text' className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500' />
      {suggestion && (
  <ul className="bg-[#0F172A] text-white flex-col border border-blue/80 gap-3 p-4 rounded-xl absolute top-18 w-full z-10">
    {filtered.length > 0 ? (
      filtered.map((k,i) => (
        <li onMouseDown={(e)=>e.preventDefault()} onClick={()=>handleCat(k)} className="cursor-pointer" key={i}>{k}</li>
      ))
    ) : (
      <li className="text-gray-500 text-sm">No matching categories</li>
    )}
  </ul>
)}

      </div>

         <div className='flex flex-col justify-start mt-4'>
        <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='price'>Selling Price</label>
        <input value={formData.sellingPrice} onChange={(e)=>SetformData({
          ...formData,
          sellingPrice:e.target.value})} id='price' type='text' className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500' />
      </div>

        
           <div className='flex flex-col justify-start mt-4'>
        <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='cost'>Unit Price</label>
        <input value={formData.unitCost} onChange={(e)=>SetformData({
          ...formData,
          unitCost:e.target.value})} id='cost' type='text' className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500' />
      </div>

      <div className='flex flex-col justify-start mt-4'>
        <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='stock'>Stock</label>
        <input   min="1"
 value={formData.stock} onChange={(e)=>SetformData({
          ...formData,
          stock:e.target.value})} id='stock' type='text' className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500' />
      </div>

        <div className='flex flex-col justify-start mt-4'>
        <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='stock'>GST%</label>
        <input value={formData.GST} onChange={(e)=>SetformData({
          ...formData,
          GST:e.target.value})} id='stock' type='text' className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500' />
      </div>

        <div className='flex flex-col justify-start mt-4'>
        <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='expiryDate'>Expiry Date</label>
        <input 
          value={formData.expiryDate} 
          onChange={(e)=>SetformData({
            ...formData,
            expiryDate:e.target.value
          })} 
          id='expiryDate' 
          type='date' 
          className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white' 
        />
      </div>

      {formData.GST !== "" && formData.unitCost !== "" && (
        <div className='col-span-2 absolute top-98 left-50 w-fit flex flex-col gap-1 bg-[#0F172A] border border-gray-700 rounded-lg px-3 py-2 mt-4 text-sm'>
          <div className='flex justify-between text-gray-400'>
            <span className='mr-3'>GST</span>
            <span className='text-white'>Rs. {gstAmount.toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-400 mr-5'>Profit</span>
            <span className={profit >= 0 ? 'text-[#1FE39A]' : 'text-red-500'}>Rs. {profit.toFixed(2)}</span>
          </div>
        </div>
      )}


    </div>
    

    <div className='flex justify-end gap-3 mt-6 items-center'>
            {err!==null?<div className='flex items-center gap-2 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2 mr-auto'><AlertCircle size={16} className='text-red-500  shrink-0' /><p className='text-sm  text-red-400'>{err}</p></div>:null}

      <button onClick={onClose} type='button' disabled={loading} className='px-4 py-2 rounded-lg bg-[#1E293B] text-white hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed'>Cancel</button>
      <button type='submit' disabled={loading} className='flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'>{loading?<Loader2 size={16} className='animate-spin' />:null}{loading?"Saving":"Save Product"}</button>
    </div>
  </form>
</div>
  )
}

export default ProductFormModal