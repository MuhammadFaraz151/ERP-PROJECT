import axios from 'axios'
import React, { useEffect, useRef, useState, useCallback } from 'react'

const Customerslist = ({setcustomer}) => {
  const [data,setdata]=useState(null)
  const [query,setQuery]=useState("")
  const [showSuggestions,setShowSuggestions]=useState(false)
  const wrapperRef = useRef(null)

  const getCustomers = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5555/allCustomer")
      setdata(res.data)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setdata([])
    }
  }, [])

  useEffect(() => {
    getCustomers()
  }, [getCustomers])


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = data?.filter((k) =>
    k.name.toLowerCase().includes(query.toLowerCase())
  ) || []

  const handleSelect = (customer) => {
    setcustomer(customer)
    setQuery(customer.name)
    setShowSuggestions(false)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
    if (e.target.value === "") {
      setcustomer(null)
    }
  }

  return (
    <div className='bg-[#020617] p-5 text-white border border-white/10 rounded-xl'>
      <div><h1 className='text-xl'>Customer Selection</h1></div>
      <div className='flex flex-col gap-3 mt-4 relative' ref={wrapperRef}>
        <p className='text-sm text-gray-400 font-medium mb-1'>Select Client / Customer</p>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type customer name..."
          className='p-2 w-full bg-[#0F172A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
        />

        {showSuggestions && query.length > 0 && (
          <ul className='absolute top-[68px] z-50 w-full bg-[#0F172A] border border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto'>
            {filtered.length > 0 ? (
              filtered.map((k) => (
                <li
                  key={k._id}
                  onClick={() => handleSelect(k)}
                  className='px-3 py-2 text-sm text-white hover:bg-[#1E293B] cursor-pointer'
                >
                  {k.name}
                </li>
              ))
            ) : (
              <li className='px-3 py-2 text-sm text-gray-500'>No matches found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Customerslist