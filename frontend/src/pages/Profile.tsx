import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaCalendarAlt, FaLock, FaArrowLeft, FaBirthdayCake, FaSignOutAlt, FaEdit, FaCamera, FaShieldAlt, FaIdCard } from 'react-icons/fa';
import { auth } from '../utils/auth';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('profileTab') || 'overview'); // overview, edit, security

  useEffect(() => {
    localStorage.removeItem('profileTab');
  }, []);
  
  // Password Reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Edit Profile state
  const [editFullName, setEditFullName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editNic, setEditNic] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = auth.getToken();
      if (!token) {
        window.location.hash = '#/auth';
        return;
      }

      const response = await api.get('/api/auth/me');
      const data = response.data;
      setUser(data);
      setEditFullName(data.fullName || '');
      if (data.dob) setEditDob(data.dob.split('T')[0]);
      setEditNic(data.nic || '');
      setEditProfileImage(data.profileImage || '');
    } catch (err: any) {
      toast.error('Failed to load profile: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');


    if (newPassword !== confirmPassword) {
      setResetMessage('New passwords do not match');
      return;
    }

    setResetLoading(true);
    try {
      await api.post('/api/auth/reset-password', { currentPassword, newPassword });

      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setResetMessage(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      const response = await api.put('/api/auth/profile', { 
        fullName: editFullName, 
        dob: editDob, 
        nic: editNic, 
        profileImage: editProfileImage 
      });
      
      setUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      setSaveMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    auth.logout();
  };

  if (isLoading) {
    return <LoadingScreen fullPage />;
  }

  return (
    <div className="min-h-screen bg-[#E3EFFF] dark:bg-slate-950 font-['Plus_Jakarta_Sans',_sans-serif] pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => window.location.hash = '#/dashboard'}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-bold hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-2 lg:translate-x-0' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600'
            }`}
          >
            <FaUser className="text-lg" />
            Show Profile
          </button>
          
          <button
            onClick={() => setActiveTab('edit')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'edit' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-2 lg:translate-x-0' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600'
            }`}
          >
            <FaEdit className="text-lg" />
            Edit Profile
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-2 lg:translate-x-0' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600'
            }`}
          >
            <FaShieldAlt className="text-lg" />
            Security Settings
          </button>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
            >
              <FaSignOutAlt className="text-lg" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          
          {/* TAB: SHOW PROFILE */}
          {activeTab === 'overview' && (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <FaUser className="text-blue-600" />
                Show Profile
              </h3>

              <div className="space-y-8">
                {/* Image & Role Area */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border-4 border-white dark:border-slate-600 shadow-md">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{user?.fullName || 'User Account'}</h4>
                    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                      {user?.role === 'admin' ? 'Administrator' : 'Patient'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        readOnly 
                        value={user?.fullName || 'N/A'} 
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-600 dark:text-slate-300 font-medium transition-all cursor-default" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        readOnly 
                        value={user?.email || 'N/A'} 
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-600 dark:text-slate-300 font-medium transition-all cursor-default" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">NIC Number</label>
                    <div className="relative">
                      <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        readOnly 
                        value={user?.nic || 'N/A'} 
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-600 dark:text-slate-300 font-medium transition-all cursor-default" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                      <input 
                        type="text" 
                        readOnly 
                        value={user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not set'} 
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-600 dark:text-slate-300 font-medium transition-all cursor-default" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Age</label>
                    <div className="relative">
                      <FaBirthdayCake className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                      <input 
                        type="text" 
                        readOnly 
                        value={user?.dob ? `${calculateAge(user.dob)} Years Old` : 'N/A'} 
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-600 dark:text-slate-300 font-medium transition-all cursor-default" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <FaEdit className="text-blue-600" />
                Edit Profile
              </h3>

              <form onSubmit={handleEditProfile} className="space-y-8">
                {saveMessage && (
                  <div className={`p-4 rounded-2xl text-sm font-bold border ${saveMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {saveMessage}
                  </div>
                )}

                {/* Image Upload Area */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border-4 border-white dark:border-slate-600 shadow-md">
                    {editProfileImage ? (
                      <img src={editProfileImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Profile Picture</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload a new avatar. Max size 2MB.</p>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-sm">
                      <FaCamera />
                      Choose Image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date of Birth</label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                      <input 
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all appearance-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">NIC Number</label>
                    <div className="relative">
                      <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text"
                        value={editNic}
                        onChange={(e) => setEditNic(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="e.g. 199012345678"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className={`px-8 py-4 rounded-2xl font-extrabold text-white shadow-xl transition-all ${
                      isSaving 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-blue-500/30'
                    }`}
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <FaShieldAlt className="text-blue-600" />
                Security Settings
              </h3>

              <form onSubmit={handlePasswordReset} className="space-y-6">
                {resetMessage && (
                  <div className={`p-4 rounded-2xl text-sm font-bold border ${resetMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {resetMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={resetLoading}
                    className={`px-8 py-4 rounded-2xl font-extrabold text-white shadow-xl transition-all ${
                      resetLoading 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-blue-500/30'
                    }`}
                  >
                    {resetLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
