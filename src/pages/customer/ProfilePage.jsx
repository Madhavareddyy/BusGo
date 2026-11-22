import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Ticket, 
  LogOut, 
  Save, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const ProfilePage = () => {
  const { user, profile, role, logout, updateProfile, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState(profile?.city || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        full_name: fullName,
        phone,
        city,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brand-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Breadcrumb & User Ribbon */}
        <div className="bg-white rounded-card border border-brand-border p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-darkred to-brand-red text-white flex items-center justify-center font-black text-2xl shadow-md">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-brand-navy">
                  {profile?.full_name || 'Passenger Profile'}
                </h1>
                <Badge variant="success" size="sm" dot>
                  {profile?.status?.toUpperCase() || 'ACTIVE'}
                </Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                {profile?.email} • Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={LogOut}
              onClick={handleLogout}
              className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">Persistent Demo Mode Session Active</p>
              <p className="text-amber-800 leading-relaxed">
                You are authenticated via the persistent in-browser authentication engine. Full role permissions, session restoration, and validation guards are active.
              </p>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 bg-white rounded-card border border-brand-border p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">Personal Information</h2>
                <p className="text-xs text-brand-muted">Verified contact info for tickets & emergency updates</p>
              </div>
              <Button
                variant={isEditing ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                leftIcon={User}
              />

              <Input
                label="Registered Email (Immutable Identity)"
                value={profile?.email || ''}
                disabled
                leftIcon={Mail}
                helperText="Email is bound to your Supabase Auth account and cannot be modified directly"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number (+91)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={Phone}
                />
                <Input
                  label="Home City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={MapPin}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={saving}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Side Shortcuts & Security Overview */}
          <div className="space-y-6">
            <div className="bg-white rounded-card border border-brand-border p-6 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
                Quick Shortcuts
              </h3>
              <div className="space-y-2">
                <Link to="/#offers-section" className="block">
                  <div className="p-3 rounded-lg border border-brand-border hover:border-brand-red hover:bg-red-50/40 transition-colors flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-navy">Explore Offers & Coupons</span>
                    <span className="text-brand-red">View →</span>
                  </div>
                </Link>
                <Link to="/" className="block">
                  <div className="p-3 rounded-lg border border-brand-border hover:border-brand-red hover:bg-red-50/40 transition-colors flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-navy">Book a New Journey</span>
                    <span className="text-brand-red">Search →</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-card border border-brand-border p-6 shadow-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-navy uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-brand-success" />
                <span>Security & Role</span>
              </div>
              <div className="text-xs space-y-1.5 text-brand-muted">
                <p><strong className="text-brand-navy">Role Assigned:</strong> {role?.toUpperCase()}</p>
                <p><strong className="text-brand-navy">Account Status:</strong> Active & Verified</p>
                <p><strong className="text-brand-navy">RLS Security:</strong> Enforced by PostgreSQL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
