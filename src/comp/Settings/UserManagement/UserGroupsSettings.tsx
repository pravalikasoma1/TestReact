/* eslint-disable jsx-a11y/anchor-is-valid */
import { sp } from '@pnp/sp'
import React, { useEffect, useState } from 'react'
import SpPeoplePicker from 'react-sp-people-picker'
import 'react-sp-people-picker/dist/index.css'
import { LoginUserDetails, LoginUserName } from '../../../pages/Master'
import loader from '../../Images/Loader.gif'
const UserGroupSettings = () => {
  const [showAddPopup, setshowAddPopup] = useState(false)
  const [searchpeople, setsearchpeople] = useState('')
  const [addpeople, setaddpeople] = useState('')
  const [DeleteToggle, setDeleteToggle] = useState(false)
  const [AdduserToggle, setAdduserToggle] = useState(false)
  const [searcheduserGroups, setsearcheduserGroups] = useState<any>()
  const [userexist, setuserexist] = useState(Boolean)
  const [searchdone, setsearchdone] = useState(Boolean)
  const [closepopup, setclosepopup] = useState(true)
  const [resetpp, setresetpp] = useState(true)
  const [emptysearch, setemptysearch] = useState(false)
  const [addemptysearch, setaddemptysearch] = useState(false)
  const [loaderState, setloaderState] = useState(false)
  const handleSelect = (e: any) => {
    console.log(e)
    setaddpeople(e.Key)
    setsearchdone(false)
    // sp.web.siteGroups.getByName(selValue).users.removeByLoginName(e.Key)
  }
  const handleSearchpp = (e: any) => {
    setsearchpeople(e.Key)
  }
  const RemoveUser = () => {
    sp.web.siteGroups.getByName(selValue).users.removeByLoginName(addpeople).then(() => {
      getUserGroups().then(() => {
        searchAddRemoveUsers()
      })
    })
  }
  const getsearchGroups = async () => {
    let groupss
    setsearchpeople('')
    const activegroupsdata: any[] = []
    if (searchpeople !== '') {
      setemptysearch(false)
      await sp.web.siteUsers
        .getByLoginName(searchpeople)
        .select('Id').get()
        .then(async (user: any) => {
          groupss = await sp.web.siteUsers.getById(user.Id).groups.get()
          const groupsdata = await groupss
          await groupsdata.forEach((item: any) => {
            console.log(item)
            if (item.Title === 'NAFFA Owners' || item.Title === 'NAFFA AFIMSC Owners' || item.Title === 'AFIMSC' || item.Title === 'SME' || item.Title === 'AFSVC' || item.Title === 'SAF FMCEB') {
              if (item.Title === 'NAFFA AFIMSC Owners') {
                activegroupsdata.push('AFIMSC Owners')
              } else {
                activegroupsdata.push(item.Title)
              }
            }
          })
          setsearcheduserGroups(activegroupsdata)
          setclosepopup(false)
        })
    } else {
      setemptysearch(true)
    }
  }
  const addPeopletoGroup = async () => {
    await sp.web.siteGroups.getByName(selValue).users
      .add(addpeople).then(function (d) {
        console.log(d)
        getUserGroups().then(() => {
          searchAddRemoveUsers()
        })
      })
  }
  const searchAddRemoveUsers = () => {
    setDeleteToggle(false)
    setAdduserToggle(false)
    setaddemptysearch(false)
    setsearchdone(true)
    let groupss
    let userexist = false
    setuserexist(false)
    if (addpeople !== '') {
      setaddemptysearch(false)
      sp.web.siteUsers
        .getByLoginName(addpeople)
        .select('Id').get()
        .then(async (user: any) => {
          groupss = await sp.web.siteUsers.getById(user.Id).groups.get()
          groupss.forEach((item: any) => {
            if (item.Title === selValue) {
              console.log(true)
              userexist = true
            }
          })
          setuserexist(userexist)
        })
    } else {
      setaddemptysearch(true)
      setuserexist(false)
    }
  }
  const [Afimscown, setAfimscOwn] = useState<any>()
  const [NAFFAown, setNAFFAOwn] = useState<any>()
  const [Afimsc, setAfimsc] = useState<any>()
  const [SME, setSME] = useState<any>()
  const [Afsvc, setAfsvc] = useState<any>()
  const [SAFFMCEB, setSAFFMCEB] = useState<any>()
  const [selValue, setselvalue] = useState('NAFFA Owners')
  useEffect(() => {
    setloaderState(true)
    const Mygroups = sp.web.siteUsers.getById(LoginUserName().UserId).groups.get()
    getUserGroups()
  }, [])
  const getUserGroups = async () => {
    const groups = sp.web.siteGroups()

    const NaffaOwnerID = getGroupID('NAFFA Owners')
    const AFIMSCOwnerID = getGroupID('NAFFA AFIMSC Owners')
    const AFIMSCID = getGroupID('AFIMSC')
    const SMEID = getGroupID('SME')
    const AFSVCID = getGroupID('AFSVC')
    const SAFFMCEBID = getGroupID('SAF FMCEB')
    const NAFFAOwners = await sp.web.siteGroups.getById(await NaffaOwnerID).users()
    const AFIMSCOwners = await sp.web.siteGroups.getById(await AFIMSCOwnerID).users()
    const AFIMSC = await sp.web.siteGroups.getById(await AFIMSCID).users()
    const SME = await sp.web.siteGroups.getById(await SMEID).users()
    const AFSVC = await sp.web.siteGroups.getById(await AFSVCID).users()
    const SAFFMCEB = await sp.web.siteGroups.getById(await SAFFMCEBID).users()
    setAfimscOwn(AFIMSCOwners)
    setNAFFAOwn(NAFFAOwners)
    setAfimsc(AFIMSC)
    setSME(SME)
    setAfsvc(AFSVC)
    setSAFFMCEB(SAFFMCEB)
    setTimeout(() => {
      setloaderState(false)
    }, 1000)
  }
  const getGroupID = async (GroupName: any) => {
    const grp = await sp.web.siteGroups.getByName(GroupName)()
    return grp.Id
  }
  const changeHandler = (e:any) => {
    setselvalue(e.target.value)
    setshowAddPopup(false)
  }
  const onclickadd = () => {
    setaddpeople('')
    setsearchdone(false)
    setresetpp(true)
    setAdduserToggle(false)
    setDeleteToggle(false)
    $('._2z2Tk input').val('')
    $('._2z2Tk').val('')
    setshowAddPopup(!showAddPopup)
    $('.divcustomPeoplepicker input').val('')
    $('._2z2Tk').val('')
    setaddemptysearch(false)
  }
  return (
    <div id="user-groups" className="tabcontent Settingsusergroups page" data-page="user-groups">
    <div className="divsettingsheader ">
      <h2><span className="icon-Usergroups"></span>
        User Groups</h2>
      <ul className="ulUsergroupsactionitems">
        <li>
          <div className="forminline userfilter">
            <label htmlFor="userfilter">Filter By:</label>
            <select name="userfilter" id="userfilter" value = {selValue} onChange = {changeHandler}>
              <option value="NAFFA Owners">NAFFA Owners</option>
              <option value="NAFFA AFIMSC Owners">AFIMSC Owners</option>
              <option value="AFIMSC">AFIMSC</option>
              <option value="SME">SME</option>
              <option value="AFSVC">AFSVC </option>
              <option value="SAF FMCEB">SAF FMCEB</option>
                </select>
          </div>
        </li>

        <li>
          <div className="divsearchcontrol">
            <div id="search-control-wrapper">

              <div className='divcustomPeoplepicker divuserprofilepicker'>
              <label htmlFor="userfilter">Check User Permissions:</label>
              <SpPeoplePicker onSelect={handleSearchpp} onChange={handleSearchpp} onClick = {handleSearchpp}/>
             {/* <input type="text" name="search" placeholder="Enter a name or email address..." className=""/> */}
              <a href="javascript:void(0)" title="Search" className="anchorsearchbtn" id="search-user-btn" onClick ={getsearchGroups}>
                <span className="icon-Search"></span>Search</a></div>
              <div className="searchresult hidecomponent">
                <div className="arrow-up"></div>
                <table aria-describedby="Check User Permissions">
                </table>
              </div>
            </div>{ emptysearch
              ? (
                 <span className="errormsg spanerrormsg" >You cant leave this blank</span>
                )
              : ''
            }
            <div className="divsearchresults" >
            { !closepopup && !emptysearch
              ? (
            <table aria-describedby='serachtable'>
              <thead>
                <tr>
                    <th>User Roles
                    <span><a className="popclosebtn" title="Close" onClick ={() => setclosepopup(true)}> <span className="icon-Close"></span> </a></span>
                    </th>

                </tr>
              </thead>
              <tbody>

                { searcheduserGroups && searcheduserGroups.length > 0
                  ? searcheduserGroups?.map((item: any) =>
                   <tr key = {item}>
                     <td>{item}</td>
                     </tr>)
                  : <td><div className="divnoresults">There are no results to display</div></td>
                }

              </tbody>
   </table>)
              : '' }
            </div>
          </div>
        </li>

      </ul>

    </div>
    <div className="divcontentarea">
                    <div className="divtopsection">
                        <span className='spanaddremoveBtn' id="anchoraddremove" onClick={ onclickadd}>
                        <span className="icon-Adduser"></span>
                        <a href="javascript:void(0)" className="" title='Add/Remove User'> Add/Remove User </a>
                        <span className="icon-Info">
                          <span className="info-tooltip">
                            <span className="classic">
                              <span className="tooltipdescp">
                                <p>Add/Remove User </p>
                              </span>
                            </span>
                          </span>
                        </span>
                        </span>
                { showAddPopup
                  // eslint-disable-next-line multiline-ternary
                  ? (
                  <div className="divaddremovepopup " id="anchoraddremovepopup">
                        <div className="row">
                          <div className="col-md-12 col-xs-12">
                            <span className="spananchorclosebtn"><a href="javascript:void(0)" title="Close"
                                id="anchorRemoveUserbtnclose" className="" onClick= {() => { setshowAddPopup(false) }}><span className="icon-Close"></span></a></span>
                            <div className="divsearch">
                              <div id="search-control-wrapper">
                                <label htmlFor="userfilter">Search User</label>

                                <div className='divcustomPeoplepicker divuserprofilepicker'>
                                  { resetpp
                                    ? (<SpPeoplePicker onSelect={handleSelect} onChange={handleSelect}/>)
                                    : ''
                                  }
                                {/* <input type="text" name="search" placeholder="Enter a name or email address..." className=""/> */}
                                <a href="javascript:void(0)" title="Search" className="anchorsearchbtn" id="search-user-btn" onClick = {searchAddRemoveUsers}>
                                  <span className="icon-Search"></span>Search</a></div>

                              </div>{ addemptysearch
                                ? (
                 <div className="errormsg pocvalidatemsg" >You cant leave this blank</div>
                                  )
                                : ''
            }
                            </div>
                            {addpeople !== '' && searchdone
                              ? (<div className='divusersearchresult'>
                                  <div className='divassignedinfo'>
                                    <h2>Currently Assigned User Role(s) <span className="icon-Info"><span className="info-tooltip"><span className="classic"><span className="tooltipdescp"><p>Currently Assigned User Role(s)  </p></span></span></span></span> </h2>
                                    <ul>
                                      <li>
                                      {userexist
                                        ? (<div className='divroleinfo'>
                                        <input data-category="" data-name="CSP Owners" className="removeGroupCheckbox" type="checkbox" id="role_CSPOwners" onClick={() => setDeleteToggle(!DeleteToggle)}/><label htmlFor='role_CSPOwners'>{selValue === 'NAFFA AFIMSC Owners' ? 'AFIMSC Owners' : selValue}</label>
                                        </div>)
                                        : <div className="divnoresults">There are no results to display</div>}
                                      </li>
                                    </ul>
                                    { DeleteToggle && userexist
                                      ? (<a className='UserBtn UserRemoveactionBtn' title='Remove User' onClick={RemoveUser}><span className='icon-Close'></span>Remove User
                                    </a>)
                                      : ''
                                  }

                                  </div>
                                  <hr/>

                                  <div className='divassignedinfo'>
                                    <h2>User Role(s) Available to assign <span className="icon-Info"><span className="info-tooltip"><span className="classic"><span className="tooltipdescp"><p>User Role(s) Available to assign  </p></span></span></span></span> </h2>
                                    <ul>
                                      <li>
                                      {!userexist
                                        ? (
                                        <div className='divroleinfo'>
                                        <input data-category="" data-name="CSP Owners" className="removeGroupCheckbox" type="checkbox" id="role_CSPOwners" onClick={() => setAdduserToggle(!AdduserToggle)}/><label htmlFor='role_CSPOwners'>{selValue === 'NAFFA AFIMSC Owners' ? 'AFIMSC Owners' : selValue}</label>
                                        </div>)
                                        : <div className="divnoresults">There are no results to display</div>}
                                      </li>
                                      { AdduserToggle && !userexist
                                        ? (
                                      <a className='UserBtn UserAddactionBtn' title='Add User' onClick ={addPeopletoGroup}><span className='icon-Check'></span>Add User
                                    </a>)
                                        : '' }
                                    </ul>
                                  </div>
                            </div>)
                              : '' }
                          </div>

                        </div>

                      </div>
                    ) : ''}
                    </div>

                    <div className="userrolesgrid">
                      <table aria-describedby=" User Groups">
                        <thead>
                          <tr>
                            <th>User Roles</th>
                            <th>User Information</th>

                          </tr>
                        </thead>
                        <tbody id="groups-tbody">
                          {(selValue === '' || selValue === 'NAFFA Owners') &&
                          <tr>
                            <td className="tdborder">NAFFA Owners <span className="spanuserscount">({NAFFAown?.length})</span></td>
                            <td className="tdborder">

                              <ul>
                              {NAFFAown?.length && NAFFAown?.length > 0
                                ? NAFFAown?.map((item: any) =>
                              <div key={'NAFFAOwners'}>
                                <li>{item.Title}</li>
                                </div>
                                )
                                : ''}
                              </ul>
                            </td>

                          </tr>
                        }
                        {(selValue === 'NAFFA AFIMSC Owners') &&
                          <tr>
                            <td className="tdborder">AFIMSC Owners <span className="spanuserscount">({Afimscown?.length})</span></td>
                            <td className="tdborder">

                              <ul>
                              {Afimscown?.length && Afimscown?.length > 0
                                ? Afimscown?.map((item: any) =>
                              <div key={'NAFFAOwners'}>
                                <li>{item.Title}</li>
                                </div>
                                )
                                : ''}

                              </ul>
                            </td>

                          </tr>}
                          {(selValue === 'AFIMSC') &&
                          <tr>
                            <td className="tdborder">AFIMSC<span className="spanuserscount">({Afimsc?.length})</span></td>
                            <td className="tdborder">

                              <ul>
                              {Afimsc?.length && Afimsc?.length > 0
                                ? Afimsc?.map((item: any) =>
                              <div key={'NAFFAOwners'}>
                                <li>{item.Title}</li>
                                </div>
                                )
                                : ''}

                              </ul>
                            </td>

                          </tr>}
                          {(selValue === 'SME') &&
                          <tr>
                            <td className="tdborder">SME <span className="spanuserscount">({SME?.length})</span></td>
                            <td className="tdborder">

                              <ul>
                              {SME?.length && SME?.length > 0
                                ? SME?.map((item: any) =>
                              <div key={'NAFFAOwners'}>
                                <li>{item.Title}</li>
                                </div>
                                )
                                : ''}
                              </ul>
                            </td>

                          </tr>}
                          {(selValue === 'AFSVC') &&
                          <tr>
                            <td className="tdborder">AFSVC <span className="spanuserscount">({Afsvc?.length})</span></td>
                            <td className="tdborder">

                              <ul>
                              {Afsvc?.length && Afsvc?.length > 0
                                ? Afsvc?.map((item: any) =>
                              <div key={'NAFFAOwners'}>
                                <li>{item.Title}</li>
                                </div>
                                )
                                : ''}
                              </ul>
                            </td>

                          </tr> }
                          {(selValue === 'SAF FMCEB') &&
                          <tr>
                            <td>SAF FMCEB <span className="spanuserscount">({SAFFMCEB?.length})</span></td>
                            <td>

                              <ul>
                              {SAFFMCEB?.length && SAFFMCEB?.length > 0
                                ? SAFFMCEB?.map((item: any) =>
                              <div key={'NAFFAOwners'}>
                                <li>{item.Title}</li>
                                </div>
                                )
                                : ''}
                              </ul>
                            </td>

                          </tr>}
                        </tbody>
                      </table>
                    </div>

                  </div>
                  {
                    loaderState
                      ? (
                  <div className="submit-bg" id="pageoverlay" >
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                    </div>
                </div>
                        )
                      : ''
                  }

</div>
  )
}
export default UserGroupSettings
