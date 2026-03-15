import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaVenusMars, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';

const ViewProfile = () => {
  const { user } = useAuth();
  const safeUser = user ?? { firstName: 'User', lastName: '', email: '', phone: '', gender: '', dob: '', initials: 'U' };

  const fields = [
    { icon: <FaUser className="text-[#3B82F6]" />, label: 'First Name', value: safeUser.firstName },
    { icon: <FaUser className="text-[#3B82F6]" />, label: 'Last Name', value: safeUser.lastName },
    { icon: <FaEnvelope className="text-[#3B82F6]" />, label: 'Email', value: safeUser.email },
    { icon: <FaPhone className="text-[#3B82F6]" />, label: 'Phone', value: safeUser.phone || 'Not provided' },
    { icon: <FaVenusMars className="text-[#3B82F6]" />, label: 'Gender', value: safeUser.gender || 'Not provided' },
    { icon: <FaCalendar className="text-[#3B82F6]" />, label: 'Date of Birth', value: safeUser.dob || 'Not provided' },
  ];

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
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#2F6FDB] to-[#3B82F6] px-8 py-10 text-center relative">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/60 flex items-center justify-center mx-auto mb-3 shadow-xl">
              <span className="text-4xl font-extrabold text-white">{safeUser.initials || 'U'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{safeUser.firstName} {safeUser.lastName}</h1>
            <p className="text-blue-100 text-sm mt-1">{safeUser.email}</p>
            <span className="inline-block mt-3 px-4 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
              Patient
            </span>
          </div>

          {/* Profile Fields */}
          <div className="px-8 py-6 space-y-4">
            <h2 className="text-lg font-bold text-[#1a2b3c] mb-2">Personal Information</h2>
            {fields.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FBFF] border border-blue-50 hover:border-blue-200 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-xs text-[#64748b] font-semibold">{f.label}</p>
                  <p className="text-sm font-bold text-[#1a2b3c]">{f.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="px-8 pb-8">
            <button
              onClick={() => (window.location.hash = '/edit-profile')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#2F6FDB] text-white rounded-xl font-bold text-sm hover:bg-[#255FC0] transition-all shadow-md"
            >
              <FaEdit /> Edit Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewProfile;
