import React, { useState, useEffect } from 'react';
import PatientNavbar from '../components/PatientNavbar';
import LoadingScreen from '../components/LoadingScreen';
import { auth } from '../utils/auth';
import api from '../utils/api';
import { FaChartBar, FaUpload, FaBone, FaCheckCircle, FaBullseye, FaClock, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

interface AnalyticsData {
  totalScans: number;
  fractured: number;
  notFractured: number;
  notXray: number;
  notLeg: number;
  avgConfidence: number;
  monthlyData: { month: string; uploads: number }[];
  dailyData: { date: string; scans: number }[];
  recentScans: { result: string; confidence: number; createdAt: string; filename: string }[];
}

const COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const userToken = auth.getToken();

  useEffect(() => {
    if (!userToken) {
      setNotLoggedIn(true);
      setIsLoading(false);
      return;
    }
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analytics/me');
      setData(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (notLoggedIn) {
    return (
      <div className="min-h-screen bg-[#E3EFFF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif]">
        <PatientNavbar currentPage="analytics" />
        <div className="max-w-xl mx-auto px-4 pt-32 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <FaLock className="text-5xl text-slate-300 dark:text-slate-700 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Login Required</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Please log in to view your personal analytics dashboard.</p>
            <button
              onClick={() => window.location.hash = '#/auth'}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pieData = data ? [
    { name: 'Fractured', value: data.fractured },
    { name: 'Not Fractured', value: data.notFractured },
    { name: 'Not X-Ray', value: data.notXray },
    { name: 'Not Leg X-Ray', value: data.notLeg },
  ].filter(d => d.value > 0) : [];

  const hasRealData = data && data.totalScans > 0;

  const totalScans = data?.totalScans || 0;
  const fracturedCount = data?.fractured || 0;
  const notFracturedCount = data?.notFractured || 0;
  const avgConf = data?.avgConfidence ? (data.avgConfidence * 100).toFixed(1) : '0';
  const fracturedRatio = totalScans > 0 ? ((fracturedCount / totalScans) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-[#E3EFFF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] transition-colors duration-300">
      <PatientNavbar currentPage="analytics" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Your personal usage statistics</p>

          {/* No Data Warning */}
          {!hasRealData && !isLoading && (
            <div className="mt-6 flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800 text-sm font-semibold">
              <FaExclamationTriangle />
              No scan data yet. Upload X-rays to populate your analytics.
            </div>
          )}
        </div>

        {isLoading ? (
          <LoadingScreen />
        ) : (
          <>
            {/* Stats Cards — 3 columns, no "Registered Users" */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <FaUpload className="text-xl" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">Total</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{totalScans}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">My Uploads</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                    <FaBone className="text-xl" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">{fracturedRatio}%</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{fracturedCount}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Fractured</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <FaCheckCircle className="text-xl" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">Clear</span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{notFracturedCount}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Not Fractured</p>
              </div>
            </div>

            {/* Confidence & Ratio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/20 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <FaBullseye className="text-2xl opacity-80" />
                  <h3 className="text-lg font-black uppercase tracking-wider opacity-90">Avg. Confidence</h3>
                </div>
                <p className="text-5xl sm:text-6xl font-black">{avgConf}%</p>
                <p className="text-sm font-semibold opacity-70 mt-2">Your scan prediction confidence</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-500/20 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <FaClock className="text-2xl opacity-80" />
                  <h3 className="text-lg font-black uppercase tracking-wider opacity-90">Fracture Ratio</h3>
                </div>
                <p className="text-5xl sm:text-6xl font-black">{fracturedRatio}%</p>
                <p className="text-sm font-semibold opacity-70 mt-2">Your fractured vs total scans</p>
              </div>
            </div>

            {/* Charts */}
            {hasRealData && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                  {/* Pie Chart */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                      My Fracture Distribution
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={4} dataKey="value" strokeWidth={0}>
                            {pieData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 700 }} />
                          <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 700 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                        My Monthly Uploads
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">History</span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-6">Tracking your scan activity over the past months</p>
                    
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data!.monthlyData} barCategoryGap="25%">
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.4} />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                            axisLine={false} 
                            tickLine={false} 
                            dy={10}
                          />
                          <YAxis 
                            tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                            axisLine={false} 
                            tickLine={false} 
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                            contentStyle={{ 
                              backgroundColor: '#0f172a', 
                              border: 'none', 
                              borderRadius: '16px', 
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              color: '#fff', 
                              fontSize: '12px', 
                              fontWeight: 700,
                              padding: '12px 16px'
                            }} 
                            itemStyle={{ color: '#60a5fa' }}
                          />
                          <Bar 
                            dataKey="uploads" 
                            fill="url(#barGradient)" 
                            radius={[6, 6, 0, 0]} 
                            animationDuration={1500}
                            label={{ position: 'top', fill: '#64748b', fontSize: 11, fontWeight: 800, offset: 10 }}
                            activeBar={{ 
                              fill: '#2563eb',
                              stroke: '#3b82f6',
                              strokeWidth: 1,
                              filter: 'drop-shadow(0px 4px 6px rgba(37, 99, 235, 0.3))'
                            }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Area Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-10">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    My Usage (Last 30 Days)
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data!.dailyData}>
                        <defs>
                          <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 700 }} />
                        <Area type="monotone" dataKey="scans" stroke="#22c55e" strokeWidth={3} fill="url(#colorScans)" dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* Recent Scans Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                My Recent Scans
              </h3>
              {data && data.recentScans && data.recentScans.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left text-xs font-black text-slate-400 uppercase tracking-wider pb-3 pr-4">#</th>
                        <th className="text-left text-xs font-black text-slate-400 uppercase tracking-wider pb-3 pr-4">Result</th>
                        <th className="text-left text-xs font-black text-slate-400 uppercase tracking-wider pb-3 pr-4">Confidence</th>
                        <th className="text-left text-xs font-black text-slate-400 uppercase tracking-wider pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentScans
                        .filter(scan => scan.result === 'Fractured' || scan.result === 'Not Fractured')
                        .map((scan, i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3.5 pr-4 text-sm font-bold text-slate-400">{i + 1}</td>
                          <td className="py-3.5 pr-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                              scan.result === 'Fractured' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                              scan.result === 'Not Fractured' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                              'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                            }`}>
                              {scan.result}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                            {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="py-3.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {new Date(scan.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaChartBar className="text-4xl text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 dark:text-slate-500 font-bold">No scans recorded yet</p>
                  <p className="text-sm text-slate-400 dark:text-slate-600 mt-1">Upload X-rays to see your scan history here</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
