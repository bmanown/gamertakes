interface OfficialFilterChipsProps {
  officialOnly: boolean
  onChange: (officialOnly: boolean) => void
}

export function OfficialFilterChips({ officialOnly, onChange }: OfficialFilterChipsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          officialOnly ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Official releases
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-4 py-2 rounded-full text-sm font-medium ${
          !officialOnly ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All games
      </button>
    </div>
  )
}
