import { useCallback, useEffect, useMemo, useState } from 'react'
import { listCategories } from './services/categories.js'
import { createSubcategory, deleteSubcategory, listSubcategories, updateSubcategory } from './services/subcategories.js'

export default function AdminSubcategories() {
  const [q, setQ] = useState('')
  const [isActive, setIsActive] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const [categories, setCategories] = useState([])

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [createActive, setCreateActive] = useState(true)
  const [createCategoryId, setCreateCategoryId] = useState('')

  const [editingId, setEditingId] = useState('')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editCategoryId, setEditCategoryId] = useState('')

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const categoryMap = useMemo(() => {
    const map = new Map()
    categories.forEach((c) => map.set(c._id, c))
    return map
  }, [categories])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await listCategories({ page: 1, limit: 250, isActive: '' })
      setCategories(res.data || [])
    } catch {
      setCategories([])
    }
  }, [])

  const fetchRows = useCallback(
    async (targetPage = page) => {
      const res = await listSubcategories({ page: targetPage, limit, q, isActive, categoryId })
      setRows(res.data || [])
      setTotal(res.total || 0)
    },
    [page, limit, q, isActive, categoryId]
  )

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    setLoading(true)
    setError('')
    fetchRows()
      .catch((e) => {
        setError(e?.message || 'Failed to load')
      })
      .finally(() => setLoading(false))
  }, [fetchRows, page, q, isActive, categoryId])

  const startEdit = (row) => {
    setEditingId(row._id)
    setEditName(row.name || '')
    setEditDescription(row.description || '')
    setEditActive(Boolean(row.isActive))
    setEditCategoryId(row.category || '')
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditName('')
    setEditDescription('')
    setEditActive(true)
    setEditCategoryId('')
  }

  const onCreate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      const res = await createSubcategory({
        name: name.trim(),
        description: description.trim(),
        isActive: createActive,
        categoryId: createCategoryId,
      })
      const created = res?.data
      setName('')
      setDescription('')
      setCreateActive(true)
      setCreateCategoryId(created?.category || createCategoryId)
      setPage(1)
      await fetchRows(1)
      await fetchCategories()
    } catch (e2) {
      setError(e2?.message || 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  const onSaveEdit = async () => {
    try {
      setLoading(true)
      setError('')
      await updateSubcategory(editingId, {
        name: editName.trim(),
        description: editDescription.trim(),
        isActive: editActive,
        categoryId: editCategoryId,
      })
      cancelEdit()
      await fetchRows()
      await fetchCategories()
    } catch (e) {
      setError(e?.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id) => {
    try {
      setLoading(true)
      setError('')
      await deleteSubcategory(id)
      if (rows.length === 1 && page > 1) setPage((p) => p - 1)
      else await fetchRows()
    } catch (e) {
      setError(e?.message || 'Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Subcategory</div>
          <div className="mt-1 text-sm text-gray-600">Create and manage subcategories</div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => {
              setPage(1)
              setQ(e.target.value)
            }}
            placeholder="Search..."
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300 md:w-56"
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setPage(1)
              setCategoryId(e.target.value)
            }}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300 md:w-52"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
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
        <div className="text-sm font-semibold text-gray-900">Add Subcategory</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-xs font-semibold text-gray-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
              placeholder="Subcategory name"
              disabled={loading}
            />
          </div>
          <div className="md:col-span-1">
            <label className="mb-2 block text-xs font-semibold text-gray-600">Category</label>
            <select
              value={createCategoryId}
              onChange={(e) => setCreateCategoryId(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
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
            <span
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${createActive ? 'primary-bg' : 'bg-gray-200'}`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${createActive ? 'translate-x-4' : 'translate-x-1'}`}
              />
            </span>
            Active
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || !createCategoryId}
            className="primary-bg h-11 w-full rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-60 md:w-auto"
          >
            Add
          </button>
        </div>
        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
      </form>

      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="text-sm font-semibold text-gray-900">All Subcategories</div>
          <div className="mt-1 text-xs text-gray-500">{loading ? 'Loading...' : `${total} items`}</div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((r) => {
                const isEditing = editingId === r._id
                const catName = categoryMap.get(r.category)?.name || '—'
                return (
                  <tr key={r._id} className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          disabled={loading}
                        />
                      ) : (
                        <div className="font-medium text-gray-900">{r.name}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select
                          value={editCategoryId}
                          onChange={(e) => setEditCategoryId(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
                          disabled={loading}
                        >
                          <option value="">Select category</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-gray-700">{catName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-gray-700">{r.slug || '—'}</div>
                      {isEditing ? (
                        <div className="mt-2">
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                            placeholder="Description"
                            disabled={loading}
                          />
                        </div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditActive((v) => !v)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
                        >
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editActive ? 'primary-bg' : 'bg-gray-200'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editActive ? 'translate-x-4' : 'translate-x-1'}`}
                            />
                          </span>
                          {editActive ? 'Active' : 'Inactive'}
                        </button>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${r.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={onSaveEdit}
                            disabled={loading || !editName.trim() || !editCategoryId}
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
                          <button
                            type="button"
                            onClick={() => onDelete(r._id)}
                            disabled={loading}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          disabled={loading}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-500">
                    No subcategories found
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
