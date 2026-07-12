import type {
  Booking,
  ShareGroup,
  Truck,
  User,
  TripEvent,
  BookingStatus,
} from './types'
import { getCity, roadDistanceKm } from './cities'
import { computeFare, computeSharedFare } from './fare'
import { getTruckType } from './trucks'
import { avatarColor } from './utils'

const DAY = 86_400_000

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * DAY).toISOString()
}

/** Build a status timeline up to a given current status. */
function buildTimeline(current: BookingStatus, pickupISO: string): TripEvent[] {
  const order: { status: BookingStatus; label: string }[] = [
    { status: 'confirmed', label: 'Booking confirmed' },
    { status: 'picked-up', label: 'Goods picked up' },
    { status: 'in-transit', label: 'In transit' },
    { status: 'delivered', label: 'Delivered' },
  ]
  const reachedIdx = order.findIndex((o) => o.status === current)
  const base = new Date(pickupISO).getTime()
  return order.map((o, i) => {
    const reached = current === 'cancelled' ? false : i <= reachedIdx
    return {
      status: o.status,
      label: o.label,
      at: reached ? new Date(base + i * 6 * 3600_000).toISOString() : null,
    }
  })
}

// --- Users -----------------------------------------------------------------

export const SEED_USERS: User[] = [
  {
    id: 'u_shipper_demo',
    role: 'shipper',
    name: 'Ananya Sharma',
    email: 'shipper@passandpay.in',
    phone: '+91 98200 11223',
    company: 'Sharma Textiles',
    city: 'Mumbai',
    avatarColor: avatarColor('Ananya Sharma'),
    kycStatus: 'verified',
    rating: 4.7,
    createdAt: daysFromNow(-120),
    documents: [
      { id: 'd1', label: 'PAN Card', fileName: 'pan_ananya.pdf', uploadedAt: daysFromNow(-118), status: 'verified' },
      { id: 'd2', label: 'GST Certificate', fileName: 'gst_sharma_textiles.pdf', uploadedAt: daysFromNow(-118), status: 'verified' },
    ],
  },
  {
    id: 'u_transporter_demo',
    role: 'transporter',
    name: 'Rajinder Singh',
    email: 'transporter@passandpay.in',
    phone: '+91 99100 44556',
    company: 'Singh Roadlines',
    city: 'Delhi',
    avatarColor: avatarColor('Rajinder Singh'),
    kycStatus: 'verified',
    rating: 4.8,
    createdAt: daysFromNow(-200),
    documents: [
      { id: 'd3', label: 'Driving License', fileName: 'dl_rajinder.jpg', uploadedAt: daysFromNow(-198), status: 'verified' },
      { id: 'd4', label: 'Aadhaar', fileName: 'aadhaar_rajinder.pdf', uploadedAt: daysFromNow(-198), status: 'verified' },
    ],
  },
  {
    id: 'u_admin_demo',
    role: 'admin',
    name: 'Pass & Pay Ops',
    email: 'admin@passandpay.in',
    phone: '+91 90000 00000',
    city: 'Bengaluru',
    avatarColor: avatarColor('Admin'),
    kycStatus: 'verified',
    createdAt: daysFromNow(-365),
    documents: [],
  },
  // Extra users awaiting verification (for admin queue)
  {
    id: 'u_shipper_2',
    role: 'shipper',
    name: 'Vikram Patel',
    email: 'vikram@example.in',
    phone: '+91 97600 33445',
    company: 'Patel Electronics',
    city: 'Ahmedabad',
    avatarColor: avatarColor('Vikram Patel'),
    kycStatus: 'pending',
    createdAt: daysFromNow(-3),
    documents: [
      { id: 'd5', label: 'PAN Card', fileName: 'pan_vikram.pdf', uploadedAt: daysFromNow(-2), status: 'pending' },
    ],
  },
  {
    id: 'u_transporter_2',
    role: 'transporter',
    name: 'Mohammed Irfan',
    email: 'irfan@example.in',
    phone: '+91 98765 12345',
    company: 'Irfan Cargo Movers',
    city: 'Hyderabad',
    avatarColor: avatarColor('Mohammed Irfan'),
    kycStatus: 'pending',
    createdAt: daysFromNow(-1),
    documents: [
      { id: 'd6', label: 'Driving License', fileName: 'dl_irfan.jpg', uploadedAt: daysFromNow(-1), status: 'pending' },
    ],
  },
]

