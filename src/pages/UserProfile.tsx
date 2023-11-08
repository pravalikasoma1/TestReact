import React from 'react'
import '../comp/CSS/profile.css'
import ProfilePage from '../comp/JS/Profilepage'
// import { Accordions } from 'myprojectpackageprav/dist/cjs/components/accordions'
import { Accordions } from 'myprojectpackageprav'
const UserProfile = () => {
  return (
    <div>
      <section className='divcontainer boxsizing'>
        <div className="divhomeheader"><h1>Profile</h1></div>
        <ProfilePage />
        <Accordions/>
      </section>
    </div>
  )
}

export default UserProfile
