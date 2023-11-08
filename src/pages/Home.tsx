import React, { useEffect, useState } from 'react'
import { GetUserGroups, GetUserProfile, GlobalConstraints, LoginUserDetails } from './Master'
import KBArticles from '../comp/JS/KBArticles'

const Home = () => {
  const [loginuserroles, setloginuserdetails] = useState<any>([])
  $('.homenavigation a').addClass('active')
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    GetUserGroups().then(function () {
      initEffect()
    })
  }, [])

  const initEffect = () => {
    const loginuser = LoginUserDetails()
    setloginuserdetails(loginuser[0])
  }
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
  <> {
      isProfileExist
        ? (
    <div>
      <KBArticles loginuserroles={loginuserroles} />
    </div>)
        : (
            ProfileExist()
          )
}
</>
  )
}

export default Home