// --- Trucks ----------------------------------------------------------------

export const SEED_TRUCKS: Truck[] = [
  {
    id: 't_1',
    ownerId: 'u_transporter_demo',
    typeId: 'eicher17',
    registrationNo: 'DL 01 GA 4521',
    modelName: 'Eicher Pro 1110',
    capacityTons: 5,
    status: 'on-trip',
    kycStatus: 'verified',
    city: 'Delhi',
    documents: [
      { id: 'td1', label: 'RC Book', fileName: 'rc_dl01ga4521.pdf', uploadedAt: daysFromNow(-190), status: 'verified' },
      { id: 'td2', label: 'Insurance', fileName: 'ins_dl01ga4521.pdf', uploadedAt: daysFromNow(-30), status: 'verified' },
    ],
  },
  {
    id: 't_2',
    ownerId: 'u_transporter_demo',
    typeId: 'container',
    registrationNo: 'DL 01 GB 7788',
    modelName: 'Ashok Leyland 2820',
    capacityTons: 12,
    status: 'available',
    kycStatus: 'verified',
    city: 'Delhi',
    documents: [
      { id: 'td3', label: 'RC Book', fileName: 'rc_dl01gb7788.pdf', uploadedAt: daysFromNow(-150), status: 'verified' },
    ],
  },
  {
    id: 't_3',
    ownerId: 'u_transporter_demo',
    typeId: 'eicher14',
    registrationNo: 'DL 01 GC 1290',
    modelName: 'Eicher Pro 2049',
    capacityTons: 4,
    status: 'available',
    kycStatus: 'pending',
    city: 'Delhi',
    documents: [
      { id: 'td4', label: 'RC Book', fileName: 'rc_dl01gc1290.pdf', uploadedAt: daysFromNow(-2), status: 'pending' },
    ],
  },
]

// --- Bookings --------------------------------------------------------------

function makeBooking(args: {
  id: string
  shipperId: string
  shipperName: string
  transporterId?: string
  transporterName?: string
  truckId?: string
  truckTypeId: Booking['truckTypeId']
  origin: string
  destination: string
  goodsType: string
  weightTons: number
  pickupOffsetDays: number
  mode: Booking['mode']
  status: BookingStatus
  paymentStatus: Booking['paymentStatus']
  shareGroupId?: string
}): Booking {
  const distanceKm = roadDistanceKm(args.origin, args.destination)
  const oc = getCity(args.origin)!.coord
  const dc = getCity(args.destination)!.coord
  const truck = getTruckType(args.truckTypeId)
  const fare =
    args.mode === 'shared'
      ? computeSharedFare({
          truckTypeId: args.truckTypeId,
          distanceKm,
          myWeightTons: args.weightTons,
          truckCapacityTons: truck.capacityTons,
        })
      : computeFare({ truckTypeId: args.truckTypeId, distanceKm })
  const pickupDate = daysFromNow(args.pickupOffsetDays)
  return {
    id: args.id,
    shipperId: args.shipperId,
    shipperName: args.shipperName,
    transporterId: args.transporterId,
    transporterName: args.transporterName,
    truckId: args.truckId,
    truckTypeId: args.truckTypeId,
    origin: args.origin,
    destination: args.destination,
    originCoord: oc,
    destinationCoord: dc,
    distanceKm,
    goodsType: args.goodsType,
    weightTons: args.weightTons,
    pickupDate,
    mode: args.mode,
    shareGroupId: args.shareGroupId,
    status: args.status,
    paymentStatus: args.paymentStatus,
    fare,
    timeline: buildTimeline(args.status, pickupDate),
    currentCoord:
      args.status === 'in-transit' || args.status === 'picked-up'
        ? [oc[0] + (dc[0] - oc[0]) * 0.45, oc[1] + (dc[1] - oc[1]) * 0.45]
        : undefined,
    createdAt: daysFromNow(args.pickupOffsetDays - 2),
    transporterRating: args.status === 'delivered' ? 5 : undefined,
    shipperRating: args.status === 'delivered' ? 4.5 : undefined,
  }
}

