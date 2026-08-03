import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

// Helper to format timestamps
const nowIso = () => new Date().toISOString()

// Initial mock parking slots
const initialParkingSlots = [
  { id: 'slot-A1', name: 'A1', floor: 'Ground', zone: 'Outdoor', allowedType: 'Car', status: 'Occupied', currentVehicleNumber: 'KA-01-AB-1234', currentRequestId: 'valet-101' },
  { id: 'slot-A2', name: 'A2', floor: 'Ground', zone: 'Outdoor', allowedType: 'Car', status: 'Available', currentVehicleNumber: null, currentRequestId: null },
  { id: 'slot-A3', name: 'A3', floor: 'Ground', zone: 'Outdoor', allowedType: 'SUV', status: 'Available', currentVehicleNumber: null, currentRequestId: null },
  { id: 'slot-B1', name: 'B1', floor: 'Basement-1', zone: 'Basement', allowedType: 'Car', status: 'Occupied', currentVehicleNumber: 'TS-09-EX-9988', currentRequestId: 'valet-102' },
  { id: 'slot-B2', name: 'B2', floor: 'Basement-1', zone: 'Basement', allowedType: 'Car', status: 'Available', currentVehicleNumber: null, currentRequestId: null },
  { id: 'slot-B3', name: 'B3', floor: 'Basement-1', zone: 'Basement', allowedType: 'SUV', status: 'Available', currentVehicleNumber: null, currentRequestId: null },
  { id: 'slot-VIP1', name: 'VIP-01', floor: 'Ground', zone: 'VIP', allowedType: 'Car', status: 'Reserved', currentVehicleNumber: null, currentRequestId: null },
  { id: 'slot-VIP2', name: 'VIP-02', floor: 'Ground', zone: 'VIP', allowedType: 'SUV', status: 'Available', currentVehicleNumber: null, currentRequestId: null },
  { id: 'slot-C1', name: 'Covered-1', floor: 'Ground', zone: 'Covered', allowedType: 'Bike', status: 'Available', currentVehicleNumber: null, currentRequestId: null },
  { id: 'slot-S1', name: 'Staff-01', floor: 'Basement-2', zone: 'Staff', allowedType: 'Car', status: 'Available', currentVehicleNumber: null, currentRequestId: null }
]

