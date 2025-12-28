export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-gray-900">Dashboard</div>
          <div className="mt-1 text-sm text-gray-600">Overview of your store</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">TOTAL ORDERS</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">0</div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">TOTAL PRODUCTS</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">0</div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold text-gray-500">TOTAL REVENUE</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">₹0</div>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">Quick Actions</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="primary-bg rounded-lg px-4 py-2 text-sm font-semibold text-white">
            Add Product
          </button>
          <button type="button" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800">
            Add Category
          </button>
          <button type="button" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800">
            View Orders
          </button>
        </div>
      </div>
    </div>
  )
}
