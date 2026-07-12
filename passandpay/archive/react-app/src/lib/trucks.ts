import type { TruckType, TruckTypeId } from './types'

// Professional, license-free imagery from Unsplash (free for commercial use).
// Each URL is parameterised for responsive, optimised delivery.
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`

export const TRUCK_TYPES: TruckType[] = [
  {
    id: 'mini',
    name: 'Mini Truck (Tata Ace)',
    capacityTons: 1,
    capacityLabel: 'up to 1 ton',
    exampleUse: 'Local small loads, e-commerce, shop supplies',
    perKmRate: 18,
    baseFare: 350,
    icon: 'Truck',
    image: img('photo-1601584115197-04ecc0da31d7'),
  },
  {
    id: 'pickup',
    name: 'Pickup (Bolero)',
    capacityTons: 1.5,
    capacityLabel: '1–1.5 ton',
    exampleUse: 'City deliveries, small home shifting',
    perKmRate: 22,
    baseFare: 450,
    icon: 'Truck',
    image: img('photo-1558618666-fcd25c85cd64'),
  },
  {
    id: 'eicher14',
    name: 'Eicher 14 ft',
    capacityTons: 4,
    capacityLabel: '4 ton',
    exampleUse: 'Medium loads, retail distribution',
    perKmRate: 34,
    baseFare: 900,
    icon: 'Truck',
    image: img('photo-1586191582151-f73872dfd183'),
  },
  {
    id: 'eicher17',
    name: 'Eicher 17 ft',
    capacityTons: 5,
    capacityLabel: '5 ton',
    exampleUse: 'Furniture, appliances, household shifting',
    perKmRate: 40,
    baseFare: 1100,
    icon: 'Truck',
    image: img('photo-1612630741022-b29ec17d013a'),
  },
  {
    id: 'container',
    name: 'Container 19/24/32 ft',
    capacityTons: 12,
    capacityLabel: '7–15 ton',
    exampleUse: 'Bulk cargo, long-haul, FMCG',
    perKmRate: 58,
    baseFare: 2200,
    icon: 'Container',
    image: img('photo-1578575437130-527eed3abbec'),
  },
  {
    id: 'open',
    name: 'Open Body / Trailer',
    capacityTons: 20,
    capacityLabel: '15+ ton',
    exampleUse: 'Heavy machinery, construction material',
    perKmRate: 72,
    baseFare: 3000,
    icon: 'Container',
    image: img('photo-1591768793355-74d04bb6608f'),
  },
]

export const TRUCK_TYPE_MAP: Record<TruckTypeId, TruckType> = TRUCK_TYPES.reduce(
  (acc, t) => {
    acc[t.id] = t
    return acc
  },
  {} as Record<TruckTypeId, TruckType>,
)

export function getTruckType(id: TruckTypeId): TruckType {
  return TRUCK_TYPE_MAP[id]
}
