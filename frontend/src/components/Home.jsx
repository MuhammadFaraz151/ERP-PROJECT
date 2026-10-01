import React, { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Dashboard from './Dashboard'
import Addproducts from './Products/Addproducts'
import Inventory from './Inventory'
import Customer from './Customer'
import Invoice from './Invoice/Invoice'
import Invoices from './Invoices and sales/Invoices'
import Categories from './Categories'
import Seller from './Seller'
import Refund from './Refund'
import Settings from './Settings'
import { toggleTheme } from '../store and slices/themeSlice'

const Home = ({invoice,setInvoice,onLogout}) => {
  const tab=useSelector((k)=>k.tab.tab)
  const { theme } = useSelector((k)=>k.theme)
  const [error,seterror]=useState(false)

  const checkStock = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allInventory")
      const lowStock = res.data?.filter(k => k?.stock < 5) || []
      seterror(lowStock.length > 0)
    } catch (error) {
      console.error("Error checking stock:", error)
      seterror(false) // Set to false on error to avoid false positives
    }
  }, [])

  useEffect(() => {
    checkStock()
    const interval = setInterval(checkStock, 5000)
    return () => clearInterval(interval)
  }, [checkStock])

return (
    <div className={`grid h-screen grid-cols-[255px_1fr] ${theme === 'dark' ? 'bg-[#111827]' : 'bg-gray-100'}`}>

    <Sidebar error={error} theme={theme} />

    <main className={`min-w-0 overflow-y-auto ${theme === 'dark' ? 'bg-[#111827]' : 'bg-gray-100'}`}>
        <Navbar setInvoice={setInvoice} onLogout={onLogout} />
{tab === "Dashboard" && <Dashboard theme={theme} />}
{tab === "Products" && <Addproducts error={error} seterror={seterror} theme={theme}></Addproducts>}
{tab === "Inventory" && <Inventory theme={theme} />}
{tab === "Categories" && <Categories theme={theme} />}
{tab === "Customers" &&        <Customer theme={theme}></Customer>}
{tab === "Supplier" && <Seller theme={theme} />}
{tab === "Invoice Generator" &&        <Invoice setInvoice={setInvoice} invoice={invoice} theme={theme}></Invoice>}
{tab === "Sales & Reports" &&        <Invoices theme={theme}></Invoices>}
{tab === "Refund" && <Refund theme={theme} />}
{tab === "Settings" && <Settings theme={theme} />}
    </main>
    </div>
  )
}

export default Home