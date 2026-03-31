import React, { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, LogOut, ShieldAlert, ChevronLeft, CheckCircle, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const ProfileSettings = () => {
  const { } = useOutletContext() || {}
  const navigate = useNavigate()

  const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}')

  const [name, setName] = useState(storedUser.name || '')
  const [email, setEmail] = useState(storedUser.email || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const handleSaveProfile = async () => {
    if (!name.trim()) return setProfileError('Name cannot be empty')
    setProfileSaving(true)
    setProfileError('')
    try {
      const token = localStorage.getItem('token')
      await axios.put('http://localhost:4000/api/user/profile',
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const updated = { ...storedUser, name, email }
      localStorage.setItem('currentUser', JSON.stringify(updated))
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordError('All fields are required')
    if (newPassword !== confirmPassword)
      return setPasswordError('New passwords do not match')
    if (newPassword.length < 6)
      return setPasswordError('Password must be at least 6 characters')
    setPasswordSaving(true)
    setPasswordError('')
    try {
      const token = localStorage.getItem('token')
      await axios.put('http://localhost:4000/api/user/password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
    navigate('/login', { replace: true })
  }

  const avatarUrl = storedUser.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=a855f7&color=fff`

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={avatarUrl} alt="avatar" className="w-14 h-14 rounded-2xl shadow-md" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-sm text-gray-500">Manage your profile and security settings</p>
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-4 h-4 text-purple-500" />
            Personal Information
          </h2>

          {/* Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            />
          </div>

          {profileError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Profile updated successfully!
            </p>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="w-full py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {profileSaving ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : 'Save Changes'}
          </button>
        </div>

        {/* Security */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-500" />
            Security
          </h2>

          {/* Current Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            />
            <button onClick={() => setShowCurrent(p => !p)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            />
            <button onClick={() => setShowNew(p => !p)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
            />
            <button onClick={() => setShowConfirm(p => !p)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {passwordError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Password changed successfully!
            </p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={passwordSaving}
            className="w-full py-2.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {passwordSaving ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Changing...</>
            ) : 'Change Password'}
          </button>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Danger Zone
            </p>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
