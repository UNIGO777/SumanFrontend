import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LOGO from '../assets/LOGO.png'
import { adminLoginInit, adminLoginVerify } from './services/adminAuth.js'
import { getApiBase } from './services/apiClient.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('credentials')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  const apiBase = useMemo(() => getApiBase(), [])

  useEffect(() => {
    const token = window.localStorage.getItem('admin_token') || window.sessionStorage.getItem('admin_token')
    if (token) navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  useEffect(() => {
    const localToken = window.localStorage.getItem('admin_token')
    const sessionToken = window.sessionStorage.getItem('admin_token')

    if (keepLoggedIn) {
      if (sessionToken && !localToken) {
        window.localStorage.setItem('admin_token', sessionToken)
        window.sessionStorage.removeItem('admin_token')
      }
      return
    }

    if (localToken && !sessionToken) {
      window.sessionStorage.setItem('admin_token', localToken)
      window.localStorage.removeItem('admin_token')
    }
  }, [keepLoggedIn])

  const isDisabled = useMemo(() => {
    if (isLoading) return true
    if (step === 'credentials') return !email.trim() || !password
    return !email.trim() || otp.trim().length !== 6
  }, [email, password, otp, step, isLoading])

  const authStore = useMemo(() => {
    return keepLoggedIn ? window.localStorage : window.sessionStorage
  }, [keepLoggedIn])

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    if (step === 'credentials') {
      setIsLoading(true)
      adminLoginInit({ email, password })
        .then(() => {
          setStep('otp')
          setPassword('')
          setOtp('')
          setStatus('OTP sent to your email')
        })
        .catch((err) => {
          setError(err.message || 'Login failed')
        })
        .finally(() => setIsLoading(false))
      return
    }

    setIsLoading(true)
    adminLoginVerify({ email, otp: otp.trim() })
      .then((data) => {
        const token = data?.token
        if (!token) throw new Error('Token not received')
        window.localStorage.removeItem('admin_token')
        window.sessionStorage.removeItem('admin_token')
        authStore.setItem('admin_token', token)
        navigate('/admin/dashboard')
      })
      .catch((err) => {
        setError(err.message || 'OTP verification failed')
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full h-screen overflow-hidden  bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <div className="grid grid-cols-1 h-screen md:grid-cols-2">
          <div className="primary-bg relative flex min-h-[340px] flex-col overflow-hidden px-8 py-12 text-white md:min-h-[560px]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/25" />
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-[1px]" />
            <div className="absolute -bottom-24 -right-28 h-80 w-80 rounded-full bg-white/10 blur-[1px]" />

            <div className="relative flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                <img src={LOGO} alt="Suman Jwellaries" className="h-7 w-auto" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide">Suman Jwellaries</div>
                <div className="text-xs text-white/70">Admin Portal</div>
              </div>
            </div>

            <div className="relative mt-14">
              <div className="font-bodoni-bold text-4xl tracking-wide md:text-5xl">Welcome back</div>
              <div className="mt-4 max-w-md text-sm leading-6 text-white/80">
                {step === 'credentials'
                  ? 'Sign in with your admin email and password to get an OTP.'
                  : 'Enter the 6-digit OTP sent to your email to continue.'}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide ring-1 ring-white/15">
                  Secure OTP login
                </div>
                <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide ring-1 ring-white/15">
                  Manage products & orders
                </div>
                <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide ring-1 ring-white/15">
                  Faster access
                </div>
              </div>
            </div>

            <div className="relative mt-auto pt-10 text-xs text-white/60">
              © {new Date().getFullYear()} Suman Jwellaries
            </div>
          </div>

          <div className="flex flex-col justify-center px-8 py-10 md:px-10 md:py-12">
            <div className="text-sm font-semibold tracking-widest text-gray-500">{step === 'credentials' ? 'SIGN IN' : 'VERIFY OTP'}</div>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              {apiBase ? null : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Set `VITE_API_BASE_URL` to your backend URL for production.
                </div>
              )}

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              {status ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {status}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-600">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Email"
                  disabled={step === 'otp' || isLoading}
                  className="h-12 w-full rounded-lg border-2 border-[#0f2e3f]/20 px-4 text-sm text-gray-900 outline-none focus:border-[#0f2e3f]"
                />
              </div>

              {step === 'credentials' ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm text-gray-900 outline-none focus:border-gray-300"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-600">OTP</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-gray-200 px-4 text-sm tracking-[0.3em] text-gray-900 outline-none focus:border-gray-300"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setKeepLoggedIn((v) => !v)}
                  disabled={isLoading}
                  className="flex items-center cursor-pointer gap-3 text-sm font-medium text-gray-600 disabled:opacity-60"
                >
                  <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${keepLoggedIn ? 'primary-bg' : 'bg-gray-200'}`}>
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${keepLoggedIn ? 'translate-x-4' : 'translate-x-1'}`}
                    />
                  </span>
                  Keep me logged in
                </button>
                {step === 'otp' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials')
                      setOtp('')
                      setStatus('')
                      setError('')
                    }}
                    className="text-sm font-medium text-gray-700 hover:underline"
                  >
                    Change email
                  </button>
                ) : null}
              </div>

              <button
                disabled={isDisabled}
                type="submit"
                className="primary-bg h-12 w-full rounded-full cursor-pointer text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,46,63,0.35)] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_12px_28px_rgba(15,46,63,0.45)] disabled:opacity-60 disabled:transform-none disabled:shadow-[0_10px_22px_rgba(15,46,63,0.35)]"
              >
                {isLoading ? 'Please wait...' : step === 'credentials' ? 'Send OTP' : 'Verify & Continue'}
              </button>
              

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
