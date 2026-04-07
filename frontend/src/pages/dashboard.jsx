import React, { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle, Clock, Users, ClipboardList, UserPlus } from 'lucide-react'

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('tasks') // tasks | employees
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEmpForm, setShowEmpForm] = useState(false)
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', duedate: '', assignedTo: ''
  })
  const [empForm, setEmpForm] = useState({ name: '', email: '', password: '' })

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const fetchData = async () => {
    try {
      const [tasksRes, empRes] = await Promise.all([
        fetch('http://localhost:4000/api/tasks/gp', { headers }),
        fetch('http://localhost:4000/api/tasks/employees', { headers })
      ])
      const tasksData = await tasksRes.json()
      const empData = await empRes.json()
      setTasks(tasksData.tasks || [])
      setEmployees(empData.employees || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCreateTask = async () => {
    if (!taskForm.title || !taskForm.assignedTo) return alert('Title aur Employee select karo')
    try {
      const res = await fetch('http://localhost:4000/api/tasks/gp', {
        method: 'POST', headers,
        body: JSON.stringify(taskForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setTasks(prev => [data.task, ...prev])
      setTaskForm({ title: '', description: '', priority: 'medium', duedate: '', assignedTo: '' })
      setShowTaskForm(false)
    } catch (err) { alert(err.message) }
  }

  const handleDeleteTask = async (id) => {
    if (!confirm('Delete karna chahte ho?')) return
    try {
      await fetch(`http://localhost:4000/api/tasks/gp/${id}`, { method: 'DELETE', headers })
      setTasks(prev => prev.filter(t => t._id !== id))
    } catch (err) { alert(err.message) }
  }

  const handleToggleTask = async (task) => {
    try {
      const res = await fetch(`http://localhost:4000/api/tasks/gp/${task._id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ completed: !task.completed })
      })
      const data = await res.json()
      setTasks(prev => prev.map(t => t._id === task._id ? data.task : t))
    } catch (err) { alert(err.message) }
  }

  const handleCreateEmployee = async () => {
    if (!empForm.name || !empForm.email || !empForm.password) return alert('Sab fields bharo')
    try {
      const res = await fetch('http://localhost:4000/api/user/create-employee', {
        method: 'POST', headers,
        body: JSON.stringify(empForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setEmpForm({ name: '', email: '', password: '' })
      setShowEmpForm(false)
      fetchData()
      alert('Employee ban gaya! ✅')
    } catch (err) { alert(err.message) }
  }

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Employee delete karna chahte ho?')) return
    try {
      const res = await fetch(`http://localhost:4000/api/user/delete-employee/${id}`, {
        method: 'DELETE', headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setEmployees(prev => prev.filter(e => e._id !== id))
    } catch (err) { alert(err.message) }
  }

  const priorityColor = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-green-100 text-green-600'
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: <ClipboardList size={20} />, color: 'bg-purple-50 text-purple-600' },
          { label: 'Completed', value: completedTasks, icon: <CheckCircle size={20} />, color: 'bg-green-50 text-green-600' },
          { label: 'Pending', value: pendingTasks, icon: <Clock size={20} />, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Employees', value: employees.length, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-4 flex items-center gap-3 ${stat.color}`}>
            {stat.icon}
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs opacity-70">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'tasks' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          📋 Tasks
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'employees' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          👥 Employees
        </button>
      </div>

      {/* ✅ TASKS TAB */}
      {activeTab === 'tasks' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">All Tasks</h2>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition"
            >
              <Plus size={16} /> New Task
            </button>
          </div>

          {showTaskForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">Task Create Karo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Task title *"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                />
                <select
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  value={taskForm.assignedTo}
                  onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                >
                  <option value="">Employee select karo *</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
                  ))}
                </select>
                <textarea
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300 md:col-span-2"
                  placeholder="Description (optional)" rows={2}
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                />
                <select
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="date"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  value={taskForm.duedate}
                  onChange={e => setTaskForm({ ...taskForm, duedate: e.target.value })}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleCreateTask} className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition">
                  Create Task
                </button>
                <button onClick={() => setShowTaskForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {tasks.length === 0 && <div className="text-center text-gray-400 py-12">Koi task nahi hai abhi</div>}
            {tasks.map(task => (
              <div key={task._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition">
                <button onClick={() => handleToggleTask(task)} className="mt-1 flex-shrink-0">
                  {task.completed
                    ? <CheckCircle size={20} className="text-green-500" />
                    : <Clock size={20} className="text-gray-400" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority]}`}>{task.priority}</span>
                  </div>
                  {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {task.assignedTo && <span className="text-xs text-blue-500">👤 {task.assignedTo.name || 'Employee'}</span>}
                    {task.duedate && <span className="text-xs text-gray-400">📅 {new Date(task.duedate).toLocaleDateString()}</span>}
                    <span className={`text-xs font-medium ${task.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                      {task.completed ? '✅ Completed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDeleteTask(task._id)} className="text-gray-300 hover:text-red-500 transition flex-shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ✅ EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Employees</h2>
            <button
              onClick={() => setShowEmpForm(!showEmpForm)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition"
            >
              <UserPlus size={16} /> Add Employee
            </button>
          </div>

          {showEmpForm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-gray-700 mb-4">New Employee Add Karo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Name *"
                  value={empForm.name}
                  onChange={e => setEmpForm({ ...empForm, name: e.target.value })}
                />
                <input
                  type="email"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Email *"
                  value={empForm.email}
                  onChange={e => setEmpForm({ ...empForm, email: e.target.value })}
                />
                <input
                  type="password"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Password *"
                  value={empForm.password}
                  onChange={e => setEmpForm({ ...empForm, password: e.target.value })}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleCreateEmployee} className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition">
                  Add Employee
                </button>
                <button onClick={() => setShowEmpForm(false)} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {employees.length === 0 && <div className="text-center text-gray-400 py-12">Koi employee nahi hai abhi</div>}
            {employees.map(emp => (
              <div key={emp._id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {emp.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEmployee(emp._id)}
                  className="text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboard