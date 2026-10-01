import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react'

import React, { useEffect, useState, useCallback, useRef } from 'react'

const Productslist = ({info,setinfo, theme}) => {
  const[suggestion,setsuggestion]=useState(null)
  const [dropdownPos, setDropdownPos] = useState(null)
  const [data,setdata]=useState(null)
  const [items,setItems]=useState([
    { id: Date.now(), productId:"", product:"", price:"", qnt:1, gst: 0, query:"", unitCost: "", originalSellingPrice: "" }
  ])
  const [stockError, setStockError] = useState(null)
  const [expiryWarning, setExpiryWarning] = useState(null)
  const scrollRef = useRef(null)



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

  // Auto-scroll to bottom when items change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), productId:"", product:"", price:"", qnt:1, gst: 0, query:"", unitCost: "", originalSellingPrice: "" }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Helper: total quantity of a given productId already used in rows OTHER than excludeId
  const getExistingQtyForProduct = (productId, excludeId) => {
    return items.reduce((sum, item) => {
      if (item.id !== excludeId && item.productId === productId) {
        return sum + (Number(item.qnt) || 0);
      }
      return sum;
    }, 0);
  };

  // Helper: check if product is expired
  const isProductExpired = (product) => {
    if (!product.expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(product.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

const handleSelect = (id, selected) => {
    const stock = selected.stock !== undefined ? Number(selected.stock) : undefined;
    const existingQty = getExistingQtyForProduct(selected._id, id);
    const defaultQty = 1; // the row will default to qty 1 once selected

    if (stock !== undefined && existingQty + defaultQty > stock) {
      setStockError(
        `Only ${stock} units available for ${selected.name}` +
        (existingQty > 0 ? ` (already ${existingQty} added in other rows)` : '')
      );
      setTimeout(() => setStockError(null), 3000);
      return; // block selecting this product
    }

    // Check for expiry warning
    if (isProductExpired(selected)) {
      setExpiryWarning(
        `Warning: ${selected.name} is expired (Expired: ${new Date(selected.expiryDate).toLocaleDateString()})`
      );
      setTimeout(() => setExpiryWarning(null), 5000);
    }

    setStockError(null);
    setItems(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, productId: selected._id, product: selected.name, price: selected.sellingPrice, qnt: 1, gst: selected.GST || 0, query: selected.name, unitCost: selected.unitCost, originalSellingPrice: selected.sellingPrice }
          : item
      );
      const isLastRow = prev[prev.length - 1].id === id;
      if (isLastRow) {
        updated.push({ id: Date.now(), productId:"", product:"", price:"", qnt:1, gst: 0, query:"", unitCost: "", originalSellingPrice: "" });
      }
      return updated;
    });
    setsuggestion(null);
    setDropdownPos(null);
  }

const handleQntChange = (p,id, e) => {
  let value = e.target.value;

  if (value === "0") {
    return;
  }

  if (value !== "" && Number(value) < 0) {
    return;
  }

  // Stock validation - prevent exceeding available stock ACROSS ALL ROWS of the same product
  const currentItem = items.find(item => item.id === id);
  if (currentItem && currentItem.productId) {
    const product = data?.find(pr => pr._id === currentItem.productId);
    if (product && product.stock !== undefined) {
      const maxStock = Number(product.stock);
      const otherQty = getExistingQtyForProduct(currentItem.productId, id);
      const enteredQty = Number(value) || 0;
      const totalQty = otherQty + enteredQty;

      if (totalQty > maxStock) {
        setStockError(
          `Only ${maxStock} units available for ${product.name}` +
          (otherQty > 0 ? ` (already ${otherQty} added in other rows)` : '')
        );
        setTimeout(() => setStockError(null), 3000);
        return;
      }
    }
  }

  setStockError(null);
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
  const rect = e.target.getBoundingClientRect();
  setDropdownPos({ top: rect.bottom, left: rect.left, width: rect.width });

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

// Close the open suggestion dropdown whenever the list is scrolled,
// so a stale dropdown doesn't stay anchored to an old position.
const handleListScroll = () => {
  if (suggestion !== null) {
    setsuggestion(null);
    setDropdownPos(null);
  }
};

 


  return (
    <div className={`p-5 border rounded-xl ${theme === 'dark' ? 'bg-[#020617] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'}`}>
      {stockError && (
        <div className='mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-lg text-red-400 text-sm'>
          {stockError}
        </div>
      )}
      <div className='flex justify-between'>
        <h1 className='text-md'>Invoice Line Items</h1>
        <div
          onClick={addItem}
          className={`flex gap-2 items-center border px-3 py-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'border-white/10 bg-[#0062ff]' : 'border-gray-300 bg-blue-600'}`}
        >
          <Plus size={16} />
          <button type="button" className='text-sm'>Add Item</button>
        </div>
      </div>

      <div className={`rounded-xl mt-4 border ${theme === 'dark' ? 'bg-[#0A1022] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
      <div ref={scrollRef} className='max-h-[420px] overflow-y-auto pr-1' onScroll={handleListScroll}>
      {items.map((item) => {

  return (
    <div key={item.id} className={`flex gap-3 items-center relative p-2 border-b last:border-b-0 ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>

      <div className='relative w-full'>
        <input
          value={item.query}
          onChange={(e) => handleSuggestion(item.id, e)}
          placeholder="Search product"
          autoComplete="off"
          name={`product-search-${item.id}`}
          className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        />
      </div>

      <input
        type="number"
        value={item.price}
        onChange={(e) => handlePriceChange(item.id, e)}
        placeholder="Price"
        className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
      />

      <input
        onChange={(e) =>{ handleQntChange(item.productId,item.id, e);}}
        type="number"
        step="0.1"
        min="0"
        value={item.qnt}
        placeholder='quantity'
        className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
      />

      <button
        type="button"
        onClick={() => removeItem(item.id)}
        disabled={items.length === 1}
        className={`cursor-pointer ${theme === 'dark' ? 'text-red-400 disabled:text-gray-600' : 'text-red-500 disabled:text-gray-400'} disabled:cursor-not-allowed`}
      >
        <Trash2 size={18} />
      </button>

    </div>
  );
})}
      </div>

        <div className={`flex justify-between items-center border-t px-3 py-2 ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Price</p>
          <p className='text-lg font-bold text-[#1FE39A]'>Rs. {grandTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* Suggestion dropdown rendered OUTSIDE the scrollable list, using fixed
          positioning anchored to the active input, so it is never clipped by
          the list's overflow-y-auto container. */}
      {suggestion !== null && dropdownPos && (() => {
        const activeItem = items.find(i => i.id === suggestion);
        if (!activeItem || !activeItem.query?.length) return null;

        const filtered = data?.filter((k) =>
          k.name.toLowerCase().includes(activeItem.query.toLowerCase())
        );

        return (
          <ul
            style={{ position: 'fixed', top: dropdownPos.top + 4, left: dropdownPos.left, width: dropdownPos.width }}
            className={`z-50 border rounded-lg max-h-48 overflow-y-auto shadow-lg ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700' : 'bg-white border-gray-200'}`}
          >
            {filtered?.length > 0 ? (
              filtered.map((product) => {
                const alreadyUsed = getExistingQtyForProduct(product._id, activeItem.id);
                const remaining = product.stock !== undefined ? Number(product.stock) - alreadyUsed : undefined;
                const isOutOfStock = remaining !== undefined && remaining <= 0;
                const isExpired = isProductExpired(product);
                return (
                  <li
                    key={product._id}
                    onClick={() => !isOutOfStock && handleSelect(activeItem.id, product)}
                    className={`p-2 text-sm flex justify-between ${
                      isOutOfStock
                        ? 'opacity-40 cursor-not-allowed'
                        : theme === 'dark' ? 'hover:bg-[#1e293b] cursor-pointer' : 'hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    <div className='flex flex-col'>
                      <span className={isExpired ? 'text-amber-400' : ''}>{product.name}</span>
                      {isExpired && <span className='text-xs text-amber-500'>Expired</span>}
                    </div>
                    <span className={remaining !== undefined && remaining < 5 ? 'text-red-400' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      Stock: {remaining !== undefined ? remaining : product.stock}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className={`p-2 text-sm cursor-default ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                No match found
              </li>
            )}
          </ul>
        );
      })()}
    </div>
  )
}

export default Productslist