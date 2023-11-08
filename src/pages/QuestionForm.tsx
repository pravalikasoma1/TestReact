import React, { useState } from 'react'
import '../comp/CSS/Form.css'
import Form from '../comp/JS/Form'
import { useLocation, useParams } from 'react-router-dom'
import { GetUserProfile, GlobalConstraints } from './Master'

const QuestionForm = () => {
  const location = useLocation()
  const a = location.state
  const [url, seturl] = useState<any>()
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
      <section className='divcontainer boxsizing'>
        <div className='divformcontainer'>
          <Form key={url} tid={a} />
        </div>
      </section>
    </div>)
        : (
            ProfileExist()
          )
    }

    </>
  )
}

export default QuestionForm
