import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { listCategories } from '../services/categories.js'
import { getApiBase } from '../services/apiClient.js'
import { uploadImages, uploadVideo } from '../services/files.js'
import { createProduct } from '../services/products.js'
import { listSubcategories } from '../services/subcategories.js'

const htmlToText = (html) => {
  if (typeof window === 'undefined') return String(html || '')
  try {
    const doc = new DOMParser().parseFromString(String(html || ''), 'text/html')
    return (doc.body?.textContent || '').replace(/\u00a0/g, ' ')
  } catch {
    return String(html || '')
  }
}

function RichTextEditor({ value, onChange, disabled, placeholder = '' }) {
  const ref = useRef(null)

  const isEmpty = useMemo(() => !htmlToText(value).trim(), [value])

  useEffect(() => {
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p')
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const next = String(value || '')
    if (el.innerHTML !== next) el.innerHTML = next
  }, [value])

  const runCmd = (cmd, arg) => {
    if (disabled) return
    const el = ref.current
    if (!el) return
    try {
      el.focus()
      document.execCommand(cmd, false, arg)
      onChange?.(el.innerHTML)
    } catch {
      return
    }
  }

  const onLink = () => {
    if (disabled) return
    const url = window.prompt('Enter link URL')
    if (!url) return
    runCmd('createLink', url)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCmd('bold')}
          disabled={disabled}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCmd('italic')}
          disabled={disabled}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCmd('underline')}
          disabled={disabled}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          U
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCmd('insertUnorderedList')}
          disabled={disabled}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCmd('insertOrderedList')}
          disabled={disabled}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          1. List
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onLink}
          disabled={disabled}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          Link
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCmd('removeFormat')}
          disabled={disabled}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          Clear
        </button>
      </div>

      <div className="relative">
        {isEmpty && placeholder ? (
          <div className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">{placeholder}</div>
        ) : null}
        <div
          ref={ref}
          contentEditable={!disabled}
          onInput={(e) => onChange?.(e.currentTarget.innerHTML)}
          className="min-h-[120px] w-full rounded-b-lg px-3 py-2 text-sm text-gray-900 outline-none"
          suppressContentEditableWarning
        />
      </div>
    </div>
  )
}

