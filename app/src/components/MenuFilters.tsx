interface MenuFiltersProps {
  onFilterChange: (category: string) => void
}

export default function MenuFilters({ onFilterChange }: MenuFiltersProps) {
  const categories = ['Tous', 'Brunch', 'Noël', 'Pâques', 'Vegan', 'Générique']

  return (
    <div className="menu-filters">
      {categories.map(cat => (
        <button
          key={cat}
          className="filter-button"
          onClick={() => onFilterChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
