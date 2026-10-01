import React, { useEffect, useState, useCallback } from 'react'
import {
  DollarSign,
  FileText,
  Package,
  TriangleAlert,
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  Wallet,
  X,
  Download,
} from "lucide-react";
import { setTab } from '../store and slices/tabSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import InvoiceCard from './Invoice/InvoiceCard';
import InventoryCard from '../components/InventoryCard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const Dashboard = ({ theme }) => {
  const[data,setdata]=useState({products:null,invocies:null})
  const dispatch=useDispatch()
  const [selectedProfitPeriod, setSelectedProfitPeriod] = useState(null)
  const [showProfitModal, setShowProfitModal] = useState(false)
  const [showCashModal, setShowCashModal] = useState(false)
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterMode, setFilterMode] = useState('profit')


const getInvoices = useCallback(async () => {
  try {
    const res = await axios.get("http://localhost:5555/getInvoices")
    setdata(prev => ({...prev, invocies: res.data}))
  } catch (error) {
    console.error("Error fetching invoices:", error)
    setdata(prev => ({...prev, invocies: []}))
  }
}, [])

const getProducts = useCallback(async () => {
  try {
    const res = await axios.get("http://localhost:5555/allInventory");
    setdata(prev => ({...prev, products: res.data}));
  } catch (error) {
    console.error("Error fetching products:", error);
    setdata(prev => ({...prev, products: []}));
  }
}, []);

useEffect(()=>{
  getInvoices();
  getProducts();
},[getInvoices, getProducts])

// NOTE: grandTotal on the invoice document already reflects the post-refund
// amount (it's recalculated/adjusted whenever a refund is processed), so we
// use it directly everywhere as "net revenue" without any hasRefund check.
const totalRevenue = data?.invocies?.reduce((sum, inv) => sum + (inv?.grandTotal || 0), 0) ?? 0;
const lowStockCount = data?.products?.filter((p) => p?.stock < 10).length ?? 0;

// Calculate total pending amounts from invoices
const totalPendingAmount = data?.invocies?.reduce((sum, inv) => sum + (inv?.remainingAmount > 0 ? inv?.remainingAmount : 0), 0) ?? 0;
const pendingInvoicesCount = data?.invocies?.filter(inv => inv?.remainingAmount > 0).length ?? 0;

// Calculate total cash in hand from cash payments
const cashInvoices = data?.invocies?.filter(inv => inv?.paymentMethod?.toLowerCase() === 'cash') ?? [];
const totalCashInHand = cashInvoices.reduce((sum, inv) => sum + (inv?.paidAmount || 0), 0) ?? 0;

