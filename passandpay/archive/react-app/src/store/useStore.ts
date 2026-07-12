import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Booking,
  BookingStatus,
  KycStatus,
  LoadMode,
  Role,
  ShareGroup,
  Truck,
  TruckStatus,
  TruckTypeId,
  User,
} from '@/lib/types'
import { SEED_BOOKINGS, SEED_SHARE_GROUPS, SEED_TRUCKS, SEED_USERS } from '@/lib/seed'
import { computeFare, computeSharedFare } from '@/lib/fare'
import { getCity, roadDistanceKm } from '@/lib/cities'
import { getTruckType } from '@/lib/trucks'
import { avatarColor, uid } from '@/lib/utils'

interface NewBookingInput {
  origin: string
  destination: string
  goodsType: string
  weightTons: number
  truckTypeId: TruckTypeId
  pickupDate: string
  mode: LoadMode
}

interface AppState {
  // session
  currentUserId: string | null
  // data
  users: User[]
  trucks: Truck[]
  bookings: Booking[]
  shareGroups: ShareGroup[]

  // ---- auth ----
  login: (email: string) => User | null
  signup: (input: { name: string; email: string; phone: string; role: Role; company?: string; city?: string }) => User
  logout: () => void
  currentUser: () => User | undefined

  // ---- shipper ----
  createBooking: (input: NewBookingInput) => Booking
  cancelBooking: (bookingId: string) => void
  payBooking: (bookingId: string) => void
  rateTransporter: (bookingId: string, rating: number) => void

  // ---- transporter ----
  acceptLoad: (bookingId: string, truckId: string) => void
  advanceStatus: (bookingId: string) => void
  addTruck: (input: { typeId: TruckTypeId; registrationNo: string; modelName: string; city: string }) => Truck
  setTruckStatus: (truckId: string, status: TruckStatus) => void

  // ---- profile / kyc ----
  uploadDocument: (label: string, fileName: string) => void
  uploadTruckDocument: (truckId: string, label: string, fileName: string) => void

  // ---- admin ----
  setUserKyc: (userId: string, status: KycStatus) => void
  setTruckKyc: (truckId: string, status: KycStatus) => void

  // ---- maintenance ----
  resetData: () => void
}

const STATUS_FLOW: BookingStatus[] = [
  'confirmed',
  'picked-up',
  'in-transit',
  'delivered',
]

function nextStatus(s: BookingStatus): BookingStatus {
  const i = STATUS_FLOW.indexOf(s)
  if (i === -1 || i === STATUS_FLOW.length - 1) return s
  return STATUS_FLOW[i + 1]
}

