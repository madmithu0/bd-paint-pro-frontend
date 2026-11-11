import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', district: '', address: '', bio: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/me');
      const u = data?.user || data;
      setForm({ name: u.name || '', phone: u.phone || '', email: u.email || '', district: u.district || '', address: u.address || '', bio: u.bio || '' });
      setAvatarPreview(u.avatar || '');
    } catch {
      toast.error('Profile Load Failed');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMe(); }, []);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name দিন');
    if (!form.phone.trim()) return toast.error('Phone দিন');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      if (avatar) fd.append('avatar', avatar);
      await api.put('/users/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile Updated!');
      navigate('/profile');
    } catch {
      toast.error('Update Failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-5 mt-3 space-y-3">
        {/* Avatar */}
        <div className="text-center">
          <img src={avatarPreview || 'https://via.placeholder.com/96'} className="w-24 h-24 rounded-full object-cover mx-auto" alt="" />
          <label className="inline-block bg-gray-100 px-4 py-1.5 rounded-full text-sm mt-2 cursor-pointer">📷 Change Photo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { setAvatar(e.target.files[0]); setAvatarPreview(URL.createObjectURL(e.target.files[0])); }} />
          </label>
        </div>

        <div><label className="font-bold">Name *</label><input value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full border rounded-lg p-3 mt-1" placeholder="আপনার নাম" /></div>
        <div><label className="font-bold">Phone *</label><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full border rounded-lg p-3 mt-1" placeholder="01XXXXXXXXX" /></div>
        <div><label className="font-bold">Email</label><input value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full border rounded-lg p-3 mt-1" placeholder="email@gmail.com" /></div>
        <div><label className="font-bold">District</label>
          <select value={form.district} onChange={(e) => update('district', e.target.value)} className="w-full border rounded-lg p-3 mt-1">
            <option value="">Select District</option>
            {['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div><label className="font-bold">Address</label><input value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full border rounded-lg p-3 mt-1" placeholder="বাসা / এলাকা" /></div>
        <div><label className="font-bold">Bio</label><textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} rows={3} className="w-full border rounded-lg p-3 mt-1" placeholder="নিজের সম্পর্কে..." /></div>

        <button disabled={saving} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
      </form>
    </div>
  );
};

export default EditProfile;