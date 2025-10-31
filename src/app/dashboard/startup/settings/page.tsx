'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function StartupSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    companyName: '',
    username: '',
    tagline: '',
    logoFile: null as File | null,
    logoPreview: null as string | null,
    linkedin: '',
    twitter: '',
    instagram: '',
    tiktok: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('startup_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setFormData({
          companyName: profile.company_name || '',
          username: profile.username || '',
          tagline: profile.tagline || '',
          logoFile: null,
          logoPreview: profile.logo_url || null,
          linkedin: profile.linkedin || '',
          twitter: profile.twitter || '',
          instagram: profile.instagram || '',
          tiktok: profile.tiktok || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        logoFile: file,
        logoPreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let logoUrl = formData.logoPreview;

      // Upload logo if new file selected
      if (formData.logoFile) {
        const fileExt = formData.logoFile.name.split('.').pop();
        const fileName = `${user.id}-logo-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, formData.logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('startup_profiles')
        .update({
          company_name: formData.companyName,
          username: formData.username,
          tagline: formData.tagline,
          logo_url: logoUrl,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          instagram: formData.instagram,
          tiktok: formData.tiktok,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'team', label: 'Team' },
    { id: 'plan', label: 'Plan' },
    { id: 'billing', label: 'Billing' },
    { id: 'api', label: 'API' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-h2 font-semibold">Settings</h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-tint-5 text-primary font-medium border-l-4 border-primary'
                    : 'text-neutral-grey hover:bg-neutral-silver'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-h3 font-semibold mb-2">Startup profile</h2>
                  <p className="text-body-3 text-neutral-grey">
                    Update your startup logo and details here.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="normal"
                    onClick={() => loadProfile()}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="normal"
                    onClick={handleSave}
                    loading={loading}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.includes('Error')
                    ? 'bg-error/10 text-error'
                    : 'bg-success/10 text-success'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-6">
                {/* Public Profile */}
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Public profile *
                  </label>
                  <p className="text-body-3 text-neutral-grey mb-3">
                    This will be displayed on your profile.
                  </p>
                  <Input
                    name="companyName"
                    type="text"
                    placeholder="Startup Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <div className="flex-shrink-0 bg-neutral-silver rounded-lg px-4 py-3 text-body-3 text-neutral-grey">
                      frictionless.com/profile/
                    </div>
                    <Input
                      name="username"
                      type="text"
                      placeholder="startupname"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Tagline
                  </label>
                  <p className="text-body-3 text-neutral-grey mb-3">
                    A quick snapshot of your company.
                  </p>
                  <textarea
                    name="tagline"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-grey-blue focus:border-primary focus:outline-none text-body-3 resize-none"
                    rows={4}
                    maxLength={160}
                    placeholder="Lorem ipsum dolor sit amet consectetur. Egestas turpis sociis cursus felis aliquam nam vulputate."
                    value={formData.tagline}
                    onChange={handleChange}
                  />
                  <p className="text-body-3 text-neutral-grey mt-1">
                    {160 - formData.tagline.length} characters left
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-2">
                    Startup logo *
                  </label>
                  <p className="text-body-3 text-neutral-grey mb-3">
                    Update your company logo and then choose where you want it to display.
                  </p>
                  <div className="flex gap-4 items-start">
                    {formData.logoPreview && (
                      <div className="w-32 h-32 bg-neutral-silver rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={formData.logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 border-2 border-dashed border-neutral-grey-blue rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.gif"
                        onChange={handleFileChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="mb-4">
                          <svg className="w-12 h-12 mx-auto text-neutral-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-body-2 text-primary mb-1">
                          Click to upload
                        </p>
                        <p className="text-body-3 text-neutral-grey">
                          or drag and drop
                        </p>
                        <p className="text-body-3 text-neutral-grey mt-2">
                          SVG, PNG, JPG or GIF (max. 800×400px)
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Social Profiles */}
                <div>
                  <label className="block text-body-3-medium text-neutral-black mb-3">
                    Social profiles
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 bg-neutral-silver rounded-lg px-4 py-3 text-body-3 text-neutral-grey">
                        linkedin.com/company/
                      </div>
                      <Input
                        name="linkedin"
                        type="text"
                        placeholder="startupname"
                        value={formData.linkedin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 bg-neutral-silver rounded-lg px-4 py-3 text-body-3 text-neutral-grey">
                        x.com/
                      </div>
                      <Input
                        name="twitter"
                        type="text"
                        placeholder="startupname"
                        value={formData.twitter}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 bg-neutral-silver rounded-lg px-4 py-3 text-body-3 text-neutral-grey">
                        instagram.com/
                      </div>
                      <Input
                        name="instagram"
                        type="text"
                        placeholder="startupname"
                        value={formData.instagram}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-shrink-0 bg-neutral-silver rounded-lg px-4 py-3 text-body-3 text-neutral-grey">
                        tiktok.com/
                      </div>
                      <Input
                        name="tiktok"
                        type="text"
                        placeholder="startupname"
                        value={formData.tiktok}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button
                  variant="secondary"
                  size="normal"
                  onClick={() => loadProfile()}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="normal"
                  onClick={handleSave}
                  loading={loading}
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && (
            <div className="card">
              <h2 className="text-h3 font-semibold mb-2">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-body-3 text-neutral-grey">
                This section is coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