function stampTimeline(b: Booking, status: BookingStatus): Booking['timeline'] {
  return b.timeline.map((ev) =>
    ev.status === status && !ev.at ? { ...ev, at: new Date().toISOString() } : ev,
  )
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      users: SEED_USERS,
      trucks: SEED_TRUCKS,
      bookings: SEED_BOOKINGS,
      shareGroups: SEED_SHARE_GROUPS,

      currentUser: () => get().users.find((u) => u.id === get().currentUserId),

      login: (email) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
        )
        if (user) set({ currentUserId: user.id })
        return user ?? null
      },

      signup: (input) => {
        const existing = get().users.find(
          (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
        )
        if (existing) {
          set({ currentUserId: existing.id })
          return existing
        }
        const user: User = {
          id: uid('u'),
          role: input.role,
          name: input.name,
          email: input.email.trim(),
          phone: input.phone,
          company: input.company,
          city: input.city,
          avatarColor: avatarColor(input.name),
          kycStatus: 'unverified',
          documents: [],
          createdAt: new Date().toISOString(),
          rating: undefined,
        }
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }))
        return user
      },

      logout: () => set({ currentUserId: null }),

      createBooking: (input) => {
        const user = get().currentUser()
        const distanceKm = roadDistanceKm(input.origin, input.destination)
        const oc = getCity(input.origin)!.coord
        const dc = getCity(input.destination)!.coord
        const truck = getTruckType(input.truckTypeId)

        const fare =
          input.mode === 'shared'
            ? computeSharedFare({
                truckTypeId: input.truckTypeId,
                distanceKm,
                myWeightTons: input.weightTons,
                truckCapacityTons: truck.capacityTons,
              })
            : computeFare({ truckTypeId: input.truckTypeId, distanceKm })

        const booking: Booking = {
          id: uid('b'),
          shipperId: user?.id ?? 'u_shipper_demo',
          shipperName: user?.name ?? 'Guest Shipper',
          truckTypeId: input.truckTypeId,
          origin: input.origin,
          destination: input.destination,
          originCoord: oc,
          destinationCoord: dc,
          distanceKm,
          goodsType: input.goodsType,
          weightTons: input.weightTons,
          pickupDate: input.pickupDate,
          mode: input.mode,
          status: 'pending',
          paymentStatus: 'unpaid',
          fare,
          timeline: [
            { status: 'confirmed', label: 'Booking confirmed', at: null },
            { status: 'picked-up', label: 'Goods picked up', at: null },
            { status: 'in-transit', label: 'In transit', at: null },
            { status: 'delivered', label: 'Delivered', at: null },
          ],
          createdAt: new Date().toISOString(),
        }

        // Part-load: join or create a matching share group.
        if (input.mode === 'shared') {
          const match = get().shareGroups.find(
            (g) =>
              g.truckTypeId === input.truckTypeId &&
              g.origin === input.origin &&
              g.destination === input.destination &&
              sameDay(g.pickupDate, input.pickupDate) &&
              g.usedTons + input.weightTons <= g.capacityTons,
          )
          if (match) {
            booking.shareGroupId = match.id
            set((s) => ({
              shareGroups: s.shareGroups.map((g) =>
                g.id === match.id
                  ? { ...g, usedTons: g.usedTons + input.weightTons, bookingIds: [...g.bookingIds, booking.id] }
                  : g,
              ),
            }))
          } else {
            const group: ShareGroup = {
              id: uid('sg'),
              truckTypeId: input.truckTypeId,
              origin: input.origin,
              destination: input.destination,
              pickupDate: input.pickupDate,
              capacityTons: truck.capacityTons,
              usedTons: input.weightTons,
              bookingIds: [booking.id],
            }
            booking.shareGroupId = group.id
            set((s) => ({ shareGroups: [...s.shareGroups, group] }))
          }
        }

        set((s) => ({ bookings: [booking, ...s.bookings] }))
        return booking
      },

      cancelBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b,
          ),
        })),

      payBooking: (bookingId) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, paymentStatus: 'paid' } : b,
          ),
        })),

      rateTransporter: (bookingId, rating) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, transporterRating: rating } : b,
          ),
        })),

      acceptLoad: (bookingId, truckId) => {
        const user = get().currentUser()
        const truck = get().trucks.find((t) => t.id === truckId)
        set((s) => ({
          bookings: s.bookings.map((b) => {
            if (b.id !== bookingId) return b
            const status: BookingStatus = 'confirmed'
            return {
              ...b,
              status,
              transporterId: user?.id,
              transporterName: user?.name,
              truckId,
              timeline: stampTimeline(b, status),
            }
          }),
          trucks: s.trucks.map((t) =>
            t.id === truckId ? { ...t, status: 'on-trip' as TruckStatus } : t,
          ),
        }))
        void truck
      },

      advanceStatus: (bookingId) =>
        set((s) => {
          let freedTruckId: string | undefined
          const bookings = s.bookings.map((b) => {
            if (b.id !== bookingId) return b
            const ns = nextStatus(b.status)
            if (ns === 'delivered') freedTruckId = b.truckId
            // simulate a live position jump toward destination
            const t =
              ns === 'in-transit' ? 0.5 : ns === 'delivered' ? 1 : ns === 'picked-up' ? 0.1 : 0
            const currentCoord: [number, number] = [
              b.originCoord[0] + (b.destinationCoord[0] - b.originCoord[0]) * t,
              b.originCoord[1] + (b.destinationCoord[1] - b.originCoord[1]) * t,
            ]
            return { ...b, status: ns, currentCoord, timeline: stampTimeline(b, ns) }
          })
          const trucks = freedTruckId
            ? s.trucks.map((t) =>
                t.id === freedTruckId ? { ...t, status: 'available' as TruckStatus } : t,
              )
            : s.trucks
          return { bookings, trucks }
        }),

      addTruck: (input) => {
        const user = get().currentUser()
        const type = getTruckType(input.typeId)
        const truck: Truck = {
          id: uid('t'),
          ownerId: user?.id ?? 'u_transporter_demo',
          typeId: input.typeId,
          registrationNo: input.registrationNo,
          modelName: input.modelName,
          capacityTons: type.capacityTons,
          status: 'available',
          kycStatus: 'pending',
          documents: [],
          city: input.city,
        }
        set((s) => ({ trucks: [...s.trucks, truck] }))
        return truck
      },

      setTruckStatus: (truckId, status) =>
        set((s) => ({
          trucks: s.trucks.map((t) => (t.id === truckId ? { ...t, status } : t)),
        })),

      uploadDocument: (label, fileName) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === s.currentUserId
              ? {
                  ...u,
                  kycStatus: u.kycStatus === 'verified' ? u.kycStatus : 'pending',
                  documents: [
                    ...u.documents,
                    { id: uid('d'), label, fileName, uploadedAt: new Date().toISOString(), status: 'pending' },
                  ],
                }
              : u,
          ),
        })),

      uploadTruckDocument: (truckId, label, fileName) =>
        set((s) => ({
          trucks: s.trucks.map((t) =>
            t.id === truckId
              ? {
                  ...t,
                  documents: [
                    ...t.documents,
                    { id: uid('td'), label, fileName, uploadedAt: new Date().toISOString(), status: 'pending' },
                  ],
                }
              : t,
          ),
        })),

      setUserKyc: (userId, status) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? { ...u, kycStatus: status, documents: u.documents.map((d) => ({ ...d, status })) }
              : u,
          ),
        })),

      setTruckKyc: (truckId, status) =>
        set((s) => ({
          trucks: s.trucks.map((t) =>
            t.id === truckId
              ? { ...t, kycStatus: status, documents: t.documents.map((d) => ({ ...d, status })) }
              : t,
          ),
        })),

      resetData: () =>
        set({
          users: SEED_USERS,
          trucks: SEED_TRUCKS,
          bookings: SEED_BOOKINGS,
          shareGroups: SEED_SHARE_GROUPS,
          currentUserId: null,
        }),
    }),
    {
      name: 'pass-and-pay-store',
      version: 2,
    },
  ),
)

function sameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}
