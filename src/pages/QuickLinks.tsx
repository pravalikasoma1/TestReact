import React, { useState } from 'react'
import { HardCodedNames } from './Config'
import QuickLinksTile from '../comp/JS/QuickLinksTile'
import { GetUserProfile, GlobalConstraints } from './Master'
const QuickLinks = () => {
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
      <QuickLinksTile label={HardCodedNames().QUICKLINKS} />
    </div>)
        : (
            ProfileExist()
          )
    }

    </>
  )
}

export default QuickLinks
