import React from 'react'
import { Clock, CheckCircle, ChefHat, Package, ShoppingBag, Utensils } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import OrderTimeline from './OrderTimeline'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  preparing: {
    label: 'Preparing',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  ready: {
    label: 'Ready',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  },
  completed: {
    label: 'Completed',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}

export default function OrderCard({ order, onUpdateStatus }) {
  const config = statusConfig[order.status] || statusConfig.pending

  const TypeIcon = order.type === 'dine-in' ? Utensils : ShoppingBag

  return (
    <div className="flex flex-col h-full w-full bg-slate-800/80 border border-slate-700/80 p-5 rounded-3xl shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-black text-white text-base">{order.id}</span>
            <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 uppercase tracking-wider", config.color)}>
              {config.label}
            </div>
            <div className="bg-slate-700/80 text-slate-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-slate-600 flex items-center gap-1 uppercase tracking-wider">
               <TypeIcon size={12} />
               {order.type === 'dine-in' ? 'Dine-in' : 'Takeaway'}
            </div>
          </div>
          <h3 className="text-slate-300 font-bold text-xs">{order.customerName || 'Customer'}</h3>
        </div>
        <div className="text-right">
          <div className="font-black text-xl font-mono text-orange-400">₹{order.total?.toFixed(0) || order.total}</div>
          <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
            {order.slot || new Date(order.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="flex-1 mb-4">
        <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-700/60 space-y-2">
          <ul className="space-y-2">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between text-xs">
                <span className="text-slate-200 font-bold">
                  <span className="text-orange-400 font-black mr-1.5">{item.quantity}x</span>
                  {item.name}
                </span>
                <span className="text-slate-400 font-mono font-bold">₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto pt-2">
        <OrderTimeline currentStatus={order.status} onStatusChange={(newStatus) => onUpdateStatus(order.id, newStatus)} />
      </div>
    </div>
  )
}
