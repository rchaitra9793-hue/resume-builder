import { Lock, Mail, User2Icon } from 'lucide-react'
import React from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getToken, setSession } from '../utils/api'

const Login = () => {

  const navigate = useNavigate()
  const [query] = useSearchParams()
  const urlState = query.get('state')
  const [state, setState] = React.useState(urlState || "login")
  const [loading, setLoading] = React.useState(false)

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = await api.post(`/users/${state === 'login' ? 'login' : 'register'}`, formData)
            setSession(data.token, data.user)
            toast.success(data.message)
            navigate('/app')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

  if (getToken()) return <Navigate to='/app' replace />

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <form onSubmit={handleSubmit} className="sm:w-96 w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
                <h1 className="text-gray-900 text-3xl mt-10 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
                <p className="text-gray-500 text-sm mt-2">Please {state === "login" ? "login" : "sign up"} to continue</p>
                {state !== "login" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <User2Icon size={16} color='#6B7280'/>
                        <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0 w-full pr-4" value={formData.name} onChange={handleChange} required />
                    </div>
                )}
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Mail size={16} color='#6B7280'/>
                    <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0 w-full pr-4" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Lock size={16} color='#6B7280'/>
                    <input type="password" name="password" placeholder="Password" minLength={6} className="border-none outline-none ring-0 w-full pr-4" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="mt-4 text-left text-green-500">
                    <button className="text-sm" type="button" onClick={() => toast('Password reset is not available yet.')}>Forgot password?</button>
                </div>
                <button type="submit" disabled={loading} className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity disabled:opacity-60">
                    {loading ? 'Please wait...' : state === "login" ? "Login" : "Sign up"}
                </button>
                <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? "Don't have an account?" : "Already have an account?"} <span className="text-green-500 hover:underline cursor-pointer">click here</span></p>
      </form>
    </div>
  )
}

export default Login
