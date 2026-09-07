import { Box, FileText, LayoutDashboard, ShoppingBag, BarChart3, TrendingUp, Users, AlertTriangle, Tags, RotateCcw } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTab } from '../store and slices/tabSlice'

const Sidebar = ({error}) => {
    const dispatch=useDispatch()
    const tab = useSelector((state) => state.tab.tab) 

   const Links = [
    { icon: LayoutDashboard, name: "Dashboard" },
    { icon: FileText, name: "Invoice Generator" },
    { icon: Box, name: "Inventory" },
    { icon: Tags, name: "Categories" },
    { icon: Users, name: "Customers" },
    { icon: BarChart3, name: "Sales & Reports" },
    { icon: RotateCcw, name: "Refund" },
];

  return (
<div className="h-screen sticky top-0 w-[255px] bg-[#020617] flex flex-col justify-between text-white border-r border-white/10"> <div>
            <div className='flex gap-3 items-center border-b border-white/10 p-6 pb-7'>
                <div className='bg-gradient-to-br from-[#4F6FEA] to-[#2563EB] p-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.40)]'>
                    <h1 className='text-lg font-bold'>MK</h1>
                </div>

                <div className='flex flex-col'>
                    <p className='font-bold text-[16px]'>BillStream Pro</p>
                    <p className='text-[#60A5FA] text-xs mt-1'>Malik karyana Store</p>
                </div>
            </div>

            <div className='px-4 pt-4 flex flex-col gap-1'>

                {Links.slice(0,2).map((k, i) => {
                    const Icon = k.icon;

                    return (
                        <div
                            onClick={()=>dispatch(setTab(k.name))} key={i} className={`${k.name===tab
                            ?"flex cursor-pointer items-center bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-3 py-3 rounded-lg gap-3 shadow-[0_0_20px_rgba(37,99,235,0.35)] text-white"
                            :"flex px-3 py-3 cursor-pointer rounded-lg items-center gap-3 text-[#94A3B8] hover:bg-[#0F172A] hover:text-white transition-all duration-300"}`}>
                            <Icon size={18} />
                            <h1 className='text-sm font-semibold'>{k.name}</h1>
                        </div>
                    );
                })}

                <div
                    onClick={()=>dispatch(setTab("Products"))}
                    className={`${"Products"===tab
                    ?"flex cursor-pointer items-center bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-3 py-3 rounded-lg gap-3 shadow-[0_0_20px_rgba(37,99,235,0.35)] text-white"
                    :`flex px-3 py-3 cursor-pointer rounded-lg items-center gap-3 hover:bg-[#0F172A] hover:text-white transition-all duration-300 ${error ? 'text-red-500' : 'text-[#94A3B8]'}`}`}>
                    <ShoppingBag size={18} />
                    <h1 className='text-sm font-semibold'>Products</h1>
                </div>

                {Links.slice(2).map((k, i) => {
                    const Icon = k.icon;

                    return (
                        <div
                            onClick={()=>dispatch(setTab(k.name))} key={k.name} className={`${k.name===tab
                            ?"flex cursor-pointer items-center bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-3 py-3 rounded-lg gap-3 shadow-[0_0_20px_rgba(37,99,235,0.35)] text-white"
                            :"flex px-3 py-3 cursor-pointer rounded-lg items-center gap-3 text-[#94A3B8] hover:bg-[#0F172A] hover:text-white transition-all duration-300"}`}>
                            <Icon size={18} />
                            <h1 className='text-sm font-semibold'>{k.name}</h1>
                        </div>
                    );
                })}

            </div>
        </div>


        <div className='border-t border-white/10 p-5'>

            <div className='flex gap-3 items-center border border-white/10 rounded-xl bg-[#111C30] p-3'>

                <div className='bg-[#172554] text-[#60A5FA] p-3 rounded-full'>
                    <h1 className='text-sm font-bold'>AD</h1>
                </div>

                <div className='flex flex-col'>
                    <p className='text-sm font-semibold'>Admin Executive</p>
                    <p className='text-[#94A3B8] text-xs mt-1'>admin@billstream.pk</p>
                </div>

            </div>

        </div>

    </div>
  )
}

export default Sidebar