export const SEED_BOOKINGS: Booking[] = [
  makeBooking({
    id: 'b_1001',
    shipperId: 'u_shipper_demo',
    shipperName: 'Ananya Sharma',
    transporterId: 'u_transporter_demo',
    transporterName: 'Rajinder Singh',
    truckId: 't_1',
    truckTypeId: 'eicher17',
    origin: 'Delhi',
    destination: 'Jaipur',
    goodsType: 'Cotton fabric rolls',
    weightTons: 4.2,
    pickupOffsetDays: 0,
    mode: 'full',
    status: 'in-transit',
    paymentStatus: 'unpaid',
  }),
  makeBooking({
    id: 'b_1002',
    shipperId: 'u_shipper_demo',
    shipperName: 'Ananya Sharma',
    transporterId: 'u_transporter_demo',
    transporterName: 'Rajinder Singh',
    truckId: 't_2',
    truckTypeId: 'container',
    origin: 'Mumbai',
    destination: 'Bengaluru',
    goodsType: 'Packaged garments',
    weightTons: 9,
    pickupOffsetDays: -8,
    mode: 'full',
    status: 'delivered',
    paymentStatus: 'paid',
  }),
  makeBooking({
    id: 'b_1003',
    shipperId: 'u_shipper_demo',
    shipperName: 'Ananya Sharma',
    truckTypeId: 'eicher14',
    origin: 'Mumbai',
    destination: 'Pune',
    goodsType: 'Retail stock cartons',
    weightTons: 1.5,
    pickupOffsetDays: 2,
    mode: 'shared',
    status: 'pending',
    paymentStatus: 'unpaid',
    shareGroupId: 'sg_1',
  }),
  // Other shippers' open loads — visible to transporters in "Available Loads"
  makeBooking({
    id: 'b_2001',
    shipperId: 'u_shipper_2',
    shipperName: 'Vikram Patel',
    truckTypeId: 'container',
    origin: 'Ahmedabad',
    destination: 'Delhi',
    goodsType: 'LED televisions (boxed)',
    weightTons: 8,
    pickupOffsetDays: 1,
    mode: 'full',
    status: 'pending',
    paymentStatus: 'unpaid',
  }),
  makeBooking({
    id: 'b_2002',
    shipperId: 'u_shipper_2',
    shipperName: 'Vikram Patel',
    truckTypeId: 'eicher14',
    origin: 'Mumbai',
    destination: 'Pune',
    goodsType: 'Home appliances',
    weightTons: 2,
    pickupOffsetDays: 2,
    mode: 'shared',
    status: 'pending',
    paymentStatus: 'unpaid',
    shareGroupId: 'sg_1',
  }),
  makeBooking({
    id: 'b_2003',
    shipperId: 'u_shipper_2',
    shipperName: 'Vikram Patel',
    truckTypeId: 'mini',
    origin: 'Pune',
    destination: 'Mumbai',
    goodsType: 'Spare parts',
    weightTons: 0.8,
    pickupOffsetDays: 3,
    mode: 'full',
    status: 'pending',
    paymentStatus: 'unpaid',
  }),
]

// --- Share groups ----------------------------------------------------------

export const SEED_SHARE_GROUPS: ShareGroup[] = [
  {
    id: 'sg_1',
    truckTypeId: 'eicher14',
    origin: 'Mumbai',
    destination: 'Pune',
    pickupDate: daysFromNow(2),
    capacityTons: getTruckType('eicher14').capacityTons,
    usedTons: 3.5, // b_1003 (1.5t) + b_2002 (2t)
    bookingIds: ['b_1003', 'b_2002'],
  },
]
