import React, { useState } from 'react'
import axios from 'axios'
import { User, Lock, Mail, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/login' : '/register'
      const response = await axios.post(`http://localhost:5555${endpoint}`, formData)

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      onLogin(response.data.user)
    } catch (error) {
      console.error("Authentication error:", error)
      setError(error.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#0F172A] flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-[#1E293B] rounded-2xl p-8 border border-white/10 shadow-2xl'>
          {/* Logo/Header */}
          <div className='text-center mb-8'>
            <div className='bg-gradient-to-br from-[#4F6FEA] to-[#2563EB] w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.40)]'>
              <h1 className='text-2xl font-bold text-white'>MK</h1>
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>BillStream Pro</h2>
            <p className='text-gray-400 text-sm'>Malik Karyana Store</p>
          </div>

          {/* Tab Toggle */}
          <div className='flex bg-[#0F172A] rounded-lg p-1 mb-6'>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='text-gray-400 text-sm mb-2 block'>Username</label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                <input
                  type='text'
                  name='username'
                  value={formData.username}
                  onChange={handleChange}
                  placeholder='Enter username'
                  className='w-full bg-[#0F172A] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className='text-gray-400 text-sm mb-2 block'>Email</label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Enter email'
                    className='w-full bg-[#0F172A] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className='text-gray-400 text-sm mb-2 block'>Password</label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Enter password'
                  className='w-full bg-[#0F172A] border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className='bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm'>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Login' : 'Sign Up'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className='mt-6 text-center'>
            <p className='text-gray-400 text-sm'>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type='button'
                onClick={() => setIsLogin(!isLogin)}
                className='text-blue-400 hover:text-blue-300 font-medium'
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-6 text-gray-500 text-xs'>
          <p>© 2026 BillStream Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Login
