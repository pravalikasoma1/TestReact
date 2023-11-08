import React, { useEffect, useState } from 'react'
import UserProfile from '../comp/Settings/MetadataManagement/UserProfile'
import '../comp/CSS/Settings.css'
import '../comp/CSS/RhybusSettings.css'
import '../comp/CSS/UserprofileSettings.css'
import ProfilePage from '../comp/JS/Profilepage'
import { GetUserGroups, GetUserProfile, GlobalConstraints, LoginUserDetails } from './Master'
import AccessDenied from './AccessDenied'
const UserProfileSettings = () => {
  const [loginuserroles, setloginuserdetails] = useState<any>([])
  useEffect(() => {
    GetUserGroups().then(function () {
      initEffect()
    })
  }, [])
  const initEffect = () => {
    const loginuser = LoginUserDetails()
    setloginuserdetails(loginuser[0])
  }
  return (
    <>
{
       loginuserroles && (loginuserroles.isNAFFAOwner || loginuserroles.isOwners)
         ? (
        <div>
     <UserProfile/>
    </div>
           )
         : loginuserroles !== [] && loginuserroles.length === undefined
           ? (
          <div>
          <AccessDenied/>
        </div>
             )
           : ''
    }

</>
  )
}

export default UserProfileSettings
