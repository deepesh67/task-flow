import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Clock, CheckCircle, Lightbulb } from 'lucide-react'

const Sidebar = ({ user, tasks = [] }) => {
  const location = useLocation();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const productivity = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let tip = "Keep going 👍";

  if (pendingTasks > 0) {
    tip = "You have many pending tasks, start working ⚡";
  } else if (totalTasks > 0 && completedTasks === totalTasks) {
    tip = "Great job! All tasks done 🎉";
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
        <p className="text-xs text-purple-500 mt-0.5">✨ Let's crush some tasks!</p>
      </div>

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
      </nav>

      <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-100">
        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1">
          <Lightbulb size={14} className="text-purple-500" /> Pro Tip
        </p>
        <p className="text-xs text-gray-500">{tip}</p>
      </div>

    </div>
  )
}

export default Sidebar