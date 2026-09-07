import axios from 'axios';
import { AlertTriangle, CheckCircle2, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react'

import ProductFormModal from './ProductFormModal';
import { getProductsApi, updateProductApi } from './Productapi';

const Addproducts = ({error,seterror}) => {
  const [open,setopen]=useState(false)
  const[err,seterr]=useState(null)
  const[data,setdata]=useState(null)
  const[success,setsuccess]=useState(null)
  const[loading,setloading]=useState(false)
  const [search,setsearch]=useState("")
    const [formData,SetformData]=useState({
      name:"",
      category:"",
      unitCost:"",
      sellingPrice:"",
      stock:"",
      expiryDate:"",
      GST:""
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
  const lowStock = data?.filter(k => k?.stock < 5) || []
  seterror(lowStock.length > 0)
}, [data])

useEffect(() => {
  getProducts();
}, [getProducts]);
    const [isopen,setisopen]=useState(false)

      const addProduct=async()=>{
      const baseSellingPrice = Number(formData.sellingPrice)
      if(Number(formData.unitCost) > baseSellingPrice){
        seterr("Unit cost cannot be greater than selling price")
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
        const res=await axios.post("http://localhost:5555/inventory",{
          name:formData.name,
      category:formData.category,
      unitCost:Number(formData.unitCost),
      sellingPrice:baseSellingPrice,
      stock:Number(formData.stock),
      expiryDate:formData.expiryDate,
      GST:formData.GST
        })

        seterr(null)
        setisopen(false)
        setloading(false)
        SetformData({
          name:"",
          category:"",
          unitCost:"",
          sellingPrice:"",
          stock:"",
          expiryDate:"",
          GST:""
        })
        setsuccess("Product added successfully")
        getProducts()
        setTimeout(()=>setsuccess(null),3000)
      } catch (error) {
        setloading(false)
        seterr(error?.response?.data?.message || "Failed to add product")
        setTimeout(()=>seterr(null),3000)
     
      }
    }
    
    const handleForm=async (e)=>{
     e.preventDefault()
     await addProduct()

    }

  
    const openEditModal=(product)=>{
      SetformData({
        name:product.name,
        category:product.category,
        unitCost:String(product.unitCost),
        sellingPrice:String(product.sellingPrice),
        stock:String(product.stock),
        expiryDate:product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
        GST:String(product.GST)
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
          GST:formData.GST
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
          GST:""
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

const filteredData = data?.filter((k) => {
  const idPart = k?._id?.slice(20,) || ""
  return (
    k?.name?.toLowerCase().includes(search.toLowerCase()) ||
    idPart.toLowerCase().includes(search.toLowerCase())
  )
})
  

  return (
    <div className='bg-[#0F172A] h-full flex-col relative  p-7'>

      {success!==null?<div className='absolute z-50 left-[400px]  flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-lg px-4 py-3 text-sm text-green-400 shadow-lg z-50'><CheckCircle2 size={16} /><p>{success}</p></div>:null}

       <div className='flex bg-[#162032] border   border-white/7 justify-between text-white p-7 rounded-xl'>
        <div>
            <h1 className='text-2xl tracking-wider font-bold '>Product Catalog</h1>
            <p className='text-sm'>Manage stock items, pricing, and SKU identifiers.</p>
        </div>
        <div onClick={()=>setisopen(true)} className='flex gap-3 items-center  border  border-white/10 p-3 rounded-xl bg-[#3B82F6]'>
            <Plus />
            <button className=''>Add Product</button>
            
        </div>
     </div>

     {/* search */}
     <div className='relative mt-6'>
       <Search size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
       <input
         value={search}
         onChange={(e)=>setsearch(e.target.value)}
         placeholder='Search by product name or Product code'
         className='w-full pl-9 p-2 bg-[#162032] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'
       />
     </div>

     {/* products */}
     <div className='grid  p-7 mb-4 grid-cols-6 border rounded-xl border-white/8  mt-6'>
 <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Product_Code</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Product Name</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Category</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Price</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Stock</p>
  <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Actions</p>

    {filteredData?.map((k)=>{
     const id = k?._id?.slice(20, );

        return(
            <React.Fragment key={k._id}>
    <p className="py-4 text-sm text-[#4D8DFF] border-b border-gray-800 truncate"> {`${id}`}</p>

      <p className="py-4 text-sm text-white border-b border-gray-800">   {k?.name}</p>

      <p className="py-4 text-sm text-gray-300 border-b border-gray-800">    {k?.category} </p>

      <p className="py-4 text-sm text-white border-b border-gray-800">  Rs. {k?.sellingPrice} </p>
   <div>
  <p className={`py-4 text-sm border-b border-gray-800 flex items-center gap-1 ${k?.stock < 5 ? 'text-red-500' : 'text-[#1FE39A]'}`}>
    {k?.stock}
    {k?.stock < 5 && <AlertTriangle size={14} />}
  </p>
</div>
    <div className='flex gap-4 border-b border-gray-800'>
        <button onClick={()=>openEditModal(k)} ><SquarePen className='text-white cursor-pointer ' /></button>
        <button  onClick={()=>delProduct(k?._id)} className='text-white  cursor-pointer'><Trash2 /></button>
    </div>

            </React.Fragment>
        )
    })}
  
     </div>
     {/* form */}
{isopen===true &&(
  <ProductFormModal
    title="Add New Product"
    formData={formData}
    SetformData={SetformData}
    err={err}
    loading={loading}
    onClose={()=>setisopen(false)}
    onSubmit={handleForm}
  />
  )}
{open===true &&(
  <ProductFormModal
    title="Update Product"
    formData={formData}
    SetformData={SetformData}
    err={err}
    loading={loading}
    onClose={()=>setopen(false)}
    onSubmit={handleEditForm}
  />
  )}
    </div>
  )
}

export default Addproducts