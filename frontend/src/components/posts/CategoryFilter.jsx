"use client"

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`btn btn-sm ${selectedCategory === category.id ? "btn-primary" : "btn-outline"}`}
          onClick={() => onSelectCategory(category.id)}
        >
          {category.icon}
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  )
}
