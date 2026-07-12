import { CITIES } from '@/lib/cities'

/** A city select backed by the seeded city list. */
export function CityPicker({
  id,
  value,
  onChange,
  placeholder = 'Select a city',
  exclude,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  exclude?: string
}) {
  return (
    <select
      id={id}
      className="input appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%23667' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {CITIES.filter((c) => c.name !== exclude).map((c) => (
        <option key={c.name} value={c.name}>
          {c.name}, {c.state}
        </option>
      ))}
    </select>
  )
}
