
import React from 'react'

import Header from '@/Components/Student/Header'
import Sider from '@/Components/Student/Sider'

const StudentHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <Sider/>
     <div className='flex  m-10 items-center '>
     <div>STUDENT DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user?.data?.fullName}</span></div>
     </div>

    </div>
  )
}

export default StudentHome