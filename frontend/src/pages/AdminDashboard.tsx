import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaSave, FaPlus, FaTrash, FaEdit, FaList, FaDumbbell, FaSearch } from 'react-icons/fa';
import AdminNavbar from '../components/AdminNavbar';

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

const API_URL = 'http://localhost:5000/api/exercises';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'manage' | 'form'>('manage');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Fetch Exercises from the Backend
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setExercises(data))
      .catch(err => console.error("Failed to load exercises:", err));
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
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setExercises(prev => prev.filter(ex => ex.id !== id));
        setSuccessMsg('Exercise deleted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        // Update existing
        const updatedExercise = { ...exerciseData, id: editingId };
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedExercise)
        });
        const data = await res.json();
        setExercises(prev => prev.map(ex => ex.id === editingId ? data : ex));
        setSuccessMsg('Exercise updated successfully!');
      } else {
        // Create new
        const newId = exercises.length > 0 ? Math.max(...exercises.map(e => e.id)) + 1 : 1;
        const newExercise = { ...exerciseData, id: newId };
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExercise)
        });
        const data = await res.json();
        setExercises(prev => [...prev, data]);
        setSuccessMsg('Exercise created successfully!');
      }
    } catch (err) {
      console.error("Failed to save", err);
    }
    
    setIsSubmitting(false);
    resetForm();
    setActiveTab('manage');
    setTimeout(() => setSuccessMsg(''), 3000);
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
          
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 shadow-inner">
            <button
              onClick={() => { setActiveTab('manage'); resetForm(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'manage' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <FaList /> Manage
            </button>
            <button
              onClick={() => { setActiveTab('form'); resetForm(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
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
