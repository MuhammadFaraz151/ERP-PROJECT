import axios from 'axios';
import { Search, SquarePen, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react'
import InventoryCard from './InventoryCard';
import ProductFormModal from './Products/ProductFormModal';
import { updateProductApi } from './Products/Productapi';

const Inventory = ({ theme }) => {
  const [data,setdata]=useState(null)
  const [search,setsearch]=useState("")
  const [open,setopen]=useState(false)
  const[err,seterr]=useState(null)
  const[success,setsuccess]=useState(null)
  const[loading,setloading]=useState(false)
  const [formData,SetformData]=useState({
    name:"",
    category:"",
    unitCost:"",
    sellingPrice:"",
    stock:"",
    expiryDate:"",
    GST:"",
    unit: "pcs"
  })
  const [editId,seteditId]=useState(null)

  const getProducts = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allInventory");
      setdata(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setdata([]);
    }
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

const totalAssetValue = data?.reduce((sum, p) => sum + ((p?.sellingPrice || 0) * (p?.stock || 0)), 0) ?? 0;
const totalCapitalInvested = data?.reduce((sum, p) => sum + ((p?.unitCost || 0) * (p?.stock || 0)), 0) ?? 0;
const totalGSTInvested = data?.reduce((sum, p) => {
  const unitCost = Number(p?.unitCost) || 0;
  const gstPercentage = Number(p?.GST) || 0;
  const gstAmount = unitCost * (gstPercentage / 100);
  return sum + (gstAmount * (p?.stock || 0));
}, 0) ?? 0;
const potentialGrossProfit = totalAssetValue - (totalCapitalInvested + totalGSTInvested);

const inventorySummary = [
  {
    title: "Total Inventory Asset Value",
    value: totalAssetValue,
    formattedValue: `Rs. ${totalAssetValue.toLocaleString()}`,
    color: "#38E89D"
  },
  {
    title: "Total Capital Invested (Cost)",
    value: totalCapitalInvested,
    formattedValue: `Rs. ${totalCapitalInvested.toLocaleString()}`,
    color: "#FFFFFF"
  },
  {
    title: "Potential Gross Profit Margin",
    value: potentialGrossProfit,
    formattedValue: `Rs. ${potentialGrossProfit.toLocaleString()}`,
    color: "#4A90E2"
  }
];

const filterData = data?.filter((k) =>
  k?.name?.toLowerCase().includes(search.toLowerCase()) ||
  k?._id?.slice(20)?.toLowerCase().includes(search.toLowerCase())
);

const openEditModal=(product)=>{
  SetformData({
    name:product.name,
    category:product.category,
    unitCost:String(product.unitCost),
    sellingPrice:String(product.sellingPrice),
    stock:String(product.stock),
    expiryDate:product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
    GST:String(product.GST),
    unit: product.unit || "pcs"
  })
  seteditId(product._id)
  seterr(null)
  setopen(true)
}

const editProduct=async()=>{
  if(Number(formData.unitCost) > Number(formData.sellingPrice)){
    seterr("Unit cost cannot be greater than selling price")
    return
  }
  
  if(Number(formData.stock) < 0){
    seterr("Stock cannot be negative")
    return
  }
  
  // Validate category exists
  try {
    const categoriesRes = await axios.get("http://localhost:5555/allCategories");
    const categoryExists = categoriesRes.data.some(cat => cat.name.toLowerCase() === formData.category.toLowerCase());
    if (!categoryExists) {
      seterr("Category does not exist. Please add this category first in the Categories tab.")
      return
    }
  } catch (error) {
    seterr("Failed to validate category. Please try again.")
    return
  }
  
  setloading(true)
  try {
    await updateProductApi(editId,{
      name:formData.name,
      category:formData.category,
      unitCost:Number(formData.unitCost),
      sellingPrice:Number(formData.sellingPrice),
      stock:Number(formData.stock),
      expiryDate:formData.expiryDate,
      GST:formData.GST,
      unit: formData.unit
    })

    seterr(null)
    setopen(false)
    setloading(false)
    seteditId(null)
    SetformData({
      name:"",
      category:"",
      unitCost:"",
      sellingPrice:"",
      stock:"",
      expiryDate:"",
      GST:"",
      unit: "pcs"
    })
     getProducts()
    setsuccess("Product updated successfully")
   
    setTimeout(()=>setsuccess(null),3000)
  } catch (error) {
    setloading(false)
    seterr(error?.response?.data?.message || "Failed to update product")
    setTimeout(()=>seterr(null),3000)
  }
}

const handleEditForm=async (e)=>{
  e.preventDefault()
  await editProduct()
}

 const delProduct = async (id) => {
  try {
    await axios.delete("http://localhost:5555/deleteItem", {
      data: {
        _id: id,
      },
    });

 setsuccess("Product deleted successfully");
getProducts();
setTimeout(() => setsuccess(null), 3000);
  } catch (error) {
    console.error(error);
  }
};
  return (
    <div className={`h-full flex-col p-7 relative ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
      {success!==null?<div className='absolute z-50 left-[400px]  flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-lg px-4 py-3 text-sm text-green-400 shadow-lg z-50'><CheckCircle2 size={16} /><p>{success}</p></div>:null}

      {/* inventory summary */}
      <div className='grid grid-cols-3 gap-4  '>
        {inventorySummary.map((k,i)=>{
            return(
                <div key={i} className={`flex flex-col p-4 gap-3 border rounded-xl ${theme === 'dark' ? 'text-white bg-[#020617] border-white/7' : 'text-gray-900 bg-white border-gray-200'}`}>
                    <p className={`text-sm mt-3 font-bold ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>{k.title}</p>
                    <h1  style={{ color: k.color }} className={`text-xl   mtb-3 text-sm font-bold`}>{k.formattedValue}</h1>
                </div>
            )
        })}
      </div>
      {/* Inventory */}
      <div className={`border rounded-xl p-5 mt-6 ${theme === 'dark' ? 'border-white/8' : 'border-gray-200'}`}>
        <div className={`flex justify-between items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <h1 className='text-md tracking-widest font-bold'>Stock & Inventory Report</h1>
            <div className="relative">  <Search  size={18}  className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}/>
        <input onChange={(e)=>setsearch(e.target.value)}  className={`border text-[15px] rounded-xl p-4 pl-10 ${theme === 'dark' ? 'border-white/7 bg-[#0F172A] text-white' : 'border-gray-200 bg-white text-gray-900'}`}  placeholder="Search by SKU and Name"  type="search" /></div>    </div>
      
          <div className="grid grid-cols-9 p-5 text-sm">
  {/* Header */}
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>SKU</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Product Name</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Category</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Unit Cost</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Selling Price</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Stock</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Unit</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Status</p>
  <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Actions</p>

  {filterData?.map((k)=><InventoryCard key={k._id} data={k} onEdit={openEditModal} onDelete={delProduct} compact={false} theme={theme}></InventoryCard>)}
   
</div>
      </div>

      {/* Edit Modal */}
{open===true &&(
  <ProductFormModal
    title="Update Product"
    formData={formData}
    SetformData={SetformData}
    err={err}
    loading={loading}
    onClose={()=>setopen(false)}
    onSubmit={handleEditForm}
    theme={theme}
  />
)}






    </div>

  )
}

export default Inventory