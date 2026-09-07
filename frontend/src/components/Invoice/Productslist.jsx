import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react'

import React, { useEffect, useState, useCallback } from 'react'

const Productslist = ({info,setinfo}) => {
  const[suggestion,setsuggestion]=useState(null)
  const [data,setdata]=useState(null)
  const [items,setItems]=useState([
    { id: Date.now(), productId:"", product:"", price:"", qnt:1, gst: 0, query:"", unitCost: "", originalSellingPrice: "" }
  ])



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
  },[getProducts]);


  useEffect(() => {
    // only rows where a real product was picked (skips the empty trailing row)
    const validItems = items.filter(item => item.productId && Number(item.qnt) > 0);
    const totalPrice = validItems.reduce(
      (sum, item) => {
        const sellingPrice = Number(item.price) || 0;
        return sum + (sellingPrice * Number(item.qnt || 0));
      },
      0
    );
    setinfo(prev => ({ ...prev, items: validItems, totalPrice }));
  }, [items]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId:"", product:"", price:"", qnt:1, gst: 0, query:"", unitCost: "", originalSellingPrice: "" }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

const handleSelect = (id, selected) => {
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, productId: selected._id, product: selected.name, price: selected.sellingPrice, gst: selected.GST || 0, query: selected.name, unitCost: selected.unitCost, originalSellingPrice: selected.sellingPrice }
          : item
      );
      const isLastRow = prev[prev.length - 1].id === id;
      if (isLastRow) {
        updated.push({ id: Date.now(), productId:"", product:"", price:"", qnt:1, gst: 0, query:"", unitCost: "", originalSellingPrice: "" });
      }
      return updated;
    });
    setsuggestion(null);
  }
const handleQntChange = (p,id, e) => {
  let value = e.target.value;

  if (value === "0") {
    return;
  }

  if (value !== "" && Number(value) < 1) {
    return;
  }

  // Remove stock validation to allow stock to go to 0
  setItems(items.map(item =>
    item.id === id ? { ...item, qnt: value } : item
  ));
}

const handlePriceChange = (id, e) => {
  let value = e.target.value;
  
  if (value === "" || Number(value) < 0) {
    return;
  }
  
  // Find the current item to get its original selling price
  const currentItem = items.find(item => item.id === id);
  if (currentItem && currentItem.originalSellingPrice) {
    const originalSellingPrice = Number(currentItem.originalSellingPrice);
    const enteredPrice = Number(value);
    
    if (enteredPrice < originalSellingPrice) {
      return; // Prevent entering price less than original selling price
    }
  }
  
  setItems(items.map(item =>
    item.id === id ? { ...item, price: value } : item
  ));
}
  const grandTotal = items.reduce(
    (sum, item) => {
      const sellingPrice = Number(item.price) || 0;
      return sum + (sellingPrice * Number(item.qnt || 0));
    },
    0
  );

const handleSuggestion = (id, e) => {
  const value = e.target.value;

  setItems(items.map(item =>

    item.id === id
      ? {
          ...item,
          query: value
        }
      : item
  ))
  setsuggestion(id);
};

 


  return (
    <div className='bg-[#020617] p-5 text-white border border-white/10 rounded-xl'>
      <div className='flex justify-between'>
        <h1 className='text-md'>Invoice Line Items</h1>
        <div
          onClick={addItem}
          className='flex gap-2 items-center border border-white/10 px-3 py-2 rounded-lg bg-[#0062ff] cursor-pointer'
        >
          <Plus size={16} />
          <button type="button" className='text-sm'>Add Item</button>
        </div>
      </div>

      <div className='bg-[#0A1022] rounded-xl mt-4 border border-white/10'>
      {items.map((item) => {

  const filtered = data?.filter((k) =>
    k.name.toLowerCase().includes(item.query.toLowerCase())
  );
 
  return (
    <div key={item.id} className='flex gap-3 items-center relative p-2 border-b border-white/5 last:border-b-0'>

      <div className='relative w-full'>
        <input
          value={item.query}
          onChange={(e) => handleSuggestion(item.id, e)}
          placeholder="Search product"
          className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
        />

        {suggestion === item.id && item.query?.length > 0 && (
          <>
            {filtered?.length > 0 ? (
              <ul className='absolute z-10 top-full left-0 w-full bg-[#0F172A] border border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto'>
                {filtered.map((product) => (
                  <li
                    key={product._id}
                    onClick={() => handleSelect(item.id, product)}
                    className='p-2 hover:bg-[#1e293b] cursor-pointer text-sm'
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className='absolute z-10 top-full left-0 w-full bg-[#0F172A] border border-gray-700 rounded-lg mt-1'>
                <li className='p-2 text-gray-500 text-sm cursor-default'>
                  No match found
                </li>
              </ul>
            )}
          </>
        )}
      </div>

      <input
        type="number"
        value={item.price}
        onChange={(e) => handlePriceChange(item.id, e)}
        placeholder="Price"
        className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
      />

      <input
        onChange={(e) =>{ handleQntChange(item.productId,item.id, e);}}
        type="number"
        value={item.qnt}
        placeholder='quantity'
        className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
      />

      <button
        type="button"
        onClick={() => removeItem(item.id)}
        disabled={items.length === 1}
        className='text-red-400 disabled:text-gray-600 disabled:cursor-not-allowed cursor-pointer'
      >
        <Trash2 size={18} />
      </button>

    </div>
  );
})}

        <div className='flex justify-between items-center border-t border-white/10 px-3 py-2'>
          <p className='text-sm text-gray-400'>Total Price</p>
          <p className='text-lg font-bold text-[#1FE39A]'>Rs. {grandTotal.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default Productslist