// Calculate expired products based on expiry date (less than 7 days remaining)
const expiredProducts = data?.products?.filter((p) => {
  if (!p?.expiryDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(p.expiryDate);
  expiryDate.setHours(0, 0, 0, 0);

  // Calculate days difference
  const daysDifference = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

  // Show as expired if less than 7 days remaining
  return daysDifference < 7;
}) ?? [];

// Build a map of { productId: totalRefundedQty } for an invoice from its
// refunds array. Handles invoices with zero, one, or multiple refund events,
// and partial refunds (some items/qty refunded, others not).
const getRefundedQtyMap = (invoice) => {
  const map = {};
  if (!invoice?.hasRefund || !Array.isArray(invoice?.refunds)) return map;

  invoice.refunds.forEach(refund => {
    refund?.items?.forEach(ri => {
      const key = ri?.productId?.toString?.() ?? ri?.productId;
      if (!key) return;
      map[key] = (map[key] || 0) + (Number(ri?.refundedQty) || 0);
    });
  });

  return map;
};

// Calculate profit for a single invoice, correctly netting out ONLY the
// refunded quantity rather than zeroing the whole invoice.
//
// IMPORTANT: an invoice can have MULTIPLE line items with the SAME
// productId (e.g. the same product added to the cart 12 separate times,
// each as its own qty:1 line, instead of one line with qty:12). A refund
// map keyed by productId alone would re-apply the FULL refunded quantity
// to every one of those duplicate lines, zeroing out far more stock than
// was actually refunded. To fix this, we treat the refunded qty as a
// shared pool PER PRODUCT that gets consumed as we walk through the
// invoice's items in order, so only as many units as were truly refunded
// get excluded — not the whole product's line count.
const calculateInvoiceProfit = (invoice) => {
  if (!invoice?.items || !data?.products) return 0;

  // Mutable pool: {productId: refundedQty remaining to be "consumed"}
  const refundPool = getRefundedQtyMap(invoice);

  let totalCost = 0;
  let totalRevenue = 0;

  invoice.items.forEach(item => {
    if (!item) return;

    const itemProductId = item.productId?.toString?.() ?? item.productId;
    const originalQty = Number(item?.qty) || 0;

    // Consume from the shared pool for this product, capped at this
    // line's own quantity, then decrement the pool so the next line with
    // the same productId doesn't get charged the same refund again.
    const availableRefund = refundPool[itemProductId] || 0;
    const refundedForThisItem = Math.min(originalQty, availableRefund);
    if (itemProductId in refundPool) {
      refundPool[itemProductId] = availableRefund - refundedForThisItem;
    }
    const netQty = originalQty - refundedForThisItem;

    // Fully refunded item contributes nothing to cost or revenue.
    if (netQty === 0) return;

    // Try to find product by ID, handle both string and ObjectId
    const product = data.products.find(p => {
      if (!p) return false;
      return p._id === item.productId || p._id?.toString() === item.productId?.toString();
    });

    let unitCost, gstPercentage;
    if (product) {
      unitCost = Number(product.unitCost) || 0;
      gstPercentage = Number(product.GST) || 0;
    } else {
      // If product not found, fall back to the unit cost stored on the item
      unitCost = Number(item.unitCost) || 0;
      gstPercentage = Number(item.gst) || 0;
    }

    const gstAmount = unitCost * (gstPercentage / 100);
    const totalUnitCost = unitCost + gstAmount;
    totalCost += totalUnitCost * netQty;

    // Net revenue for this item: the selling price ONLY, for the quantity
    // that was NOT refunded. GST charged to the customer is a pass-through
    // tax liability (owed to the government), not business revenue or
    // profit — it must NOT be added here. This matches the profit formula
    // shown on the product page itself: Profit = Price - (UnitCost + GST
    // on cost), which never adds GST to the price side.
    const unitPrice = Number(item?.price) || 0;
    totalRevenue += unitPrice * netQty;
  });

  return totalRevenue - totalCost;
};

// Filter invoices by date period.
// IMPORTANT: we no longer exclude invoices just because hasRefund is true —
// a partially refunded invoice is still a real sale and should still count
// toward revenue/profit for the period (calculateInvoiceProfit already nets
// out the refunded portion). Only the date-range check applies here.
const filterInvoicesByPeriod = (period) => {
  if (!data.invocies) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return data.invocies.filter(inv => {
    const invDate = new Date(inv.createdAt);

    switch(period) {
      case 'daily': {
        // Check if invoice is from today (same calendar day)
        const invDateDay = new Date(invDate.getFullYear(), invDate.getMonth(), invDate.getDate());
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return invDateDay.getTime() === todayDay.getTime();
      }
      case 'weekly': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return invDate >= weekAgo;
      }
      case 'monthly': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return invDate >= monthAgo;
      }
      case 'custom': {
        if (!filterStartDate || !filterEndDate) return false;
        const startDate = new Date(filterStartDate);
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999);
        return invDate >= startDate && invDate <= endDate;
      }
      default:
        return true;
    }
  });
};

// Calculate profit for each period
const dailyInvoices = filterInvoicesByPeriod('daily');
const weeklyInvoices = filterInvoicesByPeriod('weekly');
const monthlyInvoices = filterInvoicesByPeriod('monthly');

const dailyProfit = dailyInvoices.reduce((sum, inv) => sum + calculateInvoiceProfit(inv), 0);
const weeklyProfit = weeklyInvoices.reduce((sum, inv) => sum + calculateInvoiceProfit(inv), 0);
const monthlyProfit = monthlyInvoices.reduce((sum, inv) => sum + calculateInvoiceProfit(inv), 0);

