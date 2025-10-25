import React, { useEffect } from 'react'
import Login from './Page/Auth/Login'
import QualityOfficeHome from './Page/QualityOffice/Home'
import { Route,Routes } from 'react-router-dom'
import InstractorHome from './Page/Instractor/Home'
import { Toaster } from 'sonner'
import DepartmentHeadHome from './Page/DepartmentHead/Home'
import { useDispatch, useSelector } from 'react-redux'
import { profile } from './Store/AuthUserSlice'
import Profile from './Page/Alluser/Profile'
import Setting from './Page/Alluser/Setting'
import EditUser from './Components/DepartmentHead/UserCrud/EditUser'

const App = () => {
  const dispatch=useDispatch()
  const {user}=useSelector(state=>state.auth)
  useEffect(()=>{
    dispatch(profile())
    
  },[dispatch])
  console.log(user)
  return (
    <div className="text-3xl font-bold ">
      <Toaster/>
      <Routes>
     <Route path='/' element={ <Login/>}/>
     <Route path='/quality-office-home' element={ <QualityOfficeHome/>}/>
     <Route path='/instractor-home' element={ <InstractorHome/>}/>
     <Route path='/department-head-home' element={ <DepartmentHeadHome/>}/>
     <Route path='/profile' element={ <Profile user={user} />}/>
     <Route path='/settings' element={ <Setting/>}/>
     <Route path="/users/edit/:userId" element={<EditUser />} />

      </Routes>
     
      
    </div>
  )
}

export default App