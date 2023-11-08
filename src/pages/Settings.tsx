import React, { useEffect, useState } from 'react'
import SettingsPage from '../comp/Settings/SettingsPage'
import '../comp/CSS/Settings.css'
import '../comp/CSS/RhybusSettings.css'
import { GetUserGroups, LoginUserDetails } from './Master'
import AccessDenied from '../pages/AccessDenied'

const Settings = () => {
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
      <SettingsPage/>
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

export default Settings
