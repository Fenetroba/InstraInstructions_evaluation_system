
import React from 'react'
import Analysis from '../Alluser/Analysis'
import Header from '@/Components/CollegeDien/Header'
import Sider from '@/Components/CollegeDien/Sider'


const CollageDeanHome = ({user}) => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
     <div className='flex items-center mb-10'>
     <Sider/>
     <div className='mt-20'>COLLEGE DEAN DASHBOARD <span className='bg-(--three) p-3 rounded-lg'>{user.fullName}</span></div>
     </div>
     <Analysis/>
    </div>
  )
}

export default CollageDeanHome