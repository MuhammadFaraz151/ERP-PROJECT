import React from 'react'
import { SquarePen, Trash2, AlertTriangle } from 'lucide-react'

const InventoryCard = ({ data, compact = false, onEdit, onDelete }) => {
  const k = data
  
  
const getStatus = () => {
  if (!k.expiryDate) return 'healthy';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(k.expiryDate);
  expiryDate.setHours(0, 0, 0, 0);

  // Calculate days difference
  const daysDifference = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
  // Show as expired if less than 7 days remaining
  return daysDifference < 7 ? 'expired' : 'healthy';
};
  
  const status = getStatus();
  
  return (
    <>
      {!compact && (
        <p className="py-4 text-[#4D8DFF] border-b border-gray-800"> {k?._id?.slice(20, )}</p>
      )}

      <p className="py-4 text-white border-b border-gray-800">   {k.name}</p>

      {!compact && (
        <p className="py-4 text-gray-300 border-b border-gray-800">    {k.category} </p>
      )}

      {!compact && (
        <p className="py-4 text-white border-b border-gray-800">  Rs. {k.unitCost} </p>
      )}

      {!compact && (
        <p className="py-4 text-[#1FE39A] border-b border-gray-800">  Rs. {k.sellingPrice} </p>
      )}

      <p className={`py-4 text-sm border-b border-gray-800 flex items-center gap-1 ${k.stock < 5 ? 'text-red-500' : 'text-white'}`}>
        {k.stock}
        {k.stock < 5 && <AlertTriangle size={14} />}
      </p>

      {!compact && (
        <div className="py-3 border-b border-gray-800">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === 'expired'
                ? "bg-red-900/30 text-red-400 border border-red-700"
                : "bg-green-900/30 text-green-400 border border-green-700"
            }`}
          >
            {status}
          </span>
        </div>
      )}

      {onEdit && onDelete && !compact && (
        <div className='flex gap-4 border-b border-gray-800 py-4'>
          <button onClick={() => onEdit(k)} ><SquarePen className='text-white cursor-pointer ' /></button>
          <button onClick={() => onDelete(k?._id)} className='text-white cursor-pointer'><Trash2 /></button>
        </div>
      )}
    
    </>
  )
}

export default InventoryCard