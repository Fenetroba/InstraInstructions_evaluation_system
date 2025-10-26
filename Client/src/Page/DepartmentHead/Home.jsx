import Header from '@/Components/DepartmentHead/Header'
import Sider from '@/Components/DepartmentHead/Sider'
import React from 'react'
import Analysis from '../Alluser/Analysis'

const DepartmentHeadHome = () => {
  return (
    <div className='Dashboard h-screen'>
      <Header/>
      <Sider/>
      <Analysis/>
    </div>
  )
}

export default DepartmentHeadHome