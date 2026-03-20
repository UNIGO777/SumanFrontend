import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCategories } from '../services/categories.js'
import { uploadImage, uploadImages, uploadVideo } from '../services/files.js'
import { deleteProduct, listProducts, updateProduct } from '../services/products.js'
import { listSubcategories } from '../services/subcategories.js'
import { getApiBase } from '../services/apiClient.js'

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
  const [editDescription, setEditDescription] = useState('')
  const [editStock, setEditStock] = useState('0')
  const [editOccasionKey, setEditOccasionKey] = useState('')
  const [editSilverWeightGrams, setEditSilverWeightGrams] = useState('')
  const [editDiscountPercent, setEditDiscountPercent] = useState('')
  const [editMakingCost, setEditMakingCost] = useState('')
  const [editOtherCharges, setEditOtherCharges] = useState('')
  const [editImage, setEditImage] = useState('')
  const [editImages, setEditImages] = useState([])
  const [editVideo, setEditVideo] = useState('')
  const [editIsBestseller, setEditIsBestseller] = useState(false)
  const [editIsSpecialOccasion, setEditIsSpecialOccasion] = useState(false)
  const [editIsMostGifted, setEditIsMostGifted] = useState(false)
  const [editLocalMainImage, setEditLocalMainImage] = useState('')
  const [editLocalImages, setEditLocalImages] = useState([])
  const [editLocalVideo, setEditLocalVideo] = useState('')
  const [editLocalVideoName, setEditLocalVideoName] = useState('')
  const [isEditMainImageDragActive, setIsEditMainImageDragActive] = useState(false)
  const [isEditImagesDragActive, setIsEditImagesDragActive] = useState(false)
  const [isEditVideoDragActive, setIsEditVideoDragActive] = useState(false)

  const [editHadPairVariant, setEditHadPairVariant] = useState(false)
  const [editHasPairVariant, setEditHasPairVariant] = useState(false)
  const [editPairName, setEditPairName] = useState('Pair')
  const [editPairDescription, setEditPairDescription] = useState('')
  const [editPairStock, setEditPairStock] = useState('0')
  const [editPairSilverWeightGrams, setEditPairSilverWeightGrams] = useState('')
  const [editPairDiscountPercent, setEditPairDiscountPercent] = useState('')
  const [editPairMakingCost, setEditPairMakingCost] = useState('')
  const [editPairOtherCharges, setEditPairOtherCharges] = useState('')
  const [editPairIsActive, setEditPairIsActive] = useState(true)
  const [editPairImage, setEditPairImage] = useState('')
  const [editPairImages, setEditPairImages] = useState([])
  const [editPairLocalMainImage, setEditPairLocalMainImage] = useState('')
  const [editPairLocalImages, setEditPairLocalImages] = useState([])
  const [editOtherVariants, setEditOtherVariants] = useState([])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])
  const apiBase = useMemo(() => getApiBase(), [])
  const maxUploadBytes = 5 * 1024 * 1024

  const toPublicUrl = (p) => {
    if (!p) return ''
    if (/^https?:\/\//i.test(p)) return p
    if (!apiBase) return p
    if (String(p).startsWith('/')) return `${apiBase}${p}`
    return `${apiBase}/${p}`
  }

  const safeRevokeUrl = (u) => {
    try {
      if (u) URL.revokeObjectURL(u)
    } catch {
      return
    }
  }

  const safeRevokeUrls = (urls) => {
    ;(urls || []).forEach((u) => safeRevokeUrl(u))
  }

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
    const variantsRaw = Array.isArray(row?.variants) ? row.variants : []
    const pairVariant =
      variantsRaw.find((v) => String(v?.variantKey || v?.key || '').trim().toLowerCase() === 'pair') || null
    const otherVariants = variantsRaw.filter((v) => String(v?.variantKey || v?.key || '').trim().toLowerCase() !== 'pair')

    setEditingId(row._id)
    setEditName(row.name || '')
    setEditActive(Boolean(row.isActive))
    setEditCategoryId(row.category || '')
    setEditSubCategoryId(row.subCategory || '')
    setEditSku(row.sku || '')
    setEditDescription(row.description || '')
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
    setEditIsBestseller(Boolean(row.isBestseller))
    setEditIsSpecialOccasion(Boolean(row.isSpecialOccasion))
    setEditIsMostGifted(Boolean(row.isMostGifted))
    setEditHadPairVariant(Boolean(pairVariant))
    setEditHasPairVariant(Boolean(pairVariant))
    setEditOtherVariants(otherVariants)
    setEditPairName(pairVariant?.name || 'Pair')
    setEditPairDescription(pairVariant?.description || '')
    setEditPairStock(pairVariant?.stock !== undefined && pairVariant?.stock !== null ? String(pairVariant.stock) : '0')
    setEditPairSilverWeightGrams(
      pairVariant?.silverWeightGrams === undefined || pairVariant?.silverWeightGrams === null ? '' : String(pairVariant.silverWeightGrams)
    )
    setEditPairDiscountPercent(
      pairVariant?.discountPercent === undefined || pairVariant?.discountPercent === null ? '' : String(pairVariant.discountPercent)
    )
    setEditPairMakingCost(
      pairVariant?.makingCost?.amount !== undefined && pairVariant?.makingCost?.amount !== null
        ? String(pairVariant.makingCost.amount)
        : pairVariant?.makingCost !== undefined && pairVariant?.makingCost !== null
          ? String(pairVariant.makingCost)
          : ''
    )
    setEditPairOtherCharges(
      pairVariant?.otherCharges?.amount !== undefined && pairVariant?.otherCharges?.amount !== null
        ? String(pairVariant.otherCharges.amount)
        : pairVariant?.otherCharges !== undefined && pairVariant?.otherCharges !== null
          ? String(pairVariant.otherCharges)
          : ''
    )
    setEditPairIsActive(pairVariant?.isActive === undefined ? true : Boolean(pairVariant.isActive))
    setEditPairImage(pairVariant?.image || '')
    setEditPairImages(Array.isArray(pairVariant?.images) ? pairVariant.images : [])
    setEditLocalMainImage((prev) => {
      safeRevokeUrl(prev)
      return ''
    })
    setEditLocalImages((prev) => {
      safeRevokeUrls(prev)
      return []
    })
    setEditLocalVideo((prev) => {
      safeRevokeUrl(prev)
      return ''
    })
    setEditLocalVideoName('')
    setEditPairLocalMainImage((prev) => {
      safeRevokeUrl(prev)
      return ''
    })
    setEditPairLocalImages((prev) => {
      safeRevokeUrls(prev)
      return []
    })
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditName('')
    setEditActive(true)
    setEditCategoryId('')
    setEditSubCategoryId('')
    setEditSku('')
    setEditDescription('')
    setEditStock('0')
    setEditOccasionKey('')
    setEditSilverWeightGrams('')
    setEditDiscountPercent('')
    setEditMakingCost('')
    setEditOtherCharges('')
    setEditImage('')
    setEditImages([])
    setEditVideo('')
    setEditIsBestseller(false)
    setEditIsSpecialOccasion(false)
    setEditIsMostGifted(false)
    setEditLocalMainImage((prev) => {
      safeRevokeUrl(prev)
      return ''
    })
    setEditLocalImages((prev) => {
      safeRevokeUrls(prev)
      return []
    })
    setEditLocalVideo((prev) => {
      safeRevokeUrl(prev)
      return ''
    })
    setEditLocalVideoName('')
    setIsEditMainImageDragActive(false)
    setIsEditImagesDragActive(false)
    setIsEditVideoDragActive(false)
    setEditHadPairVariant(false)
    setEditHasPairVariant(false)
    setEditPairName('Pair')
    setEditPairDescription('')
    setEditPairStock('0')
    setEditPairSilverWeightGrams('')
    setEditPairDiscountPercent('')
    setEditPairMakingCost('')
    setEditPairOtherCharges('')
    setEditPairIsActive(true)
    setEditPairImage('')
    setEditPairImages([])
    setEditOtherVariants([])
    setEditPairLocalMainImage((prev) => {
      safeRevokeUrl(prev)
      return ''
    })
    setEditPairLocalImages((prev) => {
      safeRevokeUrls(prev)
      return []
    })
  }

  const handleEditMainImageSelected = async (file) => {
    if (!file) return
    setError('')
    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }
    const localUrl = URL.createObjectURL(file)
    setEditLocalMainImage((prev) => {
      safeRevokeUrl(prev)
      return localUrl
    })
    try {
      setLoading(true)
      const res = await uploadImage(file)
      const path = String(res?.path || '').trim()
      if (!path) throw new Error('Upload failed')
      setEditImage(path)
      setEditImages((arr) => {
        const list = Array.isArray(arr) ? arr.map((x) => String(x)) : []
        const first = String(path)
        const next = [first, ...list.filter((x) => x && x !== first)]
        return Array.from(new Set(next.map((s) => String(s)).filter(Boolean)))
      })
      setEditLocalMainImage((prev) => {
        safeRevokeUrl(prev)
        return ''
      })
    } catch (e) {
      setError(e?.message || 'Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  const handleEditImagesSelected = async (fileList) => {
    setError('')
    const files = Array.isArray(fileList) ? fileList : Array.from(fileList || [])
    if (!files.length) return
    const tooLarge = files.find((f) => (f?.size || 0) > maxUploadBytes)
    if (tooLarge) {
      setError(`"${tooLarge.name}" is larger than 5 MB`)
      return
    }
    const localUrls = files.map((f) => URL.createObjectURL(f))
    setEditLocalImages((prev) => {
      safeRevokeUrls(prev)
      return localUrls
    })
    try {
      setLoading(true)
      const res = await uploadImages(files)
      const paths = res?.paths || []
      if (!paths.length) throw new Error('Upload failed')
      setEditImages((arr) => {
        const next = Array.isArray(arr) ? [...arr, ...paths] : [...paths]
        return Array.from(new Set(next.map((s) => String(s)).filter(Boolean)))
      })
      setEditImage((v) => String(v || '').trim() || paths[0] || '')
      setEditLocalImages((prev) => {
        safeRevokeUrls(prev)
        return []
      })
    } catch (e) {
      setError(e?.message || 'Failed to upload images')
    } finally {
      setLoading(false)
    }
  }

  const handleEditVideoSelected = async (file) => {
    if (!file) return
    setError('')
    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }
    const localUrl = URL.createObjectURL(file)
    setEditLocalVideo((prev) => {
      safeRevokeUrl(prev)
      return localUrl
    })
    setEditLocalVideoName(file.name || '')
    try {
      setLoading(true)
      const res = await uploadVideo(file)
      const path = res?.path
      if (!path) throw new Error('Upload failed')
      setEditVideo(path)
      setEditLocalVideo((prev) => {
        safeRevokeUrl(prev)
        return ''
      })
      setEditLocalVideoName('')
    } catch (e) {
      setError(e?.message || 'Failed to upload video')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPairMainImageSelected = async (file) => {
    if (!file) return
    setError('')
    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }
    const localUrl = URL.createObjectURL(file)
    setEditPairLocalMainImage((prev) => {
      safeRevokeUrl(prev)
      return localUrl
    })
    try {
      setLoading(true)
      const res = await uploadImage(file)
      const path = String(res?.path || '').trim()
      if (!path) throw new Error('Upload failed')
      setEditPairImage(path)
      setEditPairImages((arr) => {
        const list = Array.isArray(arr) ? arr.map((x) => String(x)) : []
        const first = String(path)
        const next = [first, ...list.filter((x) => x && x !== first)]
        return Array.from(new Set(next.map((s) => String(s)).filter(Boolean)))
      })
      setEditPairLocalMainImage((prev) => {
        safeRevokeUrl(prev)
        return ''
      })
    } catch (e) {
      setError(e?.message || 'Failed to upload image')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPairImagesSelected = async (fileList) => {
    setError('')
    const files = Array.isArray(fileList) ? fileList : Array.from(fileList || [])
    if (!files.length) return
    const tooLarge = files.find((f) => (f?.size || 0) > maxUploadBytes)
    if (tooLarge) {
      setError(`"${tooLarge.name}" is larger than 5 MB`)
      return
    }
    const localUrls = files.map((f) => URL.createObjectURL(f))
    setEditPairLocalImages((prev) => {
      safeRevokeUrls(prev)
      return localUrls
    })
    try {
      setLoading(true)
      const res = await uploadImages(files)
      const paths = res?.paths || []
      if (!paths.length) throw new Error('Upload failed')
      setEditPairImages((arr) => {
        const next = Array.isArray(arr) ? [...arr, ...paths] : [...paths]
        return Array.from(new Set(next.map((s) => String(s)).filter(Boolean)))
      })
      setEditPairImage((v) => String(v || '').trim() || paths[0] || '')
      setEditPairLocalImages((prev) => {
        safeRevokeUrls(prev)
        return []
      })
    } catch (e) {
      setError(e?.message || 'Failed to upload images')
    } finally {
      setLoading(false)
    }
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
      isBestseller: editIsBestseller,
      isSpecialOccasion: editIsSpecialOccasion,
      isMostGifted: editIsMostGifted,
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

    payload.description = String(editDescription || '')

    const imageTrim = String(editImage || '').trim()
    const imagesOut = (Array.isArray(editImages) ? editImages : []).map((s) => String(s)).filter(Boolean)
    if (imagesOut.length) payload.images = imagesOut
    if (imageTrim) payload.image = imageTrim
    else if (imagesOut.length) payload.image = imagesOut[0]

    const videoTrim = String(editVideo || '').trim()
    if (videoTrim) payload.video = videoTrim

    const shouldSendVariants = editHasPairVariant || editHadPairVariant
    if (shouldSendVariants) {
      const variants = Array.isArray(editOtherVariants) ? editOtherVariants : []

      if (editHasPairVariant) {
        const stockNum = String(editPairStock || '').trim() ? Number(editPairStock) : 0
        if (!Number.isFinite(stockNum) || stockNum < 0) {
          setError('Pair stock must be a valid number')
          return
        }

        const v = {
          name: String(editPairName || '').trim() || 'Pair',
          variantKey: 'pair',
          description: String(editPairDescription || ''),
          stock: stockNum,
          isActive: Boolean(editPairIsActive),
        }

        const imageTrim = String(editPairImage || '').trim()
        const imagesOut = (Array.isArray(editPairImages) ? editPairImages : []).map((s) => String(s)).filter(Boolean)
        if (imagesOut.length) v.images = imagesOut
        if (imageTrim) v.image = imageTrim
        else if (imagesOut.length) v.image = imagesOut[0]

        if (String(editPairSilverWeightGrams || '').trim()) {
          const n = Number(editPairSilverWeightGrams)
          if (!Number.isFinite(n) || n < 0) {
            setError('Pair silver weight must be a valid number')
            return
          }
          v.silverWeightGrams = n
        }

        if (String(editPairDiscountPercent || '').trim()) {
          const n = Number(editPairDiscountPercent)
          if (!Number.isFinite(n) || n < 0 || n > 100) {
            setError('Pair discount must be between 0 and 100')
            return
          }
          v.discountPercent = n
        }

        if (String(editPairMakingCost || '').trim()) {
          const n = Number(editPairMakingCost)
          if (!Number.isFinite(n) || n < 0) {
            setError('Pair making cost must be a valid number')
            return
          }
          v.makingCost = n
        }

        if (String(editPairOtherCharges || '').trim()) {
          const n = Number(editPairOtherCharges)
          if (!Number.isFinite(n) || n < 0) {
            setError('Pair other charges must be a valid number')
            return
          }
          v.otherCharges = n
        }

        variants.push(v)
      }

      payload.variants = variants
    }

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
                            <div className="md:col-span-3">
                              <div className="text-xs font-semibold text-gray-600">Description</div>
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Optional"
                                className="mt-2 min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
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
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Bestseller</div>
                              <button
                                type="button"
                                onClick={() => setEditIsBestseller((v) => !v)}
                                disabled={loading}
                                className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                              >
                                <span>{editIsBestseller ? 'Yes' : 'No'}</span>
                                <span
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editIsBestseller ? 'primary-bg' : 'bg-gray-200'}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editIsBestseller ? 'translate-x-4' : 'translate-x-1'}`}
                                  />
                                </span>
                              </button>
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Special Occasion</div>
                              <button
                                type="button"
                                onClick={() => setEditIsSpecialOccasion((v) => !v)}
                                disabled={loading}
                                className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                              >
                                <span>{editIsSpecialOccasion ? 'Yes' : 'No'}</span>
                                <span
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editIsSpecialOccasion ? 'primary-bg' : 'bg-gray-200'}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editIsSpecialOccasion ? 'translate-x-4' : 'translate-x-1'}`}
                                  />
                                </span>
                              </button>
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Most Gifted</div>
                              <button
                                type="button"
                                onClick={() => setEditIsMostGifted((v) => !v)}
                                disabled={loading}
                                className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                              >
                                <span>{editIsMostGifted ? 'Yes' : 'No'}</span>
                                <span
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editIsMostGifted ? 'primary-bg' : 'bg-gray-200'}`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editIsMostGifted ? 'translate-x-4' : 'translate-x-1'}`}
                                  />
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="md:col-span-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-xs font-semibold text-gray-600">Main Image URL</div>
                                {Array.isArray(editImages) && editImages.length ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (loading) return
                                      const first = String(editImages[0] || '').trim()
                                      if (!first) return
                                      setEditImage(first)
                                    }}
                                    disabled={loading}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                                  >
                                    Use first image
                                  </button>
                                ) : null}
                              </div>
                              <div
                                className={`mt-2 rounded-xl border-2 border-dashed bg-white p-4 transition-colors ${
                                  isEditMainImageDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                                }`}
                                onDragEnter={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (loading) return
                                  setIsEditMainImageDragActive(true)
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (loading) return
                                  setIsEditMainImageDragActive(true)
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (e.currentTarget !== e.target) return
                                  setIsEditMainImageDragActive(false)
                                }}
                                onDrop={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setIsEditMainImageDragActive(false)
                                  if (loading) return
                                  const f = e.dataTransfer?.files?.[0]
                                  await handleEditMainImageSelected(f)
                                }}
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">Drag & drop main image here</div>
                                    <div className="mt-1 text-xs font-medium text-gray-500">PNG, JPG, WEBP, HEIC. Max 5 MB.</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (loading) return
                                      document.getElementById('edit-main-image-file')?.click()
                                    }}
                                    disabled={loading}
                                    className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                                  >
                                    Browse file
                                  </button>
                                </div>

                                {editLocalMainImage || editImage ? (
                                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
                                    <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                      <img
                                        src={editLocalMainImage || toPublicUrl(editImage)}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="text-xs font-semibold text-gray-700">Main image selected</div>
                                  </div>
                                ) : (
                                  <div className="mt-3 text-xs text-gray-500">No main image selected</div>
                                )}
                              </div>
                              <input
                                id="edit-main-image-file"
                                type="file"
                                accept="image/*,.heic,.heif,.jfif"
                                disabled={loading}
                                onChange={async (e) => {
                                  const f = e.target.files?.[0]
                                  e.target.value = ''
                                  await handleEditMainImageSelected(f)
                                }}
                                className="hidden"
                              />
                              <input
                                value={editImage ? toPublicUrl(editImage) : ''}
                                onChange={(e) => setEditImage(e.target.value)}
                                placeholder="Optional"
                                className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                disabled={loading}
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Images</div>
                              <div
                                className={`mt-2 rounded-xl border-2 border-dashed bg-white p-4 transition-colors ${
                                  isEditImagesDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                                }`}
                                onDragEnter={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (loading) return
                                  setIsEditImagesDragActive(true)
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (loading) return
                                  setIsEditImagesDragActive(true)
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (e.currentTarget !== e.target) return
                                  setIsEditImagesDragActive(false)
                                }}
                                onDrop={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setIsEditImagesDragActive(false)
                                  if (loading) return
                                  await handleEditImagesSelected(e.dataTransfer?.files)
                                }}
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">Drag & drop images here</div>
                                    <div className="mt-1 text-xs font-medium text-gray-500">PNG, JPG, WEBP, HEIC. Max 5 MB each.</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (loading) return
                                      document.getElementById('edit-images-file')?.click()
                                    }}
                                    disabled={loading}
                                    className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                                  >
                                    Browse files
                                  </button>
                                </div>

                                {Array.isArray(editLocalImages) && editLocalImages.length ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {editLocalImages.map((u) => (
                                      <div key={u} className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        <img src={u} alt="" className="h-full w-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                ) : null}

                                {Array.isArray(editImages) && editImages.length ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {editImages.map((p) => (
                                      <div key={p} className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        <img src={toPublicUrl(p)} alt="" className="h-full w-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => setEditImages((arr) => (Array.isArray(arr) ? arr.filter((x) => x !== p) : []))}
                                          disabled={loading}
                                          className="absolute right-1 top-1 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-800 disabled:opacity-60"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="mt-3 text-xs text-gray-500">No images uploaded</div>
                                )}
                              </div>
                              <input
                                id="edit-images-file"
                                type="file"
                                accept="image/*,.heic,.heif,.jfif"
                                multiple
                                disabled={loading}
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files || [])
                                  e.target.value = ''
                                  await handleEditImagesSelected(files)
                                }}
                                className="hidden"
                              />
                            </div>
                            <div className="md:col-span-1">
                              <div className="text-xs font-semibold text-gray-600">Video (optional)</div>
                              <div
                                className={`mt-2 rounded-xl border-2 border-dashed bg-white p-4 transition-colors ${
                                  isEditVideoDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                                }`}
                                onDragEnter={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (loading) return
                                  setIsEditVideoDragActive(true)
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (loading) return
                                  setIsEditVideoDragActive(true)
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (e.currentTarget !== e.target) return
                                  setIsEditVideoDragActive(false)
                                }}
                                onDrop={async (e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setIsEditVideoDragActive(false)
                                  if (loading) return
                                  const f = e.dataTransfer?.files?.[0]
                                  await handleEditVideoSelected(f)
                                }}
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">Drag & drop video here</div>
                                    <div className="mt-1 text-xs font-medium text-gray-500">MP4, WEBM, MOV. Max 5 MB.</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (loading) return
                                      document.getElementById('edit-video-file')?.click()
                                    }}
                                    disabled={loading}
                                    className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                                  >
                                    Browse file
                                  </button>
                                </div>

                                {editLocalVideo || editVideo ? (
                                  <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                    <video className="w-full" controls src={editLocalVideo || toPublicUrl(editVideo)} />
                                  </div>
                                ) : (
                                  <div className="mt-3 text-xs text-gray-500">No video uploaded</div>
                                )}

                                {editLocalVideoName ? <div className="mt-2 text-xs text-gray-600">{editLocalVideoName}</div> : null}

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
                              <input
                                id="edit-video-file"
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                disabled={loading}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  e.target.value = ''
                                  await handleEditVideoSelected(file)
                                }}
                                className="hidden"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">Pair Variant (optional)</div>
                                    <div className="mt-1 text-xs text-gray-500">Separate pricing, images, and description for pair</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEditHasPairVariant((v) => !v)}
                                    disabled={loading}
                                    className="flex h-10 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 disabled:opacity-60"
                                  >
                                    <span>{editHasPairVariant ? 'Enabled' : 'Disabled'}</span>
                                    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editHasPairVariant ? 'primary-bg' : 'bg-gray-200'}`}>
                                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editHasPairVariant ? 'translate-x-4' : 'translate-x-1'}`} />
                                    </span>
                                  </button>
                                </div>

                                {editHasPairVariant ? (
                                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                      <div className="text-xs font-semibold text-gray-600">Pair Name</div>
                                      <input
                                        value={editPairName}
                                        onChange={(e) => setEditPairName(e.target.value)}
                                        placeholder="Pair"
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                        disabled={loading}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-gray-600">Pair Stock</div>
                                      <input
                                        value={editPairStock}
                                        onChange={(e) => setEditPairStock(e.target.value)}
                                        inputMode="numeric"
                                        placeholder="0"
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                        disabled={loading}
                                      />
                                    </div>
                                    <div className="md:col-span-2">
                                      <div className="text-xs font-semibold text-gray-600">Pair Description</div>
                                      <textarea
                                        value={editPairDescription}
                                        onChange={(e) => setEditPairDescription(e.target.value)}
                                        placeholder="Optional"
                                        className="mt-2 min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-300"
                                        disabled={loading}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-gray-600">Pair Silver Weight (grams)</div>
                                      <input
                                        value={editPairSilverWeightGrams}
                                        onChange={(e) => setEditPairSilverWeightGrams(e.target.value)}
                                        inputMode="decimal"
                                        placeholder="Optional"
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                        disabled={loading}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-gray-600">Pair Discount (%)</div>
                                      <input
                                        value={editPairDiscountPercent}
                                        onChange={(e) => setEditPairDiscountPercent(e.target.value)}
                                        inputMode="decimal"
                                        placeholder="0"
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                        disabled={loading}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-gray-600">Pair Making Cost</div>
                                      <input
                                        value={editPairMakingCost}
                                        onChange={(e) => setEditPairMakingCost(e.target.value)}
                                        inputMode="decimal"
                                        placeholder="Optional"
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                        disabled={loading}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-gray-600">Pair Other Charges</div>
                                      <input
                                        value={editPairOtherCharges}
                                        onChange={(e) => setEditPairOtherCharges(e.target.value)}
                                        inputMode="decimal"
                                        placeholder="Optional"
                                        className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                        disabled={loading}
                                      />
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-gray-600">Pair Active</div>
                                      <button
                                        type="button"
                                        onClick={() => setEditPairIsActive((v) => !v)}
                                        disabled={loading}
                                        className="mt-2 flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                                      >
                                        <span>{editPairIsActive ? 'Active' : 'Inactive'}</span>
                                        <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editPairIsActive ? 'primary-bg' : 'bg-gray-200'}`}>
                                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editPairIsActive ? 'translate-x-4' : 'translate-x-1'}`} />
                                        </span>
                                      </button>
                                    </div>
                                    <div className="md:col-span-2">
                                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                                        <div className="w-full md:w-1/2">
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="text-xs font-semibold text-gray-600">Pair Main Image</div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (loading) return
                                                document.getElementById(`edit-pair-main-image-file-${editingId}`)?.click()
                                              }}
                                              disabled={loading}
                                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                                            >
                                              Upload
                                            </button>
                                          </div>
                                          <input
                                            id={`edit-pair-main-image-file-${editingId}`}
                                            type="file"
                                            accept="image/*,.heic,.heif,.jfif"
                                            disabled={loading}
                                            onChange={async (e) => {
                                              const f = e.target.files?.[0]
                                              e.target.value = ''
                                              await handleEditPairMainImageSelected(f)
                                            }}
                                            className="hidden"
                                          />
                                          {editPairLocalMainImage || editPairImage ? (
                                            <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-2">
                                              <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                <img
                                                  src={editPairLocalMainImage || toPublicUrl(editPairImage)}
                                                  alt=""
                                                  className="h-full w-full object-cover"
                                                />
                                              </div>
                                              <div className="text-xs font-semibold text-gray-700">Pair main image selected</div>
                                            </div>
                                          ) : (
                                            <div className="mt-3 text-xs text-gray-500">No pair main image selected</div>
                                          )}
                                          <input
                                            value={editPairImage ? toPublicUrl(editPairImage) : ''}
                                            onChange={(e) => setEditPairImage(e.target.value)}
                                            placeholder="Optional"
                                            className="mt-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                                            disabled={loading}
                                          />
                                        </div>

                                        <div className="w-full md:w-1/2">
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="text-xs font-semibold text-gray-600">Pair Images</div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (loading) return
                                                document.getElementById(`edit-pair-images-file-${editingId}`)?.click()
                                              }}
                                              disabled={loading}
                                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                                            >
                                              Upload
                                            </button>
                                          </div>
                                          <input
                                            id={`edit-pair-images-file-${editingId}`}
                                            type="file"
                                            accept="image/*,.heic,.heif,.jfif"
                                            multiple
                                            disabled={loading}
                                            onChange={async (e) => {
                                              const files = Array.from(e.target.files || [])
                                              e.target.value = ''
                                              await handleEditPairImagesSelected(files)
                                            }}
                                            className="hidden"
                                          />
                                          {Array.isArray(editPairImages) && editPairImages.length ? (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                              {editPairImages.slice(0, 12).map((p) => (
                                                <div
                                                  key={p}
                                                  className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white"
                                                >
                                                  <img src={toPublicUrl(p)} alt="" className="h-full w-full object-cover" />
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setEditPairImages((arr) => (Array.isArray(arr) ? arr.filter((x) => x !== p) : []))
                                                      setEditPairImage((cur) => (String(cur || '') === String(p) ? '' : cur))
                                                    }}
                                                    disabled={loading}
                                                    className="absolute right-1 top-1 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-800 disabled:opacity-60"
                                                  >
                                                    Remove
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          ) : Array.isArray(editPairLocalImages) && editPairLocalImages.length ? (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                              {editPairLocalImages.map((u) => (
                                                <div key={u} className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                                  <img src={u} alt="" className="h-full w-full object-cover" />
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="mt-3 text-xs text-gray-500">No pair images uploaded</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : editHadPairVariant ? (
                                  <div className="mt-3 text-xs font-semibold text-amber-700">
                                    Pair variant exists on this product. Disable + Save to remove it.
                                  </div>
                                ) : null}
                              </div>
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
