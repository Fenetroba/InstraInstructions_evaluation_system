
import React from 'react'
import Analysis from '../Alluser/Analysis'
import Header from '@/Components/ViceAcademy/Header'
import Sider from '@/Components/ViceAcademy/Sider'

const ViceAcademyHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center mb-10'>
     <Sider/>
     <div className='mt-20'>VICE ACADEMY DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <Analysis/>
    </div>
  )
}

export default ViceAcademyHome;