export default function AdminProductsNew() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [attributesPairs, setAttributesPairs] = useState([{ key: '', value: '' }])
  const [sku, setSku] = useState('')
  const [stock, setStock] = useState('0')
  const [occasionKey, setOccasionKey] = useState('')
  const [silverWeightGrams, setSilverWeightGrams] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [makingCost, setMakingCost] = useState('')
  const [otherCharges, setOtherCharges] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isBestseller, setIsBestseller] = useState(false)
  const [isSpecialOccasion, setIsSpecialOccasion] = useState(false)
  const [isMostGifted, setIsMostGifted] = useState(false)
  const [image, setImage] = useState('')
  const [images, setImages] = useState([])
  const [video, setVideo] = useState('')
  const [localImages, setLocalImages] = useState([])
  const [localVideo, setLocalVideo] = useState('')
  const [localVideoName, setLocalVideoName] = useState('')
  const [isImagesDragActive, setIsImagesDragActive] = useState(false)
  const [dragImageKey, setDragImageKey] = useState('')
  const [isVideoDragActive, setIsVideoDragActive] = useState(false)

  const filteredSubcategories = useMemo(() => {
    if (!categoryId) return subcategories
    return subcategories.filter((s) => String(s.category) === String(categoryId))
  }, [subcategories, categoryId])

  const apiBase = useMemo(() => getApiBase(), [])

  const toPublicUrl = (p) => {
    if (!p) return ''
    if (/^https?:\/\//i.test(p)) return p
    if (!apiBase) return p
    if (p.startsWith('/')) return `${apiBase}${p}`
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

  const maxUploadBytes = 5 * 1024 * 1024

  const handleImagesSelected = async (fileList) => {
    setError('')
    const files = Array.isArray(fileList) ? fileList : Array.from(fileList || [])
    if (!files.length) return

    const tooLarge = files.find((f) => (f?.size || 0) > maxUploadBytes)
    if (tooLarge) {
      setError(`"${tooLarge.name}" is larger than 5 MB`)
      return
    }

    const localUrls = files.map((f) => URL.createObjectURL(f))
    setLocalImages((prev) => {
      safeRevokeUrls(prev)
      return localUrls
    })

    try {
      setLoading(true)
      const res = await uploadImages(files)
      const paths = res?.paths || []
      if (!paths.length) throw new Error('Upload failed')
      setImages((arr) => {
        const next = Array.isArray(arr) ? [...arr, ...paths] : [...paths]
        return Array.from(new Set(next.map((s) => String(s)).filter(Boolean)))
      })
      setImage((prev) => String(prev || '').trim() || paths[0] || '')
      setLocalImages((prev) => {
        safeRevokeUrls(prev)
        return []
      })
    } catch (err) {
      setError(err?.message || 'Failed to upload images')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSelected = async (file) => {
    if (!file) return
    setError('')

    if ((file?.size || 0) > maxUploadBytes) {
      setError(`"${file.name}" is larger than 5 MB`)
      return
    }

    const localUrl = URL.createObjectURL(file)
    setLocalVideo((prev) => {
      safeRevokeUrl(prev)
      return localUrl
    })
    setLocalVideoName(file.name || '')

    try {
      setLoading(true)
      const res = await uploadVideo(file)
      const path = res?.path
      if (!path) throw new Error('Upload failed')
      setVideo(path)
      setLocalVideo((prev) => {
        safeRevokeUrl(prev)
        return ''
      })
      setLocalVideoName('')
    } catch (err) {
      setError(err?.message || 'Failed to upload video')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listCategories({ page: 1, limit: 250 })
      .then((c) => {
        setCategories(c?.data || [])
      })
      .catch(() => {
        setCategories([])
      })
  }, [])

  useEffect(() => {
    let active = true

    if (!categoryId) {
      setSubcategories([])
      setSubCategoryId('')
      return () => {
        active = false
      }
    }

    setSubcategories([])
    setSubCategoryId('')

    listSubcategories({ page: 1, limit: 500, categoryId })
      .then((s) => {
        if (!active) return
        setSubcategories(s?.data || [])
      })
      .catch(() => {
        if (!active) return
        setSubcategories([])
      })

    return () => {
      active = false
    }
  }, [categoryId])

  useEffect(() => {
    if (!categoryId) return
    if (subCategoryId && !filteredSubcategories.some((s) => s._id === subCategoryId)) {
      setSubCategoryId('')
    }
  }, [categoryId, subCategoryId, filteredSubcategories])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!categoryId) {
      setError('Category is required')
      return
    }
    if (!subCategoryId) {
      setError('Subcategory is required')
      return
    }
    if (!htmlToText(description).trim()) {
      setError('Description is required')
      return
    }

    let attributes
    if (Array.isArray(attributesPairs) && attributesPairs.length) {
      const obj = {}
      for (let i = 0; i < attributesPairs.length; i += 1) {
        const k = String(attributesPairs[i]?.key || '').trim()
        if (!k) continue
        obj[k] = String(attributesPairs[i]?.value ?? '').trim()
      }
      if (Object.keys(obj).length) attributes = obj
    }

    const payload = {
      name: name.trim(),
      description: String(description || ''),
    }

    const stockNum = String(stock || '').trim() ? Number(stock) : 0
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      setError('Stock must be a valid number')
      return
    }

    const skuTrim = String(sku || '').trim()
    if (skuTrim) payload.sku = skuTrim
    payload.stock = stockNum

    const occasionKeyTrim = String(occasionKey || '').trim().toLowerCase()
    if (occasionKeyTrim) payload.occasionKey = occasionKeyTrim

    const imageTrim = String(image || '').trim()
    if (imageTrim) payload.image = imageTrim

    const imagesOut = (Array.isArray(images) ? images : []).map((s) => String(s)).filter(Boolean)
    if (imagesOut.length) payload.images = imagesOut
    if (!payload.image && imagesOut.length) payload.image = imagesOut[0]

    const videoTrim = String(video || '').trim()
    if (videoTrim) payload.video = videoTrim

    if (String(makingCost || '').trim()) {
      const n = Number(makingCost)
      if (!Number.isFinite(n) || n < 0) {
        setError('Making cost must be a valid number')
        return
      }
      payload.makingCost = n
    }

    if (String(otherCharges || '').trim()) {
      const n = Number(otherCharges)
      if (!Number.isFinite(n) || n < 0) {
        setError('Other charges must be a valid number')
        return
      }
      payload.otherCharges = n
    }

    if (String(silverWeightGrams || '').trim()) {
      const n = Number(silverWeightGrams)
      if (!Number.isFinite(n) || n < 0) {
        setError('Silver weight must be a valid number')
        return
      }
      payload.silverWeightGrams = n
    }

    if (String(discountPercent || '').trim()) {
      const n = Number(discountPercent)
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        setError('Discount must be between 0 and 100')
        return
      }
      payload.discountPercent = n
    }

    payload.isActive = isActive
    payload.isBestseller = isBestseller
    payload.isSpecialOccasion = isSpecialOccasion
    payload.isMostGifted = isMostGifted

    if (categoryId) payload.categoryId = categoryId
    if (subCategoryId) payload.subCategoryId = subCategoryId
    if (attributes !== undefined) payload.attributes = attributes

    try {
      setLoading(true)
      await createProduct(payload)
      setStatus('Product created')
      navigate('/admin/products', { replace: true })
    } catch (e2) {
      setError(e2?.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const goNext = () => {
    setError('')
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!categoryId) {
      setError('Category is required')
      return
    }
    if (!subCategoryId) {
      setError('Subcategory is required')
      return
    }
    if (!htmlToText(description).trim()) {
      setError('Description is required')
      return
    }
    setCurrentStep((s) => Math.min(totalSteps, s + 1))
  }

  const goBack = () => setCurrentStep((s) => Math.max(1, s - 1))

  const goToVariants = () => {
    if (currentStep === 2) return
    goNext()
  }

  return (
    <div className="space-y-9">
      <div>
        <div className="text-sm font-semibold text-gray-900">Add New Product</div>
        <div className="mt-1 text-sm text-gray-600">Create a product in your catalog</div>
      </div>

      <form onSubmit={onSubmit} className="rounded-xl bg-white p-5 shadow-md ">
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}
        {status ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">Step {currentStep} of {totalSteps}</div>
            <div className="mt-1 text-xs text-gray-500">
              {currentStep === 1 ? 'Enter product details' : 'Set pricing and upload media'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={loading}
              className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 transition-colors disabled:opacity-60 ${
                currentStep === 1 ? 'primary-bg text-white ring-transparent' : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              Product
            </button>
            <button
              type="button"
              onClick={goToVariants}
              disabled={loading}
              className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 transition-colors disabled:opacity-60 ${
                currentStep === 2 ? 'primary-bg text-white ring-transparent' : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              Pricing
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {currentStep === 1 ? (
            <motion.div
              key="step-product"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-semibold text-gray-600">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                    placeholder="Product name"
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-1" />
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading}
                  >
                    <option value="">None</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">Subcategory</label>
                  <select
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300"
                    disabled={loading}
                  >
                    <option value="">None</option>
                    {filteredSubcategories.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="mb-2 block text-xs font-semibold text-gray-600">Description</label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Product description"
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-semibold text-gray-600">Attributes</label>
                    <button
                      type="button"
                      onClick={() => setAttributesPairs((arr) => [...(Array.isArray(arr) ? arr : []), { key: '', value: '' }])}
                      disabled={loading}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Add Attribute
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {(Array.isArray(attributesPairs) ? attributesPairs : []).map((p, idx) => (
                      <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                        <div className="sm:col-span-5">
                          <input
                            value={p?.key || ''}
                            onChange={(e) =>
                              setAttributesPairs((arr) =>
                                (Array.isArray(arr) ? arr : []).map((row, i) => (i === idx ? { ...row, key: e.target.value } : row))
                              )
                            }
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                            placeholder="Key"
                            disabled={loading}
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <input
                            value={p?.value ?? ''}
                            onChange={(e) =>
                              setAttributesPairs((arr) =>
                                (Array.isArray(arr) ? arr : []).map((row, i) => (i === idx ? { ...row, value: e.target.value } : row))
                              )
                            }
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                            placeholder="Value"
                            disabled={loading}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <button
                            type="button"
                            onClick={() =>
                              setAttributesPairs((arr) => {
                                const next = (Array.isArray(arr) ? arr : []).filter((_, i) => i !== idx)
                                return next.length ? next : [{ key: '', value: '' }]
                              })
                            }
                            disabled={loading}
                            className="h-10 w-full rounded-lg border border-gray-200 bg-white text-xs font-semibold text-red-700 disabled:opacity-60"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-variants"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Pricing</div>
                    <div className="mt-1 text-xs text-gray-500">Set stock, charges, and upload media</div>
                  </div>
                  <div />
                </div>

                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-white p-4 ring-1 ring-gray-100">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">SKU</label>
                        <input
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          placeholder="Optional"
                          disabled={loading}
                        />
                      </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-xs font-semibold text-gray-600">Occasion Key</label>
                          <input
                            value={occasionKey}
                            onChange={(e) => setOccasionKey(e.target.value)}
                            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                            placeholder="Eg. valentines-day"
                            disabled={loading}
                          />
                        </div>
                      <div className="md:col-span-1">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Stock</label>
                        <input
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          inputMode="numeric"
                          placeholder="0"
                          disabled={loading}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Silver Weight (grams)</label>
                        <input
                          value={silverWeightGrams}
                          onChange={(e) => setSilverWeightGrams(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          placeholder="Optional"
                          inputMode="decimal"
                          disabled={loading}
                        />
                      </div>
                      <div className="md:col-span-1">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Discount (%)</label>
                        <input
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          placeholder="0"
                          inputMode="decimal"
                          disabled={loading}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Making Cost</label>
                        <input
                          value={makingCost}
                          onChange={(e) => setMakingCost(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          placeholder="Optional"
                          inputMode="decimal"
                          disabled={loading}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Other Charges</label>
                        <input
                          value={otherCharges}
                          onChange={(e) => setOtherCharges(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          placeholder="Optional"
                          inputMode="decimal"
                          disabled={loading}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Active</label>
                        <button
                          type="button"
                          onClick={() => setIsActive((v) => !v)}
                          disabled={loading}
                          className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                        >
                          <span>{isActive ? 'Active' : 'Inactive'}</span>
                          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? 'primary-bg' : 'bg-gray-200'}`}>
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                          </span>
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Bestseller</label>
                        <button
                          type="button"
                          onClick={() => setIsBestseller((v) => !v)}
                          disabled={loading}
                          className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                        >
                          <span>{isBestseller ? 'Yes' : 'No'}</span>
                          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isBestseller ? 'primary-bg' : 'bg-gray-200'}`}>
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isBestseller ? 'translate-x-4' : 'translate-x-1'}`} />
                          </span>
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Special Occasion</label>
                        <button
                          type="button"
                          onClick={() => setIsSpecialOccasion((v) => !v)}
                          disabled={loading}
                          className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                        >
                          <span>{isSpecialOccasion ? 'Yes' : 'No'}</span>
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isSpecialOccasion ? 'primary-bg' : 'bg-gray-200'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isSpecialOccasion ? 'translate-x-4' : 'translate-x-1'}`}
                            />
                          </span>
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Most Gifted</label>
                        <button
                          type="button"
                          onClick={() => setIsMostGifted((v) => !v)}
                          disabled={loading}
                          className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 disabled:opacity-60"
                        >
                          <span>{isMostGifted ? 'Yes' : 'No'}</span>
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isMostGifted ? 'primary-bg' : 'bg-gray-200'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${isMostGifted ? 'translate-x-4' : 'translate-x-1'}`}
                            />
                          </span>
                        </button>
                      </div>

                      <div className="md:col-span-3">
                        <label className="mb-2 block text-xs font-semibold text-gray-600">Main Image URL</label>
                        <input
                          value={image || ''}
                          onChange={(e) => setImage(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-300"
                          placeholder="Optional"
                          disabled={loading}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-xs font-semibold text-gray-600">Images</label>
                          <button
                            type="button"
                            onClick={() => {
                              if (loading) return
                              document.getElementById('product-images')?.click()
                            }}
                            disabled={loading}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                          >
                            Select Images
                          </button>
                        </div>
                        <div
                          className={`mt-3 rounded-xl border-2 border-dashed bg-white p-4 transition-colors ${
                            isImagesDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                          }`}
                          onDragEnter={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (loading) return
                            setIsImagesDragActive(true)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (loading) return
                            setIsImagesDragActive(true)
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (e.currentTarget !== e.target) return
                            setIsImagesDragActive(false)
                          }}
                          onDrop={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsImagesDragActive(false)
                            if (loading) return
                            await handleImagesSelected(e.dataTransfer?.files)
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
                                document.getElementById('product-images')?.click()
                              }}
                              disabled={loading}
                              className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                            >
                              Browse files
                            </button>
                          </div>

                          {image || (Array.isArray(localImages) && localImages.length) ? (
                            <div className="mt-4 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
                              <div className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <img src={image ? toPublicUrl(image) : localImages[0]} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="text-xs font-semibold text-gray-700">Main image selected</div>
                            </div>
                          ) : null}
                        </div>
                        <input
                          id="product-images"
                          type="file"
                          accept="image/*,.heic,.heif,.jfif"
                          multiple
                          disabled={loading}
                          onChange={async (e) => {
                            const fileList = e.target.files
                            e.target.value = ''
                            await handleImagesSelected(fileList)
                          }}
                          className="hidden"
                        />
                        {Array.isArray(images) && images.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {images.map((p) => (
                              <div key={p} className="relative h-16 w-16">
                                <button
                                  type="button"
                                  onClick={() => setImage(p)}
                                  disabled={loading}
                                  draggable
                                  onDragStart={(e) => {
                                    if (loading) return
                                    setDragImageKey(String(p))
                                    try {
                                      e.dataTransfer.setData('text/plain', String(p))
                                    } catch {
                                      return
                                    }
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault()
                                    if (loading) return
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault()
                                    if (loading) return
                                    const fromKey = dragImageKey || e.dataTransfer?.getData('text/plain') || ''
                                    const toKey = String(p)
                                    if (!fromKey || fromKey === toKey) return
                                    setImages((arr) => {
                                      const list = Array.isArray(arr) ? [...arr] : []
                                      const fromIdx = list.findIndex((x) => String(x) === String(fromKey))
                                      const toIdx = list.findIndex((x) => String(x) === String(toKey))
                                      if (fromIdx < 0 || toIdx < 0) return list
                                      const [moved] = list.splice(fromIdx, 1)
                                      list.splice(toIdx, 0, moved)
                                      return list
                                    })
                                  }}
                                  onDragEnd={() => setDragImageKey('')}
                                  className={`h-16 w-16 overflow-hidden rounded-lg border bg-gray-50 disabled:opacity-60 ${
                                    String(image || '') === String(p) ? 'border-gray-900 ring-2 ring-gray-900/10' : 'border-gray-200'
                                  }`}
                                  aria-label="Set as main image"
                                >
                                  <img src={toPublicUrl(p)} alt="" className="h-full w-full object-cover" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImages((arr) => (Array.isArray(arr) ? arr.filter((x) => x !== p) : []))
                                    setImage((cur) => (String(cur || '') === String(p) ? '' : cur))
                                  }}
                                  disabled={loading}
                                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 disabled:opacity-60"
                                  aria-label="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : Array.isArray(localImages) && localImages.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {localImages.map((u) => (
                              <div key={u} className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                <img src={u} alt="" className="h-full w-full object-cover" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-gray-500">No images uploaded</div>
                        )}
                        {Array.isArray(images) && images.length ? (
                          <div className="mt-2 text-[11px] font-medium text-gray-500">Tip: Drag thumbnails to reorder. Click one to set main image.</div>
                        ) : null}
                      </div>

                      <div className="md:col-span-3">
                        <div className="flex items-center justify-between gap-2">
                          <label className="block text-xs font-semibold text-gray-600">Video (optional)</label>
                          <button
                            type="button"
                            onClick={() => {
                              if (loading) return
                              document.getElementById('product-video')?.click()
                            }}
                            disabled={loading}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                          >
                            Select Video
                          </button>
                        </div>
                        <div
                          className={`mt-3 rounded-xl border-2 border-dashed bg-white p-4 transition-colors ${
                            isVideoDragActive ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                          }`}
                          onDragEnter={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (loading) return
                            setIsVideoDragActive(true)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (loading) return
                            setIsVideoDragActive(true)
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (e.currentTarget !== e.target) return
                            setIsVideoDragActive(false)
                          }}
                          onDrop={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsVideoDragActive(false)
                            if (loading) return
                            const f = e.dataTransfer?.files?.[0]
                            await handleVideoSelected(f)
                          }}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">Drag & drop video here</div>
                              <div className="mt-1 text-xs font-medium text-gray-500">Max 5 MB.</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (loading) return
                                document.getElementById('product-video')?.click()
                              }}
                              disabled={loading}
                              className="rounded-lg bg-[#0f2e40] px-4 py-2 text-xs font-semibold text-white hover:bg-[#13384d] disabled:opacity-60"
                            >
                              Browse file
                            </button>
                          </div>

                          {video || localVideo ? (
                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                              <video
                                src={video ? toPublicUrl(video) : localVideo}
                                controls
                                className="h-28 w-full max-w-[220px] rounded-lg border border-gray-200 bg-black"
                              />
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-700">
                                  {video ? video.split('/').slice(-1)[0] : localVideoName || 'Selected'}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVideo('')
                                    setLocalVideo((prev) => {
                                      safeRevokeUrl(prev)
                                      return ''
                                    })
                                    setLocalVideoName('')
                                  }}
                                  disabled={loading}
                                  className="mt-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-gray-500">No video uploaded</div>
                          )}
                        </div>
                        <input
                          id="product-video"
                          type="file"
                          accept="video/*"
                          disabled={loading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            await handleVideoSelected(file)
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => navigate('/admin/products')}
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
          >
            Cancel
          </button>
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={loading}
              onClick={goBack}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-800 disabled:opacity-60"
            >
              Back
            </button>
          ) : null}
          {currentStep === totalSteps ? (
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="primary-bg rounded-lg px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Create
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                goNext()
              }}
              disabled={loading || !name.trim()}
              className="primary-bg rounded-lg px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              Next
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
