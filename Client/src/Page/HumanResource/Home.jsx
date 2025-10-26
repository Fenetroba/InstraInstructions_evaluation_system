
import React from 'react'
import Analysis from '../Alluser/Analysis'
import Header from '@/Components/HumanResource/Header'
import Sider from '@/Components/HumanResource/Sider'

const HumanResourcerHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center mb-10'>
     <Sider/>
     <div className='mt-20'>HUMAN RESOURCE DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <Analysis/>
    </div>
  )
}

export default HumanResourcerHome