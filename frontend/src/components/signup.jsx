import React, { useState } from 'react'
import { Zap } from 'lucide-react'
import axios from 'axios'

const Signup = ({ onSubmit, onSwitchMode }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [step, setStep] = useState('signup')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:4000/api/user/register', formData)
      if (res.data.success) {
        setRegisteredEmail(formData.email)
        setStep('otp')
        setSuccess(`OTP sent to: ${formData.email}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async e => {
    e.preventDefault()
    if (otp.length !== 6) return setError('Please enter 6 digit OTP')
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:4000/api/user/verify-otp', {
        email: registeredEmail,
        otp
      })
      if (res.data.success) {
        onSubmit({ verified: true, token: res.data.token, user: res.data.user })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await axios.post('http://localhost:4000/api/user/resend-otp', { email: registeredEmail })
      setSuccess('New OTP sent successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Resend failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 justify-center">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          TaskFlow
        </span>
      </div>

      {/* SIGNUP SCREEN */}
      {step === 'signup' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Create account</h2>
          <p className="text-gray-500 text-center text-sm mb-6">Start managing your tasks today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending OTP...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <button onClick={onSwitchMode} className="text-purple-600 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </>
      )}

      {/* OTP SCREEN */}
      {step === 'otp' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Verify Email</h2>
          <p className="text-gray-500 text-center text-sm mb-2">OTP sent to:</p>
          <p className="text-purple-600 font-semibold text-center text-sm mb-6">{registeredEmail}</p>

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="······"
                maxLength={6}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-center tracking-[0.5em] font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying...</>
              ) : 'Verify OTP'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Didn't receive OTP?{' '}
            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="text-purple-600 font-semibold hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          </p>

          <p className="text-center text-sm text-gray-500 mt-2">
            <button onClick={() => { setStep('signup'); setError(''); setSuccess('') }}
              className="text-gray-400 hover:underline text-xs">
              ← Go back
            </button>
          </p>
        </>
      )}
    </div>
  )
}

export default Signup