import Header from '@/Components/DepartmentHead/Header'
import Sider from '@/Components/DepartmentHead/Sider'
import React from 'react'
import Analysis from '../Alluser/Analysis'

const DepartmentHeadHome = ({user}) => {

  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center mb-10'>
     <Sider/>
     <div className='mt-20'>DEPARTMENT HEAD DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <Analysis/>
    </div>
  )
}

export default DepartmentHeadHome