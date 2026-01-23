import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Building, Save } from 'lucide-react';
import axios from 'axios';

export default function MyAccount() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        companyName: user.companyName || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/me',
        {
          name: formData.name,
          companyName: user.role === 'company' ? formData.companyName : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      login(response.data, token);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-[#1c1f26] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10 bg-white/5">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <User className="w-6 h-6 text-[rgb(var(--primary))]" />
              Account Settings
            </h1>
            <p className="mt-1 text-gray-400">Manage your profile information</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="block w-full pl-10 bg-[#0d1117] border border-white/10 rounded-lg py-2.5 text-gray-400 opacity-60 cursor-not-allowed sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Role
                  </label>
                  <div className="relative">
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wide mt-2">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 my-6"></div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 bg-[#0d1117] border border-white/10 rounded-lg py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all sm:text-sm"
                    required
                  />
                </div>
              </div>

              {user?.role === 'company' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="companyName">
                    Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="block w-full pl-10 bg-[#0d1117] border border-white/10 rounded-lg py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-[rgb(var(--primary))] focus:border-transparent transition-all sm:text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))]/90 text-white font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                   <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
