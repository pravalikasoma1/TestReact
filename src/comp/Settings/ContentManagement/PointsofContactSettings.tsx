/* eslint-disable indent */
import { sp } from '@pnp/sp'
import React, { useEffect, useState } from 'react'
import SpPeoplePicker from 'react-sp-people-picker'
import 'react-sp-people-picker/dist/index.css'
import { ListNames } from '../../../pages/Config'
import { compareDates, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import loader from '../../Images/Loader.gif'

const PointsofContactSettings = () => {
  const [showAddPopup, setshowAddPopup] = useState(false)
  const handleSelect = (e: any) => {
    console.log(e)
    getCustID(e.Description, e.Key)
    setName(e.DisplayText)
  }
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const listName = ListNames().PointsofContact
  const [loaderState, setloaderState] = useState(false)
  const [Name, setName] = useState('')
  const [phone, setphone] = useState('')
  const [Arch, setArch] = useState('')
  const [POCValidations, setPOCValidations] = useState({
    valid: true,
    POCName: true,
    POCphone: true
  })
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const [listItems, setListItems] = useState<any>([])
  const [custID, setCustID] = useState(Number)
  const [pp, setPp] = useState(false)

  // eslint-disable-next-line space-before-function-paren
  async function getCustID(mail: any, Key: any) {
    let customerIdval: any
    if (mail !== undefined && mail !== '[]') {
      try {
        const checkuser = await sp.web.ensureUser(mail)
        console.log(await checkuser)
        customerIdval = await checkuser.data.Id
      } catch (SPException: any) {
        customerIdval = ''
      }
      if (customerIdval === '' || customerIdval === undefined) {
        await (await sp.web.siteGroups.getByName('All Users').users.add(Key))().then(function (data) {
          // console.log(data)
          customerIdval = data.Id
          sp.web.siteGroups.getByName('All Users').users.removeByLoginName(Key).then(() => {
            console.log('added and removed')
          })
        })
      }
    } else {
      customerIdval = ''
    }
    setCustID(Number(customerIdval))
    return customerIdval
  }
  // async init effect
  const initEffect = () => {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('PointsofContactBuildModifiedListDate' + siteName) || ''
      const POCModifiedDate = localStorage.getItem('POC_LMDate' + siteName) || ''
      const needToUpdate = compareDates(listModifiedDate, POCModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        // const items = await list.items.top(5000).get()
        const endpoint = ['ID', 'PhoneNo', 'PointsofContact/Title', 'PointsofContact/Name', 'PointsofContact/JobTitle', 'PointsofContact/FirstName', 'PointsofContact/LastName', 'PointsofContact/EMail', 'IsArchived', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'AttachmentFiles']
        const expand = ['PointsofContact', 'Author', 'Editor', 'AttachmentFiles']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          const siteName = GlobalConstraints().siteName
          localStorage.setItem('POCData' + siteName, JSON.stringify(items))
          localStorage.setItem('POC_LMDate' + siteName, listModifiedDate)
          setListItems(items)
        })
      } else {
        const POCData: any = (localStorage.getItem('POCData' + siteName) !== undefined && localStorage.getItem('POCData' + siteName) !== '' && localStorage.getItem('POCData' + siteName) !== null ? JSON.parse(localStorage.getItem('POCData' + siteName) || '{}') : [])
        setListItems(POCData)
      }
      setTimeout(() => {
        toggleLoader(false)
      }, 2000)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const onEdit = (item: any) => {
    setInEditMode({
      status: true,
      rowKey: item.ID
    })
    setPp(false)
    getCustID(item.PointsofContact.EMail, item.PointsofContact.Name)
    const isArchive = item.IsArchived ? 'Yes' : 'No'
    setshowAddPopup(false)
    setName(item.PointsofContact.Title)
    const phonenumber = fnPhonechange(item.PhoneNo)
    setphone(phonenumber)
    setArch(isArchive)
    setPOCValidations({
      ...POCValidations,
      valid: true,
      POCName: true,
      POCphone: true
    })
  }
  function fnPhonechange (phonenumber: any) {
    if (phonenumber != '' && phonenumber != undefined && phonenumber != null) {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      phonenumber = phonenumber.replace(phoneRegex, '$1-$2-$3')
    }
    return phonenumber
  }
  const changepeople = (e: any) => {
    setName(e.target.value)
    if (e.target.value === '') {
      setPp(true)
      setName('')
    }
  }
  // eslint-disable-next-line space-before-function-paren
  function validatePhone(phonenumber: any) {
    let str = ''
    let isvalidphone = true
    const intRegex = /[0-9 -()+]+$/
    if (phonenumber.indexOf('-') > -1) {
      phonenumber = phonenumber.replace('-', '')
    }
    if (phonenumber.indexOf('/') > -1) {
      phonenumber = phonenumber.replace('/', '')
    }
    for (let x = 0; x < phonenumber.length; x++) {
      str = phonenumber.charAt(x)
      if (!intRegex.test(str)) {
        isvalidphone = false
        return isvalidphone
      }
    }
    return isvalidphone
  }
  const validate = (item: any) => {
    toggleLoader(true)
    let valid = true
    let name = true
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    const phonenumber = phone.replace(phoneRegex, '$1$2$3')

    if (Name == '' || Name == undefined || Name == null) {
      valid = false
      name = false
    }
    let validphone = true
    if ((phone.length > 16) || (!validatePhone(phonenumber)) || (phone.length < 10)) {
      valid = false
      validphone = false
    }
    setPOCValidations({
      ...POCValidations,
      valid: valid,
      POCName: name,
      POCphone: validphone
    })
    if (valid) {
      saveOrUpdate(item.ID)
    } else {
      toggleLoader(false)
    }
  }
  $(document).on('focusout', '#PointofContactPhoneNumber,#addPointofContactPhoneNumber', function () {
    const phonenumber = fnPhonechange(phone)
    setphone(phonenumber)
    $(this).val(phonenumber)
    $(this).attr('data-identifier', phonenumber)
  })
  const saveOrUpdate = (id: any) => {
    console.log(id)
    setshowAddPopup(false)
    setInEditMode({
      status: false,
      rowKey: null
    })
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    const phonenumber = phone.replace(phoneRegex, '$1$2$3')

    const isArchived = Arch === 'Yes'
    const updateObj = {
      PointsofContactId: custID,
      PhoneNo: phonenumber,
      IsArchived: isArchived
    }
    if (id !== '' && id !== null && id !== undefined) {
      sp.web.lists.getByTitle(ListNames().PointsofContact).items.getById(id).update(updateObj).then(function () {
        BuildmodifiedListUpdate()
      })
    } else {
      sp.web.lists.getByTitle(ListNames().PointsofContact).items.add(updateObj).then(function () {
        BuildmodifiedListUpdate()
      })
    }
  }
  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'PointsofContact') {
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
  const Delete = (id: any) => {
    toggleLoader(true)
    sp.web.lists.getByTitle(ListNames().PointsofContact).items.getById(id).delete().then(function () {
      BuildmodifiedListUpdate()
    })
  }
  const displayalertDelete = (id: any) => {
    const proceed = window.confirm('Are you sure, you want to delete the selected item?')
    if (proceed) {
      Delete(id)
    }
  }
  function changePhone (e: any) {
    let phonenumber = e.target.value
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    phonenumber = phonenumber.replace(phoneRegex, '$1$2$3')
    setphone(phonenumber)
  }
  const onClickAdd = () => {
    setshowAddPopup(!showAddPopup)
    setInEditMode({
      status: false,
      rowKey: null
    })
    setPOCValidations({
      ...POCValidations,
      valid: true,
      POCName: true,
      POCphone: true
    })
    setName('')
    setphone('')
    setArch('')
  }
  return (
    <div id="poc" className="tabcontent SettingsPointofContact page" data-page="poc">
      <div className="divsettingsheader ">
        <h2><span className="icon-Usergroups"></span> Points of Contact</h2>
        <ul className="ulactionitems ulUsergroupsactionitems">

          <li><a href="javascript:void(0)" title="Add" className="anchorsettingglobalbtn" id="addPointsofContact" onClick={() => { onClickAdd() }}>
            <span className="icon-Add"></span>
            Add</a></li>
        </ul>
      </div>
      {showAddPopup
        ? (<div className="divaddpopup divsettingglobalpopup" id="addPointsofContactpopup">
          <h3>ADD PEOPLE</h3>
          <div className="divcardbody">
            <div className="row">
              <div className="col-xl-12 col-sm-12">
                <div className="divformgroup divcustomPeoplepicker divpocpicker">
                  <label htmlFor="POC">
                    Points of Contact </label><span className="mandatory">
                    *</span>
                  <SpPeoplePicker onSelect={handleSelect} onChange={handleSelect} />
                  {
                    !POCValidations.POCName
                      ? (
                        <span className="errormsg pocvalidatemsg" id="PointsofContact">
                          Please enter name </span>
                      )
                      : ''}
                </div>
              </div>
              <div className="col-xs-6 col-sm-6">
                <div className="divformgroup">
                  <label htmlFor="POCPhoneNumber">Phone Number</label><span className="mandatory">
                    *</span>
                  <input type="text" className="numdata phdata" name="POCPhoneNumber" id="addPointofContactPhoneNumber"
                    placeholder="Example 123-555-6789" value={phone} onChange={changePhone} onClick ={changePhone} />
                  {
                    !POCValidations.POCphone
                      ? (
                        <span className="errormsg" id="PointofContactPhoneNumberErr">
                          Please enter valid phone number. </span>
                      )
                      : ''}
                </div>
              </div>

              <div className="col-xs-6 col-sm-6">
                <div className="divformgroup">
                  <div className="selectdropdown">
                    <label htmlFor="knowledgeGraphCategory">Category </label><span className="mandatory">
                      *</span>
                    <select name="Category" id="knowledgeGraphCategory" disabled>
                      <option value="NAFFA">NAFFA</option>
                    </select>
                    <p className="errormsg hidecomponent" id="knowledgeGraphSectionErr">
                      Please select Dropdown</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="divpopupfooter">
              <ul>
                <li><a href="javascript:void(0)" title="Save" className="anchorsavebtn" onClick={() => validate('')}>
                  <span className="icon-Save" ></span>Save</a></li>
                <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchorglobalcancelbtn"
                  id="quicklinkcancelbtn" onClick={() => { setshowAddPopup(false) }}>
                  <span className="icon-Close"></span>Cancel</a></li>
              </ul>
            </div>
          </div>
        </div>)
        : ''}
      <div className="divcontentarea divpoccontent">
        <ul id="populatequicklinks">
          {listItems?.length && listItems?.length > 0
            ? listItems?.map((item: any) =>
              <li id="qlid-1" key={item.ID}>
                <div className="divcard divnormalcard">
                  <div className="divitem">
                    <p>Name</p><span id="">{item.PointsofContact.Title}</span>
                  </div>
                  <div className="divitem">
                    <p>Phone Number</p>
                    <span>{fnPhonechange(item.PhoneNo)}</span>
                  </div>
                  <div className="divitem">
                    <p>Category</p>
                    <span>Naffa</span>
                  </div>
                  <div className="divitem">
                    <p>Is Archived</p><span id="qlArchtext-1">{item.IsArchived ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="divitem">
                    <p>Actions</p>
                    <ul>
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit"
                        id="qlEdit-1" onClick={() => onEdit(item)}> <span className="icon-Edit"></span> Edit</a></li>
                      <li><a href="javascript:void(0)" title="Delete" id="qlDelete-1" onClick={() => displayalertDelete(item.ID)}> <span
                        className="icon-trash"></span> Delete </a></li>
                    </ul>
                  </div>
                </div>
                {inEditMode.status && inEditMode.rowKey === item.ID
                  ? (
                    <div id="content-qlEdit1" className="divcardedit divcardeditpopup" >

                      <div className="row">
                        <div className="col-xl-12 col-sm-12">
                          <div className="divformgroup divcustomPeoplepicker divpocpicker ">
                            <label htmlFor="POC">
                              Points of Contact </label><span className="mandatory">
                              *</span>
                            {!pp
                              ? (<input value={Name} onChange={(e) => changepeople(e)}></input>)
                              : ''}
                            {
                              pp
                                ? (
                                  <SpPeoplePicker onSelect={handleSelect} onChange={handleSelect} />
                                )
                                : ''
                            }
                            {
                              !POCValidations.POCName
                                ? (
                                  <span className="errormsg pocvalidatemsg" id="PointsofContact">
                                    Please enter name </span>
                                )
                                : ''}
                          </div>
                        </div>

                        <div className="col-xs-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="POCPhoneNumber">Phone Number </label> <span className="mandatory">
                              *</span>
                            <input type="text" className="numdata phdata" name="POCPhoneNumber"
                              id="PointofContactPhoneNumber" placeholder="Example 123-555-6789" maxLength={12} value={phone} onChange={changePhone} onClick ={changePhone}/>
                            {
                              !POCValidations.POCphone
                                ? (
                                  <span className="errormsg" id="PointofContactPhoneNumberErr">
                                    Please enter valid phone number. </span>
                                )
                                : ''}
                          </div>
                        </div>
                        <div className="col-xs-6 col-sm-6">
                          <div className="divformgroup">
                            <div className="selectdropdown">
                              <label htmlFor="knowledgeGraphCategory">Category </label><span className="mandatory">*</span>
                              <select name="Category" id="knowledgeGraphCategory" disabled>
                                <option value="NAFFA">NAFFA</option>
                              </select>
                              <p className="errormsg hidecomponent" id="knowledgeGraphSectionErr">Please select Dropdown</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-xl-6 col-md-6">
                          <div className="divformgroup"><label htmlFor="SelectDropdownIsArchived">Is Archived
                          </label><select name="QuicklinkIsArchived" id="QuicklinkIsArchived-qlEdit1" value={Arch} onChange={(event) => setArch(event.target.value)}>
                              <option value="Yes">Yes</option>
                              <option value="No" selected>No</option>
                            </select></div>
                        </div>
                      </div>
                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update"
                            className="anchorsavebtn" id="qlUpdate-1" onClick={() => validate(item)}> <span className="icon-Update"></span> Update</a>
                          </li>
                          <li><a href="javascript:void(0)" title="Cancel" aria-label="Cancel"
                            className="anchorcancelbtn anchoreditcanel" id="qlCancel-1" onClick={() => { setInEditMode({ ...inEditMode, status: false }) }}> <span
                              className="icon-Close"></span> Cancel</a></li>
                        </ul>
                      </div>
                    </div>
                  )
                  : ''}
              </li>)
            : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}

        </ul>
      </div>
      {
        loaderState
          ? (
            <div className="submit-bg" id="pageoverlay">
              <div className="copying">
                <p id="displaytext">Working on it</p>
                <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
              </div>
            </div>)
          : ''}
    </div>
  )
}

export default PointsofContactSettings
