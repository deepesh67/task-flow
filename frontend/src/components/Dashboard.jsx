import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Home, Plus, Circle, Flame } from 'lucide-react'
import axios from 'axios'

const priorityConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
}

const Dashboard = () => {
  const { tasks = [], refreshTasks } = useOutletContext()
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'low', duedate: '' })
  const [submitting, setSubmitting] = useState(false)

  const totalTasks = tasks.length
  const lowCount = tasks.filter(t => t.priority === 'low').length
  const mediumCount = tasks.filter(t => t.priority === 'medium').length
  const highCount = tasks.filter(t => t.priority === 'high').length

  const today = new Date().toDateString()
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true
    if (filter === 'Today') return new Date(t.duedate).toDateString() === today
    if (filter === 'Week') return new Date(t.duedate) <= weekFromNow
    if (filter === 'High') return t.priority === 'high'
    if (filter === 'Medium') return t.priority === 'medium'
    if (filter === 'Low') return t.priority === 'low'
    return true
  })

  const handleToggle = async (task) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:4000/api/tasks/gp/${task._id}`,
        { completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      refreshTasks()
    } catch (err) { console.error(err) }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:4000/api/tasks/gp',
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setForm({ title: '', description: '', priority: 'low', duedate: '' })
      setShowForm(false)
      refreshTasks()
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:4000/api/tasks/gp/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      refreshTasks()
    } catch (err) { console.error(err) }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="w-6 h-6 text-purple-500" /> Task Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your tasks efficiently</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
        >
          <Plus size={16} /> Add New Task
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <form onSubmit={handleAddTask} className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm space-y-3">
          <input
            type="text" placeholder="Task title *"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          <input
            type="text" placeholder="Description"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          <div className="flex gap-3">
            <select
              value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date" value={form.duedate} onChange={e => setForm({ ...form, duedate: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      )}

      {/* Priority Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: <Home size={18} className="text-purple-500" />, bg: 'bg-purple-50' },
          { label: 'Low Priority', value: lowCount, icon: <Circle size={18} className="text-green-500" />, bg: 'bg-green-50' },
          { label: 'Medium Priority', value: mediumCount, icon: <Flame size={18} className="text-yellow-500" />, bg: 'bg-yellow-50' },
          { label: 'High Priority', value: highCount, icon: <Flame size={18} className="text-red-500" />, bg: 'bg-red-50' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-3 border border-white shadow-sm`}>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg">{item.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-800">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Task List */}
      <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">All Tasks</h2>
          <div className="flex gap-1 flex-wrap">
            {['All', 'Today', 'Week', 'High', 'Medium', 'Low'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f}
              </button>
            ))}
          </div>
          
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">No tasks found</p>
          )}
          {filteredTasks.map(task => (
            <div key={task._id} className={`flex items-start gap-3 p-3 rounded-xl border transition ${task.completed ? 'border-green-100 bg-green-50/30' : 'border-gray-100 hover:border-purple-100'}`}>
              <button onClick={() => handleToggle(task)} className="mt-0.5 shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${task.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                  {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${priorityConfig[task.priority]?.color || 'bg-gray-100 text-gray-600'}`}>
                    {priorityConfig[task.priority]?.label || task.priority}
                  </span>
                </div>
                {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  {task.duedate && <span>📅 {new Date(task.duedate).toLocaleDateString()}</span>}
                  <span>🕐 Created {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(task._id)} className="text-gray-300 hover:text-red-400 text-lg shrink-0">×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard