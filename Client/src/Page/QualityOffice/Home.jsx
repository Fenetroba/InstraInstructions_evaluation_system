import Header from '@/Components/QualityOffice/Header'
import Sider from '@/Components/QualityOffice/Sider'
import React from 'react'
import Analysis from '../Alluser/Analysis'

const QualityOfficeHome = ({user}) => {
 
  return (
    <div className='Dashboard h-screen'>
    <Header/>
   <div className='flex items-center mb-10'>
   <Sider/>
   <div className='mt-20'>Quality OFFICE DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user?.data?.fullName}</span></div>
   </div>
   <Analysis/>
  </div>
  )
}

export default QualityOfficeHome