import { sp } from '@pnp/sp'
import React, { useEffect, useState } from 'react'
import { ListNames } from '../../../pages/Config'
import loader from '../../Images/Loader.gif'
import { compareDates, convertDate, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
const HelpDeskSettings = () => {
  const [edit, setedit] = useState(false)
  const [HelpDeskName, setHelpDeskName] = useState('')
  const [HelpDeskPhone, setHelpDeskPhone] = useState('')
  const [HelpDeskEmail, setHelpDeskEmail] = useState('')
  const [HDValidations, setHDValidations] = useState({
    valid: true,
    Name: true,
    Phone: true,
    Email: true
  })
  const onClick = (item: any) => {
    setedit(true)
    setHelpDeskName(item.Title)
    setHelpDeskPhone(item.PhoneNo)
    setHelpDeskEmail(item.EmailAddress)
    setHDValidations({
      ...HDValidations,
      valid: true,
      Name: true,
      Phone: true,
      Email: true
    })
  }
  const listName = ListNames().HelpDesk
  const [loaderState, setloaderState] = useState(false)
  const [listItems, setListItems] = useState<any>([])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  useEffect(() => {
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const initEffect = () => {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('HelpDeskBuildModifiedListDate' + siteName) || ''
      const POCModifiedDate = localStorage.getItem('HD_LMDate' + siteName) || ''
      const needToUpdate = compareDates(listModifiedDate, POCModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        const endpoint = ['ID', 'Title', 'PhoneNo', 'EmailAddress', 'Editor/Id', 'Editor/Title', 'Modified']
        const expand = ['Editor']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          const siteName = GlobalConstraints().siteName
          localStorage.setItem('HDData' + siteName, JSON.stringify(items))
          localStorage.setItem('HD_LMDate' + siteName, listModifiedDate)
          setListItems(items)
        })
      } else {
        const HDData: any = (localStorage.getItem('HDData' + siteName) !== undefined && localStorage.getItem('HDData' + siteName) !== '' && localStorage.getItem('HDData' + siteName) !== null ? JSON.parse(localStorage.getItem('HDData' + siteName) || '{}') : [])
        setListItems(HDData)
      }
      setTimeout(() => {
        toggleLoader(false)
      }, 2000)
    } catch (error) {
      console.log(error)
    }
  }

  const validate = (item: any) => {
    toggleLoader(true)
    let valid = true
    let name = true
    if (HelpDeskName == '' || HelpDeskName == undefined || HelpDeskName == null) {
      valid = false
      name = false
    }
    let validphone = true
    if (HelpDeskPhone == '' || HelpDeskPhone == undefined || HelpDeskPhone == null) {
      valid = false
      validphone = false
    }
    let validemail = true
    if (HelpDeskEmail == '' || HelpDeskEmail == undefined || HelpDeskEmail == null) {
      valid = false
      validemail = false
    }
    setHDValidations({
      ...HDValidations,
      valid: valid,
      Name: name,
      Phone: validphone,
      Email: validemail
    })
    if (valid) {
      Update(item.ID)
    } else {
      toggleLoader(false)
    }
  }
  const Update = (id: any) => {
    setedit(false)
    const updateObj = {
      Title: HelpDeskName,
      PhoneNo: HelpDeskPhone,
      EmailAddress: HelpDeskEmail
    }
    sp.web.lists.getByTitle(ListNames().HelpDesk).items.getById(id).update(updateObj).then(function () {
      BuildmodifiedListUpdate()
    })
  }
  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'HelpDesk') {
        GetMCount = parseInt(buildmodifiedlist[i].Mcount)
        Id = buildmodifiedlist[i].Id
        GetMCount = JSON.stringify(GetMCount + 1)
      }
    }
    const addObj = {
      Mcount: GetMCount
    }
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(Id).update(addObj).then(function () {
      GetBuildModifiedList().then(function () {
        initEffect()
        toggleLoader(false)
      })
    })
  }
  return (
    <div id="help-desk" className="tabcontent SettingsHelpdesk page" data-page="help-desk">
      <div className="divsettingsheader ">
        <h2><span className="icon-usersettings"></span>
          Help Desk</h2>

      </div>

      <div className='divcontentarea divhepdeskcontent'>
        <ul>
          {listItems?.length && listItems?.length > 0
            ? listItems?.map((item: any) =>
              <li key={item.ID}>
                <div className='divcard divnormalcard'>
                  <div className='divitem'>
                    <p>Name</p>
                    <span>{item.Title}</span>
                  </div>
                  <div className='divitem'>
                    <p>Phone Number</p>
                    <span>{item.PhoneNo}</span>
                  </div>
                  <div className='divitem'>
                    <p>Email Address</p>
                    <span>{item.EmailAddress}</span>
                  </div>
                  <div className='divitem'>
                    <p>Modified</p>
                    <span>{item.Editor.Title} | {convertDate(item.Modified, 'date')}</span>
                  </div>
                  <div className='divitem'>
                    <p>Actions</p>
                    <ul>
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit" onClick={() => onClick(item)}> <span className="icon-Edit"></span>Edit</a></li>
                    </ul>
                  </div>
                </div>
                {edit
                  ? (
                    <div className="divcardedit divcardeditpopup" >
                      <div className="row">
                        <div className="col-xl-4 col-md-12">
                          <div className="divformgroup">
                            <label htmlFor="InputTextQuickLinkNameEdit">Name</label><span className="mandatory">*</span>
                            <input type="text" name="InputTextQuickLinkNameEdit" aria-label="Name" aria-required="true" placeholder="Enter Name" value={HelpDeskName} onChange={(e) => setHelpDeskName(e.target.value)} />
                            {
                              !HDValidations.Name
                                ? (<span className="errormsg">Please enter name</span>
                                  // eslint-disable-next-line indent
                                )
                                : ''}
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-12">
                          <div className="divformgroup">
                            <label htmlFor="InputTextQuickLinkNameEdit">Phone Number</label><span className="mandatory">*</span>
                            <input type="num" name="InputTextQuickLinkNameEdit" aria-label="Name" aria-required="true" placeholder="Phone Number" value={HelpDeskPhone} onChange={(e) => setHelpDeskPhone(e.target.value)} />
                            {
                              !HDValidations.Phone
                                ? (<span className="errormsg">Please enter Phone Number</span>
                                  // eslint-disable-next-line indent
                                )
                                : ''}</div>
                        </div>
                        <div className="col-xl-4 col-md-12">
                          <div className="divformgroup">
                            <label htmlFor="InputTextQuickLinkNameEdit">Email</label><span className="mandatory">*</span>
                            <input type="text" name="InputTextQuickLinkNameEdit" aria-label="Name" aria-required="true" placeholder="Enter email" value={HelpDeskEmail} onChange={(e) => setHelpDeskEmail(e.target.value)} />
                            {
                              !HDValidations.Email
                                ? (<span className="errormsg">Please enter valid Email</span>
                                  // eslint-disable-next-line indent
                                )
                                : ''}
                            <span className="errormsg" id="quicklinknameval-1" style={{ display: 'none' }}>Please enter Email</span></div>
                        </div>
                      </div>
                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update" className="anchorsavebtn" id="qlUpdate-1" onClick={() => validate(item)}> <span className="icon-Update"></span>Update</a>
                          </li>
                          <li><a href="javascript:void(0)" title="Cancel" aria-label="Cancel" className="anchorcancelbtn anchoreditcanel" id="qlCancel-1" onClick={() => setedit(false)}> <span className="icon-Close"></span>Cancel</a>
                          </li>
                        </ul>
                      </div>
                    </div>)
                  : ''}
              </li>)
            : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}

        </ul>
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
            // eslint-disable-next-line indent
          )
          : ''
      }
    </div>
  )
}
export default HelpDeskSettings
