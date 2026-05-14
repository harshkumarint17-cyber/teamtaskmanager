'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import api from '@/lib/axios'
import { Mail, ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const [step, setStep] = useState('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { finishAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.endsWith('@ethara.ai')) {
      setError('Only @ethara.ai email addresses are allowed')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/auth/signup', { name, email, password, role })
      setStep('otp')
      setOtp('')
      setCooldown(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/api/auth/signup/verify', { email, otp })
      const { token, ...userData } = res.data
      finishAuth(userData, token)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setLoading(true)
    try {
      await api.post('/api/auth/signup', { name, email, password, role })
      setOtp('')
      setCooldown(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dp-bg flex items-center justify-center px-4">
      <div className="bg-dp-surface rounded-2xl border border-dp-border w-full max-w-md p-8 shadow-[0_0_40px_rgba(109,40,217,0.15)]">
        <div className="flex items-center gap-2 mb-8">
          <Image src="/ethara.png" alt="Ethara" width={120} height={36} className="h-9 w-auto object-contain" priority />
        </div>

        {step === 'form' ? (
          <>
            <h1 className="text-2xl font-bold text-violet-50 mb-1">Create account</h1>
            <p className="text-violet-400 text-sm mb-8">Only @ethara.ai email addresses can register</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-violet-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Harsh Kumar Singh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="you@ethara.ai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-300 mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {loading ? 'Sending code...' : 'Continue'}
              </button>
            </form>

            <p className="text-sm text-violet-500 text-center mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 font-medium hover:text-violet-300 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => { setStep('form'); setError(''); setOtp('') }}
              className="flex items-center gap-1.5 text-sm text-violet-500 hover:text-violet-300 mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <div className="flex items-center justify-center w-12 h-12 bg-violet-600/20 rounded-xl mb-5">
              <Mail size={22} className="text-violet-400" />
            </div>

            <h1 className="text-2xl font-bold text-violet-50 mb-1">Verify your email</h1>
            <p className="text-violet-400 text-sm mb-1">We sent a 6-digit code to</p>
            <p className="text-violet-300 text-sm font-medium mb-8">{email}</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-violet-300 mb-1.5">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-4 text-center text-2xl font-bold tracking-[0.6em] bg-dp-bg border-2 border-dp-bstrong rounded-xl text-violet-100 placeholder:text-violet-700 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="------"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-violet-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify & Create account'}
              </button>
            </form>

            <div className="text-center mt-5">
              {cooldown > 0 ? (
                <p className="text-sm text-violet-600">Resend code in {cooldown}s</p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-violet-400 hover:text-violet-300 font-medium disabled:opacity-50 transition-colors"
                >
                  Resend code
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
