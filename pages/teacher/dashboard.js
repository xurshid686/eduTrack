import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/TeacherLayout';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTasks: 0,
    totalResources: 0,
    averageProgress: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/teacher/dashboard');
        const data = await response.json();
        
        if (response.ok) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="👨‍🎓"
          color="bg-blue-500"
        />
        <StatCard
          title="Active Tasks"
          value={stats.activeTasks}
          icon="📝"
          color="bg-green-500"
        />
        <StatCard
          title="Resources"
          value={stats.totalResources}
          icon="📚"
          color="bg-yellow-500"
        />
        <StatCard
          title="Avg Progress"
          value={`${stats.averageProgress}%`}
          icon="📈"
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 text-gray-600 font-medium">Student</th>
                <th className="text-left py-3 text-gray-600 font-medium">Task</th>
                <th className="text-left py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left py-3 text-gray-600 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3">{activity.studentName}</td>
                  <td className="py-3">{activity.taskName}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'in progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
