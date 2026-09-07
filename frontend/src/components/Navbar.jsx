import { Plus, LogOut, User } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTab } from '../store and slices/tabSlice'

const Navbar = ({setInvoice,onLogout}) => {
  const tab=useSelector((k)=>(k.tab.tab))
  const { user } = useSelector((k)=>(k.auth))
  const dispatch=useDispatch()
  
  const handleLogout = () => {
    dispatch({ type: 'auth/logout' })
    if (onLogout) onLogout()
  }
  
  return (
    <div  className={` h-[64px] bg-[#0B1220] border-b border-white/10 flex items-center justify-between px-7`}>
      
      <div className='flex items-center gap-5'>
        <div className='border border-[#2563EB]/30 bg-[#2563EB]/10 px-3 py-1 rounded-full'>
          <p className='text-[#93C5FD] text-[11px] font-semibold tracking-wider'>
            PROFESSIONAL CORPORATE ERP
          </p>
        </div>

        <h1 className='text-white text-lg font-semibold'>
         {tab}
        </h1>
      </div>

      <div className='flex items-center gap-4'>
        {user && (
          <div className='flex items-center gap-2 text-gray-400'>
            <User size={18} />
            <span className='text-sm'>{user.username}</span>
          </div>
        )}
        <button onClick={()=>{dispatch(setTab("Invoice Generator"));setInvoice(false)}} className='flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_25px_rgba(37,99,235,0.55)] transition-all duration-300'>
          <Plus size={18} />
          New Invoice
        </button>
        <button onClick={handleLogout} className='flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300'>
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  )
}

export default Navbar