import React, { useEffect, useState } from 'react'
import Pascode from '../comp/Settings/MetadataManagement/PascodeSettings'
import '../comp/CSS/Settings.css'
import '../comp/CSS/RhybusSettings.css'
import '../comp/CSS/PascodeSettings.css'
import { GetUserGroups, GetUserProfile, GlobalConstraints, LoginUserDetails } from './Master'
import AccessDenied from './AccessDenied'
const PascodeSettings = () => {
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
      <Pascode/>
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

export default PascodeSettings
