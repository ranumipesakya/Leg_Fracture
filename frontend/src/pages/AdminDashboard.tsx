import React, { useState, useEffect } from 'react';
import { FaSave, FaPlus, FaTrash, FaEdit, FaList, FaDumbbell, FaSearch, FaChartBar, FaUsers, FaUpload, FaBone, FaCheckCircle, FaBullseye, FaClock } from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';
import LoadingScreen from '../components/LoadingScreen';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import { auth } from '../utils/auth';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

interface Exercise {
  id: number;
  title: string;
  duration: string;
  sets: string;
  reps: string;
  imageUrl: string;
  videoUrl: string;
  category: string;
  instructions: string[];
  benefits: string[];
  precautions: string[];
}

const AdminDashboard = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const API_URL = `${apiBaseUrl}/api/exercises`;
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'manage' | 'form'>('overview');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [exerciseData, setExerciseData] = useState<Omit<Exercise, 'id'>>({
    title: '',
    duration: '',
    sets: '',
    reps: '',
    imageUrl: '',
    videoUrl: '',
    category: 'post-surgery',
    instructions: [''],
    benefits: [''],
    precautions: ['']
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getAdminHeaders = () => {
    const token = auth.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleAuthFailure = (status: number) => {
    if (status === 401 || status === 403) {
      auth.logout();
      return true;
    }
    return false;
  };

  // Fetch Exercises from the Backend
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setExercises(data))
      .catch(err => console.error("Failed to load exercises:", err));

    // Fetch analytics
    const token = auth.getToken();
    if (token) {
      api.get('/api/analytics')
        .then(response => {
          if (response.data && !response.data.error) setAnalytics(response.data);
        })
        .catch(err => {
          console.error('Failed to load analytics:', err);
          if (err.response?.status !== 401) toast.error('Failed to load analytics');
        })
        .finally(() => setAnalyticsLoading(false));

      api.get('/api/admin/users')
        .then(response => { 
          if (Array.isArray(response.data)) {
            setUsersList(response.data); 
          }
        })
        .catch(err => {
          console.error('Failed to load users:', err);
        });
    } else {
      setAnalyticsLoading(false);
    }
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setExerciseData({
      title: '', duration: '', sets: '', reps: '',
      imageUrl: '', videoUrl: '', category: 'post-surgery',
      instructions: [''], benefits: [''], precautions: ['']
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setExerciseData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'instructions' | 'benefits' | 'precautions', index: number, value: string) => {
    const newArray = [...exerciseData[field]];
    newArray[index] = value;
    setExerciseData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'instructions' | 'benefits' | 'precautions') => {
    setExerciseData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'instructions' | 'benefits' | 'precautions', index: number) => {
    const newArray = exerciseData[field].filter((_, i) => i !== index);
    setExerciseData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setExerciseData({ ...exercise });
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this exercise?")) {
      try {
        setErrorMsg('');
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
        });
        if (handleAuthFailure(response.status)) return;
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to delete exercise');
        }
        setExercises(prev => prev.filter(ex => ex.id !== id));
        setSuccessMsg('Exercise deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to delete exercise');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    let didSave = false;
    
    try {
      if (editingId) {
        // Update existing
        const updatedExercise = { ...exerciseData, id: editingId };
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(updatedExercise)
        });
        if (handleAuthFailure(res.status)) return;
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update exercise');
        }
        const data = await res.json();
        setExercises(prev => prev.map(ex => ex.id === editingId ? data : ex));
        setSuccessMsg('Exercise updated successfully!');
        didSave = true;
      } else {
        // Create new
        const newId = exercises.length > 0 ? Math.max(...exercises.map(e => e.id)) + 1 : 1;
        const newExercise = { ...exerciseData, id: newId };
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify(newExercise)
        });
        if (handleAuthFailure(res.status)) return;
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create exercise');
        }
        const data = await res.json();
        setExercises(prev => [...prev, data]);
        setSuccessMsg('Exercise created successfully!');
        didSave = true;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save exercise');
      console.error("Failed to save", err);
    } finally {
      setIsSubmitting(false);
    }

    if (didSave) {
      resetForm();
      setActiveTab('manage');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.category.toLowerCase().includes(searchQuery.toLowerCase().replace(' ', '-'))
  );

  return (
    <div className="font-['Plus_Jakarta_Sans',_sans-serif] bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500 pb-20">
      <AdminNavbar currentPage="admin" />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="mb-8 p-6 md:p-10 rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              Admin <span className="text-indigo-600 dark:text-indigo-400">Dashboard</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Manage patient physiotherapy assignments (Create, Read, Update, Delete).
            </p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 shadow-inner flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'overview' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <FaChartBar /> Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'users' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <FaUsers /> Users
            </button>
            <button
              onClick={() => { setActiveTab('manage'); resetForm(); }}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'manage' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <FaList /> Exercises
            </button>
            <button
              onClick={() => { setActiveTab('form'); resetForm(); }}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'form' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <FaDumbbell /> {editingId ? 'Edit' : 'Add New'}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold">
            {errorMsg}
          </div>
        )}

        {/* =========================================
            OVERVIEW TAB (ANALYTICS & CHARTS)
            ========================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {analyticsLoading ? (
              <LoadingScreen />
            ) : analytics ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <FaUpload className="text-xl" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">Total Scans</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{analytics.totalScans}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Total System Uploads</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                        <FaBone className="text-xl" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">Fractured</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{analytics.fractured}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Fracture Cases</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <FaCheckCircle className="text-xl" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">Not Fractured</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{analytics.notFractured}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Clear Scans</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                        <FaUsers className="text-xl" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full">Users</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{analytics.totalUsers}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Registered Users</p>
                  </div>
                </div>

                {/* Accuracy & Confidence Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/20 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <FaBullseye className="text-2xl opacity-80" />
                      <h3 className="text-lg font-black uppercase tracking-wider opacity-90">System Avg. Confidence</h3>
                    </div>
                    <p className="text-5xl sm:text-6xl font-black">{(analytics.avgConfidence * 100).toFixed(1)}%</p>
                    <p className="text-sm font-semibold opacity-70 mt-2">Overall model prediction confidence across all scans</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-500/20 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <FaClock className="text-2xl opacity-80" />
                      <h3 className="text-lg font-black uppercase tracking-wider opacity-90">Fracture Rate</h3>
                    </div>
                    <p className="text-5xl sm:text-6xl font-black">
                      {analytics.totalScans > 0 ? ((analytics.fractured / analytics.totalScans) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-sm font-semibold opacity-70 mt-2">Percentage of valid scans identifying fractures</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                      Overall Fracture Distribution
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={[
                              { name: 'Fractured', value: analytics.fractured },
                              { name: 'Not Fractured', value: analytics.notFractured },
                              { name: 'Not X-Ray', value: analytics.notXray },
                              { name: 'Not Leg X-Ray', value: analytics.notLeg },
                            ].filter(d => d.value > 0)} 
                            cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={4} dataKey="value" strokeWidth={0}
                          >
                            {[1, 2, 3, 4].map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 700 }} />
                          <Legend wrapperStyle={{ fontSize: '13px', fontWeight: 700 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                      Global Monthly Uploads
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.monthlyData} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px', fontWeight: 700 }} />
                          <Bar dataKey="uploads" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-10">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    System Usage (Last 30 Days)
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.dailyData}>
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
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 font-bold">No analytics data available yet.</p>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            USERS TAB (REGISTERED USERS TABLE)
            ========================================= */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Registered Patients</h2>
                <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{usersList.length} Total Users</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                      <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">NIC Number</th>
                      <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Date of Birth</th>
                      <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold">No users registered yet.</td>
                      </tr>
                    ) : (
                      usersList.map((u, i) => (
                        <tr key={u._id || i} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
                                {u.fullName?.charAt(0) || 'U'}
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">{u.fullName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 font-medium text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black text-slate-500 dark:text-slate-400">
                              {u.nic || 'N/A'}
                            </span>
                          </td>
                          <td className="px-8 py-5 font-medium text-slate-600 dark:text-slate-400">
                            {u.dob ? new Date(u.dob).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            MANAGE EXERCISES TAB (LIST, SEARCH, DELETE)
            ========================================= */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <FaSearch className="text-slate-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search exercises by name or category (e.g., 'fall' or 'pain')..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
                  No exercises found matching your search. Add one to get started!
                </div>
              ) : (
                filteredExercises.map(ex => (
                  <div key={ex.id} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all flex flex-col">
                    <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
                      {ex.imageUrl ? (
                        <img src={ex.imageUrl} alt={ex.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm text-slate-900 dark:text-white">
                        {ex.category.replace('-', ' ')}
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{ex.title}</h3>
                      <div className="text-sm font-semibold text-slate-500 mb-4 flex-wrap">
                        {ex.duration} &bull; {ex.sets} &bull; {ex.reps}
                      </div>

                      <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button 
                          onClick={() => handleEdit(ex)}
                          className="flex-1 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(ex.id)}
                          className="w-12 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================
            ADD / EDIT EXERCISE FORM TAB
            ========================================= */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* General Information */}
            <div className="p-6 md:p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                {editingId ? 'Edit General Information' : 'General Information'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Exercise Title (Rename)</label>
                  <input 
                    type="text"
                    required
                    value={exerciseData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    placeholder="e.g., Ankle Pumps"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                  <select 
                    value={exerciseData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white appearance-none"
                  >
                    <option value="post-surgery">Post-Surgery Recovery</option>
                    <option value="after-fall">After a Fall</option>
                    <option value="general-pain">General Leg Pain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Duration</label>
                  <input 
                    type="text"
                    required
                    value={exerciseData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    placeholder="e.g., 5-10 min"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Sets</label>
                    <input 
                      type="text"
                      required
                      value={exerciseData.sets}
                      onChange={(e) => handleInputChange('sets', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      placeholder="e.g., 3 sets"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Reps</label>
                    <input 
                      type="text"
                      required
                      value={exerciseData.reps}
                      onChange={(e) => handleInputChange('reps', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      placeholder="e.g., 10 reps"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Media Links */}
            <div className="p-6 md:p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Media Resources
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Image URL (or path)</label>
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      required
                      value={exerciseData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                      placeholder="/exercises/ankle-pumps.gif"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">YouTube Video URL</label>
                  <input 
                    type="url"
                    required
                    value={exerciseData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    placeholder="https://youtu.be/..."
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Lists */}
            {['instructions', 'benefits', 'precautions'].map((field) => (
              <div key={field} className="p-6 md:p-8 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full ${field === 'precautions' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    {field}
                  </h2>
                  <button
                    type="button"
                    onClick={() => addArrayItem(field as any)}
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <FaPlus /> Add Step
                  </button>
                </div>
                
                <div className="space-y-4">
                  {exerciseData[field as 'instructions' | 'benefits' | 'precautions'].map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <textarea 
                        required
                        value={item}
                        onChange={(e) => handleArrayChange(field as any, index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white min-h-[60px] resize-none"
                        placeholder={`Enter ${field} detail...`}
                      />
                      {exerciseData[field as 'instructions' | 'benefits' | 'precautions'].length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeArrayItem(field as any, index)}
                          className="p-3 mt-1 rounded-xl text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit Action */}
            <div className="flex justify-end pt-4 gap-4">
              <button 
                type="button"
                onClick={() => { resetForm(); setActiveTab('manage'); }}
                className="px-8 py-4 rounded-2xl font-extrabold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-extrabold text-white shadow-xl transition-all ${
                  isSubmitting 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1 hover:shadow-indigo-500/30'
                }`}
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <FaSave className="w-5 h-5" />
                    {editingId ? 'Update Exercise' : 'Save Exercise'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