// Initial mock valet requests
const initialValetRequests = [
  {
    id: 'valet-101',
    tokenNumber: 'VP-000101',
    orderId: 'ORD-1001',
    restaurantId: 'r1',
    customerName: 'Alice Johnson',
    vehicleNumber: 'KA-01-AB-1234',
    vehicleType: 'Car',
    vehicleColor: 'White',
    arrivalTime: '12:30 PM',
    actualArrivalTime: new Date(Date.now() - 25 * 60000).toISOString(),
    parkingSlot: 'A1',
    parkingSlotId: 'slot-A1',
    watchmanId: 'wm-1',
    watchmanName: 'Ramesh Kumar',
    currentStatus: 'PARKED',
    notes: 'Near entrance',
    statusHistory: [
      { status: 'WAITING', timestamp: new Date(Date.now() - 35 * 60000).toISOString() },
      { status: 'ARRIVED', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
      { status: 'RECEIVED', timestamp: new Date(Date.now() - 28 * 60000).toISOString() },
      { status: 'PARKED', timestamp: new Date(Date.now() - 25 * 60000).toISOString() }
    ]
  },
  {
    id: 'valet-102',
    tokenNumber: 'VP-000102',
    orderId: 'ORD-1002',
    restaurantId: 'r1',
    customerName: 'Bob Smith',
    vehicleNumber: 'TS-09-EX-9988',
    vehicleType: 'SUV',
    vehicleColor: 'Black',
    arrivalTime: '12:45 PM',
    actualArrivalTime: new Date(Date.now() - 15 * 60000).toISOString(),
    parkingSlot: 'B1',
    parkingSlotId: 'slot-B1',
    watchmanId: 'wm-2',
    watchmanName: 'Suresh Verma',
    currentStatus: 'REQUESTED',
    notes: 'Handle with care',
    statusHistory: [
      { status: 'WAITING', timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
      { status: 'ARRIVED', timestamp: new Date(Date.now() - 20 * 60000).toISOString() },
      { status: 'RECEIVED', timestamp: new Date(Date.now() - 18 * 60000).toISOString() },
      { status: 'PARKED', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
      { status: 'REQUESTED', timestamp: new Date(Date.now() - 2 * 60000).toISOString() }
    ]
  },
  {
    id: 'valet-103',
    tokenNumber: 'VP-000103',
    orderId: 'ORD-1004',
    restaurantId: 'r1',
    customerName: 'Carol Danvers',
    vehicleNumber: 'MH-12-PQ-5544',
    vehicleType: 'Car',
    vehicleColor: 'Red',
    arrivalTime: '01:10 PM',
    actualArrivalTime: null,
    parkingSlot: null,
    parkingSlotId: null,
    watchmanId: null,
    watchmanName: null,
    currentStatus: 'ARRIVED',
    notes: 'Customer at main lobby',
    statusHistory: [
      { status: 'WAITING', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
      { status: 'ARRIVED', timestamp: new Date(Date.now() - 2 * 60000).toISOString() }
    ]
  }
]

const initialWatchmen = [
  { id: 'wm-1', name: 'Ramesh Kumar', phone: '+91 98765 43210', shift: 'Day Shift (8 AM - 4 PM)', activeStatus: 'Online', currentAssignedVehicles: 3 },
  { id: 'wm-2', name: 'Suresh Verma', phone: '+91 98765 43211', shift: 'Day Shift (8 AM - 4 PM)', activeStatus: 'Online', currentAssignedVehicles: 2 },
  { id: 'wm-3', name: 'Rajesh Singh', phone: '+91 98765 43212', shift: 'Evening Shift (4 PM - 12 AM)', activeStatus: 'Offline', currentAssignedVehicles: 0 }
]

const showNotificationToast = (message, icon = '🚗') => {
  toast(message, {
    icon,
    style: {
      borderRadius: '16px',
      background: '#0f172a',
      color: '#f8fafc',
      border: '1px solid #334155'
    }
  })
}

let tokenCounter = 104

const matchesReq = (req, targetId) => {
  return req.id === targetId || req.tokenNumber === targetId || req.orderId === targetId
}

const useValetStore = create(
  persist(
    (set, get) => ({
      valetRequests: initialValetRequests,
      parkingSlots: initialParkingSlots,
      watchmen: initialWatchmen,

      // --- Customer & Order Flow Actions ---
      createValetRequest: (payload) => {
        const tokenNumber = `VP-${String(tokenCounter++).padStart(6, '0')}`
        const newRequest = {
          id: `valet-${Date.now()}`,
          tokenNumber,
          orderId: payload.orderId,
          restaurantId: payload.restaurantId || 'r1',
          customerName: payload.customerName || 'You',
          vehicleNumber: payload.vehicleNumber,
          vehicleType: payload.vehicleType || 'Car',
          vehicleColor: payload.vehicleColor || '',
          arrivalTime: payload.arrivalTime || 'ASAP',
          actualArrivalTime: null,
          parkingSlot: null,
          parkingSlotId: null,
          watchmanId: null,
          watchmanName: null,
          currentStatus: 'WAITING',
          notes: payload.notes || '',
          statusHistory: [{ status: 'WAITING', timestamp: nowIso() }]
        }

        set((state) => ({
          valetRequests: [newRequest, ...state.valetRequests]
        }))

        showNotificationToast(`Valet Ticket Created! Token: ${tokenNumber}`, '🎟️')
        return newRequest
      },

      markCustomerArrived: (requestId) => {
        set((state) => {
          const updated = state.valetRequests.map((req) => {
            if (matchesReq(req, requestId)) {
              const updatedHistory = [...req.statusHistory, { status: 'ARRIVED', timestamp: nowIso() }]
              return { ...req, currentStatus: 'ARRIVED', actualArrivalTime: nowIso(), statusHistory: updatedHistory }
            }
            return req
          })
          return { valetRequests: [...updated] }
        })
        showNotificationToast('Customer Arrived! Watchman notified.', '📍')
      },

      requestVehicleRetrieval: (requestId) => {
        set((state) => {
          const updated = state.valetRequests.map((req) => {
            if (matchesReq(req, requestId)) {
              const updatedHistory = [...req.statusHistory, { status: 'REQUESTED', timestamp: nowIso() }]
              return { ...req, currentStatus: 'REQUESTED', statusHistory: updatedHistory }
            }
            return req
          })
          return { valetRequests: [...updated] }
        })
        showNotificationToast('Vehicle Retrieval Requested! Watchman is on the way.', '🏎️')
      },

      // --- Watchman Actions ---
      receiveVehicle: (requestId, parkingSlotId, watchmanId = 'wm-1', watchmanName = 'Ramesh Kumar') => {
        const slots = get().parkingSlots
        const slot = slots.find((s) => s.id === parkingSlotId)

        if (!slot) {
          toast.error('Selected parking slot does not exist!')
          return
        }

        set((state) => {
          const targetReq = state.valetRequests.find((r) => matchesReq(r, requestId))

          // Update request status to PARKED and assign slot
          const updatedRequests = state.valetRequests.map((req) => {
            if (matchesReq(req, requestId)) {
              const updatedHistory = [
                ...req.statusHistory,
                { status: 'RECEIVED', timestamp: nowIso() },
                { status: 'PARKED', timestamp: nowIso() }
              ]
              return {
                ...req,
                currentStatus: 'PARKED',
                parkingSlot: slot.name,
                parkingSlotId: slot.id,
                watchmanId,
                watchmanName,
                statusHistory: updatedHistory
              }
            }
            return req
          })

          // Update parking slot status to Occupied
          const updatedSlots = state.parkingSlots.map((s) => {
            if (s.id === parkingSlotId) {
              return {
                ...s,
                status: 'Occupied',
                currentVehicleNumber: targetReq ? targetReq.vehicleNumber : 'PARKED',
                currentRequestId: targetReq ? targetReq.id : requestId
              }
            }
            return s
          })

          return { valetRequests: [...updatedRequests], parkingSlots: [...updatedSlots] }
        })

        showNotificationToast(`Vehicle Parked in Slot ${slot.name}! Digital ticket updated.`, '🅿️')
      },

      startVehicleDelivery: (requestId) => {
        set((state) => {
          const updated = state.valetRequests.map((req) => {
            if (matchesReq(req, requestId)) {
              const updatedHistory = [...req.statusHistory, { status: 'DELIVERING', timestamp: nowIso() }]
              return { ...req, currentStatus: 'DELIVERING', statusHistory: updatedHistory }
            }
            return req
          })
          return { valetRequests: [...updated] }
        })
        showNotificationToast('Vehicle is being fetched from parking slot...', '🚘')
      },

      completeVehicleDelivery: (requestId) => {
        set((state) => {
          let freedSlotId = null
          const updatedRequests = state.valetRequests.map((req) => {
            if (matchesReq(req, requestId)) {
              freedSlotId = req.parkingSlotId
              const updatedHistory = [...req.statusHistory, { status: 'COMPLETED', timestamp: nowIso() }]
              return { ...req, currentStatus: 'COMPLETED', statusHistory: updatedHistory }
            }
            return req
          })

          const updatedSlots = state.parkingSlots.map((s) => {
            if (s.id === freedSlotId || s.currentRequestId === requestId) {
              return { ...s, status: 'Available', currentVehicleNumber: null, currentRequestId: null }
            }
            return s
          })

          return { valetRequests: [...updatedRequests], parkingSlots: [...updatedSlots] }
        })

        showNotificationToast('Vehicle Delivered to Customer at Exit Gate 1!', '✅')
      },

      cancelValetRequest: (requestId) => {
        set((state) => {
          let freedSlotId = null
          const updatedRequests = state.valetRequests.map((req) => {
            if (matchesReq(req, requestId)) {
              freedSlotId = req.parkingSlotId
              const updatedHistory = [...req.statusHistory, { status: 'CANCELLED', timestamp: nowIso() }]
              return { ...req, currentStatus: 'CANCELLED', statusHistory: updatedHistory }
            }
            return req
          })

          const updatedSlots = state.parkingSlots.map((s) => {
            if (s.id === freedSlotId || s.currentRequestId === requestId) {
              return { ...s, status: 'Available', currentVehicleNumber: null, currentRequestId: null }
            }
            return s
          })

          return { valetRequests: [...updatedRequests], parkingSlots: [...updatedSlots] }
        })
        showNotificationToast('Valet Request Cancelled', '❌')
      },

      // --- Parking Slot Management Actions ---
      addParkingSlot: (slotData) => {
        const newSlot = {
          id: `slot-${Date.now()}`,
          name: slotData.name,
          floor: slotData.floor || 'Ground',
          zone: slotData.zone || 'Outdoor',
          allowedType: slotData.allowedType || 'Car',
          status: 'Available',
          currentVehicleNumber: null,
          currentRequestId: null
        }
        set((state) => ({ parkingSlots: [...state.parkingSlots, newSlot] }))
        toast.success(`Parking Slot ${newSlot.name} created!`)
      },

      updateParkingSlot: (slotId, updatedFields) => {
        set((state) => ({
          parkingSlots: state.parkingSlots.map((s) => (s.id === slotId ? { ...s, ...updatedFields } : s))
        }))
        toast.success('Parking slot updated')
      },

      deleteParkingSlot: (slotId) => {
        set((state) => ({
          parkingSlots: state.parkingSlots.filter((s) => s.id !== slotId)
        }))
        toast.success('Parking slot deleted')
      },

      // --- Selectors & Analytics Helpers ---
      getValetByOrderId: (orderId) => {
        return get().valetRequests.find((r) => r.orderId === orderId)
      },

      getQueueMetrics: (restaurantId = 'r1') => {
        const requests = get().valetRequests.filter((r) => r.restaurantId === restaurantId)
        const slots = get().parkingSlots

        const waitingArrival = requests.filter((r) => r.currentStatus === 'WAITING' || r.currentStatus === 'ARRIVED').length
        const parked = requests.filter((r) => r.currentStatus === 'PARKED').length
        const waitingRetrieval = requests.filter((r) => r.currentStatus === 'REQUESTED' || r.currentStatus === 'DELIVERING').length
        const completed = requests.filter((r) => r.currentStatus === 'COMPLETED').length

        const availableSlotsCount = slots.filter((s) => s.status === 'Available').length
        const totalSlotsCount = slots.length
        const occupancyRate = totalSlotsCount > 0 ? Math.round(((totalSlotsCount - availableSlotsCount) / totalSlotsCount) * 100) : 0

        return {
          waitingArrival,
          parked,
          waitingRetrieval,
          completed,
          availableSlotsCount,
          totalSlotsCount,
          occupancyRate,
          avgParkDuration: '24 mins',
          avgRetrievalTime: '3.5 mins'
        }
      }
    }),
    {
      name: 'takeaway-valet-storage'
    }
  )
)

export default useValetStore
