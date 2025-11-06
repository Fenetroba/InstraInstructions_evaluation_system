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
import StudentHome from './Page/Student/Home'
import HumanResourcerHome from './Page/HumanResource/Home'
import CollageDeanHome from './Page/CollegeDien/Home'
import ViceAcademyHome from './Page/ViceAcademy/Home'
import InstructorEvaluations from './Components/Student/InstructorEvaluations'
import ChangePassword from './Page/Alluser/ChangePassword'

const App = () => {
  const dispatch=useDispatch()
  const {user,isAuthenticated,loading}=useSelector(state=>state.auth)

 

  
  useEffect(()=>{
    dispatch(profile())
    
  },[])

  // Helper function to get role-based home page
  const getRoleBasedHomePage = (userRole) => {
    const roleHomeMap = {
      'quality_officer': '/quality-office-home',
      'instructor': '/instructor-home',
      'department_head': '/department-head-home',
      'college_dean': '/college-dean-home',
      'vice_academy': '/vice-academy-home',
      'human_resours': '/human-resource-home',
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
  path="/change-password" 
  element={
    <PageProtector>
      <ChangePassword />
    </PageProtector>
  } 
/>
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
           <QualityOfficeHome user={user}/>
         </PageProtector>
       }
     />
     <Route 
       path='/instructor-home' 
       element={ 
         <PageProtector allowedRoles={['instructor', 'admin']}>
           <InstractorHome user={user}/>
         </PageProtector>
       }
     />
     <Route 
       path='/department-head-home' 
       element={ 
         <PageProtector allowedRoles={['department_head', 'admin']}>
           <DepartmentHeadHome user={user}/>
         </PageProtector>
       }
     />
    
      <Route 
       path="/evaluation/:id" 
       element={
         <PageProtector requireAuth={true}>
          {(user?.role || user?.data?.role)==="quality_officer"?<ViewsinglIvaluation/>:<InstructorEvaluations  />}
         </PageProtector>
       } 
     />

     
     <Route 
       path='/student-home' 
       element={ 
         <PageProtector allowedRoles={['student', 'admin']}>
           <StudentHome user={user}/>
         </PageProtector>
       }
     />
     <Route 
       path='/human-resource-home' 
       element={ 
         <PageProtector allowedRoles={['human_resours', 'admin']}>
           <HumanResourcerHome user={user}/>
         </PageProtector>
       }
     />
     <Route 
       path='/college-dean-home' 
       element={ 
         <PageProtector allowedRoles={['college_dean', 'admin']}>
           <CollageDeanHome user={user}/>
         </PageProtector>
       }
     />
     <Route 
       path='/vice-academy-home' 
       element={ 
         <PageProtector allowedRoles={['vice_academy', 'admin']}>
           <ViceAcademyHome user={user}/>
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
    

      </Routes>
     
      
    </div>
  )
}

export default App