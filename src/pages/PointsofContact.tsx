import React, { useState } from 'react'
import { HardCodedNames } from './Config'
import PointsofContact from '../comp/JS/PointsofContactTitle'
import { GetUserProfile, GlobalConstraints } from './Master'

const PointofContact = () => {
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
      <PointsofContact label={HardCodedNames().POINTSOFCONTACT} />
    </div>
          )
        : (
            ProfileExist()
          )
}

</>
  )
}

export default PointofContact
