import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Category {
  id: string
  name: string
  slug: string
  description: string
}

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    setCategories(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const catData = { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description }

    if (editingCat) {
      await supabase.from('categories').update(catData).eq('id', editingCat.id)
    } else {
      await supabase.from('categories').insert(catData)
    }
    resetForm()
    fetchCategories()
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setDescription('')
    setEditingCat(null)
    setShowForm(false)
  }

  const editCat = (cat: Category) => {
    setEditingCat(cat)
    setName(cat.name)
    setSlug(cat.slug)
    setDescription(cat.description || '')
    setShowForm(true)
  }

  const deleteCat = async (id: string) => {
    if (confirm('Delete this category?')) {
      await supabase.from('categories').delete().eq('id', id)
      fetchCategories()
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Category
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCat ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug (URL friendly)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., general-knowledge"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {editingCat ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Slug</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{cat.name}</td>
                  <td className="px-4 py-3 text-sm">{cat.slug}</td>
                  <td className="px-4 py-3 text-sm">{cat.description || '-'}</td>
                  <td className="px-4 py-3 text-sm flex gap-2">
                    <button onClick={() => editCat(cat)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => deleteCat(cat.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}