import React, { useState } from 'react'
import { Zap } from 'lucide-react'

const Login = ({ onSubmit, onSwitchMode }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [step, setStep] = useState('login') // login | forgot | otp | reset
  const [fpEmail, setFpEmail] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [fpNewPassword, setFpNewPassword] = useState('')
  const [fpConfirmPassword, setFpConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      const res = await fetch('http://localhost:4000/api/user/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage({ text: 'OTP sent! Check your email.', type: 'success' })
      setStep('otp')
    } catch (err) {
      setMessage({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (fpNewPassword !== fpConfirmPassword) {
      return setMessage({ text: 'Passwords do not match', type: 'error' })
    }
    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      const res = await fetch('http://localhost:4000/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, newpassword: fpNewPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage({ text: 'Password reset! Please login.', type: 'success' })
      setTimeout(() => {
        setStep('login')
        setFpEmail('')
        setFpOtp('')
        setFpNewPassword('')
        setFpConfirmPassword('')
        setMessage({ text: '', type: '' })
      }, 2000)
    } catch (err) {
      setMessage({ text: err.message, type: 'error' })
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

      {/* ✅ Login Form */}
      {step === 'login' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Welcome back</h2>
          <p className="text-gray-500 text-center text-sm mb-6">Sign in to your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="you@example.com" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" name="password" value={formData.password}
                onChange={handleChange} placeholder="••••••••" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            {/* ✅ Forgot Password link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => { setStep('forgot'); setMessage({ text: '', type: '' }) }}
                className="text-xs text-purple-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-md"
            >
              Sign In
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <button onClick={onSwitchMode} className="text-purple-600 font-semibold hover:underline">
              Sign up
            </button>
          </p>
        </>
      )}

      {/* ✅ Forgot Password — Enter email */}
      {step === 'forgot' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Forgot Password</h2>
          <p className="text-gray-500 text-center text-sm mb-6">Enter your email to get OTP</p>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" value={fpEmail}
                onChange={e => setFpEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            {message.text && (
              <p className={`text-xs px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {message.text}
              </p>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            <button onClick={() => setStep('login')} className="text-purple-600 font-semibold hover:underline">
              Back to Login
            </button>
          </p>
        </>
      )}

      {/* ✅ OTP + New Password */}
      {step === 'otp' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Reset Password</h2>
          <p className="text-gray-500 text-center text-sm mb-6">Enter OTP and new password</p>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
              <input
                type="text" value={fpOtp}
                onChange={e => setFpOtp(e.target.value)}
                placeholder="6 digit OTP" required maxLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password" value={fpNewPassword}
                onChange={e => setFpNewPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password" value={fpConfirmPassword}
                onChange={e => setFpConfirmPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              />
            </div>
            {message.text && (
              <p className={`text-xs px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {message.text}
              </p>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm hover:opacity-90 transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            <button onClick={() => setStep('forgot')} className="text-purple-600 font-semibold hover:underline">
              Resend OTP
            </button>
          </p>
        </>
      )}
    </div>
  )
}

export default Login