import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../store/useCartStore';

export default function TopCartButton() {
  const navigate = useNavigate();
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <button 
      onClick={() => navigate('/checkout')}
      className="relative p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-sm text-slate-800 transition-colors flex items-center justify-center border border-slate-200"
    >
      <ShoppingCart size={20} />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
          {totalItems}
        </span>
      )}
    </button>
  );
}
