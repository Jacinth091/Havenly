import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';

function AdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Properties',
      value: '89',
      change: '+5%',
      trend: 'up',
      icon: Building2,
      color: 'green'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,678',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'purple'
    },
    {
      title: 'Occupancy Rate',
      value: '87%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  const activities = [
    {
      id: 1,
      type: 'user',
      message: 'New landlord registered - John Doe',
      time: '5 minutes ago',
      icon: Users,
      status: 'success'
    },
    {
      id: 2,
      type: 'property',
      message: 'New property added - Sunset Apartments',
      time: '1 hour ago',
      icon: Building2,
      status: 'success'
    },
    {
      id: 3,
      type: 'alert',
      message: 'Payment overdue - Unit 4B',
      time: '2 hours ago',
      icon: AlertCircle,
      status: 'warning'
    },
    {
      id: 4,
      type: 'system',
      message: 'System backup completed',
      time: '5 hours ago',
      icon: CheckCircle2,
      status: 'success'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
        </div>
        <QuickActions role="admin" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">System Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database</span>
              <span className="text-sm font-medium text-gray-900">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">47</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;