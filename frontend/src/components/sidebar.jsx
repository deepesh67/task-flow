import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Clock, CheckCircle, Activity, ShieldCheck } from 'lucide-react'

const Sidebar = ({ user, tasks = [] }) => {
  const location = useLocation();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const productivity = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  let tip = `Hey ${firstName}! Keep going 👍`;
  if (pendingTasks > 0) {
    tip = `Hey ${firstName}! You have ${pendingTasks} pending task${pendingTasks > 1 ? 's' : ''}, start working ⚡`;
  } else if (totalTasks > 0 && completedTasks === totalTasks) {
    tip = `Hey ${firstName}! Great job! All tasks done 🎉`;
  } else if (totalTasks === 0) {
    tip = `Hey ${firstName}! No tasks assigned yet. Relax! 😊`;
  }

  const links = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/pending', icon: <Clock size={18} />, label: 'Pending Tasks' },
    { to: '/completed', icon: <CheckCircle size={18} />, label: 'Completed Tasks' },
  ];

  return (
    <div className="hidden md:flex fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 p-4 flex-col gap-4">
      <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
        <p className="font-semibold text-gray-800">Hey, {user?.name || 'User'} 👋</p>
        <p className="text-xs text-purple-500 mt-0.5">
          {user?.role === 'admin' ? '👑 Admin' : "✨ Let's crush some tasks!"}
        </p>
      </div>

      {user?.role !== 'admin' && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">PRODUCTIVITY</span>
            <span>{productivity}%</span>
          </div>
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500"
              style={{ width: `${productivity}%` }}
            />
          </div>
        </div>
      )}

      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${location.pathname === link.to
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-2 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase">Admin</div>
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${location.pathname === '/admin'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-orange-50'
                }`}
            >
              <ShieldCheck size={18} /> Admin Panel
            </Link>
          </>
        )}
      </nav>

      {user?.role !== 'admin' && (
        <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1">
            <Activity size={14} className="text-purple-500" /> Your Status
          </p>
          <p className="text-xs text-gray-500">{tip}</p>
        </div>
      )}
    </div>
  )
}

export default Sidebar