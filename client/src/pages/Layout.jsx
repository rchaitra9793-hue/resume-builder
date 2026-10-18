import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getToken } from '../utils/api'

const Layout = () => {
  if (!getToken()) return <Navigate to='/login?state=login' replace />

  return (
    <div>
      <div className='min-h-screen bg-gray-50'>
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
