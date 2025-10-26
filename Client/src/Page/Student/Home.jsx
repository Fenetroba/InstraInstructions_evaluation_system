
import React from 'react'
import Analysis from '../Alluser/Analysis'
import Header from '@/Components/Student/Header'
import Sider from '@/Components/Student/Sider'

const StudentHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center'>
     <Sider/>
     <div>STUDENT DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <Analysis/>
    </div>
  )
}

export default StudentHome