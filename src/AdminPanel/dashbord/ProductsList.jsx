import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCategories } from '../services/categories.js'
import { uploadImages, uploadVideo } from '../services/files.js'
import { deleteProduct, listProducts, updateProduct } from '../services/products.js'
import { listSubcategories } from '../services/subcategories.js'

export default function AdminProductsList({ activeOnly = false }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  const [editingId, setEditingId] = useState('')
  const [editName, setEditName] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editSubCategoryId, setEditSubCategoryId] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editStock, setEditStock] = useState('0')
  const [editOccasionKey, setEditOccasionKey] = useState('')
  const [editSilverWeightGrams, setEditSilverWeightGrams] = useState('')
  const [editDiscountPercent, setEditDiscountPercent] = useState('')
  const [editMakingCost, setEditMakingCost] = useState('')
  const [editOtherCharges, setEditOtherCharges] = useState('')
  const [editImage, setEditImage] = useState('')
  const [editImages, setEditImages] = useState([])
  const [editVideo, setEditVideo] = useState('')

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])

  const categoryMap = useMemo(() => {
    const map = new Map()
    categories.forEach((c) => map.set(c._id, c))
    return map
  }, [categories])

  const subCategoryMap = useMemo(() => {
    const map = new Map()
    subcategories.forEach((s) => map.set(s._id, s))
    return map
  }, [subcategories])

  const filteredEditSubcategories = useMemo(() => {
    if (!editCategoryId) return subcategories
    return subcategories.filter((s) => String(s.category) === String(editCategoryId))
  }, [subcategories, editCategoryId])

  const loadMeta = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([listCategories({ page: 1, limit: 250 }), listSubcategories({ page: 1, limit: 500 })])
      setCategories(c?.data || [])
      setSubcategories(s?.data || [])
    } catch {
      setCategories([])
      setSubcategories([])
    }
  }, [])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await listProducts({ page, limit, q })
      const data = res?.data || []
      setRows(activeOnly ? data.filter((p) => Boolean(p.isActive)) : data)
      setTotal(res?.total || 0)
    } catch (e) {
      setError(e?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, limit, q, activeOnly])

  useEffect(() => {
    loadMeta()
  }, [loadMeta])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!editingId) return
    if (editSubCategoryId && !filteredEditSubcategories.some((s) => s._id === editSubCategoryId)) {
      setEditSubCategoryId('')
    }
  }, [editingId, editCategoryId, editSubCategoryId, filteredEditSubcategories])

  const startEdit = (row) => {
    setEditingId(row._id)
    setEditName(row.name || '')
    setEditActive(Boolean(row.isActive))
    setEditCategoryId(row.category || '')
    setEditSubCategoryId(row.subCategory || '')
    setEditSku(row.sku || '')
    setEditStock(row.stock !== undefined && row.stock !== null ? String(row.stock) : '0')
    setEditOccasionKey(row.occasionKey || '')
    setEditSilverWeightGrams(
      row.silverWeightGrams === undefined || row.silverWeightGrams === null ? '' : String(row.silverWeightGrams)
    )
    setEditDiscountPercent(row.discountPercent === undefined || row.discountPercent === null ? '' : String(row.discountPercent))
    setEditMakingCost(row.makingCost?.amount !== undefined && row.makingCost?.amount !== null ? String(row.makingCost.amount) : '')
    setEditOtherCharges(
      row.otherCharges?.amount !== undefined && row.otherCharges?.amount !== null ? String(row.otherCharges.amount) : ''
    )
    setEditImage(row.image || '')
    setEditImages(Array.isArray(row.images) ? row.images : [])
    setEditVideo(row.video || '')
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditName('')
    setEditActive(true)
    setEditCategoryId('')
    setEditSubCategoryId('')
    setEditSku('')
    setEditStock('0')
    setEditOccasionKey('')
    setEditSilverWeightGrams('')
    setEditDiscountPercent('')
    setEditMakingCost('')
    setEditOtherCharges('')
    setEditImage('')
    setEditImages([])
    setEditVideo('')
  }

  const onSaveEdit = async () => {
    setError('')
    if (!editName.trim()) {
      setError('Name is required')
      return
    }

    const payload = {
      name: editName.trim(),
      isActive: editActive,
    }

    if (editCategoryId) payload.categoryId = editCategoryId
    if (editSubCategoryId) payload.subCategoryId = editSubCategoryId

    const sku = String(editSku || '').trim()
    if (sku) payload.sku = sku

    const occasionKeyTrim = String(editOccasionKey || '').trim().toLowerCase()
    if (occasionKeyTrim) payload.occasionKey = occasionKeyTrim

    const stockNum = String(editStock || '').trim() ? Number(editStock) : 0
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      setError('Stock must be a valid number')
      return
    }
    payload.stock = stockNum

    if (String(editSilverWeightGrams || '').trim()) {
      const n = Number(editSilverWeightGrams)
      if (!Number.isFinite(n) || n < 0) {
        setError('Silver weight must be a valid number')
        return
      }
      payload.silverWeightGrams = n
    }
    if (String(editDiscountPercent || '').trim()) {
      const n = Number(editDiscountPercent)
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        setError('Discount must be between 0 and 100')
        return
      }
      payload.discountPercent = n
    }

    if (String(editMakingCost || '').trim()) {
      const n = Number(editMakingCost)
      if (!Number.isFinite(n) || n < 0) {
        setError('Making cost must be a valid number')
        return
      }
      payload.makingCost = n
    }

    if (String(editOtherCharges || '').trim()) {
      const n = Number(editOtherCharges)
      if (!Number.isFinite(n) || n < 0) {
        setError('Other charges must be a valid number')
        return
      }
      payload.otherCharges = n
    }

    const imageTrim = String(editImage || '').trim()
    const imagesOut = (Array.isArray(editImages) ? editImages : []).map((s) => String(s)).filter(Boolean)
    if (imagesOut.length) payload.images = imagesOut
    if (imageTrim) payload.image = imageTrim
    else if (imagesOut.length) payload.image = imagesOut[0]

    const videoTrim = String(editVideo || '').trim()
    if (videoTrim) payload.video = videoTrim

    try {
      setLoading(true)
      await updateProduct(editingId, payload)
      cancelEdit()
      await load()
      await loadMeta()
    } catch (e) {
      setError(e?.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id) => {
    try {
      setLoading(true)
      setError('')
      await deleteProduct(id)
      if (rows.length === 1 && page > 1) setPage((p) => p - 1)
      else await load()
    } catch (e) {
      setError(e?.message || 'Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">{activeOnly ? 'Active Product' : 'All Product'}</div>
          <div className="mt-1 text-sm text-gray-600">{activeOnly ? 'View active products' : 'View and manage products'}</div>
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
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="primary-bg h-10 w-full rounded-lg px-4 text-sm font-semibold text-white md:w-auto"
          >
            Add Product
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="text-sm font-semibold text-gray-900">Products</div>
          <div className="mt-1 text-xs text-gray-500">{loading ? 'Loading...' : `${total} items`}</div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Subcategory</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((r) => {
                const isEditing = editingId === r._id
                const catName = categoryMap.get(r.category)?.name || '—'
                const subName = subCategoryMap.get(r.subCategory)?.name || '—'
                const totalStock = r.stock ?? 0

                return (
                  <Fragment key={r._id}>
                    <tr className="border-t border-gray-100">
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          disabled={loading}
                        />
                      ) : (
                        <div>
                          <div className="font-medium text-gray-900">{r.name}</div>
                          <div className="mt-1 text-xs text-gray-500">{r.slug || ''}</div>
                        </div>
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
                          <option value="">None</option>
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
                      {isEditing ? (
                        <select
                          value={editSubCategoryId}
                          onChange={(e) => setEditSubCategoryId(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
                          disabled={loading}
                        >
                          <option value="">None</option>
                          {filteredEditSubcategories.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-gray-700">{subName}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-gray-700">{totalStock}</div>
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
                  {isEditing ? (
                    <tr className="border-t border-gray-100 bg-gray-50/40">
                      <td colSpan={6} className="px-5 py-5">
                        <div className="rounded-lg bg-white p-4 ring-1 ring-gray-100">
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">SKU</div>
                              <input
                                value={editSku}
                                onChange={(e) => setEditSku(e.target.value)}
                                placeholder="Optional"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Occasion Key</div>
                              <input
                                value={editOccasionKey}
                                onChange={(e) => setEditOccasionKey(e.target.value)}
                                placeholder="Eg. valentines-day"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Stock</div>
                              <input
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                inputMode="numeric"
                                placeholder="0"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Silver Weight (grams)</div>
                              <input
                                value={editSilverWeightGrams}
                                onChange={(e) => setEditSilverWeightGrams(e.target.value)}
                                inputMode="decimal"
                                placeholder="0"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Discount (%)</div>
                              <input
                                value={editDiscountPercent}
                                onChange={(e) => setEditDiscountPercent(e.target.value)}
                                inputMode="decimal"
                                placeholder="0"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Making Cost</div>
                              <input
                                value={editMakingCost}
                                onChange={(e) => setEditMakingCost(e.target.value)}
                                inputMode="decimal"
                                placeholder="Optional"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Other Charges</div>
                              <input
                                value={editOtherCharges}
                                onChange={(e) => setEditOtherCharges(e.target.value)}
                                inputMode="decimal"
                                placeholder="Optional"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Main Image URL</div>
                              <input
                                value={editImage}
                                onChange={(e) => setEditImage(e.target.value)}
                                placeholder="Optional"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Upload Images</div>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                multiple
                                disabled={loading}
                                onChange={async (e) => {
                                  const files = e.target.files
                                  e.target.value = ''
                                  if (!files || files.length === 0) return
                                  try {
                                    setLoading(true)
                                    const res = await uploadImages(files)
                                    const paths = res?.paths || []
                                    setEditImages((arr) => (Array.isArray(arr) ? [...arr, ...paths] : [...paths]))
                                    setEditImage((v) => String(v || '').trim() || paths[0] || '')
                                  } catch (err) {
                                    setError(err?.message || 'Failed to upload images')
                                  } finally {
                                    setLoading(false)
                                  }
                                }}
                                className="mt-2 block w-full text-sm"
                              />
                              {Array.isArray(editImages) && editImages.length ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {editImages.map((p) => (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => setEditImages((arr) => (Array.isArray(arr) ? arr.filter((x) => x !== p) : []))}
                                      disabled={loading}
                                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 disabled:opacity-60"
                                    >
                                      {String(p).split('/').slice(-1)[0]}
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Upload Video (optional)</div>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                disabled={loading}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  e.target.value = ''
                                  if (!file) return
                                  try {
                                    setLoading(true)
                                    const res = await uploadVideo(file)
                                    const path = res?.path
                                    if (!path) throw new Error('Upload failed')
                                    setEditVideo(path)
                                  } catch (err) {
                                    setError(err?.message || 'Failed to upload video')
                                  } finally {
                                    setLoading(false)
                                  }
                                }}
                                className="mt-2 block w-full text-sm"
                              />
                              {editVideo ? (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="text-xs text-gray-600">{String(editVideo).split('/').slice(-1)[0]}</div>
                                  <button
                                    type="button"
                                    onClick={() => setEditVideo('')}
                                    disabled={loading}
                                    className="text-xs font-semibold text-red-700 disabled:opacity-60"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  </Fragment>
                )
              })}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-500">
                    No products found
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
