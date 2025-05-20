import React, { useState } from 'react';
import api from '../../lib/axios';

const ProfileUpdateForm = ({ onUpdate, initialData }) => {
  const [formData, setFormData] = useState({
    industry: initialData?.industry || '',
    experience: initialData?.experience || 1,
    skills: initialData?.skills || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Industry options
  const industries = [
    'Software Development',
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Artificial Intelligence',
    'Cybersecurity',
    'Cloud Computing',
    'DevOps',
    'Mobile Development',
    'Game Development',
    'UI/UX Design',
    'Product Management',
    'Digital Marketing',
    'Finance',
    'Healthcare',
    'Education',
    'E-commerce',
    'Telecommunications'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience' ? parseInt(value) : value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/api/users/profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (err) {
      setError('Failed to update profile');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-200">
          Profile updated successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-cyan-50 mb-2">
            Industry
          </label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full bg-zinc-700 text-cyan-50 border border-zinc-600 rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
            required
          >
            <option value="">Select an industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-cyan-50 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            name="experience"
            min="0"
            max="50"
            value={formData.experience}
            onChange={handleChange}
            className="w-full bg-zinc-700 text-cyan-50 border border-zinc-600 rounded-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-cyan-50 mb-2">
            Skills
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="bg-cyan-900/30 text-cyan-50 px-3 py-1 rounded-full flex items-center">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-cyan-300 hover:text-cyan-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 bg-zinc-700 text-cyan-50 border border-zinc-600 rounded-l-lg p-2.5 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-cyan-600 text-white px-4 rounded-r-lg hover:bg-cyan-700"
            >
              Add
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 text-white py-2.5 px-4 rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileUpdateForm; 