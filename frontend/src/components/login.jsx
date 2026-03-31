import React, { useState } from 'react'
import { Zap } from 'lucide-react'

const Login = ({ onSubmit, onSwitchMode }) => {
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit(formData)
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

      <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Welcome back</h2>
      <p className="text-gray-500 text-center text-sm mb-6">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
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
    </div>
  )
}

export default Login