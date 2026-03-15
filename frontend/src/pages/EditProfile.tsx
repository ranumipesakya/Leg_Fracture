import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState(() => (user ?? { firstName: '', lastName: '', email: '', phone: '', gender: '', dob: '', initials: '' }));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      dob: formData.dob,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.hash = '/profile';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] font-['Plus_Jakarta_Sans',_sans-serif]">
      <main className="max-w-2xl mx-auto px-6 py-12">
        <button
          onClick={() => (window.location.hash = '/dashboard')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6FDB] hover:text-[#255FC0] transition-colors"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <div className="bg-white rounded-3xl shadow-xl border border-blue-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2F6FDB] to-[#3B82F6] px-8 py-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/60 flex items-center justify-center mx-auto mb-2 shadow-xl">
              <span className="text-3xl font-extrabold text-white">
                {`${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase() || 'U'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Edit Profile</h1>
            <p className="text-blue-100 text-sm mt-1">Update your personal information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="px-8 py-6 space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748b]">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-[#F8FBFF] text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748b]">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-[#F8FBFF] text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748b]">Email Address</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-[#F8FBFF] text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748b]">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-[#F8FBFF] text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm font-medium"
              />
            </div>

            {/* Gender & DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748b]">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-[#F8FBFF] text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm font-medium"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#64748b]">Date of Birth</label>
                <input
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-[#F8FBFF] text-[#1e293b] focus:ring-2 focus:ring-blue-300 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Success Message */}
            {saved && (
              <div className="py-3 px-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold text-center">
                ✅ Profile saved successfully! Redirecting…
              </div>
            )}

            {error && (
              <div className="py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#2F6FDB] text-white rounded-xl font-bold text-sm hover:bg-[#255FC0] transition-all shadow-md"
              >
                <FaSave /> Save Changes
              </button>
              <button
                type="button"
                onClick={() => (window.location.hash = '/profile')}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-blue-200 text-[#64748b] rounded-xl font-bold text-sm hover:bg-blue-50 transition-all"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
