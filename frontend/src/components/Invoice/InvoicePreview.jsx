import { Printer, Plus } from 'lucide-react'
import { useSelector } from 'react-redux'
import storeLogo from '../../assets/store-log.png';
import './InvoicePreview.css'
import img from '../../assets/paid-stamp.png'

const InvoicePreview = ({customer,setInvoice}) => {
  const data=useSelector((k)=>k.infoo.infoo) || {}
  const info = data.info || {}
  const items = (info.items || []).filter(item => item.productId)
  
  // Calculate total GST from items
  const calculatedTotalGST = items.reduce((sum, item) => {
    const unitCost = Number(item?.unitCost) || Number(item?.price || 0);
    const gstPercentage = Number(item?.gst) || 0;
    const gstAmount = unitCost * (gstPercentage / 100);
    return sum + (gstAmount * (item?.qnt || 0));
  }, 0);  
if (!customer || items.length === 0) {
    return (
      <div  className='bg-[#020617]  flex justify-between items-center ml-40 border border-white/10 rounded-xl p-6 text-white w-full max-w-3xl'>
        <p className='text-sm text-gray-400'>
          Please select a customer and add at least one item to generate the invoice.
        </p>
        <button onClick={()=>setInvoice(false)}  type='button' className='flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700'>
          <Plus size={16} />
          Create Invoice
        </button>
      </div>
    )
  }

  const handlePrint=()=>{
    // Add print-specific styles to hide browser headers
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @page {
        margin: 0;
        size: auto;
      }
      @media print {
        body {
          margin: 0;
        }
      }
    `;
    document.head.appendChild(printStyle);
    
    window.print();
    
    // Remove the print style after printing
    setTimeout(() => {
      document.head.removeChild(printStyle);
    }, 1000);
  }

  return (
    <div className='printable-invoice bg-[#020617] ml-40 border border-white/10 rounded-xl p-6 text-white w-full max-w-3xl relative'>

      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-4'>
          <div className='w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20'>
            <img 
              src={storeLogo}
              alt='MALIK KARYANA STORE Logo' 
              className='w-full h-full object-cover'
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-2xl">🏪</span>';
              }}
            />
          </div>
          <div>
            <h2 className='text-xl font-bold text-white'>MALIK KARYANA STORE</h2>
            <p className='text-sm text-gray-400 mt-1'>QUALITY PRODUCTS • BETTER PRICES</p>
            <p className='text-sm text-blue-400 mt-1'>📞 030067937122</p>
            <p className='text-sm text-gray-400 mt-1'>📍 Lahore Road Sargodha</p>
          </div>
        </div>
        <div className='text-right'>
          <h1 className='text-xl font-bold'>{data.invoiceNo || "Generating..."}</h1>
        </div>
      </div>

    

      <div className='flex justify-between items-start bg-[#0A1022] border border-white/10 rounded-lg p-4 mt-5'>
        <div>
          <p className='text-sm text-gray-400'>Billed To: {customer?.name || "-"}</p>
          <p className='font-semibold mt-1'></p>
          <p className='text-sm text-gray-400 mt-1'>Payment via: {data.payment || "-"}</p>
          <p className='text-sm text-gray-400 mt-1'>Date: {data.date || "-"}</p>
        </div>
        <div className='text-right'>
          <p className='text-sm text-gray-400'>Status:</p>
          {Number(data.remainingAmount) > 0 ? (
            <p className='font-semibold text-amber-400 mt-1'>Pending</p>
          ) : (
            <p className='font-semibold text-green-400 mt-1'>Paid</p>
          )}
        </div>
      </div>

      <div className='mt-6'>
        <div className='grid grid-cols-5 pb-3 border-b border-gray-700 text-xs font-semibold text-gray-400'>
          <p>ITEM DESCRIPTION</p>
          <p className='text-right'>QTY</p>
          <p className='text-right'>SELLING PRICE</p>
          <p className='text-right'>GST AMOUNT</p>
          <p className='text-right'>TOTAL</p>
        </div>

        {items.length > 0 ? (
          items.map((item) => {
            const unitCost = Number(item?.unitCost) || Number(item?.price || 0);
            const sellingPrice = Number(item?.sellingPrice) || Number(item?.price || 0);
            const gstPercentage = Number(item?.gst) || 0;
            const gstAmount = unitCost * (gstPercentage / 100);
            const totalPrice = sellingPrice * (item?.qnt || 0);
            const totalGSTAmount = gstAmount * (item?.qnt || 0);

            return (
              <div key={item?.id} className='grid grid-cols-5 py-3 border-b border-gray-800 text-sm'>
                <p className='font-medium'>{item?.product || "-"}</p>
                <p className='text-right'>{item?.qnt || 0}</p>
                <p className='text-right'>Rs. {sellingPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                <p className='text-right text-purple-400'>{gstAmount > 0 ? `Rs. ${totalGSTAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}</p>
                <p className='text-right font-semibold'>
                  Rs. {totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            );
          })
        ) : (
          <p className='text-sm text-gray-500 py-4'>No items added</p>
        )}

        <div className='flex flex-col items-end mt-5 gap-2'>
          <div className='flex justify-between w-64 text-sm text-gray-300'>
            <p>Subtotal (without GST):</p>
            <p>Rs. {Number(data.subtotal || (Number(data.total ?? info.totalPrice ?? 0) - Number(data.totalGST || calculatedTotalGST || 0))).toLocaleString()}</p>
          </div>
          <div className='flex justify-between w-64 text-sm text-purple-400'>
            <p>Total GST:</p>
            <p>Rs. {Number(data.totalGST || calculatedTotalGST || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
          <div className='flex justify-between w-64 text-sm text-green-400'>
            <p>Discount:</p>
            <p>-Rs. {Number(data.discount || 0).toLocaleString()}</p>
          </div>
          <div className='flex justify-between w-64 border-t border-gray-700 pt-3 mt-1'>
            <p className='text-base font-semibold'>Grand Total:</p>
            <p className='text-lg font-bold text-[#1FE39A]'>Rs. {Number(data.total ?? info.totalPrice ?? 0).toLocaleString()}</p>
          </div>
          <div className='flex justify-between w-64 mt-2'>
            <p className='text-sm font-semibold text-blue-400'>Paid Amount:</p>
            <p className='text-sm font-bold text-blue-400'>Rs. {Number(data.paidAmount || 0).toLocaleString()}</p>
          </div>
          {Number(data.remainingAmount) > 0 && (
            <div className='flex justify-between w-64 mt-2'>
              <p className='text-sm font-semibold text-amber-400'>Remaining Amount:</p>
              <p className='text-sm font-bold text-amber-400'>Rs. {Number(data.remainingAmount).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-end gap-3 mt-6 no-print'>
        <button onClick={handlePrint}  type='button' className='flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] text-white hover:bg-[#334155]'>
          <Printer size={16} />
          Print / PDF
        </button>
      </div>
      
      {/* Stamp */}
      {Number(data.remainingAmount) === 0 ? (
        <div className='invoice-stamp stamp-paid'>
          <img src={img} alt='PAID' className='w-full h-full object-contain' onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('fallback');
            e.target.parentElement.innerHTML = 'PAID';
          }} />
        </div>
      ) : (
        <div className='invoice-stamp stamp-pending fallback'>PENDING</div>
      )}
    </div>
  )
}

export default InvoicePreview