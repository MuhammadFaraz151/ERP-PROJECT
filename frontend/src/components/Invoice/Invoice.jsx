import React, { useState } from 'react'
import Customerslist from './Customerslist'
import Productslist from './Productslist'
import PaymentSummary from './Paymentsummary'
import InvoicePreview from './InvoicePreview'

const Invoice = ({invoice,setInvoice}) => {
    const [customer,setcustomer]=useState(null)
    const[info,setinfo]=useState({product:"",price:"",qnt:1,totalPrice:""})
   
    const[payment,setpayment]=useState(null)
   
    
  
   
  return (
  <div>
     {invoice?<InvoicePreview setInvoice={setInvoice} customer={customer}></InvoicePreview>: <div className='bg-[#0F172A] h-full grid grid-cols-5 gap-4 p-7'>
        <div className='flex flex-col col-span-3 gap-4'>
            <Customerslist customer={customer} setcustomer={setcustomer} ></Customerslist>
            <Productslist info={info} setinfo={setinfo}></Productslist>
        </div>
        <div>
            <PaymentSummary customer={customer}  setInvoice={setInvoice} info={info} ></PaymentSummary>
        </div>
     </div>}
    </div>
  )
}

export default Invoice
