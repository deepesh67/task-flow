import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ListChecks, Plus } from 'lucide-react'
import axios from 'axios'

const priorityConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
}

const PendingTasks = () => {
  const { tasks = [], refreshTasks } = useOutletContext()
  const [sort, setSort] = useState('newest')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'low', duedate: '' })
  const [submitting, setSubmitting] = useState(false)

  const pendingTasks = tasks.filter(t => !t.completed)

  const sortedTasks = [...pendingTasks].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sort === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority]
    }
    return 0
  })

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('http://localhost:4000/api/tasks/gp', form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setForm({ title: '', description: '', priority: 'low', duedate: '' })
      setShowForm(false)
      refreshTasks()
    } catch (err) { console.error(err) }
    finally { setSubmitting(false) }
  }

  const handleComplete = async (task) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`http://localhost:4000/api/tasks/gp/${task._id}`,
        { completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      refreshTasks()
    } catch (err) { console.error(err) }
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
            <ListChecks className="w-6 h-6 text-purple-500" /> Pending Task
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{pendingTasks.length} tasks needing your attention</p>
        </div>
        {/* Sort buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort by:</span>
          {[
            { key: 'newest', label: 'Newest' },
            { key: 'oldest', label: 'Oldest' },
            { key: 'priority', label: 'Priority' },
          ].map(s => (
            <button key={s.key} onClick={() => setSort(s.key)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition ${sort === s.key ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-200 rounded-xl text-purple-500 text-sm font-medium hover:border-purple-400 hover:bg-purple-50 transition"
      >
        <Plus size={16} /> Add New Task
      </button>

      {/* Add Task Form */}
      {showForm && (
        <form onSubmit={handleAddTask} className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm space-y-3">
          <input type="text" placeholder="Task title *"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          <input type="text" placeholder="Description"
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
          />
          <div className="flex gap-3">
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" value={form.duedate} onChange={e => setForm({ ...form, duedate: e.target.value })}
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

      {/* Task Cards */}
      <div className="space-y-3">
        {sortedTasks.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No pending tasks 🎉</div>
        )}
        {sortedTasks.map(task => (
          <div key={task._id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:border-purple-100 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button onClick={() => handleComplete(task)} className="mt-0.5 shrink-0">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-purple-500 transition" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-700">{task.title}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${priorityConfig[task.priority]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {priorityConfig[task.priority]?.label || task.priority}
                    </span>
                  </div>
                  {task.description && <p className="text-xs text-gray-400 mt-1">{task.description}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    {task.duedate && <span>📅 {new Date(task.duedate).toLocaleDateString()}</span>}
                    <span>🕐 Created {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(task._id)} className="text-gray-300 hover:text-red-400 text-xl shrink-0">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingTasks