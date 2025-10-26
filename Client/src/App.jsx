import React, { useEffect } from 'react'
import Login from './Page/Auth/Login'
import './App.css'
import QualityOfficeHome from './Page/QualityOffice/Home'
import { Navigate, Route,Routes } from 'react-router-dom'
import InstractorHome from './Page/Instractor/Home'
import { Toaster } from 'sonner'
import DepartmentHeadHome from './Page/DepartmentHead/Home'
import { useDispatch, useSelector } from 'react-redux'
import { profile } from './Store/AuthUserSlice'
import Profile from './Page/Alluser/Profile'
import Setting from './Page/Alluser/Setting'
import EditUser from './Components/DepartmentHead/UserCrud/EditUser'
import ViewsinglIvaluation from './Components/QualityOffice/CrudEvaluatinForm/ViewsinglIvaluation'
import PageProtector from './Page/Alluser/PageProtector'
import { Loader2 } from 'lucide-react'

const App = () => {
  const dispatch=useDispatch()
  const {user,isAuthenticated,loading}=useSelector(state=>state.auth)
  
  useEffect(()=>{
    dispatch(profile())
    
  },[dispatch])

  // Helper function to get role-based home page
  const getRoleBasedHomePage = (userRole) => {
    const roleHomeMap = {
      'quality_officer': '/quality-office-home',
      'instructor': '/instractor-home',
      'department_head': '/department-head-home',
      'department head': '/department-head-home',
      'college_dean': '/college-dean-home',
      'college dean': '/college-dean-home',
      'vice_academy': '/vice-academy-home',
      'vice academy': '/vice-academy-home',
      'human_resours': '/human-resource-home',
      'human resours': '/human-resource-home',
      'student': '/student-home',
      'admin': '/quality-office-home' // Admin defaults to quality office home
    };
    
    const normalizedRole = userRole?.toLowerCase().replace(/\s+/g, '_');
    return roleHomeMap[normalizedRole] || '/login';
  };

  // Show loading while checking authentication
 

  return (
    <div className="text-3xl font-bold ">
      <Toaster/>
      <Routes>
     {/* Root path: redirect to appropriate home or login */}
     <Route 
       path='/' 
       element={
         isAuthenticated ? (
           <Navigate to={getRoleBasedHomePage(user?.role || user?.data?.role)} replace />
         ) : (
           <Login />
         )
       }
     />
     <Route path='/login' element={!isAuthenticated ? <Login/> : <Navigate to={getRoleBasedHomePage(user?.role || user?.data?.role)} replace />}/>
     <Route 
       path='/quality-office-home' 
       element={ 
         <PageProtector allowedRoles={['quality_officer', 'admin']}>
           <QualityOfficeHome/>
         </PageProtector>
       }
     />
     <Route 
       path='/instractor-home' 
       element={ 
         <PageProtector allowedRoles={['instructor', 'admin']}>
           <InstractorHome/>
         </PageProtector>
       }
     />
     <Route 
       path='/department-head-home' 
       element={ 
         <PageProtector allowedRoles={['department_head', 'admin']}>
           <DepartmentHeadHome/>
         </PageProtector>
       }
     />
     <Route 
       path='/profile' 
       element={ 
         <PageProtector requireAuth={true}>
           <Profile user={user} />
         </PageProtector>
       }
     />
   
     <Route 
       path="/users/edit/:userId" 
       element={
         <PageProtector allowedRoles={['department_head', 'admin']}>
           <EditUser />
         </PageProtector>
       } 
     />
     <Route 
       path="/evaluations/:id" 
       element={
         <PageProtector requireAuth={true}>
           <ViewsinglIvaluation />
         </PageProtector>
       } 
     />

      </Routes>
     
      
    </div>
  )
}

export default App