// grandTotal already reflects the post-refund total, so it's used directly
// as net revenue — no hasRefund check needed (that was zeroing revenue for
// ANY refund, even a Rs.100 partial refund on a Rs.1200 invoice).
const dailyRevenue = dailyInvoices.reduce((sum, inv) => sum + (inv?.grandTotal || 0), 0);
const weeklyRevenue = weeklyInvoices.reduce((sum, inv) => sum + (inv?.grandTotal || 0), 0);
const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + (inv?.grandTotal || 0), 0);

const stats = [
  {
    title: "Total Sales Revenue",
    value: `Rs. ${totalRevenue.toLocaleString()}`,
    icon: DollarSign,
    iconColor: "text-emerald-400",
  },
  {
    title: "Invoices Generated",
    value: data?.invocies?.length ?? 0,
    icon: FileText,
    iconColor: "text-blue-400",
  },
  {
    title: "Active Products",
    value: data?.products?.length ?? 0,
    icon: Package,
    iconColor: "text-indigo-400",
  },
  {
    title: "Pending Amounts",
    value: `Rs. ${totalPendingAmount.toLocaleString()}`,
    icon: Clock,
    iconColor: "text-orange-400",
    subtitle: `${pendingInvoicesCount} invoices pending`
  },
  {
    title: "Cash in Hand",
    value: `Rs. ${totalCashInHand.toLocaleString()}`,
    icon: Wallet,
    iconColor: "text-green-400",
    subtitle: `${cashInvoices.length} cash payments`,
    onClick: () => setShowCashModal(true)
  },
];

const profitCards = [
  {
    title: "Daily Profit",
    value: `Rs. ${dailyProfit.toLocaleString()}`,
    revenue: `Rs. ${dailyRevenue.toLocaleString()}`,
    icon: Calendar,
    iconColor: "text-white",
    period: "daily",
    invoices: dailyInvoices,
  },
  {
    title: "Weekly Profit",
    value: `Rs. ${weeklyProfit.toLocaleString()}`,
    revenue: `Rs. ${weeklyRevenue.toLocaleString()}`,
    icon: TrendingUp,
    iconColor: "text-blue-400",
    period: "weekly",
    invoices: weeklyInvoices,
  },
  {
    title: "Monthly Profit",
    value: `Rs. ${monthlyProfit.toLocaleString()}`,
    revenue: `Rs. ${monthlyRevenue.toLocaleString()}`,
    icon: BarChart3,
    iconColor: "text-purple-400",
    period: "monthly",
    invoices: monthlyInvoices,
  },
];

const handleProfitCardClick = (card) => {
  setSelectedProfitPeriod(card);
  setShowProfitModal(true);
  // Reset date filters when opening modal
  setFilterStartDate('');
  setFilterEndDate('');
  setFilterMode('profit');
};

const handleDownloadPDF = (card) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(`${card.title} Report`, 14, 22);
  
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Add summary
  doc.setFontSize(14);
  doc.text('Summary', 14, 40);
  
  doc.setFontSize(12);
  doc.text(`Total Revenue: ${card.revenue}`, 14, 48);
  doc.text(`Total Profit: ${card.value}`, 14, 55);
  doc.text(`Number of Invoices: ${card.invoices.length}`, 14, 62);
  
  // Add invoice details table
  if (card.invoices.length > 0) {
    const tableData = card.invoices.map(inv => [
      inv.invoiceNo,
      inv.customerName,
      new Date(inv.createdAt).toLocaleDateString(),
      `Rs. ${inv.grandTotal.toLocaleString()}`,
      `Rs. ${calculateInvoiceProfit(inv).toLocaleString()}`
    ]);
    
    autoTable(doc, {
      startY: 70,
      head: [['Invoice No', 'Customer', 'Date', 'Revenue', 'Profit']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 }
    });
  }
  
  // Save the PDF
  doc.save(`${card.title.replace(/\s+/g, '_')}_Report.pdf`);
};

