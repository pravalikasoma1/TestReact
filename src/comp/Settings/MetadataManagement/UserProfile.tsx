/* eslint-disable multiline-ternary */
/* eslint-disable indent */
/* eslint-disable space-before-function-paren */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import React, { useEffect, useState } from 'react'
import { compareDates, convertDate, GetBuildModifiedList, GetUserProfile, GlobalConstraints } from '../../../pages/Master'
import { ListNames } from '../../../pages/Config'
import { sp } from '@pnp/sp'
import Autocomplete from 'react-autocomplete'
import { useIndexedDB } from 'react-indexed-db'
import SpPeoplePicker from 'react-sp-people-picker'
import loader from '../../Images/Loader.gif'

const UserProfile = () => {
  const [showAddPopup, setshowAddPopup] = useState(false)
  const [pp, setPp] = useState(false)
  const listName = ListNames().UserProfile
  const [listItems, setListItems] = useState<any>([])
  const [FilterItems, setFilterItems] = useState<any>([])
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [loaderState, setloaderState] = useState(false)
  const [emptysearch, setemptysearch] = useState(false)
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const [Accordion, setAcc] = useState({
    status: false,
    rowKey: null
  })
  const [validation, setStatevalidations] = useState({
    DOD: false,
    ValidDOD: false,
    UniqueDOD: false,
    AssignedComp: false,
    Status: false,
    Phone: false,
    ValidPhone: false,
    PASCode: false,
    ValidPASCode: false,
    Majcom: false,
    Installation: false,
    ValidInstallation: false,
    Organization: false,
    ValidOrganization: false,
    validDutyEmail: false
  })
  const [Pasvalue, setValue] = useState('')
  const [Insvalue, setInsValue] = useState('')
  const [Orgvalue, setOrgValue] = useState('')
  const [PasCodeID, setPasID] = useState<any>()
  const [email, setEmail] = useState('')
  const [currentMaj, setOrgMajValue] = useState('')
  const [currentStatus, setStatusVal] = useState('')
  const [currentAssignedComp, setAssignedComp] = useState('RegAF')
  const [currentPhone, setPhoneval] = useState('')
  const [showInfo, setshow] = useState(false)
  const [isDisabled, setVal] = useState(false)
  const [PasCodelistItems, setPasCodeItems] = useState<any>([])
  const defaultOptionValue = 'Select'
  const [selMajcomPascodeData, setMajcomPas] = useState<any>([])
  const [uniqueInsta, setuniqueInsta] = useState<any>([])
  const [uniqueOrg, setuniqueOrg] = useState<any>([])
  const [selInsPascodeData, setInstaPas] = useState<any>([])
  const [showInst, setInstallationshow] = useState(false)
  const [showOrg, setOrgshow] = useState(false)
  const [showCPTS, setCPTSshow] = useState(false)
  const [showPascodeDiv, setPascodeshow] = useState(false)
  const [showOrgMaj, setOrgMajdisplay] = useState(true)
  const [DodVal, setDODvalue] = useState('')
  const [CptsVal, setCptsValue] = useState('')
  const [MajVal, setMajValue] = useState('')
  const [Disname, setDisName] = useState('')
  const [custID, setCustID] = useState(Number)
  const [inputValue, setInputValue] = useState('')
  const siteName = GlobalConstraints().siteName
  const { add } = useIndexedDB('PASCODE' + siteName + '')
  const { getByID } = useIndexedDB('PASCODE' + siteName + '')
  const { update } = useIndexedDB('PASCODE' + siteName + '')
  const toggleLoader = (val: any) => {
    setloaderState(val)
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
  const ProfileExist = () => {
    document.location = `${window.location.origin + window.location.pathname}#/UserProfile`
    return (
    <></>
    )
  }
  useEffect(() => {
    getPASCode()
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  function changeAssignedComponent(a: any) {
    setAssignedComp(a.target.value)
  }
  function getPASCode() {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('PASCodeMetadataListBuildModifiedListDate' + siteName) || ''
      const PascodeModifiedDate = localStorage.getItem('Pascode_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, PascodeModifiedDate)
      const list = sp.web.lists.getByTitle(ListNames().PASCodeMetadataList)
      const endpoint = ['ID', 'Title', 'Organization', 'Installation', 'MAJCOM', 'ServicingCPTS', 'AssignedComponent', 'IsArchived', 'OrgMAJCOM']
      if (needToUpdate) {
        list.items.select('' + endpoint + '').top(5000).get().then(function (items) {
          getByID(1).then((DBData: any) => {
            if (DBData && DBData.items.length > 0) {
              update({ id: 1, items: items }).then(
                (result: any) => { console.log('Data Stored in DB') }
              )
            } else {
              add({ items: items }).then((DBData: any) => {
              })
            }
          })
          localStorage.setItem('Pascode_LMDate' + siteName, listModifiedDate)
        })
      } else {
        getData()
      }
    } catch (error) {
      console.log(error)
    }
  }
  const initEffect = () => {
    toggleLoader(true)
    setInputValue('')
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('UserProfileBuildModifiedListDate' + siteName) || ''
      const QLModifiedDate = localStorage.getItem('UP_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, QLModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        const endpoint = ['ID', 'AssignedComponent', 'CustomerID', 'disName', 'DoDIDNumber', 'DutyEmail', 'DutyPhone', 'Status', 'PasCode/Title', 'PasCode/ServicingCPTS', 'PasCode/ID', 'PasCode/Installation', 'PasCode/MAJCOM', 'PasCode/Organization', 'PasCode/OrgMAJCOM', 'IsArchived', 'Modified', 'Editor/Id', 'Editor/Title']
        const expand = ['PasCode', 'Editor']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          localStorage.setItem('ProfileData' + siteName, JSON.stringify(items))
          localStorage.setItem('UP_LMDate' + siteName, listModifiedDate)
          setListItems(items)
          setFilterItems(items)
          console.log(items)
          setTimeout(() => {
            toggleLoader(false)
          }, 2000)
        })
      } else {
        const ProfileData: any = (localStorage.getItem('ProfileData' + siteName) !== undefined && localStorage.getItem('ProfileData' + siteName) !== '' && localStorage.getItem('ProfileData' + siteName) !== null ? JSON.parse(localStorage.getItem('ProfileData' + siteName) || '{}') : [])
        setListItems(ProfileData)
        setFilterItems(ProfileData)
        setTimeout(() => {
          toggleLoader(false)
        }, 1000)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const handleSelect = (e: any) => {
    console.log(e)
    setEmail(e.Description)
    setDisName(e.DisplayText)
    getCustID(e.Description, e.Key)
  }
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
  const onEdit = async (item: any) => {
    setInEditMode({
      status: true,
      rowKey: item.Id
    })
    setPp(false)
    setshow(true)
    setVal(true)
    setInstallationshow(true)
    setOrgshow(true)
    setCPTSshow(true)
    setshowAddPopup(false)
    setStatevalidations({
      ...validation,
      DOD: false,
      ValidDOD: false,
      UniqueDOD: false,
      AssignedComp: false,
      Status: false,
      Phone: false,
      ValidPhone: false,
      PASCode: false,
      ValidPASCode: false,
      Majcom: false,
      Installation: false,
      ValidInstallation: false,
      Organization: false,
      ValidOrganization: false,
      validDutyEmail: false
    })
    setDODvalue(item.DoDIDNumber)
    setStatusVal(item.Status)
    const phonenumber = fnPhonechange(item.DutyPhone)
    setPhoneval(phonenumber)
    setValue(item.PasCode.Title)
    setInsValue(item.PasCode.Installation)
    setOrgValue(item.PasCode.Organization)
    setCptsValue(item.PasCode.ServicingCPTS)
    setMajValue(item.PasCode.Organization)
    setOrgMajValue(item.PasCode.OrgMAJCOM)
    setEmail(item.DutyEmail)
    setDisName(item.disName)
    setCustID(item.CustomerID)
  }
  $(document).on('focusout', '#inputTextDutyPhone,#addinputTextDutyPhone', function () {
    const phonenumber = fnPhonechange(currentPhone)
    setPhoneval(phonenumber)
    $(this).val(phonenumber)
    $(this).attr('data-identifier', phonenumber)
  })

  function fnPhonechange (phonenumber: any) {
    if (phonenumber != '' && phonenumber != undefined && phonenumber != null) {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      phonenumber = phonenumber.replace(phoneRegex, '$1-$2-$3')
    }
    return phonenumber
  }
  $(document).on('keypress', '#inputTextDutyPhone,#addinputTextDutyPhone', function (event: any) {
    const charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault ? event.preventDefault() : event.returnValue = false
    }
  })
  const onClickAdd = () => {
    setshowAddPopup(!showAddPopup)
    setInEditMode({
      status: false,
      rowKey: null
    })
    setVal(false)
    setshow(false)
    setOrgMajdisplay(true)
    setDODvalue('')
    setStatusVal('')
    setPhoneval('')
    clearData()
    setStatevalidations({
      ...validation,
      DOD: false,
      ValidDOD: false,
      UniqueDOD: false,
      AssignedComp: false,
      Status: false,
      Phone: false,
      ValidPhone: false,
      PASCode: false,
      ValidPASCode: false,
      Majcom: false,
      Installation: false,
      ValidInstallation: false,
      Organization: false,
      ValidOrganization: false,
      validDutyEmail: false
    })
  }
  const onChangeHandler = (event: any) => {
    setValue(event.target.value)
    changePascode(event.target.value)
  }
  function changePascode(a: any) {
    const pascodeitems = PasCodelistItems.filter(
      (item: any) => item.name === a
    )
    if (pascodeitems.length > 0) {
      setCPTSshow(true)
      setOrgshow(true)
      setInstallationshow(true)
      setOrgMajdisplay(true)
      setInsValue(pascodeitems[0].Installation)
      setOrgValue(pascodeitems[0].Organization)
      setCptsValue(pascodeitems[0].CPTS)
      setMajValue(pascodeitems[0].MAJCOM)
      setOrgMajValue(pascodeitems[0].OrgMAJCOM)
      setValue(a)
      setPasID(pascodeitems[0].ID)
    } else {
      setCPTSshow(false)
      setOrgshow(false)
      setInstallationshow(false)
      setOrgMajdisplay(false)
      setInsValue('')
      setOrgValue('')
      setCptsValue('')
      setMajValue('')
      setValue(a)
    }
  }

  function changePASCodeYesorNo(a: any) {
    if (a.target.value === 'No') {
      const majpascodeitems = PasCodelistItems.filter(
        (item: any) => item.OrgMAJCOM === currentMaj
      )
      const dupmajpascodeitems = Array.from(new Set(majpascodeitems.map((v: any) => v.Installation)))
      setMajcomPas(majpascodeitems)
      setuniqueInsta(dupmajpascodeitems)
      selectinstallation(Insvalue)
      setVal(false)
      setshow(false)
      setOrgMajdisplay(true)
      setPascodeshow(true)
      clearData()
    } else {
      setVal(true)
      setshow(true)
      setOrgMajdisplay(false)
      setInstallationshow(false)
      setOrgshow(false)
      setCPTSshow(false)
      setPascodeshow(false)
    }
  }
  function changeMajcom(a: any) {
    const val = a.target.value
    if (val === 'Select') {
      setInstallationshow(false)
    }
    setInsValue('')
    setOrgshow(false)
    setCPTSshow(false)
    setPascodeshow(false)
    setOrgMajValue(val)
    const majpascodeitems = PasCodelistItems.filter(
      (item: any) => item.OrgMAJCOM === val
    )
    const dupmajpascodeitems = Array.from(new Set(majpascodeitems.map((v: any) => v.Installation)))
    if (!isDisabled && majpascodeitems.length > 0) {
      setInstallationshow(true)
    }
    setMajcomPas(majpascodeitems)
    setuniqueInsta(dupmajpascodeitems)
  }
  function changeInstallation(a: any) {
    const duplicatemajpascodeitems = Array.from(new Set(selMajcomPascodeData.map((v: any) => v.Installation)))
    setuniqueInsta(duplicatemajpascodeitems)
    const val = a.target.value
    setInsValue(a.target.value)
    const majpascodeitems = selMajcomPascodeData.filter(
      (item: any) => item.Installation === val
    )
    if (val === '' || majpascodeitems.length === 0) {
      setOrgshow(false)
      setOrgValue('')
      setCPTSshow(false)
      setPascodeshow(false)
    }
    const dupmajpascodeitems = Array.from(new Set(majpascodeitems.map((v: any) => v.Organization)))
    if (!isDisabled && majpascodeitems.length > 0) {
      setOrgshow(true)
    }
    setInstaPas(majpascodeitems)
    setuniqueOrg(dupmajpascodeitems)
  }
  function RenderMajcomDropdown() {
    getData()
    if (isDisabled === false) {
      let Majcomset = Array.from(new Set(PasCodelistItems?.filter((item: { OrgMAJCOM: any }) => item.OrgMAJCOM).map((item: { OrgMAJCOM: any }) => item.OrgMAJCOM)))
      Majcomset = Majcomset?.sort()
      if (Majcomset.length > 0) {
        return (
          <select name='"MAJCOM/DRU/FOA"' id='ddlMajcom' value={currentMaj} onChange={changeMajcom} aria-label="MAJCOM/DRU/FOA" disabled={isDisabled}>
            <option value={defaultOptionValue}>{defaultOptionValue}</option>
            {Majcomset.map((orgMajcom: any) => <option key={orgMajcom} value={orgMajcom}>{orgMajcom}</option>)}
          </select>
        )
      }
    } else {
      const pascodeitems = PasCodelistItems.filter(
        (item: any) => item.name === Pasvalue
      )
      const Majcomset = Array.from(new Set(pascodeitems?.filter((item: { OrgMAJCOM: any }) => item.OrgMAJCOM).map((item: { OrgMAJCOM: any }) => item.OrgMAJCOM)))
      if (Majcomset.length > 0) {
        return (
          <select name='"MAJCOM/DRU/FOA"' id='ddlMajcom' value={currentMaj} onChange={changeMajcom} aria-label="MAJCOM/DRU/FOA" disabled={isDisabled}>
            {Majcomset.map((orgMajcom: any) => <option key={orgMajcom} value={orgMajcom}>{orgMajcom}</option>)}
          </select>
        )
      } else {
        return (
          <select name='"MAJCOM/DRU/FOA"' id='ddlMajcom' value={currentMaj} onChange={changeMajcom} aria-label="MAJCOM/DRU/FOA" disabled={isDisabled}>
            {Majcomset.map((orgMajcom: any) => <option key={''} value={''}>{''}</option>)}
          </select>
        )
      }
    }
  }
  function changeOrganization(a: any) {
    const majcompascodeitems = selMajcomPascodeData.filter(
      (item: any) => item.Installation === Insvalue
    )
    const duplicatemajpascodeitem = Array.from(new Set(majcompascodeitems.map((v: any) => v.Organization)))
    setuniqueOrg(duplicatemajpascodeitem)
    const val = a.target.value
    if (val === '' || majcompascodeitems.length === 0) {
      setCPTSshow(false)
      setPascodeshow(false)
    }
    a = setOrgValue(a.target.value)
    const majpascodeitems = selInsPascodeData.filter(
      (item: any) => item.Organization === val
    )
    if (!isDisabled && majpascodeitems.length > 0) {
      setCPTSshow(true)
    }
    if (majpascodeitems.length > 0) {
      setCptsValue(majpascodeitems[0].CPTS)
      setMajValue(majpascodeitems[0].MAJCOM)
      setPasID(majpascodeitems[0].ID)
    }
  }
  function selectOrganization(a: any) {
    const val = a
    setOrgValue(a)
    const majpascodeitems = selInsPascodeData.filter(
      (item: any) => item.Organization === val
    )
    if (!isDisabled && majpascodeitems.length > 0) {
      setCPTSshow(true)
      setPascodeshow(true)
    }
    if (majpascodeitems.length > 0) {
      setCptsValue(majpascodeitems[0].CPTS)
      setMajValue(majpascodeitems[0].MAJCOM)
      setValue(majpascodeitems[0].name)
      setPasID(majpascodeitems[0].ID)
    }
  }
  function PascodeDiv() {
    return (
      <div className="flexitem" id="inputPASCODEDiv" style={{ visibility: showPascodeDiv ? 'visible' : 'hidden' }}>
        <div className="divformgroup forminline">
          <label htmlFor="inputTextPASCODE">PASCODE</label> <span className="mandatory">*</span>
          <span className="icon-Info">
            <span className="info-tooltip">
              <span className="classic">
                <span className="tooltipdescp">
                  <p>PASCODE</p>
                </span>
              </span>
            </span>
          </span>
          <div className="tooltip-wrap"><span className="tooltip-icon"><i className="icon-info"></i></span></div>
          <input type="text" className="formcontrol" name="PASCODE" id="inputTextPASCODE" aria-label="PASCODE" placeholder="PASCODE" aria-required="true" disabled={true} value={Pasvalue} />
        </div>
      </div>
    )
  }
  function setProfileData(onload: any) {
    getData()
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    if (loginUserProfile && loginUserProfile.length > 0) {
      setVal(true)
      setshow(true)
      setOrgMajdisplay(true)
      setInstallationshow(true)
      setOrgshow(true)
      setCPTSshow(true)
      setAssignedComp(currentAssignedComp)
      setInsValue(Insvalue)
      setOrgValue(Orgvalue)
      setValue(Pasvalue)
      setCptsValue(CptsVal)
      setMajValue(MajVal)
      setOrgMajValue(currentMaj)
      if (onload) {
        setDODvalue(loginUserProfile[0].DoDIDNumber)
        setStatusVal(loginUserProfile[0].Status)
        const phonenumber = fnPhonechange(loginUserProfile[0].DutyPhone)
        setPhoneval(phonenumber)
      }
    }
  }
  function getData() {
    const pascodeitems: any = []
    getByID(1).then((DBData: any) => {
      if (DBData !== undefined && DBData !== null) {
        if (DBData.items && DBData.items.length > 0) {
          DBData.items?.map((item: any) => {
            if (item.IsArchived === false) {
              pascodeitems.push({
                ID: item.ID,
                name: item.Title,
                Organization: item.Organization,
                Installation: item.Installation,
                MAJCOM: item.MAJCOM,
                CPTS: item.ServicingCPTS,
                AssignedComponent: item.AssignedComponent,
                IsArchived: item.IsArchived,
                OrgMAJCOM: item.OrgMAJCOM
              })
            }
          })
        }
      }
      setPasCodeItems(pascodeitems)
    })
  }
  function clearData() {
    setValue('')
    setOrgMajValue('select')
    setInsValue('')
    setOrgValue('')
    setCPTSshow(false)
    setPascodeshow(false)
    setInstallationshow(false)
    setOrgshow(false)
    setCptsValue('')
    setMajValue('')
  }
  function selectinstallation(a: any) {
    const val = a
    setInsValue(a)
    if (val === '') {
      setOrgshow(false)
      setCPTSshow(false)
      setPascodeshow(false)
    }
    const majpascodeitems = selMajcomPascodeData.filter(
      (item: any) => item.Installation === val
    )
    const dupmajpascodeitems = Array.from(new Set(majpascodeitems.map((v: any) => v.Organization)))
    if (!isDisabled && majpascodeitems.length > 0) {
      setOrgshow(true)
    }
    setInstaPas(majpascodeitems)
    setuniqueOrg(dupmajpascodeitems)
  }
  function validateDoDID(dodnumber: any) {
    let isValidateDoD = true
    if (dodnumber !== null || dodnumber !== '') {
      const regex = /^[0-9\b]+$/
      if ((dodnumber.length !== 10) || (!regex.test(dodnumber))) {
        isValidateDoD = false
      }
    }
    return isValidateDoD
  }
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
  function validateData(column: any, value: any, arr: any) {
    let items = []
    if (column === 'name') {
      items = arr.filter(
        (a: any) => a.name === value
      )
    }
    if (column === 'Installation') {
      items = arr.filter(
        (a: any) => a.Installation === value
      )
    }
    if (column === 'Organization') {
      items = arr.filter(
        (a: any) => a === value
      )
    }
    if (items.length > 0) {
      return false
    } else {
      return true
    }
  }
  function changePhone (e: any) {
    let phonenumber = e.target.value
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    phonenumber = phonenumber.replace(phoneRegex, '$1$2$3')
    setPhoneval(phonenumber)
  }

  const validate = (id: any) => {
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    let valid = true
    setStatevalidations({
      ...validation,
      DOD: false,
      ValidDOD: false,
      UniqueDOD: false,
      AssignedComp: false,
      Status: false,
      Phone: false,
      ValidPhone: false,
      PASCode: false,
      ValidPASCode: false,
      Majcom: false,
      Installation: false,
      ValidInstallation: false,
      Organization: false,
      ValidOrganization: false,
      validDutyEmail: false
    })
    const validationset = {
      DOD: false,
      ValidDOD: false,
      UniqueDOD: false,
      AssignedComp: false,
      Status: false,
      Phone: false,
      ValidPhone: false,
      PASCode: false,
      ValidPASCode: false,
      Majcom: false,
      Installation: false,
      ValidInstallation: false,
      Organization: false,
      ValidOrganization: false,
      validdutyemail: false
    }
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      const phonenumber = currentPhone.replace(phoneRegex, '$1$2$3')
    if (email === '' || email === undefined || email === null) {
      validationset.validdutyemail = true
      valid = false
    }
    if (DodVal === '' || DodVal === null) {
      validationset.DOD = true
      valid = false
    } else if (!validateDoDID(DodVal)) {
      validationset.ValidDOD = true
      valid = false
    } else {
      // const data: any = validateUniqueDod(DodVal, currentStatus, LoginUserName().UserId, pos)
      const validDod = validateUniqueDod(DodVal, currentStatus, id)
      if (validDod && currentStatus !== '') {
        validationset.UniqueDOD = true
        valid = false
      }
    }

    if (currentAssignedComp === '' || currentAssignedComp === null) {
      validationset.AssignedComp = true
      valid = false
    }
    if (currentStatus === '' || currentStatus === null) {
      validationset.Status = true
      valid = false
    }
    if (currentPhone === '' || currentPhone === null) {
      validationset.Phone = true
      valid = false
    } else if ((currentPhone.length > 12) || (!validatePhone(phonenumber)) || (currentPhone.length < 10)) {
      validationset.ValidPhone = true
      valid = false
    }
    if ((Pasvalue === '' || Pasvalue === null) && isDisabled) {
      validationset.PASCode = true
      valid = false
    } else if (validateData('name', Pasvalue, PasCodelistItems) && isDisabled) {
      validationset.ValidPASCode = true
      valid = false
    }
    if ((currentMaj === '' || currentMaj === null || currentMaj === 'Select' || currentMaj === 'select') && showOrgMaj) {
      validationset.Majcom = true
      valid = false
    }
    if ((Insvalue === '' || Insvalue === null) && showInst) {
      validationset.Installation = true
      valid = false
    } else if ((validateData('Installation', Insvalue, selInsPascodeData)) && !isDisabled && showInst) {
      validationset.ValidInstallation = true
      valid = false
    }
    if ((Orgvalue === '' || Orgvalue === '') && showOrg) {
      validationset.Organization = true
      valid = false
    } else if ((validateData('Organization', Orgvalue, uniqueOrg)) && !isDisabled && showOrg) {
      validationset.ValidOrganization = true
      valid = false
    }
    setStatevalidations({
      ...validation,
      DOD: validationset.DOD,
      ValidDOD: validationset.ValidDOD,
      UniqueDOD: validationset.UniqueDOD,
      AssignedComp: validationset.AssignedComp,
      Status: validationset.Status,
      Phone: validationset.Phone,
      ValidPhone: validationset.ValidPhone,
      PASCode: validationset.PASCode,
      ValidPASCode: validationset.ValidPASCode,
      Majcom: validationset.Majcom,
      Installation: validationset.Installation,
      ValidInstallation: validationset.ValidInstallation,
      Organization: validationset.Organization,
      ValidOrganization: validationset.ValidOrganization,
      validDutyEmail: validationset.validdutyemail
    })
    if (valid) {
      saveOrUpdateProfile(id)
    }
    return valid
  }
  const saveOrUpdateProfile = (id: any) => {
    setshowAddPopup(false)
    setInEditMode({
      status: false,
      rowKey: null
    })
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      const phonenumber = currentPhone.replace(phoneRegex, '$1$2$3')
    const addObj = {
      AssignedComponent: 'RegAF',
      DoDIDNumber: DodVal,
      CustomerID: custID,
      DutyEmail: email,
      disName: Disname,
      DutyPhone: phonenumber,
      Status: currentStatus,
      PasCodeId: PasCodeID
    }
    if (id !== '' && id !== null && id !== undefined) {
      sp.web.lists.getByTitle(ListNames().UserProfile).items.getById(id).update(addObj).then(function () {
        BuildmodifiedListUpdate()
      })
    } else {
      sp.web.lists.getByTitle(ListNames().UserProfile).items.add(addObj).then(function () {
        BuildmodifiedListUpdate()
      })
    }
  }
  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'UserProfile') {
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
  function validateUniqueDod(Dod: any, Status: any, id: any) {
    let data = []
    if (Status === 'Active Duty') {
      data = listItems?.filter(
        (data: any) => {
          return (
            data.DoDIDNumber.toLowerCase().includes(Dod.toLowerCase()) &&
            data.Status.toLowerCase().includes(Status.toLowerCase()) &&
            data.Id !== id
          )
        })
    } else {
      data = listItems?.filter(
        (data: any) => {
          return (
            data.DoDIDNumber.toLowerCase().includes(Dod.toLowerCase()) &&
            (data.Status.toLowerCase().includes('civilian') || data.Status.toLowerCase().includes('contractor')) && data.Id !== id
          )
        })
    }
    if (data.length > 0) return true
    else return false
  }
  const onSearch = () => {
    const searchword = inputValue
    setInputValue(searchword)
    if (searchword !== '') {
      setemptysearch(false)
      const filtereddata = FilterItems?.filter(
        (data: any) => {
          return (
            data.DoDIDNumber.toLowerCase().includes(searchword.toLowerCase()) ||
            data.DutyEmail.toLowerCase().includes(searchword.toLowerCase()) ||
            data.DutyPhone.toLowerCase().includes(searchword.toLowerCase()) ||
            String(data.CustomerID).toLowerCase().includes(searchword.toLowerCase()) ||
            data.PasCode.Title.toLowerCase().includes(searchword.toLowerCase()) ||
            data.PasCode.ServicingCPTS.toLowerCase().includes(searchword.toLowerCase()) ||
            data.PasCode.Installation.toLowerCase().includes(searchword.toLowerCase()) ||
            data.PasCode.MAJCOM.toLowerCase().includes(searchword.toLowerCase()) ||
            data.PasCode.Organization.toLowerCase().includes(searchword.toLowerCase()) ||
            data.PasCode.OrgMAJCOM.toLowerCase().includes(searchword.toLowerCase())
          )
        }
      )
      setFilterItems(filtereddata)
    } else {
      setFilterItems(listItems)
      setemptysearch(true)
    }
  }
  const changepeople = (e: any) => {
    setDisName(e.target.value)
    setEmail('')
    if (e.target.value === '') {
      setPp(true)
      setEmail('')
    }
  }
  return (
    <>
    {
      isProfileExist
        ? (
    <section className="divcontainer boxsizing divuserprofilesettings">

      <div className="divhomeheader">
        <h1><span className="icon-Usergroups"></span>USER PROFILES <span className="spanprofilecount">{FilterItems?.length}</span></h1>
        <div className="divactionitems">
          <div className="divsearch">
            <div id="search-control-wrapper">

              <input type="text" name="search"
                placeholder="Search with DoD, Duty Email,Servicing Comptroller, Installation/Assigned Location, Organization, PASCODE"
                className="" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }} />
              {emptysearch
                ? (
                  <span className="errormsg spanerromsg" >You cant leave this blank</span>
                )
                : ''
              }

              <a href="javascript:void(0)" title="Search" className="anchorsearchbtn" id="search-user-btn" onClick={(e) => onSearch()}>
                <span className="icon-searchleft" ></span>Search</a></div>

          </div>
          <a href="javascript:void(0)" title="Add" className="anchoraddbtn" id="anchoraddbtn" onClick={() => { onClickAdd() }}><span className="icon-Add"></span> Add</a>
        </div>
      </div>
      {
        showAddPopup
          // eslint-disable-next-line multiline-ternary
          ? (<div className="divProfilecontainer" id="divProfilecontainer" >
            <div className="row">
              <div className="col-md-12 col-xs-12">
                <div className="divprofilehead">
                  <div className="divprofileheader">
                    <h2>ADD PEOPLE</h2>

                  </div>

                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 col-xs-12">
                <div className="divformbody">
                  <h2>Personal Details</h2>
                </div>
              </div>

              <div className="col-md-12 col-xs-12">
                <div className="divflexcontainer">
                  <div className="divflexitem">
                    <div className="divformgroup">
                      <label htmlFor="inputTextDoDIDNumber">
                        DoD ID Number</label> <span className="mandatory">
                        *</span>

                      <input type="text" name="DoD ID Number" id="inputTextDoDIDNumber" className="formcontrol"
                        maxLength={10} placeholder="1234567890" aria-required="true"
                        aria-label="DoD ID Number" spellCheck="true" autoFocus = {true} value={DodVal} onChange={(e) => setDODvalue(e.target.value)} />
                      {
                        validation.DOD
                          ? (
                            <p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please Enter DOD ID Number</p>
                          )
                          : ''
                      }
                      {validation.ValidDOD
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please Enter Valid DOD ID Number</p>)
                        : ''}
                      {validation.UniqueDOD
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Already Profile Exists for the Entered DOD ID with given Status.</p>)
                        : ''}
                    </div>
                  </div>
                  <div className="divflexitem">
                    <div className="divformgroup">
                      <label htmlFor="SelectdropdownYourAssignedComponent">Your Assigned Component</label> <span
                        className="mandatory">
                        *</span>
                      <select name="Your Assigned Component" id="SelectdropdownYourAssignedComponent"
                        aria-required="true" aria-label="Your Assigned Component"
                        data-identifier="Regular Air Force" value={currentAssignedComp} onChange={changeAssignedComponent}>
                        <option value="RegAF" data-id="RegAF">RegAF</option>
                      </select>
                    </div>
                  </div>
                  <div className="divflexitem">
                    <div className="divformgroup divcustomPeoplepicker divpperrormsg">
                      <label htmlFor="inputTextDutyEmail">Duty Email</label> <span className="mandatory">
                        *</span>
                      <SpPeoplePicker onSelect={handleSelect} onChange={handleSelect} />
                      {validation.validDutyEmail
                        ? (<p className="errormsg UserProfileEr pocvalidatemsg" id="UserProfileMajcomErr0">Please enter Duty Email</p>)
                        : ''}
                    </div>
                  </div>

                  <div className="divflexitem">
                    <div className="divformgroup">
                      <label htmlFor="ddlStatus">Status</label> <span className="mandatory">
                        *</span>

                      <select name="Status" id="ddlStatus" className="formcontrol" aria-required="true"
                        aria-label="Status" data-identifier="AB" value={currentStatus} onChange={(e) => setStatusVal(e.target.value)}>
                        <option value="">Select</option>
                        <option value="Active Duty">Active Duty</option>
                        <option value="Civilian" selected>Civilian</option>
                        <option value="Contractor">Contractor</option>
                      </select>
                      {validation.Status
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter Status</p>)
                        : ''}
                    </div>
                  </div>
                  <div className="divflexitem">
                    <div className="divformgroup">
                      <label htmlFor="inputTextDutyPhone">
                        Duty Phone</label> <span className="mandatory">
                        *</span>

                      <input type="text" id="addinputTextDutyPhone" maxLength={12} placeholder="Example 123-555-6789"
                        className="formcontrol" aria-required="true" aria-label="Duty Phone" spellCheck="true"
                        data-identifier="555-754-3010" value={currentPhone} onChange={changePhone} onClick={changePhone} />
                      {validation.Phone
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter Duty Phone</p>)
                        : ''}
                      {validation.ValidPhone
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter valid Duty Phone</p>)
                        : ''}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className='row'>
              <div className="col-md-12 col-xs-12">
                <div className="divformbody">
                  <h2>Organization Details</h2>
                </div>
              </div>
              <div className="col-md-12 col-xs-12">
                <div className="divflexcontainer divorgflexcontainer">
                  <div className="divflexitem">
                    <div className="divformgroup divknowpascode">
                      <label htmlFor="up_pascode">
                        Do you know the PASCODE? </label>
                      <span className='mandatory'>*</span>
                      <div className="divradiobutns" id="pascoderadiobtn" onChange={changePASCodeYesorNo}>
                        <label htmlFor="inputRadioPASCODEYes">
                          <input type="radio" name="Unit PASCODE" id="inputRadioPASCODEYes"
                            aria-label="Yes" value="Yes" checked={isDisabled} />
                          YES
                        </label>
                        <label htmlFor="inputRadioPASCODENo">
                          <input type="radio" name="Unit PASCODE" id="inputRadioPASCODENo" aria-label="No" value="No"
                            checked={!isDisabled} />
                          NO
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="divflexitem" style={{ display: showInfo ? 'block' : 'none' }}>
                    <div className="divformgroup" >
                      <label htmlFor="inputTextPascode">PASCODE </label>
                      <span className="mandatory">*</span>

                      <div className='divAutocompleteInput divpascodeinput'>
                        <Autocomplete data-class='test'
                          // Items is the list of suggestions displayed while the user type
                          items={(Pasvalue !== '' && Pasvalue.length > 1) ? PasCodelistItems : []}

                          shouldItemRender={
                            (item, value
                            ) => (item.name.toLowerCase()
                              .indexOf(value.toLowerCase()) > -1)
                          }
                          getItemValue={item => item.name}
                          renderItem={(item, isHighlighted) =>
                            // Styling to highlight selected item
                            <div style={{
                              background: isHighlighted
                                ? '#1E90FF'
                                : 'white',
                              color: isHighlighted
                                ? '#FFF'
                                : ''
                            }}
                              key={item.id}>
                              {item.name}
                            </div>
                          }
                          value={Pasvalue}
                          onChange={onChangeHandler}
                          onSelect={changePascode}
                          // Added style in Autocomplete component
                          inputProps={{
                            placeholder: 'PASCODE'
                          }}
                        />
                      </div>
                      {validation.PASCode
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter PASCODE</p>)
                        : ''}
                      {validation.ValidPASCode
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter valid PASCODE</p>)
                        : ''}
                    </div>
                  </div>
                  <div className="divflexitem" style={{ display: showOrgMaj && !isDisabled ? '' : 'none' }}>
                    <div className="divformgroup" >
                      <label htmlFor="inputTextMajcom">MAJCOM/DRU/FOA</label> <span className="mandatory">*</span>

                      {RenderMajcomDropdown()}
                      {validation.Majcom
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter MAJCOM/DRU/FOA</p>)
                        : ''}
                    </div>
                  </div>
                  <div className="divflexitem" style={{ display: showOrgMaj && isDisabled && Pasvalue ? '' : 'none' }}>
                    <div className="divformgroup" >
                      <label htmlFor="inputTextMajcom">MAJCOM/DRU/FOA</label> <span className="mandatory">*</span>

                      <input type="text" name='PhoneNumber' id="inputTextMAJCOM" maxLength={16}
                        aria-required="true" value={currentMaj} disabled={isDisabled} />
                    </div>
                  </div>
                  <div className="divflexitem">
                    <div className="divformgroup" style={{ visibility: showInst ? 'visible' : 'hidden' }}>
                      <label htmlFor="inputTextInstallation">Installation/Assigned Location</label> <span className="mandatory">*</span>

                      <div className='divAutocompleteInput divwidthauto'>
                        <Autocomplete items={(Insvalue !== '' && Insvalue.length > 1) ? uniqueInsta : []} shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
                          getItemValue={item => item}
                          renderItem={(item, isHighlighted) =>
                            <div style={{
                              background: isHighlighted
                                ? '#1E90FF'
                                : 'white',
                              color: isHighlighted
                                ? '#FFF'
                                : ''
                            }}
                              key={item.id}>
                              {item}
                            </div>
                          }
                          value={Insvalue}
                          onChange={changeInstallation}
                          onSelect={selectinstallation}
                          inputProps={{
                            style: {
                              width: '100%'

                            },
                            placeholder: 'Search and Select Installation/Assigned Location',
                            disabled: isDisabled
                          }}
                        />
                      </div>
                      {validation.Installation
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter Installation</p>)
                        : ''}
                      {validation.ValidInstallation
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Search and select valid Installation</p>)
                        : ''}
                    </div>
                  </div>
                  <div className="divflexitem">
                    <div className="divformgroup" style={{ visibility: showOrg ? 'visible' : 'hidden' }}>
                      <label htmlFor="inputTextOrganization">Organization/Unit Name</label> <span className="mandatory">*</span>

                      <div className='divAutocompleteInput divwidthauto'>
                        <Autocomplete items={(Orgvalue !== '' && Orgvalue.length > 1) ? uniqueOrg : []} shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
                          getItemValue={item => item}
                          renderItem={(item, isHighlighted) =>
                            <div style={{
                              background: isHighlighted
                                ? '#1E90FF'
                                : 'white',
                              color: isHighlighted
                                ? '#FFF'
                                : ''
                            }}
                              key={item.id}>
                              {item}
                            </div>
                          }
                          // noOptionsText ={'Your Customized No Options Text'}
                          value={Orgvalue}
                          onChange={changeOrganization}
                          onSelect={selectOrganization}
                          inputProps={{
                            style: {
                              width: '100%'

                            },
                            placeholder: 'Search and Select Installation/Assigned Location',
                            disabled: isDisabled
                          }}
                        />
                      </div>
                      {validation.Organization
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please enter Organization</p>)
                        : ''}
                      {validation.ValidOrganization
                        ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Search and select valid Organization</p>)
                        : ''}
                    </div>
                  </div>
                  <div className="divflexitem">
                    <div className="divformgroup" style={{ visibility: showCPTS ? 'visible' : 'hidden' }}>
                      <label htmlFor="inputTextServicingComptroller">Servicing Comptroller</label> <span className="mandatory">*</span>

                      <input type="text" name="Servicing Comptroller" id="inputTextServicingComptroller" value={CptsVal}
                        maxLength={10} placeholder="Servicing Comptroller" aria-label="Organization/Unit Name"
                        disabled={true} />
                    </div>
                  </div>
                  <div className="divflexitem">
                    <div className="divformgroup" style={{ visibility: showCPTS ? 'visible' : 'hidden' }}>
                      <label htmlFor="inputTextServicingMajcom">Servicing MAJCOM</label> <span className="mandatory">*</span>

                      <input type="text" name="Servicing MAJCOM" id="inputTextServicingMajcom" maxLength={10} value={MajVal}
                        placeholder="Servicing Majcom" aria-label="Servicing MAJCOM" disabled={true} />
                    </div>
                  </div>
                  {!isDisabled === true ? PascodeDiv() : ''}
                </div>
              </div>
            </div>
            <div className="divpopupfooter">
              <ul>
                <li><a href="javascript:void(0)" title="Save" className="anchorsavebtn" onClick={() => validate('')}>
                  <span className="icon-Save"></span>
                  Save</a></li>
                <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchorglobalcancelbtn"
                  id="quicklinkcancelbtn" onClick={() => { setshowAddPopup(false) }}>
                  <span className="icon-Close"></span>
                  Cancel</a></li>
              </ul>
            </div>

          </div>
          ) : ''
      }

      <div className="tabcontent divuserprofilescontent">

        <div className="divcontentarea" >
          <ul aria-label="userprofiles" className="ulaccordians" id="userprofiles">
            {FilterItems?.length && FilterItems?.length > 0
              ? FilterItems?.map((item: any) =>
                <li key={item.ID} className='profile' >
                  <div className="divcard divaccordiancard" aria-controls="userprofilescontent-1"
                    aria-expanded={(Accordion.status && Accordion.rowKey === item.ID && !inEditMode.status)} id="accordion-control-1" onClick={() => {
                      if (!inEditMode.status) {
                        setAcc({
                          status: (Accordion.rowKey === item.ID) ? !Accordion.status : true,
                          rowKey: item.Id
                        })
                      }
                    }}>
                    <div className="divitem">
                      <p>DoD ID Number</p>
                      <span id="kbTitletext-32">{item.DoDIDNumber}</span>
                    </div>
                    <div className="divitem">
                      <p>Customer ID</p><span>{item.CustomerID}</span>
                    </div>
                    <div className="divitem">
                      <p>Status</p><span>{item.Status}</span>
                    </div>
                    <div className="divitem">
                      <p>Duty Email</p><span>{item.DutyEmail}</span>
                    </div>
                    <div className="divitem">
                      <p>Duty Phone</p><span>{fnPhonechange(item.DutyPhone)}</span>
                    </div>
                  </div>
                  <div className="divitem divcustomactions">
                    <p>Actions</p>
                    <ul>
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit"
                        id="anchorEditFolderNamepolicy" onClick={() => { onEdit(item) }}><span className="icon-Edit"></span> Edit</a></li>

                    </ul>
                  </div>
                  {inEditMode.status && inEditMode.rowKey === item.Id
                    ? (
                      <div className="divcardedit divcardeditpopup divcardadddocument" id="editFolder0">
                        <div id="profileform" className="divprofilefields">
                          <h5 className="profileinfoheadding">Personal Details</h5>
                          <div className="flex-container personaldets mobileflex">

                            <div className="flexitem divdodnumber">
                              <div className="divformgroup forminline">
                                <label htmlFor="inputTextDoDIDNumber">
                                  DoD ID Number</label> <span className="mandatory">
                                  *</span>
                                <input type="text" name="DoD ID Number" id="inputTextDoDIDNumber" className="formcontrol" maxLength={10} placeholder="Enter Your DoD ID Number" aria-required="true" aria-label="DoD ID Number" spellCheck="true" value={DodVal} onChange={(e) => setDODvalue(e.target.value)} />
                                {
                                  validation.DOD
                                    ? (
                                      <p className="errormsg UserProfileEr" id="UserProfileDoDIDNumberErr0">Please enter DoD ID Number</p>
                                    )
                                    : ''
                                }
                                {
                                  validation.ValidDOD
                                    ? (
                                      <p className="errormsg UserProfileEr" id="UserProfileDoDIDNumberErr0">Enter valid DoD ID Number</p>
                                    )
                                    : ''
                                }
                                {validation.UniqueDOD
                                  ? (<p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Already Profile Exists for the Entered DOD ID with given Status.</p>)
                                  : ''}

                              </div>
                            </div>

                            <div className="flexitem">
                              <div className="divformgroup">
                                <label htmlFor="SelectdropdownYourAssignedComponent">Your Assigned Component</label> <span
                                  className="mandatory">
                                  *</span>

                                <select name="Your Assigned Component" id="SelectdropdownYourAssignedComponent"
                                  aria-required="true" aria-label="Your Assigned Component"
                                  data-identifier="Regular Air Force" value={currentAssignedComp} onChange={changeAssignedComponent}>
                                  <option value="RegAF" data-id="RegAF">RegAF</option>
                                </select>
                              </div>
                            </div>
                            <div className="flexitem divdutyemail">
                              <div className="divformgroup forminline divcustomPeoplepicker divpperrormsg">
                                <label htmlFor="inputTextDutyEmail">Duty Email </label><span className="mandatory">*</span>
                                {!pp
                                  ? (<input value={Disname} onChange={(e) => changepeople(e)}></input>)
                                  : ''}
                                {
                                  pp
                                    ? (
                                      <SpPeoplePicker onSelect={handleSelect} onChange={handleSelect} />
                                    )
                                    : ''
                                }

                                {
                                  validation.validDutyEmail
                                    ? (
                                      <p className="errormsg UserProfileEr pocvalidatemsg" id="UserProfileDutyEmailErr0">Please enter Duty Email</p>
                                    )
                                    : ''
                                }
                              </div>
                            </div>
                            <div className="flexitem">
                              <div className="divformgroup forminline">
                                <label htmlFor="ddlStatus">Status</label> <span className="mandatory">*</span>
                                <select name="status" id="ddlStatus" className="formcontrol clrank cls-form-edit" aria-required="true" aria-label="Status" value={currentStatus} onChange={(e) => setStatusVal(e.target.value)}>
                                  <option value="">Select</option>
                                  <option value="Active Duty">Active Duty</option>
                                  <option value="Civilian" selected>Civilian</option>
                                  <option value="Contractor">Contractor</option>
                                </select>
                                {
                                  validation.Status
                                    ? (
                                      <p className="errormsg UserProfileEr" id="UserProfileStatusErr0">Please select Status</p>
                                    )
                                    : ''
                                }
                              </div>
                            </div>
                            <div className="flexitem">
                              <div className="divformgroup forminline">
                                <label htmlFor="inputTextDutyPhone"> Duty Phone</label> <span className="mandatory">*</span>
                                <input type="text" id="inputTextDutyPhone" maxLength={12} placeholder="Example 123-555-6789" className="formcontrol cls-form-edit" aria-required="true" aria-label="Duty Phone" spellCheck="true" value={currentPhone} onClick={changePhone} onChange={changePhone} />
                                {
                                  validation.Phone
                                    ? (
                                      <p className="errormsg UserProfileEr" id="UserProfileDutyPhoneNumberErr0">Please enter Duty Phone</p>
                                    )
                                    : ''
                                }
                                {
                                  validation.ValidPhone
                                    ? (
                                      <p className="errormsg UserProfileEr" id="UserProfileDutyPhoneNumberErr0">Enter valid Contact Phone Number</p>
                                    )
                                    : ''
                                }
                              </div>
                            </div>
                          </div>
                          <div className="userprofiles">
                            <div className="accordion">
                              <h4 className="regular accordionheading accordion-toggle active hidden" aria-expanded="true">
                                Civilian Contractor
                                <div className="fltr">
                                  <a href="javascript:void(0)" className="currentlink">
                                    Set as Current</a>
                                  <a href="javascript:void(0)" className="edit" title="Edit"><i className="icon-pencil"></i></a>
                                  <a href="javascript:void(0)" className="delete" title="Delete"><i className="icon-trash"></i></a>
                                  <i className="icon icon-chevron-up" title="Collapse"></i>
                                </div>
                              </h4>
                              <div className="accordionbody accordion-content" id="OrganizationSection">
                                <div className="formheading">
                                  <h5 className="profileinfoheadding">Organization Details</h5>
                                </div>
                                <div className="flex-container mobileflex flex-passcode">
                                  <div className="flexitem" id="pascodeyesorno">
                                    <div className="divformgroup forminline" >
                                      <label htmlFor="up_pascode">
                                        Do you know the Unit PASCODE?    </label> <span className="mandatory">*</span>
                                      <div className="divradiobutns" id="pascoderadiobtn" onChange={changePASCodeYesorNo}>
                                        <label htmlFor="editinputRadioPASCODEYes">
                                          <input type="radio" name="Unit PASCODE" id="editinputRadioPASCODEYes" aria-label="Yes" value="Yes" checked={isDisabled} /> YES
                                        </label>
                                        <label htmlFor="editinputRadioPASCODENo"><input type="radio" name="Unit PASCODE" id="editinputRadioPASCODENo" aria-label="No" value="No" checked={!isDisabled} />NO</label>

                                      </div>
                                    </div>
                                  </div>
                                  <div className="flexitem" id="inputPASCODEDiv" style={{ display: showInfo ? 'block' : 'none' }}>
                                    <div className="divformgroup forminline">
                                      <label htmlFor="inputTextPASCODE">PASCODE</label>  <span className="mandatory">*</span>
                                      <div className='divAutocompleteInput divpascodeinput'>
                                        <Autocomplete data-class='test'
                                          // Items is the list of suggestions displayed while the user type
                                          items={(Pasvalue !== '' && Pasvalue.length > 1) ? PasCodelistItems : []}

                                          shouldItemRender={
                                            (item, value
                                            ) => (item.name.toLowerCase()
                                              .indexOf(value.toLowerCase()) > -1)
                                          }
                                          getItemValue={item => item.name}
                                          renderItem={(item, isHighlighted) =>
                                            // Styling to highlight selected item
                                            <div style={{
                                              background: isHighlighted
                                                ? '#1E90FF'
                                                : 'white',
                                              color: isHighlighted
                                                ? '#FFF'
                                                : ''
                                            }}
                                              key={item.id}>
                                              {item.name}
                                            </div>
                                          }
                                          value={Pasvalue}
                                          onChange={onChangeHandler}
                                          onSelect={changePascode}
                                          // Added style in Autocomplete component
                                          inputProps={{
                                            placeholder: 'PASCODE'
                                          }}
                                        /></div>
                                      <span id="pascodeResult"></span>
                                    </div>
                                    {
                                      validation.PASCode
                                        ? (
                                          <p className="errormsg UserProfileEr" id="UserProfileinputPASCodeError0">Please enter PAS Code</p>
                                        )
                                        : ''
                                    }
                                    {
                                      validation.ValidPASCode
                                        ? (
                                          <p className="errormsg UserProfileEr" id="UserProfileinputPASCodeError0">Please enter valid PAS Code</p>
                                        )
                                        : ''
                                    }
                                  </div>
                                  <div className="flexitem passcodesec" id="sectionMajcom" style={{ display: showOrgMaj && !isDisabled ? '' : 'none' }}>
                                    <div className="divformgroup forminline">
                                      <label htmlFor="ddlMajcom">MAJCOM/DRU/FOA</label><span className="mandatory">*</span>
                                      {RenderMajcomDropdown()}
                                      {
                                        validation.Majcom
                                          ? (
                                            <p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please select MAJCOM/DRU/FOA</p>
                                          )
                                          : ''
                                      }
                                    </div>
                                  </div>
                                  <div className="flexitem passcodesec" id="sectionMajcom" style={{ display: showOrgMaj && isDisabled ? '' : 'none' }}>
                                    <div className="divformgroup forminline">
                                      <label htmlFor="ddlMajcom">MAJCOM/DRU/FOA</label><span className="mandatory">*</span>
                                      <input type="text" maxLength={255} className="formcontrol" spellCheck="true" name="MAJCOM/DRU/FOA" id="inputTextMajcom" aria-label="MAJCOM/DRU/FOA" placeholder="MAJCOM/DRU/FOA" value={currentMaj} disabled={isDisabled} />
                                    </div>
                                  </div>
                                  <div className="flexitem passcodesec" id="sectionInstallation" style={{ visibility: showInst ? 'visible' : 'hidden' }}>
                                    <div className="divformgroup forminline">
                                      <label htmlFor="inputTextInstallation">Installation/Assigned Location</label> <span className="mandatory">*</span>
                                      <div className='divAutocompleteInput divwidthauto'>
                                        <Autocomplete items={(Insvalue !== '' && Insvalue.length > 1) ? uniqueInsta : []} shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
                                          getItemValue={item => item}
                                          renderItem={(item, isHighlighted) =>
                                            <div style={{
                                              background: isHighlighted
                                                ? '#1E90FF'
                                                : 'white',
                                              color: isHighlighted
                                                ? '#FFF'
                                                : ''
                                            }}
                                              key={item.id}>
                                              {item}
                                            </div>
                                          }
                                          value={Insvalue}
                                          onChange={changeInstallation}
                                          onSelect={selectinstallation}
                                          inputProps={{

                                            placeholder: 'Search and Select Installation/Assigned Location',
                                            disabled: isDisabled
                                          }}
                                        /></div>{
                                        validation.Installation
                                          ? (
                                            <p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please Enter Installation/Assigned Location</p>
                                          )
                                          : ''
                                      }
                                      {
                                        validation.ValidInstallation
                                          ? (
                                            <p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Search and Select Valid Installation/Assigned Location</p>
                                          )
                                          : ''
                                      }
                                    </div>
                                  </div>
                                  <div className="flexitem passcodesec" id="sectionOrganization" style={{ visibility: showOrg ? 'visible' : 'hidden' }}>
                                    <div className="divformgroup forminline">
                                      <label htmlFor="inputTextOrganizationUnitName">Organization/Unit Name</label><span className="mandatory"> *</span>
                                      <div className='divAutocompleteInput divwidthauto'>
                                        <Autocomplete items={(Orgvalue !== '' && Orgvalue.length > 1) ? uniqueOrg : []} shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
                                          getItemValue={item => item}
                                          renderItem={(item, isHighlighted) =>
                                            <div style={{
                                              background: isHighlighted
                                                ? '#1E90FF'
                                                : 'white',
                                              color: isHighlighted
                                                ? '#FFF'
                                                : ''
                                            }}
                                              key={item.id}>
                                              {item}
                                            </div>
                                          }
                                          // noOptionsText ={'Your Customized No Options Text'}
                                          value={Orgvalue}
                                          onChange={changeOrganization}
                                          onSelect={selectOrganization}
                                          inputProps={{

                                            placeholder: 'Search and Select Installation/Assigned Location',
                                            disabled: isDisabled
                                          }}
                                        /></div>
                                      {
                                        validation.Organization
                                          ? (
                                            <p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Please Enter Organization</p>
                                          )
                                          : ''
                                      }
                                      {
                                        validation.ValidOrganization
                                          ? (
                                            <p className="errormsg UserProfileEr" id="UserProfileMajcomErr0">Search and Select Valid Organization</p>
                                          )
                                          : ''
                                      }
                                    </div>
                                  </div>
                                  <div className="flexitem passcodesec" id="servicingcpts" style={{ visibility: showCPTS ? 'visible' : 'hidden' }}>
                                    <div className="divformgroup forminline">
                                      <label htmlFor="inputTextServicingComptroller">Servicing Comptroller   </label> <span className="mandatory">*</span>
                                      <input type="text" className="formcontrol" value={CptsVal} spellCheck="true" name="Servicing Comptroller" id="inputTextServicingComptroller" aria-label="Servicing Comptroller" placeholder="Servicing Comptroller" aria-required="true" disabled />
                                      <p className="errormsg UserProfileEr" id="UserProfileCptsErr0" style={{ display: 'none' }}>Please enter PAS Code</p>

                                    </div>
                                  </div>
                                  <div className="flexitem passcodesec" id="servicingmajcom" style={{ visibility: showCPTS ? 'visible' : 'hidden' }}>
                                    <div className="divformgroup forminline">
                                      <label htmlFor="inputTextServicingMajcom">
                                        Servicing MAJCOM   </label> <span className="mandatory">
                                        *</span>
                                      <input type="text" className="formcontrol" spellCheck="true" value="NGB" name="Servicing Majcom" id="inputTextServicingMajcom" aria-label="Servicing Majcom" placeholder="Servicing Majcom" aria-required="true" disabled />

                                    </div>
                                  </div>
                                  {!isDisabled === true ? PascodeDiv() : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="divpopupfooter">
                          <ul>
                            <li><a href="javascript:void(0)" id="saveUpdateUserprofile" title="Save" className='anchorsavebtn' onClick={() => validate(item.Id)}>
                              <span className="icon-Update"></span> Update</a>
                            </li>
                            <li><a href="javascript:void(0)" title="Cancel" id="userprofilecancel" className='anchorcancelbtn anchoreditcanel' onClick={() => {
                              setInEditMode({
                                status: false,
                                rowKey: null
                              })
                            }}>
                              <span className="icon-Close"></span> Cancel</a>
                            </li>
                          </ul>
                        </div>
                      </div>)
                    : ''}
                  {Accordion.status && Accordion.rowKey === item.Id && !inEditMode.status
                    ? (
                      <div className="divcontentareapopup divcardedit " id="userprofilescontent-1" aria-hidden="true">
                        <div className='divuseraddinfo'>
                          <div className='divitem'>
                            <label>Assigned Component</label><p>RegAF</p>
                          </div>
                          <div className='divitem'>
                            <label>Servicing Majcom </label><p>{item.PasCode.MAJCOM}</p>
                          </div>
                          <div className='divitem'>
                            <label>Org Majcom </label><p>{item.PasCode.OrgMAJCOM}</p>
                          </div>
                          <div className='divitem'>
                            <label>PAS Code</label><p>{item.PasCode.Title}</p>
                          </div>
                          <div className='divitem'>
                            <label>Installation</label><p>{item.PasCode.Installation}</p>
                          </div>
                          <div className='divitem'>
                            <label>Organization</label><p>{item.PasCode.Organization}</p>
                          </div>
                          <div className='divitem'>
                            <label>Servicing Comptroller</label><p >{item.PasCode.ServicingCPTS}</p>
                          </div>
                          <div className='divitem'>
                            <label>Modified</label><p>{item.Editor.Title} | {convertDate(item.Modified, 'date')}</p>
                          </div>
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
            )
            : ''
        }
      </div>
    </section>
  ) : (
    ProfileExist()
  )
  }
   </>
  )
}
export default UserProfile
