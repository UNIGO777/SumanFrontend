import { useEffect, useRef, useState } from 'react'
import { bulkUploadProducts, downloadBulkTemplate, previewBulkUpload } from '../services/products.js'
import { listCategories } from '../services/categories.js'

// stage: 'idle' | 'previewing' | 'preview' | 'uploading' | 'done'

export default function AdminBulkUpload() {
  const fileRef = useRef(null)
  const [stage, setStage] = useState('idle')
  const [pendingFile, setPendingFile] = useState(null)
  const [preview, setPreview] = useState(null)   // preview response from backend
  const [results, setResults] = useState(null)   // final upload response
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    listCategories({ page: 1, limit: 250 }).then((res) => setCategories(res?.data || [])).catch(() => {})
  }, [])

  const handleDownloadTemplate = async () => {
    setDownloading(true)
    setError('')
    try {
      const blob = await downloadBulkTemplate()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'suman-products-template.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e?.message || 'Failed to download template')
    } finally {
      setDownloading(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    if (!allowed.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload a valid Excel file (.xlsx or .xls)')
      return
    }

    setError('')
    setResults(null)
    setPendingFile(file)
    setStage('previewing')
    try {
      const res = await previewBulkUpload(file)
      setPreview(res)
      setStage('preview')
    } catch (e) {
      setError(e?.message || 'Failed to read Excel file')
      setStage('idle')
      setPendingFile(null)
    }
  }

  const handleConfirm = async () => {
    if (!pendingFile) return
    setStage('uploading')
    setError('')
    try {
      const res = await bulkUploadProducts(pendingFile)
      setResults(res)
      setStage('done')
    } catch (e) {
      setError(e?.message || 'Upload failed')
      setStage('preview')
    }
  }

  const handleCancel = () => {
    setStage('idle')
    setPendingFile(null)
    setPreview(null)
    setError('')
  }

  const readyRows = preview?.results?.filter((r) => r.status === 'ready') ?? []
  const errorRows = preview?.results?.filter((r) => r.status === 'error') ?? []
  const newCategories = [...new Set(readyRows.filter((r) => r.newCategory).map((r) => r.category))]
  const newSubCategories = [...new Set(readyRows.filter((r) => r.newSubCategory).map((r) => r.subCategory))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Products</h1>
        <p className="mt-1 text-sm text-gray-500">
          Download the Excel template, fill in your products, then upload. Images can be added later via the Edit page.
        </p>
      </div>

      {/* Action cards — hidden once preview/done */}
      {(stage === 'idle' || stage === 'previewing') && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Download template */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Step 1 — Download Template</h2>
            <p className="mt-1 text-xs text-gray-500">
              Get the Excel template with all columns and an example row. An Instructions sheet explains each field.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={downloading}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {downloading ? (
                <><Spinner />Downloading…</>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Template Excel
                </>
              )}
            </button>
          </div>

          {/* Upload Excel */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-900">Step 2 — Upload Filled Excel</h2>
            <p className="mt-1 text-xs text-gray-500">
              Fill the template and select the file. You will see a preview of what will be created before confirming.
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={stage === 'previewing'}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {stage === 'previewing' ? (
                <><Spinner />Reading file…</>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Select Excel File
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {/* Confirmation panel */}
      {stage === 'preview' && preview && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Summary header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Confirm Upload</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Review what will be created, then click <span className="font-medium text-gray-700">Confirm &amp; Upload</span> to proceed.
            </p>
          </div>

          <div className="px-6 py-4">
            {/* Counts */}
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                <span className="text-2xl font-bold text-green-700">{readyRows.length}</span>
                <span className="text-sm text-green-600">product{readyRows.length !== 1 ? 's' : ''} will be created</span>
              </div>
              {errorRows.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2">
                  <span className="text-2xl font-bold text-red-600">{errorRows.length}</span>
                  <span className="text-sm text-red-500">row{errorRows.length !== 1 ? 's' : ''} have errors and will be skipped</span>
                </div>
              )}
            </div>

            {/* Preview table */}
            <div className="mb-4 max-h-72 overflow-y-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Product Name</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Sub-category</th>
                    <th className="px-3 py-2">Pair?</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {preview.results?.map((r) => (
                    <tr key={r.row} className={r.status === 'error' ? 'bg-red-50/50' : ''}>
                      <td className="px-3 py-2 font-mono text-xs text-gray-400">{r.row}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{r.name}</td>
                      <td className="px-3 py-2 text-gray-600">
                        <span>{r.category ?? '—'}</span>
                        {r.newCategory && <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-xs font-medium text-amber-700">new</span>}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        <span>{r.subCategory ?? '—'}</span>
                        {r.newSubCategory && <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-xs font-medium text-amber-700">new</span>}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500">{r.hasPair ? 'Yes' : '—'}</td>
                      <td className="px-3 py-2">
                        {r.status === 'ready' ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Ready</span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600" title={r.message}>
                            Error
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* New categories/subcategories notice */}
            {(newCategories.length > 0 || newSubCategories.length > 0) && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <p className="mb-1.5 font-semibold">The following will be created automatically:</p>
                {newCategories.length > 0 && (
                  <div className="mb-1">
                    <span className="font-medium">New categories: </span>
                    {newCategories.map((n) => <span key={n} className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono">{n}</span>)}
                  </div>
                )}
                {newSubCategories.length > 0 && (
                  <div>
                    <span className="font-medium">New sub-categories: </span>
                    {newSubCategories.map((n) => <span key={n} className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono">{n}</span>)}
                  </div>
                )}
              </div>
            )}

            {/* Error details */}
            {errorRows.length > 0 && (
              <div className="mb-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Row errors (will be skipped)</p>
                {errorRows.map((r) => (
                  <div key={r.row} className="rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-600">
                    <span className="font-mono font-medium">Row {r.row} — {r.name}:</span> {r.message}
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={readyRows.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Confirm &amp; Upload {readyRows.length} Product{readyRows.length !== 1 ? 's' : ''}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading state */}
      {stage === 'uploading' && (
        <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col items-center gap-3 text-center">
            <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Creating {readyRows.length} product{readyRows.length !== 1 ? 's' : ''}…</p>
            <p className="text-xs text-gray-400">Please wait, do not close this page</p>
          </div>
        </div>
      )}

      {/* Final results */}
      {stage === 'done' && results && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-900">Upload Complete</h2>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              {results.successCount} created
            </span>
            {results.errorCount > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                {results.errorCount} failed
              </span>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="ml-auto rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Upload another file
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Row</th>
                  <th className="pb-2 pr-4">Product Name</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.results?.map((r) => (
                  <tr key={r.row}>
                    <td className="py-2 pr-4 font-mono text-xs text-gray-400">{r.row}</td>
                    <td className="py-2 pr-4 font-medium text-gray-800">{r.name}</td>
                    <td className="py-2 pr-4">
                      {r.status === 'success' ? (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Success</span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Error</span>
                      )}
                    </td>
                    <td className="py-2 text-gray-500">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available categories hint */}
      {stage === 'idle' && categories.length > 0 && (
        <div className="rounded-xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">Available categories — use these exact names in your Excel</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <span key={c._id} className="rounded bg-white px-2 py-1 font-mono text-xs text-gray-700 ring-1 ring-amber-200">{c.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Field reference */}
      {stage === 'idle' && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Template Field Reference</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 font-semibold uppercase tracking-wide text-gray-500">
                  <th className="pb-2 pr-4">Column</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Required</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {[
                  ['NAME', 'Text', true, 'Product name'],
                  ['DESCRIPTION', 'Text', false, 'Plain text description'],
                  ['SKU', 'Text', false, 'Stock keeping unit'],
                  ['CATEGORY', 'Text', true, 'Exact category name as shown in admin'],
                  ['SUB_CATEGORY', 'Text', true, 'Exact sub-category name as shown in admin'],
                  ['STOCK', 'Number', false, 'Quantity available (default 0)'],
                  ['MAKING_COST', 'Number', false, 'In INR — e.g. 500'],
                  ['OTHER_CHARGES', 'Number', false, 'In INR — e.g. 50'],
                  ['SILVER_WEIGHT_G', 'Number', false, 'Weight in grams — e.g. 5.2'],
                  ['DISCOUNT_%', 'Number (0–100)', false, 'Discount percentage'],
                  ['OCCASION', 'Text', false, 'Occasion key — e.g. valentines-day'],
                  ['DETAILS', 'Text', false, 'Stored in product attributes.details'],
                  ['IS_ACTIVE', 'Y / N', false, 'Default Y'],
                  ['IS_BESTSELLER', 'Y / N', false, 'Default N'],
                  ['IS_SPECIAL_OCCASION', 'Y / N', false, 'Default N'],
                  ['IS_MOST_GIFTED', 'Y / N', false, 'Default N'],
                  ['IMAGES (leave blank)', '—', false, 'Leave empty — add images via Edit page after upload'],
                  ['PAIR_NAME', 'Text', false, 'If provided, a pair variant is created'],
                  ['PAIR_DESCRIPTION', 'Text', false, 'Description for the pair variant'],
                  ['PAIR_STOCK', 'Number', false, 'Stock for pair variant'],
                  ['PAIR_MAKING_COST', 'Number', false, 'Making cost for pair variant in INR'],
                  ['PAIR_OTHER_CHARGES', 'Number', false, 'Other charges for pair variant in INR'],
                ].map(([col, type, req, notes]) => (
                  <tr key={col}>
                    <td className="py-1.5 pr-4 font-mono font-medium text-gray-700">{col}</td>
                    <td className="py-1.5 pr-4">{type}</td>
                    <td className="py-1.5 pr-4">
                      {req ? <span className="font-medium text-red-600">Yes</span> : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="py-1.5">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}
