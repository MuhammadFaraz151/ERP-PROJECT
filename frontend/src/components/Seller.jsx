import axios from 'axios';
import { Search, Plus, Edit, Trash2, DollarSign, Package, AlertCircle, CheckCircle2, Users, BarChart3 } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';

const Seller = ({ theme }) => {
  const [activeTab, setActiveTab] = useState('sellers'); // 'sellers' or 'purchases'
  const [sellers, setSellers] = useState(null);
  const [purchases, setPurchases] = useState(null);
  const [categories, setCategories] = useState(null);
  const [search, setSearch] = useState('');
  const [openSellerModal, setOpenSellerModal] = useState(false);
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);


  const [sellerFormData, setSellerFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    company: ''
  });

  const [purchaseFormData, setPurchaseFormData] = useState({
    seller: '',
    sellerName: '',
    items: [{ name: '', quantity: 1, unitCost: 0, totalCost: 0, category: '', stock: 0 }],
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'Cash'
  });
  const [expandedPurchase, setExpandedPurchase] = useState(null);



  const fetchSellers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allSellers");
      setSellers(res.data);
    } catch (error) {
      console.error("Error fetching sellers:", error);
      setSellers([]);
    }
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allPurchases");
      setPurchases(res.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      setPurchases([]);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allCategories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }, []);



  useEffect(() => {
    fetchSellers();
    fetchPurchases();
    fetchCategories();
  }, [fetchSellers, fetchPurchases, fetchCategories]);

  const filteredSellers = sellers?.filter((seller) =>
    seller?.name?.toLowerCase().includes(search.toLowerCase()) ||
    seller?.company?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPurchases = purchases?.filter((purchase) =>
    purchase?.sellerName?.toLowerCase().includes(search.toLowerCase()) ||
    purchase?._id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchases = purchases?.reduce((sum, p) => sum + (p?.totalAmount || 0), 0) ?? 0;
  const totalPaid = purchases?.reduce((sum, p) => sum + (p?.paidAmount || 0), 0) ?? 0;
  const totalRemaining = purchases?.reduce((sum, p) => sum + (p?.remainingAmount || 0), 0) ?? 0;

  const sellerSummary = [
    {
      title: "Total Sellers",
      value: sellers?.length || 0,
      color: "#4A90E2"
    },
    {
      title: "Total Purchases",
      value: totalPurchases,
      formattedValue: `Rs. ${totalPurchases.toLocaleString()}`,
      color: "#38E89D"
    },
    {
      title: "Pending Payments",
      value: totalRemaining,
      formattedValue: `Rs. ${totalRemaining.toLocaleString()}`,
      color: "#F59E0B"
    }
  ];

  const handleAddSeller = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editId) {
        await axios.put("http://localhost:5555/updateSeller", {
          _id: editId,
          ...sellerFormData
        });
        setSuccess("Seller updated successfully");
      } else {
        await axios.post("http://localhost:5555/seller", sellerFormData);
        setSuccess("Seller added successfully");
      }

      setOpenSellerModal(false);
      setSellerFormData({ name: '', phone: '', email: '', address: '', company: '' });
      setEditId(null);
      fetchSellers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to save seller");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeller = async (id) => {
    if (!confirm("Are you sure you want to delete this seller?")) return;

    try {
      await axios.delete("http://localhost:5555/deleteSeller", { data: { _id: id } });
      setSuccess("Seller deleted successfully");
      fetchSellers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Failed to delete seller");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEditSeller = (seller) => {
    setSellerFormData({
      name: seller.name,
      phone: seller.phone || '',
      email: seller.email || '',
      address: seller.address || '',
      company: seller.company || ''
    });
    setEditId(seller._id);
    setOpenSellerModal(true);
  };

  const handleAddPurchaseItem = () => {
    setPurchaseFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unitCost: 0, totalCost: 0, category: '', stock: 0 }]
    }));
  };

  const handlePurchaseItemChange = (index, field, value) => {
    const updatedItems = [...purchaseFormData.items];
    updatedItems[index][field] = value;

    // Calculate total cost
    if (field === 'quantity' || field === 'unitCost') {
      updatedItems[index].totalCost = updatedItems[index].quantity * updatedItems[index].unitCost;
    }

    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    setPurchaseFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount
    }));
  };

  const handleRemovePurchaseItem = (index) => {
    // Don't allow removing the last item
    if (purchaseFormData.items.length <= 1) {
      return;
    }
    const updatedItems = purchaseFormData.items.filter((_, i) => i !== index);
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
    setPurchaseFormData(prev => ({
      ...prev,
      items: updatedItems,
      totalAmount
    }));
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post("http://localhost:5555/purchase", purchaseFormData);
      setSuccess("Purchase added successfully");
      setOpenPurchaseModal(false);
      setPurchaseFormData({
        seller: '',
        sellerName: '',
        items: [{ name: '', quantity: 1, unitCost: 0, totalCost: 0, category: '', stock: 0 }],
        totalAmount: 0,
        paidAmount: 0,
        paymentMethod: 'Cash'
      });
      fetchPurchases();
      fetchSellers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to add purchase");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSeller = (seller) => {
    setPurchaseFormData(prev => ({
      ...prev,
      seller: seller._id,
      sellerName: seller.name
    }));
  };

  const handlePayRemaining = async (purchaseId, sellerId, remainingAmount) => {
    const paymentAmount = prompt(`Enter payment amount (Remaining: Rs. ${remainingAmount})`);
    if (!paymentAmount || isNaN(paymentAmount)) return;

    try {
      await axios.put("http://localhost:5555/payPurchaseRemaining", {
        purchaseId,
        paymentAmount: Number(paymentAmount)
      });
      setSuccess("Payment recorded successfully");
      fetchPurchases();
      fetchSellers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to record payment");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (!confirm("Are you sure you want to delete this purchase? This will reverse stock changes.")) return;

    try {
      await axios.delete("http://localhost:5555/deletePurchase", { data: { _id: purchaseId } });
      setSuccess("Purchase deleted successfully");
      fetchPurchases();
      fetchSellers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError("Failed to delete purchase");
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className={`h-full flex-col p-7 relative ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
      {success !== null && (
        <div className='absolute z-50 left-[400px] flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-lg px-4 py-3 text-sm text-green-400 shadow-lg z-50'>
          <CheckCircle2 size={16} />
          <p>{success}</p>
        </div>
      )}

      {/* Header */}
      <div className={`flex border justify-between p-7 rounded-xl mb-6 ${theme === 'dark' ? 'bg-[#162032] border-white/7 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div>
          <h1 className='text-2xl tracking-wider font-bold'>Seller Management</h1>
          <p className='text-sm'>Manage suppliers and purchase records</p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={() => setOpenSellerModal(true)}
            className={`flex gap-3 items-center border p-3 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] transition-colors ${theme === 'dark' ? 'border-white/10 text-white' : 'border-blue-600 text-white'}`}
          >
            <Users size={18} />
            <button>Add Seller</button>
          </button>
          <button
            onClick={() => setOpenPurchaseModal(true)}
            className={`flex gap-3 items-center border p-3 rounded-xl bg-[#10B981] hover:bg-[#059669] transition-colors ${theme === 'dark' ? 'border-white/10 text-white' : 'border-green-600 text-white'}`}
          >
            <Package size={18} />
            <button>New Purchase</button>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {sellerSummary.map((item, i) => (
          <div key={i} className={`flex flex-col p-4 gap-3 border rounded-xl ${theme === 'dark' ? 'text-white bg-[#020617] border-white/7' : 'text-gray-900 bg-white border-gray-200'}`}>
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-600' : 'text-gray-500'}`}>{item.title}</p>
            <h1 style={{ color: item.color }} className='text-xl font-bold'>
              {item.formattedValue || item.value}
            </h1>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className='flex gap-4 mb-6'>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'sellers'
              ? 'bg-blue-600 text-white'
              : theme === 'dark' ? 'bg-[#1E293B] text-gray-400 hover:bg-[#334155]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Sellers
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'purchases'
              ? 'bg-blue-600 text-white'
              : theme === 'dark' ? 'bg-[#1E293B] text-gray-400 hover:bg-[#334155]' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Purchases
        </button>
      </div>

      {/* Search */}
      <div className='relative mb-6'>
        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={activeTab === 'sellers' ? 'Search by seller name or company' : 'Search by seller name or purchase ID'}
          className={`w-full pl-9 p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#162032] border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        />
      </div>

      {/* Sellers Table */}
      {activeTab === 'sellers' && (
        <div className={`border rounded-xl p-5 ${theme === 'dark' ? 'border-white/8' : 'border-gray-200'}`}>
          <div className='grid grid-cols-7 p-5 text-sm'>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Name</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Company</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Phone</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Email</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Total Purchases</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Remaining</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Actions</p>

            {filteredSellers?.map((seller) => (
              <React.Fragment key={seller._id}>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-900 border-gray-100'}`}>{seller.name}</p>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>{seller.company || '-'}</p>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>{seller.phone || '-'}</p>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>{seller.email || '-'}</p>
                <p className={`py-4 text-sm text-emerald-400 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>Rs. {(seller.totalPurchases || 0).toLocaleString()}</p>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} ${seller.remainingAmount > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  Rs. {(seller.remainingAmount || 0).toLocaleString()}
                </p>
                <div className={`py-4 border-b flex gap-4 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                  <button onClick={() => handleEditSeller(seller)} className='text-blue-400 hover:text-blue-300'>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDeleteSeller(seller._id)} className='text-red-400 hover:text-red-300'>
                    <Trash2 size={16} />
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Purchases Table */}
      {activeTab === 'purchases' && (
        <div className={`border rounded-xl p-5 ${theme === 'dark' ? 'border-white/8' : 'border-gray-200'}`}>
          <div className='grid grid-cols-8 p-5 text-sm'>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Purchase ID</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Seller</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Date</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Items</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Total Amount</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Paid</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Status</p>
            <p className={`pb-3 font-semibold border-b ${theme === 'dark' ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'}`}>Actions</p>

            {filteredPurchases?.map((purchase) => (
              <React.Fragment key={purchase._id}>
                <p className={`py-4 text-sm text-blue-400 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>{purchase._id.slice(20)}</p>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-white border-gray-800' : 'text-gray-900 border-gray-100'}`}>{purchase.sellerName}</p>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </p>
                <p className={`py-4 text-sm border-b ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>
                  {purchase.items?.length > 1 ? (
                    <span 
                      className='text-blue-400 cursor-pointer hover:underline'
                      onClick={() => setExpandedPurchase(expandedPurchase === purchase._id ? null : purchase._id)}
                    >
                      {expandedPurchase === purchase._id ? 'Show Less' : `View More (${purchase.items.length} items)`}
                    </span>
                  ) : (
                    purchase.items?.[0]?.name || 'No items'
                  )}
                </p>
                <p className={`py-4 text-sm text-emerald-400 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                  Rs. {purchase.totalAmount.toLocaleString()}
                </p>
                <p className={`py-4 text-sm text-blue-400 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                  Rs. {purchase.paidAmount.toLocaleString()}
                </p>
                <p className={`py-4 text-sm font-semibold border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} ${
                  purchase.status === 'Paid' ? 'text-green-400' : 'text-amber-400'
                }`}>
                  {purchase.status}
                </p>
                <div className={`py-4 border-b flex gap-4 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                  {purchase.remainingAmount > 0 && (
                    <button
                      onClick={() => handlePayRemaining(purchase._id, purchase.seller, purchase.remainingAmount)}
                      className='text-amber-400 hover:text-amber-300 flex items-center gap-1'
                    >
                      <DollarSign size={16} />
                      Pay
                    </button>
                  )}
                  <button onClick={() => handleDeletePurchase(purchase._id)} className='text-red-400 hover:text-red-300'>
                    <Trash2 size={16} />
                  </button>
                </div>
                {expandedPurchase === purchase._id && purchase.items?.length > 1 && (
                  <div className={`col-span-8 p-3 rounded-lg border mt-2 mb-2 ${theme === 'dark' ? 'bg-[#111827] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Purchase Items:</p>
                    {purchase.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between text-sm py-1 border-b last:border-b-0 ${theme === 'dark' ? 'text-gray-300 border-gray-800' : 'text-gray-600 border-gray-100'}`}>
                        <span>{item.name}</span>
                        <span>Qty: {item.quantity} × Rs. {item.unitCost} = Rs. {item.totalCost}</span>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Seller Modal */}
      {openSellerModal && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
          <form onSubmit={handleAddSeller} className={`p-6 rounded-xl w-[450px] border ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`flex justify-between items-center border-b pb-4 mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{editId ? 'Edit Seller' : 'Add New Seller'}</h2>
              <button
                type='button'
                onClick={() => {
                  setOpenSellerModal(false);
                  setSellerFormData({ name: '', phone: '', email: '', address: '', company: '' });
                  setEditId(null);
                }}
                className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                ✕
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Name *</label>
                <input
                  required
                  value={sellerFormData.name}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, name: e.target.value })}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Company</label>
                <input
                  value={sellerFormData.company}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, company: e.target.value })}
                  placeholder='Enter company name'
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Phone</label>
                <input
                  type='number'
                  value={sellerFormData.phone}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, phone: e.target.value })}
                  placeholder='Enter phone number'
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
                <input
                  type='email'
                  value={sellerFormData.email}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, email: e.target.value })}
                  placeholder='Enter email'
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Address</label>
                <input
                  value={sellerFormData.address}
                  onChange={(e) => setSellerFormData({ ...sellerFormData, address: e.target.value })}
                  placeholder='Enter address'
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            {error && (
              <div className='flex items-center gap-2 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2 mt-4'>
                <AlertCircle size={16} className='text-red-500' />
                <p className='text-sm text-red-400'>{error}</p>
              </div>
            )}

            <div className='flex justify-end gap-3 mt-6'>
              <button
                type='button'
                onClick={() => {
                  setOpenSellerModal(false);
                  setSellerFormData({ name: '', phone: '', email: '', address: '', company: '' });
                  setEditId(null);
                }}
                disabled={loading}
                className={`px-4 py-2 rounded-lg hover:disabled:opacity-50 ${theme === 'dark' ? 'bg-[#1E293B] text-white hover:bg-[#334155]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading}
                className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {loading ? 'Saving...' : 'Save Seller'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchase Modal */}
      {openPurchaseModal && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>
          <form onSubmit={handleAddPurchase} className={`p-6 rounded-xl w-[600px] border max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`flex justify-between items-center border-b pb-4 mb-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>New Purchase</h2>
              <button
                type='button'
                onClick={() => {
                  setOpenPurchaseModal(false);
                  setPurchaseFormData({
                    seller: '',
                    sellerName: '',
                    items: [{ name: '', quantity: 1, unitCost: 0, totalCost: 0, category: '', stock: 0 }],
                    totalAmount: 0,
                    paidAmount: 0,
                    paymentMethod: 'Cash'
                  });
                }}
                className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
              >
                ✕
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Seller *</label>
                <select
                  required
                  value={purchaseFormData.seller}
                  onChange={(e) => {
                    const seller = sellers?.find(s => s._id === e.target.value);
                    handleSelectSeller(seller);
                  }}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  <option value=''>Select Seller</option>
                  {sellers?.map(seller => (
                    <option key={seller._id} value={seller._id}>{seller.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Items *</label>
                  <button
                    type='button'
                    onClick={handleAddPurchaseItem}
                    className='text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/30'
                  >
                    + Add Item
                  </button>
                </div>
                {purchaseFormData.items.map((item, index) => (
                  <div key={index} className={`p-3 rounded-lg border mb-2 ${theme === 'dark' ? 'bg-[#111827] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <div className='grid grid-cols-2 gap-2 mb-2'>
                      <div>
                        <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Product Name</label>
                        <input
                          required
                          type='text'
                          value={item.name}
                          onChange={(e) => handlePurchaseItemChange(index, 'name', e.target.value)}
                          placeholder='Enter product name'
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Category</label>
                        <select
                          value={item.category}
                          onChange={(e) => handlePurchaseItemChange(index, 'category', e.target.value)}
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                          <option value=''>Select Category</option>
                          {categories?.map(category => (
                            <option key={category._id} value={category.name}>{category.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2 mb-2'>
                      <div>
                        <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Quantity</label>
                        <input
                          required
                          type='number'
                          min='1'
                          value={item.quantity === 1 ? '' : item.quantity}
                          onChange={(e) => handlePurchaseItemChange(index, 'quantity', Number(e.target.value) || 1)}
                          placeholder='Enter quantity'
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Stock to Add</label>
                        <input
                          required
                          type='number'
                          min='0'
                          value={item.stock === 0 ? '' : item.stock}
                          onChange={(e) => handlePurchaseItemChange(index, 'stock', Number(e.target.value) || 0)}
                          placeholder='Enter stock'
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2 mb-2'>
                      <div>
                        <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Unit Cost</label>
                        <input
                          required
                          type='number'
                          min='0'
                          value={item.unitCost === 0 ? '' : item.unitCost}
                          onChange={(e) => handlePurchaseItemChange(index, 'unitCost', Number(e.target.value) || 0)}
                          placeholder='Enter cost'
                          className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                      </div>
                      <div>
                        <label className={`text-xs mb-1 block ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Total</label>
                        <p className='text-sm text-emerald-400 font-semibold p-2'>Rs. {item.totalCost.toLocaleString()}</p>
                      </div>
                    </div>
                      {purchaseFormData.items.length > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemovePurchaseItem(index)}
                          className='text-red-400 hover:text-red-300 text-sm'
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Paid Amount</label>
                  <input
                    type='number'
                    min='0'
                    value={purchaseFormData.paidAmount === 0 ? '' : purchaseFormData.paidAmount}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, paidAmount: Number(e.target.value) || 0 })}
                    placeholder='Enter paid amount'
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`text-sm font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method</label>
                  <select
                    value={purchaseFormData.paymentMethod}
                    onChange={(e) => setPurchaseFormData({ ...purchaseFormData, paymentMethod: e.target.value })}
                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value='Cash'>Cash</option>
                    <option value='Bank Transfer'>Bank Transfer</option>
                    <option value='Credit'>Credit</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-[#111827] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className='flex justify-between items-center'>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Amount:</span>
                  <span className='text-xl font-bold text-emerald-400'>Rs. {purchaseFormData.totalAmount.toLocaleString()}</span>
                </div>
                <div className='flex justify-between items-center mt-2'>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Remaining:</span>
                  <span className='text-lg font-semibold text-amber-400'>
                    Rs. {(purchaseFormData.totalAmount - purchaseFormData.paidAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className='flex items-center gap-2 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2 mt-4'>
                <AlertCircle size={16} className='text-red-500' />
                <p className='text-sm text-red-400'>{error}</p>
              </div>
            )}

            <div className='flex justify-end gap-3 mt-6'>
              <button
                type='button'
                onClick={() => {
                  setOpenPurchaseModal(false);
                  setPurchaseFormData({
                    seller: '',
                    sellerName: '',
                    items: [{ name: '', quantity: 1, unitCost: 0, totalCost: 0, category: '' }],
                    totalAmount: 0,
                    paidAmount: 0,
                    paymentMethod: 'Cash'
                  });
                }}
                disabled={loading}
                className={`px-4 py-2 rounded-lg hover:disabled:opacity-50 ${theme === 'dark' ? 'bg-[#1E293B] text-white hover:bg-[#334155]' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading || purchaseFormData.items.length === 0}
                className='px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {loading ? 'Processing...' : 'Create Purchase'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Seller;
