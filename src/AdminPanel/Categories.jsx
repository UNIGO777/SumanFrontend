import { useEffect, useMemo, useState } from 'react'
import { createCategory, deleteCategory, listCategories, updateCategory } from './services/categories.js'

export default function AdminCategories() {
  const [q, setQ] = useState('')
  const [isActive, setIsActive] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [createActive, setCreateActive] = useState(true)

  const [editingId, setEditingId] = useState('')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editActive, setEditActive] = useState(true)

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listCategories({ page, limit, q, isActive })
      setRows(res.data || [])
      setTotal(res.total || 0)
    } catch (e) {
      setError(e.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, isActive])

  const startEdit = (row) => {
    setEditingId(row._id)
    setEditName(row.name || '')
    setEditDescription(row.description || '')
    setEditActive(Boolean(row.isActive))
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditName('')
    setEditDescription('')
    setEditActive(true)
  }

  const onCreate = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createCategory({ name, description, isActive: createActive })
      setName('')
      setDescription('')
      setCreateActive(true)
      setPage(1)
      await load()
    } catch (e2) {
      setError(e2.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  const onSave = async () => {
    if (!editingId) return
    setError('')
    setLoading(true)
    try {
      await updateCategory(editingId, { name: editName, description: editDescription, isActive: editActive })
      cancelEdit()
      await load()
    } catch (e) {
      setError(e.message || 'Failed to update category')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id) => {
    const ok = window.confirm('Delete this category?')
    if (!ok) return
    setError('')
    setLoading(true)
    try {
      await deleteCategory(id)
      await load()
    } catch (e) {
      setError(e.message || 'Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Category</div>
          <div className="mt-1 text-sm text-gray-600">Create and manage categories</div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
            placeholder="Search..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300 md:w-64"
          />
          <select
            value={isActive}
            onChange={(e) => {
              setPage(1)
              setIsActive(e.target.value)
            }}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300 md:w-44"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <form onSubmit={onCreate} className="rounded-xl bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">Add Category</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-xs font-semibold text-gray-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              placeholder="Category name"
              disabled={loading}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold text-gray-600">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              placeholder="Short description"
              disabled={loading}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => setCreateActive((v) => !v)}
            disabled={loading}
            className="flex items-center gap-3 text-sm font-medium text-gray-700 disabled:opacity-60"
          >
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${createActive ? 'primary-bg' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${createActive ? 'translate-x-4' : 'translate-x-1'}`} />
            </span>
            Active
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="primary-bg h-11 w-full rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-60 md:w-auto"
          >
            Add
          </button>
        </div>
        {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      </form>

      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="text-sm font-semibold text-gray-900">All Categories</div>
          <div className="mt-1 text-xs text-gray-500">
            {loading ? 'Loading...' : `${total} items`}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((r) => {
                const isEditing = editingId === r._id
                return (
                  <tr key={r._id} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                        />
                      ) : (
                        <div className="font-medium text-gray-900">{r.name}</div>
                      )}
                      {isEditing ? (
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          placeholder="Description"
                        />
                      ) : r.description ? (
                        <div className="mt-1 text-xs text-gray-500">{r.description}</div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{r.slug}</td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditActive((v) => !v)}
                          className="flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editActive ? 'primary-bg' : 'bg-gray-200'}`}>
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editActive ? 'translate-x-4' : 'translate-x-1'}`} />
                          </span>
                          {editActive ? 'Active' : 'Inactive'}
                        </button>
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onSave}
                            disabled={loading || !editName.trim()}
                            className="primary-bg rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={loading}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            disabled={loading}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(r._id)}
                            disabled={loading}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <div className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={loading || page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

