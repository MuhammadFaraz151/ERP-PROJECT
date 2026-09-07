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
import Refund from './Refund'

const Home = ({invoice,setInvoice,onLogout}) => {
  const tab=useSelector((k)=>k.tab.tab)
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
    <div className="grid h-screen grid-cols-[255px_1fr]">

    <Sidebar error={error} />

    <main className="min-w-0 bg-[#111827] overflow-y-auto">
        <Navbar setInvoice={setInvoice} onLogout={onLogout} />
{tab === "Dashboard" && <Dashboard />}
{tab === "Products" && <Addproducts error={error} seterror={seterror}></Addproducts>}
{tab === "Inventory" && <Inventory />}
{tab === "Categories" && <Categories />}
{tab === "Customers" &&        <Customer></Customer>}
{tab === "Invoice Generator" &&        <Invoice setInvoice={setInvoice} invoice={invoice} ></Invoice>}
{tab === "Sales & Reports" &&        <Invoices></Invoices>}
{tab === "Refund" && <Refund />}
    </main>
    </div>
  )
}

export default Home