import axios from 'axios'
import { CheckCircle2, Plus, SquarePen, Trash2, X, Search } from 'lucide-react'
import React, { useEffect, useState, useCallback } from 'react'

const Categories = () => {
  const [isopen, setisopen] = useState(false)
  const [data, setdata] = useState(null)
  const [err, seterr] = useState(null)
  const [success, setsuccess] = useState(null)
  const [loading, setloading] = useState(false)
  const [editId, seteditId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setformData] = useState({
    name: "",
  })

  const getCategories = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allCategories")
      setdata(res.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setdata([])
    }
  }, [])

  useEffect(() => {
    getCategories()
  }, [getCategories])

  const addCategory = async () => {
    if (!formData.name) {
      seterr("Enter category name")
      return
    }
    setloading(true)
    try {
      await axios.post("http://localhost:5555/category", {
        name: formData.name,
      })

      seterr(null)
      setisopen(false)
      setloading(false)
      setformData({
        name: "",
      })
      setsuccess("Category added successfully")
      getCategories()
      setTimeout(() => setsuccess(null), 3000)
    } catch (error) {
      setloading(false)
      seterr(error?.response?.data?.message)
      setTimeout(() => seterr(null), 3000)
    }
  }

  const updateCategory = async () => {
    if (!formData.name) {
      seterr("Enter category name")
      return
    }
    setloading(true)
    try {
      await axios.put("http://localhost:5555/updateCategory", {
        _id: editId,
        name: formData.name,
      })

      seterr(null)
      setisopen(false)
      setloading(false)
      seteditId(null)
      setformData({
        name: "",
      })
      setsuccess("Category updated successfully")
      getCategories()
      setTimeout(() => setsuccess(null), 3000)
    } catch (error) {
      setloading(false)
      seterr(error?.response?.data?.message)
      setTimeout(() => seterr(null), 3000)
    }
  }

  const handleForm = (e) => {
    e.preventDefault()
    if (editId) {
      updateCategory()
    } else {
      addCategory()
    }
  }

  const openEdit = (k) => {
    seteditId(k._id)
    setformData({
      name: k.name,
    })
    seterr(null)
    setisopen(true)
  }

  const closeForm = () => {
    setisopen(false)
    seteditId(null)
    seterr(null)
    setformData({
      name: "",
    })
  }

  const delCategory = async (id) => {
    try {
      await axios.delete("http://localhost:5555/deleteCategory", {
        data: {
          _id: id,
        },
      })

      setsuccess("Category deleted successfully")
      getCategories()
      setTimeout(() => setsuccess(null), 3000)
    } catch (error) {
      console.error(error)
      seterr(error?.response?.data?.message)
      setTimeout(() => seterr(null), 3000)
    }
  }

  const filteredData = data?.filter((k) =>
    k.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='bg-[#0F172A] w-full h-full flex-col p-7 relative'>

      {success !== null ? <div className='absolute z-50 left-[400px] flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-lg px-4 py-3 text-sm text-green-400 shadow-lg z-50'><CheckCircle2 size={16} /><p>{success}</p></div> : null}

      <div className='flex bg-[#162032] border border-white/7 justify-between text-white p-7 rounded-xl'>
        <div>
          <h1 className='text-2xl tracking-wider font-bold '>Category Management</h1>
          <p className='text-sm'>Manage product categories for better organization.</p>
        </div>
        <div className='flex gap-3 items-center'>
          <div className='relative'>
            <Search size={16} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search by name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 p-2 bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500'
            />
          </div>
          <div onClick={() => setisopen(true)} className='flex gap-3 items-center border border-white/10 p-3 rounded-xl bg-[#3B82F6]'>
            <Plus />
            <button className=''>Add Category</button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className='grid mb-4 grid-cols-4 border rounded-xl border-white/8 p-5 mt-6'>
        <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Category ID</p>
        <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Name</p>
        <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Created At</p>
        <p className="pb-3 text-sm font-semibold text-gray-400 border-b border-gray-700">Actions</p>

        {filteredData?.map((k) => {
          const id = k?._id?.slice(20,);
          const formattedDate = k?.createdAt?.replace("T", " ").slice(0, 16)
          return (
            <React.Fragment key={k._id}>
              <p className="py-4 text-sm text-[#4D8DFF] border-b border-gray-800"> {id}</p>
              <p className="py-4 text-sm text-white border-b border-gray-800 capitalize"> {k.name}</p>
              <p className="py-4 text-sm text-gray-400 border-b border-gray-800"> {formattedDate || "-"}</p>
              <p className="py-4 text-sm border-b border-gray-800 flex items-center gap-3">
                <SquarePen onClick={() => openEdit(k)} size={16} className='cursor-pointer text-blue-400 hover:text-blue-300' />
                <Trash2 onClick={() => delCategory(k._id)} size={16} className='cursor-pointer text-red-400 hover:text-red-300' />
              </p>
            </React.Fragment>
          )
        })}
      </div>

      {/* form */}
      {isopen === true && (
        <div className='h-full w-full text-white flex items-center justify-center bg-black/70 fixed inset-0'>
          <form onSubmit={handleForm} className='bg-[#020617] p-6 rounded-xl mt-20 ml-30 w-[420px] border border-white/10'>
            <div className='flex justify-between items-center border-b border-gray-700 pb-4'>
              <h1 className='text-lg font-semibold'>{editId ? "Edit Category" : "Add New Category"}</h1>
              <button onClick={closeForm} type='button' className='text-gray-400 hover:text-white'>
                <X size={18} />
              </button>
            </div>

            <div className='flex flex-col gap-1'>
              <div className='flex flex-col justify-start mt-4'>
                <label className='text-sm text-gray-400 font-medium mb-1' htmlFor='name'>Category Name</label>
                <input value={formData.name} onChange={(e) => setformData({
                  ...formData,
                  name: e.target.value
                })} id='name' type='text' className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500' />
              </div>

              {err !== null ? <div className='flex items-center gap-2 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2 mt-3'><p className='text-sm text-red-400'>{err}</p></div> : null}
            </div>

            <div className='flex justify-end gap-3 mt-6'>
              <button onClick={closeForm} type='button' disabled={loading} className='px-4 py-2 rounded-lg bg-[#1E293B] text-white hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed'>Cancel</button>
              <button type='submit' disabled={loading} className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'>{loading ? "Saving" : editId ? "Update Category" : "Save Category"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Categories