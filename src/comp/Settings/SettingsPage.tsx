/* eslint-disable no-script-url */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import QuickLinksSettings from './ContentManagement/QuickLinksSettings'
import KnowledgeGraphSettings from './ContentManagement/KnowledgeGraphSettings'
import QandASettings from './ContentManagement/QandASettings'
import PolicyMemoGuidelinesSettings from './ContentManagement/PolicyMemoGuidelinesSettings'
import PointsofContactSettings from './ContentManagement/PointsofContactSettings'
import HelpDeskSettings from './ContentManagement/HelpDeskSettings'
import UserGroupSettings from './UserManagement/UserGroupsSettings'
import SubCategorySettings from './MetadataManagement/SubCategorySettings'
import TooltipsSettings from './MetadataManagement/TooltipsSettings '
import SiteFeedback from './MetadataManagement/SiteFeedback'
import { Link } from 'react-router-dom'
import { GetUserGroups, GetUserProfile, GlobalConstraints, LoginUserDetails } from '../../pages/Master'

const SettingsPage = () => {
  const [loginuserroles, setloginuserdetails] = useState<any>([])
  const [showsection, setshowsection] = useState({
    showQL: true,
    showKB: false,
    showQA: false,
    showPolicymemo: false,
    showPOC: false,
    showHelpDesk: false,
    showUserGroups: false,
    showSubCat: false,
    showTooltips: false,
    showSiteFeedback: false
  })
  const [ToggleSection, setToggleSection] = useState({
    Content: true,
    UserManagement: false,
    MetadataManagement: false
  })
  const handleclick = (test: any) => {
    setshowsection({
      ...showsection,
      showQL: false,
      showKB: false,
      showQA: false,
      showPolicymemo: false,
      showPOC: false,
      showHelpDesk: false,
      showUserGroups: false,
      showSubCat: false,
      showTooltips: false,
      showSiteFeedback: false,
      [test]: true
    })
  }
  const [isProfileExist, setisProfileExist] = useState(true)
  $('.settingsnavigation a').addClass('active')
  GetUserProfile().then(function () {
    const siteName = GlobalConstraints().siteName
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    if (loginUserProfile && loginUserProfile.length === 0) {
      setisProfileExist(false)
    }
  })
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    GetUserGroups().then(function () {
      $('.settingsnavigation a').addClass('active')
      initEffect()
    })
  }, [])
  const initEffect = () => {
    const loginuser = LoginUserDetails()
    setloginuserdetails(loginuser[0])
  }
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
<section className="divcontainer boxsizing">
 <div className="divpagewrapper ">
   <div className="divcontainer divsettingscontainer">
   <h1> <span className="icon-Settings"></span> Settings</h1>
    <div className="row">
        { /* Menu */ }
          <div className="col-xl-2 col-md-3">
            <div className="divnavcontainer">
                <ul id="accordion" className="accordion">
                    <li className={ToggleSection.Content ? 'limainitem open' : 'limainitem'}>
                        <a href="javascript:void(0)" className="ContentManagement link "aria-controls="SettingsQuicklinks " onClick= {() => {
                          setToggleSection({ ...ToggleSection, Content: !ToggleSection.Content, UserManagement: false, MetadataManagement: false })
                          handleclick('showQL')
                        }}>ContentManagement</a>
                        <ul className="submenu" id="menu" style = {{ display: ToggleSection.Content ? '' : 'none' }}>
                            <li className="QuickLinks" onClick= {() => { handleclick('showQL') }}>
                                <a href="javascript:void(0)" className= {showsection.showQL ? 'SettingsQuicklinks active' : 'SettingsQuicklinks'} title="Quick Links" aria-controls="SettingsQuicklinks" data-page="quick-links"> <span className="icon-quicklinks"></span>Quick Links</a>
                            </li>
                              <li className="KnowledgeArticles" onClick={() => { handleclick('showKB') }} ><a href="javascript:void(0)" className={showsection.showKB ? 'active' : ''} title=" Knowledge Graph" aria-controls="SettingsKB" data-page="knowledge-articles"><span className="icon-KnowledgeGraph"></span>Knowledge Graph</a>
                            </li>
                            <li className="qanda" onClick= {() => { handleclick('showQA') }}><a href="javascript:void(0)" className={showsection.showQA ? 'SettingsQA active' : 'SettingsQA' } title="Q &amp; A" aria-controls="SettingsQA" data-page="qa"><span className="icon-addcomment"></span>Q &amp; A</a>
                            </li>
                            <li className="policymemo" onClick= {() => { handleclick('showPolicymemo') }}><a href="javascript:void(0)" className={showsection.showPolicymemo ? 'active' : ''} title="Policy Memos &amp; Guidelines" aria-controls="Settingspolicymemo" data-page="pmg"><span className="icon-policymemosnew"></span>Policy Memos &amp; Guidelines</a>
                            </li>
                            <li className=" PointsofContact" onClick= {() => { handleclick('showPOC') }}><a href="javascript:void(0)" id="pocontact" className={showsection.showPOC ? 'active' : ''}title="Points of Contact" aria-controls="SettingsPointofContact" data-page="poc"> <span className="icon-Usergroups"></span>Points of Contact</a>
                            </li>
                            <li className="HelpDesk " onClick= {() => { handleclick('showHelpDesk') }}><a href="javascript:void(0)" className={showsection.showHelpDesk ? 'active' : ''}title="Help desk" aria-controls="SettingsHelpdesk" data-page="help-desk"><span className="icon-usersettings"></span>Help Desk </a>
                            </li>
                        </ul>
                    </li>
                   { loginuserroles.isNAFFAOwner &&
                    <li className={ToggleSection.UserManagement ? 'limainitem open' : 'limainitem'} onClick= {() => { handleclick('showUserGroups') }}>
                        <a href="javascript:void(0)" className=" UserManagement link"aria-controls="SettingsUserManagement " onClick= {() => { setToggleSection({ ...ToggleSection, Content: false, UserManagement: !ToggleSection.UserManagement, MetadataManagement: false }) }}>User Management</a>
                        <ul className="submenu" id="menu" style={{ display: ToggleSection.UserManagement ? '' : 'none' }}>
                            <li className="Usergroups" onClick= {() => { handleclick('showUserGroups') }}>
                            <a href="javascript:void(0)" className={showsection.showUserGroups ? 'active' : ''} title="User groups" aria-controls="SettingsUsergroups" data-page="user-groups"> <span className="icon-Usergroups"></span> User groups</a>
                            </li>
                        </ul>
                    </li>
                    }

              { loginuserroles.isNAFFAOwner &&
                    <li className={ToggleSection.MetadataManagement ? 'limainitem open' : 'limainitem'}>
                        <a href="javascript:void(0)" className="SettingsMetadataManagement link" aria-controls="SettingsSubCategories" onClick= {() => {
                          setToggleSection({ ...ToggleSection, Content: false, UserManagement: false, MetadataManagement: !ToggleSection.MetadataManagement })
                          handleclick('showSubCat')
                        }}>Metadata Management</a>
                        <ul className="submenu" id="menu" style={{ display: ToggleSection.MetadataManagement ? '' : 'none' }}>
                            <li className="SubCategory" onClick= {() => { handleclick('showSubCat') }}>
                            <a href="javascript:void(0)" className={showsection.showSubCat ? 'active' : ''}title="Sub Category" aria-controls="SettingsSubCategory" data-page="Sub-Category"><span className="icon-metadata"></span> Sub Category </a>
                            </li>
                            <li className="userprofiles">
                                <Link title="User Profiles" to={{ pathname: '/UserProfileSettings' }} target="_blank"><span className="icon-Usergroups"></span> User Profiles</Link>
                            </li>
                            <li className='pascode'>
                              <Link title='PAS Code' to={{ pathname: '/PascodeSettings' }} target="_blank">
                              <span className="icon-metadata"></span> PAS Code
                              </Link>
                            </li>

                            <li className="Tooltips" onClick= {() => { handleclick('showTooltips') }}>
                            <a href="javascript:void(0)" className={showsection.showTooltips ? 'active' : ''}title="Tooltips" aria-controls="SettingsTooltips" data-page="Tooltips"><span className="icon-Info"></span>Tooltips </a>
                            </li>

                        </ul>
                    </li>
                }
                    <div className="divsitefeedbacknav">
                        <ul className="Sitefeedback" id="menu">
                            <li className="ligenerallink" onClick= {() => {
                              handleclick('showSiteFeedback')
                              setToggleSection({ ...ToggleSection, Content: false, UserManagement: false, MetadataManagement: false })
                            }}>
                              <a href="javascript:void(0)" className= {showsection.showSiteFeedback ? 'SettingsSiteFeedback active' : 'SettingsSiteFeedback'} title="Site Feedback"aria-controls="site-feedback"data-page="site-feedback"> <span className="icon-SiteFeedback"></span>Site Feedback</a>
                            </li>
                        </ul>
                    </div>
                </ul>
            </div>
        </div>
        <div className="col-xl-10 col-md-9">
            <div className="divsettingscontainer" id="pages">
                {showsection.showQL && <QuickLinksSettings/>}
                {showsection.showKB && <KnowledgeGraphSettings/> }
                {showsection.showQA && <QandASettings/> }
                {showsection.showPolicymemo && <PolicyMemoGuidelinesSettings/>}
                {showsection.showPOC && <PointsofContactSettings/>}
                {showsection.showHelpDesk && <HelpDeskSettings/> }
                {showsection.showUserGroups && <UserGroupSettings/> }
                {showsection.showSubCat && <SubCategorySettings/>}
                {showsection.showTooltips && <TooltipsSettings/>}
                {showsection.showSiteFeedback && <SiteFeedback/>}
            </div>
        </div>
      </div>
    </div>
  </div>
</section>
          )
        : (
            ProfileExist()
          )
}

</>
  )
}

export default SettingsPage
