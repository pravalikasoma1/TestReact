import React, { useState } from 'react'
import '../comp/CSS/PolicyMemo.css'
import PolicyMemodetails from '../comp/JS/PolicyMemodetails'
import { GetUserProfile, GlobalConstraints } from './Master'

const PolicyMemo = () => {
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
    <section className='divcontainer boxsizing'>
      <div className="divpageheader">
        <h1>
          <span className="icon-policymemosnew"></span>
          Policy Memos &amp; Guidelines
        </h1>
      </div>
      <div className="divpolicymemocontainer">
        <PolicyMemodetails />
      </div>
    </section>)
        : (
            ProfileExist()
          )
    }
</>
  )
}

export default PolicyMemo
