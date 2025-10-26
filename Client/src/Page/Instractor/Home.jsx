import Header from '@/Components/Instractor/Header'
import Sider from '@/Components/Instractor/Sider'
import React from 'react'
import Analysis from '../Alluser/Analysis'

const InstractorHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center mb-10'>
     <Sider/>
     <div>INSTRACTOR DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <Analysis/>
    </div>
  )
}

export default InstractorHome