import {
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  MapPin,
  Receipt,
  UserCog,
  Boxes,
  Route,
  Truck,
  Wallet,
  ShieldCheck,
  Users,
  Container,
  type LucideIcon,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  MapPin,
  Receipt,
  UserCog,
  Boxes,
  Route,
  Truck,
  Wallet,
  ShieldCheck,
  Users,
  Container,
}

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const Cmp = MAP[name] ?? Truck
  return <Cmp size={size} className={className} />
}
