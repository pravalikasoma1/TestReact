import React, { useState, useEffect } from 'react'
import { HardCodedNames } from '../../pages/Config'
import { NavLink as Link, useHistory, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import Notificationssec from './Notificationssec'
import { GetUserGroups, LoginUserDetails, GetUserProfile, GlobalConstraints } from '../../pages/Master'
import logo from '../Images/Logo.png'

export const Navlink = styled(Link)`  
    
}`

const Navbar = () => {
  const [loginuserroles, setloginuserdetails] = useState<any>([])
  const [notify, setnotify] = useState(true)
  const history = useHistory()
  const location = useLocation()
  $('.nav a').removeClass('active')
  const changeLocation = (placeToGo: any) => {
    if (placeToGo !== '/Settings') { $('.anchorsitefeedbackbtn').show() }
    if (location.pathname === placeToGo) {
      history.push(placeToGo)
      window.location.reload()
    } else {
      $('.divnotificationpopup').hide()
      GetUserProfile().then(function () {
        const siteName = GlobalConstraints().siteName
        const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
        if (loginUserProfile && loginUserProfile.length === 0) {
          // if (location.pathname !== '/UserProfile') {
          history.push('/UserProfile')
          window.location.reload()
          // }
        }
      })
    }
  }

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
    GetUserProfile().then(function () {
      const siteName = GlobalConstraints().siteName
      const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
      if (loginUserProfile && loginUserProfile.length === 0) {
        if (location.pathname !== '/UserProfile') {
          history.push('/UserProfile')
          // window.location.reload()
        }
      }
    })
  }

  function SettingsTab (loginuserroles: any) {
    if (loginuserroles && (loginuserroles.isNAFFAOwner || loginuserroles.isOwners)) {
      if (window.location.href === `${window.location.origin + window.location.pathname}#/Settings`) { $('.anchorsitefeedbackbtn').hide() }
      return (
          <li className='settingsnavigation nav'>
            <Navlink to='/Settings' title='Settings' onClick={() => changeLocation('/Settings')} exact><span className='icon-Settings'></span> {HardCodedNames().SETTINGS}</Navlink>
          </li>
      )
    }
  }

  return (
    <div>
      <div className="divcontainer">
        <div className="divheader">
            <div className="divlogo">
              <Navlink to='/' className='anchorlogo' title='Naffa'>
                <img src={logo} alt="Naffa" aria-label="Naffa" onClick={() => changeLocation('/')}></img>
              </Navlink>
            </div>
            <div className="divuserrole">
              <Navlink to='/QuestionForm' title="Submit A Question" className="anchorSubmitQuestion" onClick={() => changeLocation('/QuestionForm')}>Submit A Question</Navlink>
            </div>
            <div className="divheaderrightside">
                <div className="divuserdetails">
                    <ul>
                        <li className="liProfileBtn">
                          <Navlink to='/UserProfile' title='Profile' onClick={() => changeLocation('/UserProfile')}>
                            <span className="icon-User"></span>
                            <span className="nav-text"> Profile</span>
                          </Navlink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
      <div className='divnavbg'>
        <div className='divcontainer'>
          <nav className='navigation'>
            <header className='header'>
            <input className="menu-btn" type="checkbox" id="menu-btn"/>
            <label className="menu-icon" htmlFor='menu-btn'><span className="navicon"></span></label>
              <ul className='menu'>
                <li className='homenavigation nav'>
                <Navlink to='/' title='Home' onClick={() => changeLocation('/')} exact>
                  {HardCodedNames().HOME}
                </Navlink>
                </li>
                <li className='questionsnavigation nav'>
                  <Navlink to='/Questions' title='Questions' onClick={() => changeLocation('/Questions')} exact>
                    {HardCodedNames().QUESTIONS}
                  </Navlink></li>
                <li className='pointsofcontactnavigation nav'><Navlink to='/PointsofContact' title='Points of Contact' onClick={() => changeLocation('/PointsofContact')} exact>
                  {HardCodedNames().POINTSOFCONTACT}
                  </Navlink></li>
                <li className='policymemonavigation nav'><Navlink to='/PolicyMemo' title='Policy Memos & Guidelines' onClick={() => changeLocation('/PolicyMemo')} exact>
                  {HardCodedNames().POLICYMEMO}
                  </Navlink></li>
                <li className='quicklinksnavigation nav'><Navlink to='/QuickLinks' title='QuickLinks' onClick={() => changeLocation('/QuickLinks')} exact>
                  {HardCodedNames().QUICKLINKS}
                  </Navlink></li>
                <li className='qandanavigation nav'><Navlink to='/QandA' title='Q&A' onClick={() => changeLocation('/QandA')} exact>
                  {HardCodedNames().QANDA}
                  </Navlink>
                </li>
              </ul>
            </header>
            <div className='divnavright'>
              <ul>
                <li className='notification'>
                  {
                    <Notificationssec />
                  }

                </li>
                {SettingsTab(loginuserroles)}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Navbar
