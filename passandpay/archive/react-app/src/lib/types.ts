// ---------------------------------------------------------------------------
// Pass & Pay — domain types
// ---------------------------------------------------------------------------

export type Role = 'shipper' | 'transporter' | 'admin'

export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface User {
  id: string
  role: Role
  name: string
  email: string
  phone: string
  company?: string
  city?: string
  avatarColor: string // for generated avatar
  kycStatus: KycStatus
  documents: KycDocument[]
  createdAt: string
  rating?: number
}

export interface KycDocument {
  id: string
  label: string // e.g. "PAN Card", "Driving License", "RC Book"
  fileName: string
  uploadedAt: string
  status: KycStatus
}

export type TruckTypeId =
  | 'mini'
  | 'pickup'
  | 'eicher14'
  | 'eicher17'
  | 'container'
  | 'open'

export interface TruckType {
  id: TruckTypeId
  name: string
  capacityTons: number
  capacityLabel: string
  exampleUse: string
  perKmRate: number // ₹ per km
  baseFare: number // ₹
  image: string
  icon: string // lucide icon name
}

export type TruckStatus = 'available' | 'on-trip' | 'maintenance'

export interface Truck {
  id: string
  ownerId: string
  typeId: TruckTypeId
  registrationNo: string
  modelName: string
  capacityTons: number
  status: TruckStatus
  kycStatus: KycStatus
  documents: KycDocument[]
  city: string
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'picked-up'
  | 'in-transit'
  | 'delivered'
  | 'cancelled'

export type LoadMode = 'full' | 'shared'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'

export interface FareBreakdown {
  baseFare: number
  distanceKm: number
  perKmRate: number
  distanceCost: number
  surcharge: number
  surchargeLabel?: string
  gst: number
  total: number
}

export interface TripEvent {
  status: BookingStatus
  label: string
  at: string | null // ISO timestamp, null = not yet reached
  note?: string
}

export interface Booking {
  id: string
  shipperId: string
  shipperName: string
  transporterId?: string
  transporterName?: string
  truckId?: string
  truckTypeId: TruckTypeId
  origin: string
  destination: string
  originCoord: [number, number] // [lng, lat]
  destinationCoord: [number, number]
  distanceKm: number
  goodsType: string
  weightTons: number
  pickupDate: string // ISO date
  mode: LoadMode
  shareGroupId?: string // if part of a shared truck
  status: BookingStatus
  paymentStatus: PaymentStatus
  fare: FareBreakdown
  timeline: TripEvent[]
  currentCoord?: [number, number] // live position for in-transit
  createdAt: string
  shipperRating?: number
  transporterRating?: number
}

export interface ShareGroup {
  id: string
  truckTypeId: TruckTypeId
  origin: string
  destination: string
  pickupDate: string
  capacityTons: number
  usedTons: number
  bookingIds: string[]
}

export interface Invoice {
  id: string
  bookingId: string
  number: string
  amount: number
  issuedAt: string
  status: PaymentStatus
}