const applyDateFilter = () => {
  // Get the original period's invoices first
  const originalCard = profitCards.find(c => c.period === selectedProfitPeriod.period);
  const periodInvoices = originalCard.invoices;

  // Then filter by custom date range (refunded invoices are NOT excluded
  // here anymore — calculateInvoiceProfit/grandTotal already account for
  // the refunded portion correctly)
  const filteredInvoices = periodInvoices.filter(inv => {
    if (!filterStartDate || !filterEndDate) return true;
    const invDate = new Date(inv.createdAt);
    const startDate = new Date(filterStartDate);
    const endDate = new Date(filterEndDate);
    endDate.setHours(23, 59, 59, 999);
    return invDate >= startDate && invDate <= endDate;
  });

  // Sort invoices based on filterMode
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (filterMode === 'profit') {
      // Sort by profit (highest first)
      const profitA = calculateInvoiceProfit(a);
      const profitB = calculateInvoiceProfit(b);
      return profitB - profitA;
    } else {
      // Sort by revenue (highest first)
      return (b?.grandTotal || 0) - (a?.grandTotal || 0);
    }
  });

  const filteredProfit = sortedInvoices.reduce((sum, inv) => sum + calculateInvoiceProfit(inv), 0);
  const filteredRevenue = sortedInvoices.reduce((sum, inv) => sum + (inv?.grandTotal || 0), 0);

  setSelectedProfitPeriod({
    ...originalCard,
    invoices: sortedInvoices,
    value: `Rs. ${filteredProfit.toLocaleString()}`,
    revenue: `Rs. ${filteredRevenue.toLocaleString()}`
  });
};

  return (
    <div className={`h-full flex-col gap-4 p-7 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
        {/* welcome msg */}
     <div className={`flex border justify-between p-7 rounded-xl ${theme === 'dark' ? 'bg-[#162032] border-white/7 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div>
            <h1 className='text-3xl tracking-wider font-bold '>Welcome back, Admin</h1>
            <p className='text-sm'>Here is your real-time financial and inventory overview for today.</p>
        </div>
        <div className='flex gap-3'>
            <button  onClick={()=>dispatch(setTab("Invoice Generator"))} className={`border p-3 rounded-xl ${theme === 'dark' ? 'bg-[#3B82F6] border-white/10 text-white' : 'bg-blue-600 border-gray-200 text-white'}`}>Create Invoice Now</button>
            <button onClick={()=>dispatch(setTab("Products"))} className={`border p-3 rounded-xl ${theme === 'dark' ? 'border-white/10 text-white' : 'border-gray-200 text-gray-900'}`}>Check Inventory</button>
        </div>
     </div>
     {/* all sales */}
     <div className='grid grid-cols-5 mt-5 gap-4'>
        {stats.map((k,i)=>{
            const Icon=k.icon
            return(
                <div 
                    key={i} 
                    className={`flex-col py-7 rounded-xl px-5 border ${theme === 'dark' ? 'text-white border-white/20 bg-[#020617]' : 'text-gray-900 border-gray-200 bg-white'} ${k.onClick ? 'cursor-pointer hover:border-white/40 transition-all duration-200' : ''}`}
                    onClick={k.onClick}
                >
                    <div className='flex justify-between'>
                        <p className={`text-[16px] font-bold ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>{k.title}</p>
                          <Icon className={`h-6 w-6 ${k.iconColor}`} />
                    </div>
                    <div className='mt-4 mb-3'>
                        <h1 className='text-2xl font-bold'>{k.value}</h1>
                        {k.subtitle && <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{k.subtitle}</p>}
                    </div>
                </div>
            )
        })}
     </div>

     {/* profit overview cards */}
     <div className='grid grid-cols-3 mt-5 gap-4'>
        {profitCards.map((card, i) => {
            const Icon = card.icon;
            return (
                <div
                    key={i}
                    className={`flex-col py-6 rounded-xl px-5 border ${theme === 'dark' ? 'text-white border-white/20 bg-[#020617]' : 'text-gray-900 border-gray-200 bg-white'} cursor-pointer hover:border-white/40 transition-all duration-200`}
                >
                    <div className='flex justify-between'>
                        <p className={`text-[14px] font-bold ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>{card.title}</p>
                        <div className='flex gap-2'>
                            <Icon className={`h-5 w-5 ${card.iconColor}`} />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadPDF(card);
                                }}
                                className={`p-1 rounded hover:bg-blue-500/20 transition-colors ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}
                                title='Download PDF'
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                    <div className='mt-3 mb-2' onClick={() => handleProfitCardClick(card)}>
                        <h1 className='text-xl font-bold text-emerald-400'>{card.value}</h1>
                    </div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Revenue: {card.revenue}</p>
                </div>
            )
        })}
     </div>
     {/* recent invoices and inventory */}
     <div className={`grid grid-cols-1 lg:grid-cols-[1fr_385px] gap-4 mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <div className={`border rounded-xl p-4 min-h-0 ${theme === 'dark' ? 'border-white/7' : 'border-gray-200'}`}>
            <div className='flex justify-between'>
                <h1 className='text-sm'>Recent Invoices</h1>
                <p onClick={()=>dispatch(setTab("Sales & Reports"))} className='cursor-pointer text-[#2563EB] text-sm'>View All Sales</p>
            </div>
  <div className={`grid p-4 mb-4 grid-cols-5 gap-4 items-center border rounded-xl mt-4 overflow-x-auto ${theme === 'dark' ? 'border-white/8' : 'border-gray-200'}`}>
 <p className={`pb-3 text-sm font-semibold border-b whitespace-nowrap ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Invoice ID</p>
  <p className={`pb-3 text-sm font-semibold border-b whitespace-nowrap ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Customer</p>
  <p className={`pb-3 text-sm font-semibold border-b whitespace-nowrap ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Date</p>
  <p className={`pb-3 text-sm font-semibold border-b whitespace-nowrap ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Amount</p>
  <p className={`pb-3 text-sm font-semibold border-b whitespace-nowrap ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>Status</p>

                {data?.invocies?.slice(-2).map((k)=><InvoiceCard key={k?._id} data={k} isDashboard={true} theme={theme}></InvoiceCard>)}
            </div>
        </div>
        <div className='flex flex-col gap-4'>
      {/* Pending Amounts */}
<div className={`border rounded-xl p-4 cursor-pointer hover:border-orange-500/30 transition-all duration-200 ${theme === 'dark' ? 'border-white/7' : 'border-gray-200'}`} onClick={()=>dispatch(setTab("Sales & Reports"))}>
  <div className='flex justify-between'>
    <h1 className='text-sm flex items-center gap-2'>
      <Clock className='h-4 w-4 text-orange-400' />
      Pending Amounts
    </h1>
    <p className='cursor-pointer text-[#2563EB] text-sm'>View All</p>
  </div>

  <div className='flex flex-col mt-4 max-h-48 overflow-y-auto'>
    {data?.invocies
      ?.filter((inv) => inv?.remainingAmount > 0)
      .slice(0, 5)
      .map((inv) => (
        <div
          key={inv?._id}
          className={`flex justify-between items-center px-2 py-3 border-b last:border-b-0 ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}
        >
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{inv?.customerName}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{inv?.invoiceNo}</p>
          </div>
          <span className='rounded-full px-3 py-1 text-xs font-medium bg-orange-900/30 text-orange-400 border border-orange-700'>
            Rs. {Math.round(inv?.remainingAmount || 0)}
          </span>
        </div>
      ))}

    {(!data?.invocies || data?.invocies?.filter((inv) => inv?.remainingAmount > 0).length === 0) && (
      <p className={`text-sm py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No pending amounts.</p>
    )}
  </div>
</div>

      {/* Low Stock Alerts */}
<div className={`border rounded-xl p-4 cursor-pointer hover:border-yellow-500/30 transition-all duration-200 ${theme === 'dark' ? 'border-white/7' : 'border-gray-200'}`} onClick={()=>dispatch(setTab("Products"))}>
  <div className='flex justify-between'>
    <h1 className='text-sm flex items-center gap-2'>
      <TriangleAlert className='h-4 w-4 text-yellow-400' />
      Low Stock Alerts
    </h1>
    <p className='cursor-pointer text-[#2563EB] text-sm'>Manage</p>
  </div>

  <div className='flex flex-col mt-4 max-h-48 overflow-y-auto'>
    {data?.products
      ?.filter((p) => p?.stock < 5)
      .map((k) => (
        <div
          key={k?._id}
          className={`flex justify-between items-center px-2 py-3 border-b last:border-b-0 ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}
        >
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{k?.name}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{k?.category}</p>
          </div>
          <span className='rounded-full px-3 py-1 text-xs font-medium bg-red-900/30 text-red-400 border border-red-700'>
            {k?.stock} units
          </span>
        </div>
      ))}

    {(!data?.products || data?.products?.filter((p) => p?.stock < 5).length === 0) && (
      <p className={`text-sm py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>All products are well stocked.</p>
    )}
  </div>
</div>

     {/* Expiring Soon Products Alerts */}
<div className={`border rounded-xl p-4 cursor-pointer hover:border-red-500/30 transition-all duration-200 ${theme === 'dark' ? 'border-white/7' : 'border-gray-200'}`} onClick={()=>dispatch(setTab("Products"))}>
  <div className='flex justify-between'>
    <h1 className='text-sm flex items-center gap-2'>
      <TriangleAlert className='h-4 w-4 text-red-400' />
      Expiring Soon (Less than 7 days)
    </h1>
    <p className='cursor-pointer text-[#2563EB] text-sm'>Manage</p>
  </div>

  <div className='flex flex-col mt-4 max-h-48 overflow-y-auto'>
    {expiredProducts.length > 0 ? (
      expiredProducts.map((k) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(k?.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);
        const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        return (
          <div
            key={k?._id}
            className={`flex justify-between items-center px-2 py-3 border-b last:border-b-0 ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}
          >
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{k?.name}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{k?.category}</p>
              <p className='text-red-400 text-xs'>Expires: {new Date(k?.expiryDate).toLocaleDateString()} ({daysRemaining} days remaining)</p>
            </div>
            <span className='rounded-full px-3 py-1 text-xs font-medium bg-red-900/30 text-red-400 border border-red-700'>
              {daysRemaining <= 0 ? 'Expired' : 'Expiring Soon'}
            </span>
          </div>
        );
      })
    ) : (
      <p className={`text-sm py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No products expiring soon.</p>
    )}
  </div>
</div>
</div>
     </div>

     {/* Profit Detail Modal */}
     {showProfitModal && selectedProfitPeriod && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className={`border rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#0F172A] border-white/20' : 'bg-white border-gray-200'}`}>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedProfitPeriod.title} Breakdown
                        {(filterStartDate || filterEndDate) && (
                            <span className={`text-sm font-normal ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({filterMode === 'profit' ? 'Profit' : 'Revenue'} Filter)
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={() => {setShowProfitModal(false); setSelectedProfitPeriod(null);}}
                        className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                    >
                        ✕
                    </button>
                </div>

                {/* Date Filter Section - Only for Weekly and Monthly */}
                {selectedProfitPeriod.period !== 'daily' && (
                    <div className={`p-4 rounded-lg border mb-4 ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Filter by Date Range</p>
                        <div className='flex items-center gap-4 mb-3'>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='radio'
                                    name='filterMode'
                                    value='profit'
                                    checked={filterMode === 'profit'}
                                    onChange={(e) => setFilterMode(e.target.value)}
                                    className={`w-4 h-4 border text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-[#0F172A]' : 'border-gray-300 bg-white'}`}
                                />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Profit</span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='radio'
                                    name='filterMode'
                                    value='revenue'
                                    checked={filterMode === 'revenue'}
                                    onChange={(e) => setFilterMode(e.target.value)}
                                    className={`w-4 h-4 border text-blue-600 focus:ring-blue-500 ${theme === 'dark' ? 'border-gray-600 bg-[#0F172A]' : 'border-gray-300 bg-white'}`}
                                />
                                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Filter by Revenue</span>
                            </label>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                            <div>
                                <label className={`text-xs block mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Start Date</label>
                                <input
                                    type='date'
                                    value={filterStartDate}
                                    onChange={(e) => setFilterStartDate(e.target.value)}
                                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                                />
                            </div>
                            <div>
                                <label className={`text-xs block mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>End Date</label>
                                <input
                                    type='date'
                                    value={filterEndDate}
                                    onChange={(e) => setFilterEndDate(e.target.value)}
                                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                    style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={applyDateFilter}
                            className='mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors'
                        >
                            Apply Filter
                        </button>
                        {(filterStartDate || filterEndDate) && (
                            <button
                                onClick={() => {
                                    setFilterStartDate('');
                                    setFilterEndDate('');
                                    setFilterMode('profit');
                                    const originalCard = profitCards.find(c => c.period === selectedProfitPeriod.period);
                                    setSelectedProfitPeriod(originalCard);
                                }}
                                className='mt-2 w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm font-medium transition-colors'
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                )}

                {/* Display filtered or original data */}
                <div className='grid grid-cols-2 gap-4 mb-6'>
                    <div className={`p-4 rounded-lg border ${filterMode === 'revenue' ? 'border-emerald-500/50' : theme === 'dark' ? 'border-white/10' : 'border-gray-200'} ${theme === 'dark' ? 'bg-[#020617]' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Total Revenue</p>
                        <p className='text-emerald-400 text-lg font-bold'>{selectedProfitPeriod.revenue}</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${filterMode === 'profit' ? 'border-blue-500/50' : theme === 'dark' ? 'border-white/10' : 'border-gray-200'} ${theme === 'dark' ? 'bg-[#020617]' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Total Profit</p>
                        <p className='text-blue-400 text-lg font-bold'>{selectedProfitPeriod.value}</p>
                    </div>
                </div>

                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Invoices in this period
                    {(filterStartDate || filterEndDate) && (
                        <span className={`text-sm font-normal ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            (Sorted by {filterMode === 'profit' ? 'Profit' : 'Revenue'})
                        </span>
                    )}
                </h3>
                <div className='space-y-2'>
                    {selectedProfitPeriod.invoices.length === 0 ? (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No invoices in this period</p>
                    ) : (
                        selectedProfitPeriod.invoices.map((inv) => {
                            const profit = calculateInvoiceProfit(inv);
                            return (
                                <div key={inv._id} className={`p-3 rounded-lg border flex justify-between items-center ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                    <div>
                                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{inv.invoiceNo}</p>
                                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{inv.customerName}</p>
                                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(inv.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-emerald-400 text-sm font-medium'>Rs. {inv.grandTotal.toLocaleString()}</p>
                                        <p className='text-blue-400 text-xs font-medium'>Profit: Rs. {profit.toLocaleString()}</p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
     )}

     {/* Cash in Hand Modal */}
     {showCashModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className={`border rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#0F172A] border-white/20' : 'bg-white border-gray-200'}`}>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cash Payment Details</h2>
                    <button
                        onClick={() => setShowCashModal(false)}
                        className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className='grid grid-cols-2 gap-4 mb-6'>
                    <div className={`p-4 rounded-lg border border-green-500/50 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Total Cash in Hand</p>
                        <p className='text-green-400 text-lg font-bold'>Rs. {totalCashInHand.toLocaleString()}</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>Cash Transactions</p>
                        <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{cashInvoices.length}</p>
                    </div>
                </div>

                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cash Payment Transactions</h3>
                <div className='space-y-2'>
                    {cashInvoices.length === 0 ? (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No cash payments found</p>
                    ) : (
                        cashInvoices.map((inv) => (
                            <div key={inv._id} className={`p-3 rounded-lg border flex justify-between items-center ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <div>
                                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{inv.invoiceNo}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{inv.customerName}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(inv.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-green-400 text-sm font-medium'>Rs. {inv.paidAmount.toLocaleString()}</p>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Total: Rs. {inv.grandTotal.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
     )}
    </div>
  )
}

export default Dashboard