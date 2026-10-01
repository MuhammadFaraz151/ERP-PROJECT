import { FileText, LayoutDashboard, BarChart3, TrendingUp, Users, AlertTriangle, Tags, RotateCcw, Settings, Box, ShoppingCart } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTab } from '../store and slices/tabSlice'

const Sidebar = ({error, theme}) => {
    const dispatch=useDispatch()
    const tab = useSelector((state) => state.tab.tab)
    const appSettings = useSelector((state) => state.infoo.appSettings) || {
      appName: 'BillStream Pro',
      storeName: 'Malik karyana Store',
      logo: null
    }
    const { user } = useSelector((state) => state.auth)

   const Links = [
    { icon: LayoutDashboard, name: "Dashboard" },
    { icon: Box, name: "Products" },
    { icon: FileText, name: "Invoice Generator" },
    { icon: Box, name: "Inventory" },
    { icon: Tags, name: "Categories" },
    { icon: Users, name: "Customers" },
    { icon: ShoppingCart, name: "Supplier" },
    { icon: BarChart3, name: "Sales & Reports" },
    { icon: RotateCcw, name: "Refund" },
    { icon: Settings, name: "Settings" },
];

  return (
<div className={`h-screen sticky top-0 w-[255px] flex flex-col justify-between border-r ${theme === 'dark' ? 'bg-[#020617] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'}`}> <div>
            <div className={`flex gap-3 items-center border-b p-6 pb-7 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                {appSettings.logo ? (
                    <img 
                        src={appSettings.logo} 
                        alt='App Logo' 
                        className='w-12 h-12 rounded-xl object-cover shadow-[0_0_20px_rgba(37,99,235,0.40)]'
                    />
                ) : (
                    <div className='bg-gradient-to-br from-[#4F6FEA] to-[#2563EB] p-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.40)]'>
                        <h1 className='text-lg font-bold text-white'>{appSettings.appName.substring(0, 2).toUpperCase()}</h1>
                    </div>
                )}

                <div className='flex flex-col'>
                    <p className={`font-bold text-[16px] ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{appSettings.appName}</p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-[#60A5FA]' : 'text-blue-600'}`}>{appSettings.storeName}</p>
                </div>
            </div>

            <div className='px-4 pt-4 flex flex-col gap-1'>

                {Links.map((k, i) => {
                    const Icon = k.icon;
                    const isActive = k.name === tab;
                    const isError = k.name === "Products" && error;

                    return (
                        <div
                            onClick={()=>dispatch(setTab(k.name))} 
                            key={i} 
                            className={
                                isActive 
                                    ? "flex cursor-pointer items-center bg-gradient-to-r from-[#2563EB] to-[#3B82F6] px-3 py-3 rounded-lg gap-3 shadow-[0_0_20px_rgba(37,99,235,0.35)] text-white"
                                    : `flex px-3 py-3 cursor-pointer rounded-lg items-center gap-3 transition-all duration-300 ${theme === 'dark' ? 'hover:bg-[#0F172A] hover:text-white text-[#94A3B8]' : 'hover:bg-gray-100 text-gray-600'} ${isError ? 'text-red-500' : ''}`
                            }
                        >
                            <Icon size={18} />
                            <h1 className='text-sm font-semibold'>{k.name}</h1>
                        </div>
                    );
                })}

            </div>
        </div>


        <div className={`border-t p-5 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>

            <div className={`flex gap-3 items-center border rounded-xl p-3 ${theme === 'dark' ? 'border-white/10 bg-[#111C30]' : 'border-gray-200 bg-gray-50'}`}>

                <div className='bg-[#172554] text-[#60A5FA] p-3 rounded-full'>
                    <h1 className='text-sm font-bold'>{user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}</h1>
                </div>

                <div className='flex flex-col'>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user?.username || 'Admin Executive'}</p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-[#94A3B8]' : 'text-gray-500'}`}>admin@billstream.pk</p>
                </div>

            </div>

        </div>

    </div>
  )
}

export default Sidebar