import React, { useState } from 'react'
import { Settings as SettingsIcon, Save, User, Building2, CheckCircle2, Upload, X, Sun, Moon } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setAppSettings } from '../store and slices/infoSlice'
import { updateUser } from '../store and slices/authSlice'
import { toggleTheme } from '../store and slices/themeSlice'

const Settings = ({ theme }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const appSettings = useSelector((state) => state.infoo.appSettings) || {
    appName: 'BillStream Pro',
    storeName: 'Malik karyana Store',
    logo: null
  }

  const [formData, setFormData] = useState({
    appName: appSettings.appName,
    storeName: appSettings.storeName,
    username: user?.username || '',
    logo: appSettings.logo || null
  })

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState(appSettings.logo || null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setLogoPreview(base64String)
        setFormData({
          ...formData,
          logo: base64String
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setFormData({
      ...formData,
      logo: null
    })
  }

  const handleSave = () => {
    setLoading(true)

    // Save to Redux state
    dispatch(setAppSettings({
      appName: formData.appName,
      storeName: formData.storeName,
      logo: formData.logo
    }))

    // Save to localStorage for persistence
    localStorage.setItem('appSettings', JSON.stringify({
      appName: formData.appName,
      storeName: formData.storeName,
      logo: formData.logo
    }))

    // Update username in auth state
    if (formData.username !== user?.username) {
      dispatch(updateUser({ username: formData.username }))
    }

    setSuccess('Settings saved successfully!')
    setLoading(false)

    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className={`h-full flex-col p-7 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-gray-50'}`}>
      <div className={`flex border justify-between p-7 rounded-xl ${theme === 'dark' ? 'bg-[#162032] border-white/7 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <div>
          <h1 className='text-2xl tracking-wider font-bold'>Settings</h1>
          <p className='text-sm'>Customize your application preferences.</p>
        </div>
        <div className='flex gap-3 items-center'>
          <SettingsIcon className='text-[#60A5FA]' size={24} />
        </div>
      </div>

      <div className={`mt-6 border rounded-xl p-6 ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Building2 size={20} className='text-[#60A5FA]' />
          Application Settings
        </h2>

        <div className='space-y-6'>
          <div>
            <label className={`text-sm mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>App Logo</label>
            <div className='flex items-center gap-4'>
              {logoPreview ? (
                <div className='relative'>
                  <img 
                    src={logoPreview} 
                    alt='Logo Preview' 
                    className='w-20 h-20 object-cover rounded-lg border border-gray-700'
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className='w-20 h-20 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center'>
                  <span className='text-gray-500 text-xs'>No logo</span>
                </div>
              )}
              <div>
                <input
                  type='file'
                  id='logo-upload'
                  accept='image/*'
                  onChange={handleLogoUpload}
                  className='hidden'
                />
                <label
                  htmlFor='logo-upload'
                  className={`flex items-center gap-2 border rounded-lg px-4 py-2 cursor-pointer transition-colors ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white hover:bg-[#1E293B]' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'}`}
                >
                  <Upload size={16} />
                  <span className='text-sm'>Upload Logo</span>
                </label>
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Recommended: Square image, max 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className={`text-sm mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>App Name</label>
            <input
              type='text'
              name='appName'
              value={formData.appName}
              onChange={handleChange}
              placeholder='Enter application name'
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>

          <div>
            <label className={`text-sm mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Store Name</label>
            <input
              type='text'
              name='storeName'
              value={formData.storeName}
              onChange={handleChange}
              placeholder='Enter store name'
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            />
          </div>

          <div>
            <label className={`text-sm mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Theme</label>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`flex items-center gap-2 border rounded-lg px-4 py-3 transition-colors ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white hover:bg-[#1E293B]' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className='text-sm'>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`mt-6 border rounded-xl p-6 ${theme === 'dark' ? 'bg-[#020617] border-white/10' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <User size={20} className='text-[#60A5FA]' />
          User Information
        </h2>

        <div>
          <label className={`text-sm mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Username</label>
          <input
            type='text'
            name='username'
            value={formData.username}
            onChange={handleChange}
            placeholder='Enter username'
            className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 ${theme === 'dark' ? 'bg-[#0F172A] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          />
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>This will update your display name throughout the application</p>
        </div>
      </div>

      {success && (
        <div className='mt-4 flex items-center gap-2 bg-green-500/10 border border-green-500/40 rounded-lg px-4 py-3 text-sm text-green-400'>
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      <div className='mt-6 flex justify-end'>
        <button
          onClick={handleSave}
          disabled={loading}
          className='flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white px-6 py-3 rounded-lg font-medium hover:from-[#1D4ED8] hover:to-[#2563EB] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

export default Settings