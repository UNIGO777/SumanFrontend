import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { fetchStats, fetchLowStockProducts, updateSilverPrice } from '../services/adminStats.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

// ── Helpers ─────────────────────────────────────────────────────────────────

const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0)

const shortDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

const STATUS_COLOR = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#6366f1',
  delivered: '#22c55e',
  cancelled: '#ef4444'
}

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

// ── Small Components ─────────────────────────────────────────────────────────

const RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'All time', value: 'all' }
]

function RangeFilter({ range, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={
            range === r.value
              ? 'rounded-lg bg-[#0f2e40] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors'
              : 'rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:text-gray-900'
          }
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

function StatCard({ label, value, warning }) {
  const base = 'rounded-xl p-5 shadow-sm ring-1 transition-all'
  const style =
    warning === 'red'
      ? `${base} bg-red-50 ring-red-200`
      : warning === 'amber'
        ? `${base} bg-amber-50 ring-amber-200`
        : `${base} bg-white ring-gray-200`
  const valueStyle =
    warning === 'red'
      ? 'text-red-700'
      : warning === 'amber'
        ? 'text-amber-700'
        : 'text-gray-900'

  return (
    <div className={style}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueStyle}`}>{value}</p>
    </div>
  )
}

function StatCardSkeleton() {
  return <div className="h-[88px] animate-pulse rounded-xl bg-gray-200 shadow-sm" />
}

function SectionCard({ title, children, action }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

function ChartSkeleton({ height = 'h-56' }) {
  return <div className={`${height} animate-pulse rounded-xl bg-gray-100`} />
}

function EmptyChart({ height = 'h-52' }) {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <p className="text-sm text-gray-400">No data for this period</p>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  )
}

function StockBadge({ stock }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        Out of stock
      </span>
    )
  if (stock <= 2)
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        {stock} left
      </span>
    )
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
      {stock} left
    </span>
  )
}

// ── Chart Components ─────────────────────────────────────────────────────────

function RevenueLineChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart height="h-56" />
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: data.map((d) => d.revenue),
        borderColor: '#0f2e40',
        backgroundColor: 'rgba(15,46,64,0.07)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2
      }
    ]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: {
          font: { size: 10 },
          color: '#9ca3af',
          callback: (v) =>
            '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0, notation: 'compact' }).format(v)
        }
      }
    }
  }
  return (
    <div className="h-56">
      <Line data={chartData} options={options} />
    </div>
  )
}

function OrderStatusDonut({ data }) {
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  const allZero = statuses.every((s) => !data[s])
  if (allZero) return <EmptyChart height="h-56" />
  const chartData = {
    labels: statuses.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: statuses.map((s) => data[s] || 0),
        backgroundColor: statuses.map((s) => STATUS_COLOR[s]),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 10, font: { size: 11 }, padding: 12, color: '#6b7280' }
      }
    }
  }
  return (
    <div className="h-56">
      <Doughnut data={chartData} options={options} />
    </div>
  )
}

function DailyOrdersBar({ data }) {
  if (!data || data.length === 0) return <EmptyChart height="h-52" />
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: 'Orders',
        data: data.map((d) => d.count),
        backgroundColor: '#0f2e40',
        borderRadius: 5,
        barPercentage: 0.6
      }
    ]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9ca3af' } },
      y: {
        grid: { color: '#f3f4f6' },
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 10 }, color: '#9ca3af' }
      }
    }
  }
  return (
    <div className="h-52">
      <Bar data={chartData} options={options} />
    </div>
  )
}

function TopProductsBar({ data }) {
  if (!data || data.length === 0) return <EmptyChart height="h-52" />
  const chartData = {
    labels: data.map((p) => (p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name)),
    datasets: [
      {
        label: 'Units sold',
        data: data.map((p) => p.unitsSold),
        backgroundColor: '#0f2e40',
        borderRadius: 4,
        barPercentage: 0.55
      }
    ]
  }
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: '#f3f4f6' },
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 10 }, color: '#9ca3af' }
      },
      y: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#374151' } }
    }
  }
  return (
    <div className="h-52">
      <Bar data={chartData} options={options} />
    </div>
  )
}

// ── Table Components ─────────────────────────────────────────────────────────

function RecentOrdersTable({ orders }) {
  if (!orders || orders.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">No orders found</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr>
            {['Order', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
              <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((o) => (
            <tr key={o._id} className="group">
              <td className="py-3 pr-4">
                <Link
                  to={`/admin/orders/${o._id}`}
                  className="font-mono text-xs font-semibold text-[#0f2e40] hover:underline"
                >
                  #{o._id.slice(-8).toUpperCase()}
                </Link>
              </td>
              <td className="py-3 pr-4 text-sm text-gray-600">
                {o.customerPhone || o.customerEmail || '—'}
              </td>
              <td className="py-3 pr-4 text-sm font-semibold text-gray-900">{inr(o.total)}</td>
              <td className="py-3 pr-4">
                <StatusBadge status={o.status} />
              </td>
              <td className="py-3 text-xs text-gray-400">{shortDate(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LowStockTable({ products, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    )
  }
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-4 ring-1 ring-green-200">
        <span className="text-lg text-green-500">✓</span>
        <p className="text-sm font-semibold text-green-700">All products are sufficiently stocked</p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr>
            {['Product', 'Category', 'Stock'].map((h) => (
              <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((p) => (
            <tr key={p._id}>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-gray-100" />
                  )}
                  <span className="line-clamp-1 text-sm font-medium text-gray-900">{p.name}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-sm text-gray-500">{p.category || '—'}</td>
              <td className="py-3">
                <StockBadge stock={p.stock} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Silver Price Widget ──────────────────────────────────────────────────────

function SilverPriceWidget({ initialPrice, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(initialPrice || ''))
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setInput(String(initialPrice || ''))
  }, [initialPrice])

  const save = async () => {
    if (!input || isNaN(Number(input))) return
    setSaving(true)
    setStatus('')
    try {
      await updateSilverPrice(input)
      setStatus('saved')
      setEditing(false)
      onSaved(Number(input))
      setTimeout(() => setStatus(''), 3000)
    } catch (e) {
      setStatus(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setEditing(false)
    setInput(String(initialPrice || ''))
    setStatus('')
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Silver 92.5 — Current Rate</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {initialPrice
            ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(initialPrice)
            : '—'}
          <span className="ml-1 text-sm font-medium text-gray-400">/g</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {editing ? (
          <>
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 focus:border-[#0f2e40] focus:outline-none focus:ring-2 focus:ring-[#0f2e40]/20"
              placeholder="e.g. 85"
            />
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-[#0f2e40] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#13384d] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={cancel}
              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Edit Price
          </button>
        )}
        {status === 'saved' && <p className="text-xs font-semibold text-green-600">Saved successfully</p>}
        {status && status !== 'saved' && <p className="text-xs font-semibold text-red-600">{status}</p>}
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [range, setRange] = useState('all')
  const [stats, setStats] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [lowStockLoading, setLowStockLoading] = useState(true)
  const [error, setError] = useState('')
  const [silverPrice, setSilverPrice] = useState(0)

  const loadStats = async (r) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchStats(r)
      setStats(res.data)
      setSilverPrice(res.data.silverPrice || 0)
    } catch (e) {
      setError(e.message || 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const loadLowStock = async () => {
    setLowStockLoading(true)
    try {
      const res = await fetchLowStockProducts()
      setLowStock(res.data || [])
    } catch {
      setLowStock([])
    } finally {
      setLowStockLoading(false)
    }
  }

  useEffect(() => {
    loadStats(range)
  }, [range])

  useEffect(() => {
    loadLowStock()
  }, [])

  const d = stats || {}
  const ordersByStatus = d.ordersByStatus || {}

  return (
    <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <RangeFilter range={range} onChange={setRange} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between rounded-xl bg-red-50 px-5 py-4 ring-1 ring-red-200">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              onClick={() => loadStats(range)}
              className="text-xs font-semibold text-red-700 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {loading ? (
            <>
              <div className="lg:col-span-2"><StatCardSkeleton /></div>
              {[...Array(7)].map((_, i) => <StatCardSkeleton key={i} />)}
            </>
          ) : (
            <>
              <div className="col-span-2">
                <StatCard label="Total Revenue" value={inr(d.revenue)} />
              </div>
              <StatCard
                label="Pending"
                value={ordersByStatus.pending ?? 0}
                warning={ordersByStatus.pending > 0 ? 'amber' : undefined}
              />
              <StatCard label="Confirmed" value={ordersByStatus.confirmed ?? 0} />
              <StatCard label="Shipped" value={ordersByStatus.shipped ?? 0} />
              <StatCard label="Delivered" value={ordersByStatus.delivered ?? 0} />
              <StatCard
                label="Cancelled"
                value={ordersByStatus.cancelled ?? 0}
                warning={ordersByStatus.cancelled > 0 ? 'red' : undefined}
              />
              <StatCard label="Products" value={d.totalProducts ?? 0} />
              <StatCard
                label="Low Stock"
                value={d.lowStockCount ?? 0}
                warning={d.lowStockCount > 0 ? 'red' : undefined}
              />
            </>
          )}
        </div>

        {/* Row 2: Revenue chart + Status donut */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title="Revenue Trend">
              {loading ? <ChartSkeleton height="h-56" /> : <RevenueLineChart data={d.dailyRevenue} />}
            </SectionCard>
          </div>
          <div>
            <SectionCard title="Orders by Status">
              {loading ? <ChartSkeleton height="h-56" /> : <OrderStatusDonut data={ordersByStatus} />}
            </SectionCard>
          </div>
        </div>

        {/* Row 3: Daily orders + Top products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Orders per Day">
            {loading ? <ChartSkeleton height="h-52" /> : <DailyOrdersBar data={d.dailyOrders} />}
          </SectionCard>
          <SectionCard title="Top 5 Products by Units Sold">
            {loading ? <ChartSkeleton height="h-52" /> : <TopProductsBar data={d.topProducts} />}
          </SectionCard>
        </div>

        {/* Row 4: Recent orders + Low stock */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="Recent Orders"
            action={
              <Link
                to="/admin/orders"
                className="text-xs font-semibold text-[#0f2e40] hover:underline"
              >
                View all →
              </Link>
            }
          >
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : (
              <RecentOrdersTable orders={d.recentOrders} />
            )}
          </SectionCard>

          <SectionCard
            title={`Low Stock Inventory${lowStock.length > 0 ? ` (${lowStock.length})` : ''}`}
            action={
              lowStock.length > 0 ? (
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold text-[#0f2e40] hover:underline"
                >
                  Manage →
                </Link>
              ) : null
            }
          >
            <LowStockTable products={lowStock} loading={lowStockLoading} />
          </SectionCard>
        </div>

        {/* Row 5: Silver price widget */}
        <SectionCard title="Metal Price">
          {loading ? (
            <div className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ) : (
            <SilverPriceWidget
              initialPrice={silverPrice}
              onSaved={(v) => setSilverPrice(v)}
            />
          )}
        </SectionCard>

    </div>
  )
}
