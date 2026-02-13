import React, { useState } from 'react';
import { updateRiderProfile } from '../../services/riderService';
import { useAuth } from '../../context/AuthContext';

const ProfileView = ({ profile, setProfile }) => {
    const { logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        vehicleType: profile?.vehicleType || '',
        vehicleNumber: profile?.vehicleNumber || ''
    });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const updatedProfile = await updateRiderProfile(formData);
            setProfile(updatedProfile); // Update parent state
            setEditing(false);
            alert('Profile updated!');
        } catch (error) {
            alert('Failed to update profile');
        }
    };

    return (
        <div className="pb-24 px-6 md:px-10 pt-8 md:pt-12">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full mb-6 overflow-hidden relative group shadow-inner border-4 border-white">
                        <img src={`https://ui-avatars.com/api/?name=${profile?.userId?.name}&background=random&size=256`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-1">{profile?.userId?.name}</h2>
                    <p className="text-gray-500 font-bold mb-4">{profile?.userId?.email}</p>
                    <div className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                        {profile?.userId?.phone}
                    </div>
                </div>

                {/* Vehicle Details */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8 px-1">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Vehicle & Documents</h3>
                            <p className="text-sm text-gray-400 font-medium">Verify your registration details</p>
                        </div>
                        {!editing && (
                            <button onClick={() => setEditing(true)} className="text-primary-600 text-xs font-black bg-primary-100 px-6 py-2.5 rounded-xl border border-primary-200 hover:bg-primary-200 transition-all">
                                Edit Details
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Vehicle Type</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={formData.vehicleType}
                                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                                >
                                    <option value="scooter">Scooter</option>
                                    <option value="bike">Bike</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Vehicle Number</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                                    value={formData.vehicleNumber}
                                    onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                    placeholder="Enter number..."
                                />
                            </div>
                            <div className="md:col-span-2 flex gap-4 mt-4">
                                <button type="button" onClick={() => setEditing(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl shadow-gray-200 hover:bg-black transition-all">Save Changes</button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 px-1">
                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Vehicle Type</span>
                                <span className="text-lg font-black text-gray-900 capitalize flex items-center gap-2">
                                    <span className="text-2xl">🚲</span> {profile?.vehicleType}
                                </span>
                            </div>
                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Registration No.</span>
                                <span className="text-lg font-black text-gray-900 uppercase">{profile?.vehicleNumber}</span>
                            </div>
                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Driver License</span>
                                <span className="text-lg font-black text-gray-900 uppercase tracking-widest">{profile?.licenseNumber}</span>
                            </div>
                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Rider Rating</span>
                                <span className="text-lg font-black text-gray-900">⭐ 4.9 (240)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 lg:max-w-md">
                <button
                    onClick={logout}
                    className="w-full bg-white text-red-500 border border-red-100 py-5 rounded-[2.5rem] font-black flex items-center justify-center gap-3 hover:bg-red-50 transition-all shadow-sm"
                >
                    <span className="text-xl">🚪</span>
                    <span>Sign Out from Dashboard</span>
                </button>
                <p className="text-center text-gray-400 text-[10px] font-bold uppercase mt-6 tracking-[0.3em]">Befoody Rider App v2.4.0</p>
            </div>
        </div>
    );
};

export default ProfileView;
