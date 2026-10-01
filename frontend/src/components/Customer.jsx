import axios from 'axios'
import { CheckCircle2, Plus, SquarePen, Trash2, X, Search } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'

const Customer = ({ theme }) => {
  const [isopen,setisopen]=useState(false)
  const [data,setdata]=useState(null)
  const [err,seterr]=useState(null)
  const [success,setsuccess]=useState(null)
  const [loading,setloading]=useState(false)
  const [editId,seteditId]=useState(null)
  const [searchQuery,setSearchQuery]=useState("")
  const [formData,setformData]=useState({
    name:"",
    phone:"",
    email:"",
    address:"",
  })

  const getCustomers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allCustomer")
      setdata(res.data)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setdata([])
    }
  }, [])

  useEffect(() => {
    getCustomers()
  }, [getCustomers])

  const addCustomer = async () => {
    if(!formData.name){
      seterr("Enter name")
      return
    }
    if(!formData.address){
      seterr("Enter address")
      return
    }
    setloading(true)
    try {
      await axios.post("http://localhost:5555/customer",{
        name:formData.name,
        phone:formData.phone ? Number(formData.phone) : undefined,
        email:formData.email || undefined,
        address:formData.address,
      })

      seterr(null)
      setisopen(false)
      setloading(false)
      setformData({
        name:"",
        phone:"",
        email:"",
        address:"",
      })
      setsuccess("Customer added successfully")
      getCustomers()
      setTimeout(()=>setsuccess(null),3000)
    } catch (error) {
      setloading(false)
      seterr(error?.response?.data?.message)
      setTimeout(()=>seterr(null),3000)
    }
  }

  const updateCustomer = async () => {
    if(!formData.name){
      seterr("Enter name")
      return
    }
    if(!formData.address){
      seterr("Enter address")
      return
    }
    setloading(true)
    try {
      await axios.put("http://localhost:5555/updateCustomer",{
        _id:editId,
        name:formData.name,
        phone:formData.phone ? Number(formData.phone) : undefined,
        email:formData.email || undefined,
        address:formData.address,
      })

      seterr(null)
      setisopen(false)
      setloading(false)
      seteditId(null)
      setformData({
        name:"",
        phone:"",
        email:"",
        address:"",
      })
      setsuccess("Customer updated successfully")
      getCustomers()
      setTimeout(()=>setsuccess(null),3000)
    } catch (error) {
      setloading(false)
      seterr(error?.response?.data?.message)
      setTimeout(()=>seterr(null),3000)
    }
  }

  const handleForm=(e)=>{
    e.preventDefault()
    if(editId){
      updateCustomer()
    }else{
      addCustomer()
    }
  }

  const openEdit = (k) => {
    seteditId(k._id)
    setformData({
      name:k.name,
      phone:k.phone || "",
      email:k.email || "",
      address:k.address,
    })
    seterr(null)
    setisopen(true)
  }

  const closeForm = () => {
    setisopen(false)
    seteditId(null)
    seterr(null)
    setformData({
      name:"",
      phone:"",
      email:"",
      address:"",
    })
  }

  const delCustomer = async (id) => {
    try {
      await axios.delete("http://localhost:5555/deleteCustomer", {
        data: {
          _id: id,
        },
      })

      setsuccess("Customer deleted successfully")
      getCustomers()
      setTimeout(() => setsuccess(null), 3000)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={`w-full h-full flex-col p-7 relative ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>

      {success!==null?<div className='absolute z-50 left-[400px]  flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-lg px-4 py-3 text-sm text-green-400 shadow-lg z-50'><CheckCircle2 size={16} /><p>{success}</p></div>:null}

         <div className={`flex border   justify-between p-7 rounded-xl ${theme === 'dark' ? 'bg-[#162032] border-white/7 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              <div>
                  <h1 className='text-2xl tracking-wider font-bold '>Customer Directory</h1>
                  <p className='text-sm'>Manage corporate and retail clients..</p>
              </div>
              <div className='flex gap-3 items-center'>
                  <div className='relative'>
                      <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type='text'
                        placeholder='Search by name...'
                        value={searchQuery}
                        onChange={(e)=>setSearchQuery(e.target.value)}
                        className={`pl-10 p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                      />
                  </div>
                  <div onClick={()=>setisopen(true)} className={`flex gap-3 items-center  border  p-3 rounded-xl bg-[#3B82F6] ${theme === 'dark' ? 'border-white/10 text-white' : 'border-blue-600 text-white'}`}>
                      <Plus />
                      <button  className=''>Add Customer</button>

                  </div>
              </div>
           </div>
        {/* Customers */}
             <div className={`grid   mb-4 grid-cols-7  border rounded-xl p-5 mt-6 ${theme === 'dark' ? 'border-white/8' : 'border-gray-200'}`}>

  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Name</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Phone</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Email</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Address</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Total Business</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Remaining Amount</p>
  <p className={`pb-3 text-sm font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Actions</p>

    {data?.filter((k)=>k?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((k)=>{
     const id = k?._id?.slice(20, );
        return(
            <React.Fragment key={k._id}>


      <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-900 border-gray-100'}`}>   {k?.name}</p>

      <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>    {k?.phone || "-"} </p>

      <p className={`py-4 text-sm border-b truncate ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>    {k?.email || "-"} </p>

      <p className={`py-4 text-sm text-[#1FE39A] border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>  {k?.address} </p>
<p className={`py-4 text-sm text-[#1FE39A] border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
  {Math.round(k?.business) || 0}
</p>
<p className={`py-4 text-sm text-amber-400 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
  {Math.round(k?.remainingAmount) || 0}
</p>
<p className={`py-4 text-sm border-b flex items-center gap-3 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
  <SquarePen onClick={()=>openEdit(k)} size={16} className='cursor-pointer text-blue-400 hover:text-blue-300' />
  <Trash2 onClick={()=>delCustomer(k._id)} size={16} className='cursor-pointer text-red-400 hover:text-red-300' />
</p>

            </React.Fragment>
        )
    })}

     </div>
      {/* form */}

  {isopen===true &&(
        <div className='h-full w-full flex items-center justify-center bg-black/70 fixed inset-0'>
  <form onSubmit={handleForm} className={`p-6 rounded-xl mt-20 ml-30 w-[420px] border ${theme === 'dark' ? 'bg-[#020617] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
    <div className={`flex justify-between items-center border-b pb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <h1 className='text-lg font-semibold'>{editId?"Edit Customer":"Add New Customer"}</h1>
      <button onClick={closeForm} type='button' className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}>
        <X size={18} />
      </button>
    </div>

    <div className='flex flex-col gap-1'>
      <div className='flex flex-col justify-start mt-4'>
        <label className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor='name'>Company / Customer Name</label>
        <input value={formData.name} onChange={(e)=>setformData({
          ...formData,
          name:e.target.value
        })} id='name' type='text' className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
      </div>

      <div className='flex flex-col justify-start mt-4'>
        <label className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor='phone'>Phone (Optional)</label>
        <input value={formData.phone} onChange={(e)=>setformData({
          ...formData,
          phone:e.target.value
        })} id='phone' type='number' className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
      </div>

      <div className='flex flex-col justify-start mt-4'>
        <label className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor='email'>Email (Optional)</label>
        <input value={formData.email} onChange={(e)=>setformData({
          ...formData,
          email:e.target.value
        })} id='email' type='text' className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
      </div>

      <div className='flex flex-col justify-start mt-4'>
        <label className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} htmlFor='address'>Address</label>
        <input value={formData.address} onChange={(e)=>setformData({
          ...formData,
          address:e.target.value
        })} id='address' type='text' className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
      </div>

      {err!==null?<div className='flex items-center gap-2 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2 mt-3'><p className='text-sm text-red-400'>{err}</p></div>:null}
    </div>

    <div className='flex justify-end gap-3 mt-6'>
      <button onClick={closeForm} type='button' disabled={loading} className={`px-4 py-2 rounded-lg hover:disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-[#1E293B] text-white hover:bg-[#334155]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>Cancel</button>
      <button type='submit' disabled={loading} className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'>{loading?"Saving":editId?"Update Customer":"Save Customer"}</button>
    </div>
  </form>
</div>
  )}
    </div>

  )
}

export default Customer