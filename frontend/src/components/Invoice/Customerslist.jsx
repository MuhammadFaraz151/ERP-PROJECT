import axios from 'axios'
import React, { useEffect, useRef, useState, useCallback } from 'react'

const Customerslist = ({setcustomer, theme}) => {
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
    <div className={`p-5 border rounded-xl ${theme === 'dark' ? 'bg-[#020617] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'}`}>
      <div><h1 className='text-xl'>Customer Selection</h1></div>
      <div className='flex flex-col gap-3 mt-4 relative' ref={wrapperRef}>
        <p className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select Client / Customer</p>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type customer name..."
          className={`p-2 w-full border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
        />

        {showSuggestions && query.length > 0 && (
          <ul className={`absolute top-[68px] z-50 w-full border rounded-lg mt-1 max-h-48 overflow-y-auto ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700' : 'bg-white border-gray-200'}`}>
            {filtered.length > 0 ? (
              filtered.map((k) => (
                <li
                  key={k._id}
                  onClick={() => handleSelect(k)}
                  className={`px-3 py-2 text-sm cursor-pointer ${theme === 'dark' ? 'text-white hover:bg-[#1E293B]' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  {k.name}
                </li>
              ))
            ) : (
              <li className={`px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No matches found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Customerslist