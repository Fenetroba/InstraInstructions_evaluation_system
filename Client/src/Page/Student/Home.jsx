
import React from 'react'
import Analysis from '../Alluser/Analysis'
import Header from '@/Components/Student/Header'
import Sider from '@/Components/Student/Sider'

const InstractorHome = () => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center'>
     <Sider/>
     <div>STUDENT DASHBOARD</div>
     </div>
     <Analysis/>
    </div>
  )
}

export default InstractorHome