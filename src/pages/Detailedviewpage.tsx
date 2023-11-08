import React, { useState } from 'react'
import Detailedview from '../comp/JS/Detailedview'
import { GetUserProfile, GlobalConstraints } from './Master'

const Detailedviewpage = () => {
  const [isProfileExist, setisProfileExist] = useState(true)
  GetUserProfile().then(function () {
    const siteName = GlobalConstraints().siteName
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    if (loginUserProfile && loginUserProfile.length === 0) {
      setisProfileExist(false)
    }
  })
  const ProfileExist = () => {
    document.location = `${window.location.origin + window.location.pathname}#/UserProfile`
    return (
    <></>
    )
  }
  return (
    <>
    {
      isProfileExist
        ? (
    <div>
      <Detailedview />
    </div>)
        : (
            ProfileExist()
          )
}

</>
  )
}

export default Detailedviewpage
