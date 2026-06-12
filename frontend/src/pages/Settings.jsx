import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, MapPin, Camera, Save, Loader, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, t } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    profileImage: { url: '', public_id: '' }
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Populate form from user context
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zip: user.address?.zip || '',
      profileImage: user.profileImage || { url: '', public_id: '' }
    });
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      // In production, send to backend API e.g. PUT /api/users/profile
      // Since it's a UI redesign, we can simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMsg('Profile information updated successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      // Simulating update
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMsg('Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    // Simulating Cloudinary file upload
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({
          ...prev,
          profileImage: {
            url: reader.result,
            public_id: 'mock_cloudinary_id'
          }
        }));
        setSuccessMsg('Photo uploaded (simulated)! Click Save to finalize.');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', textAlign: 'left' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Manage your personal details, profile identification, and security preferences</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Navigation Tabs */}
        <div className="glass" style={{ flex: '1 1 200px', maxWidth: '240px', width: '100%', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => { setActiveTab('profile'); setSuccessMsg(''); setErrorMsg(''); }}
            style={{ 
              background: activeTab === 'profile' ? 'rgba(0, 255, 157, 0.1)' : 'transparent', 
              color: activeTab === 'profile' ? 'var(--primary)' : 'white',
              border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left', textTransform: 'none', width: '100%'
            }}
          >
            <User size={16} /> Personal Information
          </button>
          <button 
            onClick={() => { setActiveTab('security'); setSuccessMsg(''); setErrorMsg(''); }}
            style={{ 
              background: activeTab === 'security' ? 'rgba(0, 255, 157, 0.1)' : 'transparent', 
              color: activeTab === 'security' ? 'var(--primary)' : 'white',
              border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', textAlign: 'left', textTransform: 'none', width: '100%'
            }}
          >
            <Lock size={16} /> Security
          </button>
        </div>

        {/* Tab Content Panels */}
        <div style={{ flex: '3 1 500px' }}>
          
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.form 
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleProfileSubmit}
                className="glass" 
                style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} color="var(--primary)" /> Profile Information
                </h2>

                {/* Status Banners */}
                {successMsg && (
                  <div style={{ background: 'rgba(0, 255, 157, 0.08)', border: '1px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--error)', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--error)', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}

                {/* Profile Photo Upload Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0,255,157,0.05)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {profileForm.profileImage.url ? (
                        <img src={profileForm.profileImage.url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        profileForm.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <label 
                      htmlFor="photoUpload" 
                      style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'var(--bg-darkest)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 10px rgba(0,255,157,0.3)', border: '2px solid var(--bg-darkest)' }}
                      title="Upload photo"
                    >
                      <Camera size={14} />
                      <input type="file" id="photoUpload" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white' }}>Profile Picture</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Help buyers identify you. Upload an image, max 2MB.</p>
                  </div>
                </div>

                {/* Core Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Full Name</label>
                    <input 
                      type="text" name="name" value={profileForm.name} onChange={handleProfileChange}
                      style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Email Address</label>
                    <input 
                      type="email" name="email" value={profileForm.email} onChange={handleProfileChange}
                      style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Phone Number</label>
                    <input 
                      type="text" name="phone" value={profileForm.phone} onChange={handleProfileChange}
                      style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Address Subheading */}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" /> Address & Location
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Street Address</label>
                  <input 
                    type="text" name="street" value={profileForm.street} onChange={handleProfileChange}
                    placeholder="Door No, Street Name, Landmark"
                    style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>District / City</label>
                    <input 
                      type="text" name="city" value={profileForm.city} onChange={handleProfileChange}
                      style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>State</label>
                    <input 
                      type="text" name="state" value={profileForm.state} onChange={handleProfileChange}
                      style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Pincode / Zip</label>
                    <input 
                      type="text" name="zip" value={profileForm.zip} onChange={handleProfileChange}
                      style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ alignSelf: 'flex-start', padding: '0.6rem 1.75rem', borderRadius: '2rem', fontSize: '0.85rem', textTransform: 'none', minHeight: '36px' }}
                >
                  {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                </button>
              </motion.form>
            )}

            {activeTab === 'security' && (
              <motion.form 
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handlePasswordSubmit}
                className="glass" 
                style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={20} color="var(--primary)" /> Change Password
                </h2>

                {successMsg && (
                  <div style={{ background: 'rgba(0, 255, 157, 0.08)', border: '1px solid var(--primary)', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--error)', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--error)', fontSize: '0.85rem' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Current Password</label>
                  <input 
                    type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange}
                    style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>New Password</label>
                  <input 
                    type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange}
                    style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Confirm New Password</label>
                  <input 
                    type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange}
                    style={{ padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ alignSelf: 'flex-start', padding: '0.6rem 1.75rem', borderRadius: '2rem', fontSize: '0.85rem', textTransform: 'none', minHeight: '36px' }}
                >
                  {loading ? <Loader className="animate-spin" size={16} /> : <Save size={16} />} Update Password
                </button>
              </motion.form>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
};

export default Settings;
