import React, { useEffect, useRef, useState } from 'react'
import { useIndexedDB } from 'react-indexed-db'
import Autocomplete from 'react-autocomplete'
import '../CSS/profile.css'
import loader from '../Images/Loader.gif'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import { HardCodedNames, ListNames } from '../../pages/Config'
import { LoginUserName, GetUserProfile, compareDates, GetBuildModifiedList, GlobalConstraints } from '../../pages/Master'

const ProfilePage = () => {
  const listName = ListNames().PASCodeMetadataList
  const isFirstRender = useRef(false)
  const DodInput = useRef(null)
  const [updatemsg, setupdatemsg] = useState(false)
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
    DataChangedTop: true,
    DataChangedBottom: true
  })
  const siteName = GlobalConstraints().siteName
  const { add } = useIndexedDB('PASCODE' + siteName + '')
  const { getByID } = useIndexedDB('PASCODE' + siteName + '')
  const { update } = useIndexedDB('PASCODE' + siteName + '')
  const [PasCodeID, setPasID] = useState<any>()
  const [isValid, setIsValid] = useState({
    Top: true,
    bottom: true
  })
  const [items, setItems] = useState({
    item: 0,
    pos: ''
  })
  const [Pasvalue, setValue] = useState('')
  const [Insvalue, setInsValue] = useState('')
  const [Orgvalue, setOrgValue] = useState('')
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
  const [state, setLoaderState] = useState(false)
  const [Profileupdated, setProfileupdated] = useState(false)
  const [isValidated, setisValidate] = useState(false)
  const [tooltips, settooltip] = useState({
    DoDIDNumber: '',
    AssignedComponent: '',
    Status: '',
    PhoneNumber: '',
    PascodeYesorNo: '',
    PASCODE: '',
    OrgMajcom: '',
    Installation: '',
    Organization: '',
    CPTS: '',
    Majcom: ''
  })
  const searchInput: any = useRef(null)

  const statusFocus : any = useRef(null)
  const PhnFocus : any = useRef(null)
  const pascodeFocus: any = useRef(null)
  const installationfocus : any = useRef(null)
  const majfocus : any = useRef(null)
  const orgFocus: any = useRef(null)
  const [tooltip, settooltipdata] = useState<any>()
  // const PasCodelistItems: any = []
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  useEffect(() => {
    if ((isFirstRender.current)) {
      isFirstRender.current = true
      return
    }
    if (PasCodelistItems.length > 0) {
      isFirstRender.current = true
      setProfileData(true)
    }
  }, [PasCodelistItems])
  const initEffect = () => {
    getPASCode()
    gettooltips()
    GetUserProfile().then(function () {
      setProfileData(true)
    })
  }

  const toggleLoader = (val: any) => {
    setLoaderState(val)
  }
  $(document).on('focusout', '#inputTextYourContactPhoneNumber', function () {
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
  $(document).on('keypress', '#inputTextYourContactPhoneNumber', function (event: any) {
    const charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault ? event.preventDefault() : event.returnValue = false
    }
  })
  /* Set Profile Data for Existing Profile on Load */
  function setProfileData (onload: any) {
    getData()
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    if (loginUserProfile && loginUserProfile.length > 0) {
      setVal(true)
      setshow(true)
      setOrgMajdisplay(true)
      setInstallationshow(true)
      setOrgshow(true)
      setCPTSshow(true)
      setAssignedComp(loginUserProfile[0].AssignedComponent)
      setInsValue(loginUserProfile[0].UserInstallation)
      setOrgValue(loginUserProfile[0].UserOrganization)
      setValue(loginUserProfile[0].UserPasCode)
      setCptsValue(loginUserProfile[0].UserPasCodeCPTS)
      setMajValue(loginUserProfile[0].UserMajcom)
      setOrgMajValue(loginUserProfile[0].OrgMajcom)
      if (onload) {
        setDODvalue(loginUserProfile[0].DoDIDNumber)
        setStatusVal(loginUserProfile[0].Status)
        const phonenumber = fnPhonechange(loginUserProfile[0].DutyPhone)
        setPhoneval(phonenumber)
      }
    }
  }
  function changeAssignedComponent (a: any) {
    setAssignedComp(a.target.value)
  }
  function handleDataValue (a: any) {
    setDODvalue(a.target.value)
  }

  function changePASCodeYesorNo (a: any) {
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    if (a.target.value === 'No') {
      const majpascodeitems = PasCodelistItems.filter(
        (item: any) => item.OrgMAJCOM === currentMaj
      )
      const dupmajpascodeitems = Array.from(new Set(majpascodeitems.map((v: any) => v.Installation)))
      setMajcomPas(majpascodeitems)
      setuniqueInsta(dupmajpascodeitems)
      selectinstallation(Insvalue)
      if (loginUserProfile && loginUserProfile !== null && loginUserProfile !== undefined && loginUserProfile.length > 0 && loginUserProfile !== []) {
        if (Pasvalue !== loginUserProfile.UserPasCode) {
          setProfileData(false)
          setVal(false)
          setshow(false)
        }
        setInstallationshow(true)
        setOrgshow(true)
        setCPTSshow(true)
        setPascodeshow(true)
      } else {
        setVal(false)
        setshow(false)
        setOrgMajdisplay(true)
        setPascodeshow(true)
        clearData()
      }
    } else {
      if (loginUserProfile && loginUserProfile !== null && loginUserProfile !== undefined && loginUserProfile.length > 0 && loginUserProfile !== []) {
        if (Pasvalue !== loginUserProfile.UserPasCode) {
          setProfileData(false)
        }
        setOrgMajdisplay(true)
        setInstallationshow(true)
        setOrgshow(true)
        setCPTSshow(true)
        setPascodeshow(false)
      } else {
        setVal(true)
        setshow(true)
        setOrgMajdisplay(false)
        setInstallationshow(false)
        setOrgshow(false)
        setCPTSshow(false)
        setPascodeshow(false)
        clearData()
      }
    }
  }
  // To clear Organization Details Section fields value
  function clearData () {
    setValue('')
    setOrgMajValue('select')
    setInsValue('')
    setOrgValue('')
    setCPTSshow(false)
    setPascodeshow(false)
    setInstallationshow(false)
    setOrgshow(false)
  }
  const onChangeHandler = (event: any) => {
    setValue(event.target.value)
    changePascode(event.target.value)
  }
  function changeStatus (e: any) {
    setStatusVal(e.target.value)
  }
  function changePhone (e: any) {
    let phonenumber = e.target.value
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    phonenumber = phonenumber.replace(phoneRegex, '$1$2$3')
    setPhoneval(phonenumber)
  }
  function changeMajcom (a: any) {
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
  function changeInstallation (a: any) {
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
  function selectinstallation (a: any) {
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
  function changeOrganization (a: any) {
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
  function selectOrganization (a: any) {
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
  function changePascode (a: any) {
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
  function getPASCode () {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('PASCodeMetadataListBuildModifiedListDate' + siteName) || ''
      const PascodeModifiedDate = localStorage.getItem('Pascode_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, PascodeModifiedDate)
      const list = sp.web.lists.getByTitle(listName)
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
          setPasCodeItems(items)
        })
      } else {
        getData()
      }
    } catch (error) {
      console.log(error)
    }
  }
  function getData () {
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
  function PascodeDiv () {
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
          <input type="text" className="formcontrol" name="PASCODE" id="inputTextPASCODE" aria-label="PASCODE" placeholder="PASCODE"aria-required="true" disabled = {true} value = {Pasvalue}/>
        </div>
      </div>
    )
  }
  function RenderMajcomDropdown () {
    getData()
    if (isDisabled === false) {
      let Majcomset = Array.from(new Set(PasCodelistItems?.filter((item: { OrgMAJCOM: any }) => item.OrgMAJCOM).map((item: { OrgMAJCOM: any }) => item.OrgMAJCOM)))
      Majcomset = Majcomset?.sort()
      if (Majcomset.length > 0) {
        return (
          <select ref={majfocus} name='"MAJCOM/DRU/FOA"' id='ddlMajcom' value = {currentMaj} onChange={changeMajcom} aria-label="MAJCOM/DRU/FOA" disabled={isDisabled}>
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
          <select name='"MAJCOM/DRU/FOA"' id='ddlMajcom' value = {currentMaj} onChange={changeMajcom} aria-label="MAJCOM/DRU/FOA" disabled={isDisabled}>
            {Majcomset.map((orgMajcom: any) => <option key={orgMajcom} value={orgMajcom}>{orgMajcom}</option>)}
          </select>
        )
      } else {
        return (
            <select name='"MAJCOM/DRU/FOA"' id='ddlMajcom' value = {currentMaj} onChange={changeMajcom} aria-label="MAJCOM/DRU/FOA" disabled={isDisabled}>
              {Majcomset.map((orgMajcom: any) => <option key={''} value={''}>{''}</option>)}
            </select>
        )
      }
    }
  }
  function validateDoDID (dodnumber: any) {
    let isValidateDoD = true
    if (dodnumber !== null || dodnumber !== '') {
      const regex = /^[0-9\b]+$/
      if ((dodnumber.length !== 10) || (!regex.test(dodnumber))) {
        isValidateDoD = false
      }
    }
    return isValidateDoD
  }
  function validatePhone (phonenumber: any) {
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
  function validateData (column: any, value: any, arr: any) {
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
  function validateUniqueDod (DodID: any, Status: any, userID: any, pos: any) {
    return new Promise<void>(function (resolve) {
      const item: any[] = []
      if (Status === 'Civilian' || Status === 'Contractor') {
      // eslint-disable-next-line quotes
        sp.web.lists.getByTitle(ListNames().UserProfile).items.filter("CustomerID ne " + userID + " and DoDIDNumber eq  '" + DodID + "' and Status ne 'Active Duty' ").get().then(function (item) {
          setItems({
            ...items,
            item: item.length,
            pos: pos
          })
          item = item
          resolve()
          return item
        })
      } else {
      // eslint-disable-next-line quotes
        sp.web.lists.getByTitle(ListNames().UserProfile).items.filter("CustomerID ne " + userID + " and DoDIDNumber eq  '" + DodID + "' and Status eq '" + Status + "' ").get().then(function (item) {
          setItems({
            ...items,
            item: item.length,
            pos: pos
          })
          item = item
          resolve()
          return item
        })
      }
    })
  }
  // Validating Profile Fields
  const validate = (pos: any) => {
    setisValidate(false)
    if (pos === 'bottom' || pos === 'Top') {
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
        DataChangedTop: true,
        DataChangedBottom: true
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
        DataChangedTop: true,
        DataChangedBottom: true
      }
      setIsValid({
        ...isValid,
        Top: false,
        bottom: false
      })
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      const phonenumber = currentPhone.replace(phoneRegex, '$1$2$3')
      if (DodVal === '' || DodVal === null) {
        validationset.DOD = true
        valid = false
      } else if (!validateDoDID(DodVal)) {
        validationset.ValidDOD = true
        valid = false
      } else {
      // const data: any = validateUniqueDod(DodVal, currentStatus, LoginUserName().UserId, pos)
        if (items.item > 0) {
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
      if ((currentMaj === '' || currentMaj === null || currentMaj === 'Select') && showOrgMaj) {
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
      if (loginUserProfile && loginUserProfile.length > 0 && loginUserProfile !== []) {
        const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
        const phonenumber = currentPhone.replace(phoneRegex, '$1$2$3')
        if (DodVal === loginUserProfile[0].DoDIDNumber && currentStatus === loginUserProfile[0].Status && (currentPhone === loginUserProfile[0].DutyPhone || phonenumber === loginUserProfile[0].DutyPhone) && Pasvalue === loginUserProfile[0].UserPasCode) {
          if (pos === 'bottom') {
            validationset.DataChangedBottom = false
          } else {
            validationset.DataChangedTop = false
          }
        }
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
        DataChangedTop: validationset.DataChangedTop,
        DataChangedBottom: validationset.DataChangedBottom
      })
      if (pos === 'bottom') {
        setIsValid({
          ...isValid,
          bottom: valid,
          Top: true
        })
      } else {
        setIsValid({
          ...isValid,
          Top: valid,
          bottom: true
        })
      }
      setisValidate(valid)
      return valid
    }
  }
  useEffect(() => {
    validate(items.pos)
  }, [items])
  // Updating or Adding Profile Data to List
  function onSubmit (event: any, pos: any) {
    validateUniqueDod(DodVal, currentStatus, LoginUserName().UserId, pos).then(() => {
      const valid = validate(pos)
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      const phonenumber = currentPhone.replace(phoneRegex, '$1$2$3')
      if (valid) {
        let isvalidprofile = true
        if (pos === 'bottom') { isvalidprofile = isValid.bottom } else { isvalidprofile = isValid.Top }
        if (isvalidprofile) {
          const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
          if (loginUserProfile && loginUserProfile.length > 0 && (DodVal !== loginUserProfile[0].DoDIDNumber || currentStatus !== loginUserProfile[0].Status || currentPhone !== loginUserProfile[0].DutyPhone || phonenumber !== loginUserProfile[0].DutyPhone || Pasvalue !== loginUserProfile[0].UserPasCode)) {
            // toggleLoader(true)
          }
          const addObj = {
            AssignedComponent: 'RegAF',
            DoDIDNumber: DodVal,
            CustomerID: LoginUserName().UserId,
            DutyEmail: LoginUserName().UserEmail,
            disName: LoginUserName().UserName,
            DutyPhone: phonenumber,
            Status: currentStatus,
            PasCodeId: PasCodeID
          }
          if (loginUserProfile && loginUserProfile.length > 0) {
            // if (loginUserProfile && loginUserProfile.length > 0 && (DodVal !== loginUserProfile[0].DoDIDNumber || currentStatus !== loginUserProfile[0].Status || currentPhone !== loginUserProfile[0].DutyPhone || Pasvalue !== loginUserProfile[0].UserPasCode)) {
            if (!(DodVal === loginUserProfile[0].DoDIDNumber && currentStatus === loginUserProfile[0].Status && (currentPhone === loginUserProfile[0].DutyPhone || phonenumber === loginUserProfile[0].DutyPhone) && Pasvalue === loginUserProfile[0].UserPasCode)) {
              toggleLoader(true)
              sp.web.lists.getByTitle(ListNames().UserProfile).items.getById(loginUserProfile[0].ID).update(addObj).then(function () {
                setProfileupdated(true)
                setupdatemsg(true)
                RedirecttoHome()
              })
            }
          } else {
            toggleLoader(true)
            sp.web.lists.getByTitle(ListNames().UserProfile).items.add(addObj).then(function () {
              setProfileupdated(true)
              setupdatemsg(true)
              RedirecttoHome()
            })
          }
        }
      }
    })
  }

  useEffect(() => {
    if (state && Profileupdated) {
      GetUserProfile()
      BuildmodifiedListUpdate()
      setTimeout(() => {
        toggleLoader(false)
      }, 3000)
    }
  }, [Profileupdated, state])
  const RedirecttoHome = () => {
    setTimeout(() => {
      document.location = `${window.location.origin + window.location.pathname}#/`
    }, 1000)
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

    })
  }
  async function gettooltips () {
    const userprofile: any = []
    const listName = ListNames().ToolTipList
    const list = sp.web.lists.getByTitle(listName)
    const endpoint = ['Tooltip_x0020_Description', 'ToolTipId']
    await list.items.select('' + endpoint + '').get().then(function (items) {
      if (items && items.length > 0) {
        items?.map(item => {
          userprofile.push({
            tooltip: item.ToolTipId,
            tooltipdesc: item.Tooltip_x0020_Description
          })
        })
      }
    })
    settooltipdata(userprofile)
    for (let i = 0; i < userprofile.length; i++) {
      let test = ''
      test = userprofile[i].tooltip
      settooltip(prevValues => {
        return { ...prevValues, [test]: userprofile[i].tooltipdesc }
      })
    }
  }
  function handleFocus (input: any) {
    if (input === 'DOD') {
      if (searchInput.current !== null) { searchInput.current.focus() }
    } else if (input === 'status') {
      if (statusFocus.current !== null) { statusFocus.current.focus() }
    } else if (input === 'phone') {
      if (PhnFocus.current !== null) { PhnFocus.current.focus() }
    } else if (input === 'pascode') {
      if (pascodeFocus.current !== null) { pascodeFocus.current.focus() }
    } else if (input === 'majcom') {
      if (majfocus.current !== null) { majfocus.current.focus() }
    } else if (input === 'installation') {
      if (installationfocus.current !== null) { installationfocus.current.focus() }
    } else if (input === 'organization') {
      if (orgFocus.current !== null) { orgFocus.current.focus() }
    }
  }
  return (
        <>
            <div className='divProfilecontainer'>
                <div className="row">
                    <div className="col-md-12 col-xs-12">
                        <div className="divprofilehead">
                            <div className="divprofileheader">
                                <h2>Instructions</h2>
                                <ul>
                                    <li><span className="spancricle"></span> All fields marked ‘*’ must be completed.</li>
                                    <li><span className="spancricle"></span> Use ‘Update’ button to Update your Profile.</li>
                                </ul>
                            </div>
                            <a href="javascript:void(0)" title="Update" className="anchorupdatebtn" id="anchorupdatebtn" onClick={(e) => onSubmit(e, 'Top')}><span
                                className="icon-Update"></span>
                                Update</a>
                        </div>
                    </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12 col-xs-12">
                        <div id="topvalidations" className="divupdatelist" style = {{ display: (isValid.Top && validation.DataChangedTop) ? 'none' : 'block' }}>
                        <div style = {{ display: !validation.DataChangedTop ? 'block' : 'none' }}>
                          <h2>NO CHANGES DETECTED </h2>
                            <a href="javascript:void(0)" className="spancloseicon" title="Close" id="spancloseicon">
                                <span className="icon-Close" onClick={(e) => setStatevalidations({ ...validation, DataChangedTop: true })}></span>
                            </a>
                            </div>
                          <div style = {{ display: isValid.Top ? 'none' : 'block' }}>
                            <h2>
                              Please fill the below mandatory fields
                            </h2>
                            <a href="javascript:void(0);" className="spancloseicon" title="Close" id="validateclose"><span className="icon-Close" onClick={(e) => setIsValid({ ...isValid, Top: true })}></span></a>
                            <ul id="topvalidationsection">
                              <li style = {{ display: validation.DOD ? '' : 'none' }}><span className="inputTextDoDIDNumber" onClick={() => handleFocus('DOD')}>Your DoD ID Number</span></li>
                              <li style = {{ display: validation.ValidDOD ? '' : 'none' }}><span className="inputTextDoDIDNumber" onClick={ () => handleFocus('DOD')}>Enter valid DoD ID Number</span></li>
                              <li style = {{ display: validation.UniqueDOD ? '' : 'none' }}><span className="inputTextDoDIDNumber" onClick={() => handleFocus}>Already Profile Exists for the Entered DOD ID with given Status.</span></li>
                              <li style = {{ display: validation.AssignedComp ? '' : 'none' }}><span className="ddlYourAssignedComponent" >Your Assigned Component</span></li>
                              <li style = {{ display: validation.Status ? '' : 'none' }}><span className="ddlStatus" onClick={() => handleFocus('status')}>Your Status</span></li>
                              <li style = {{ display: validation.Phone ? '' : 'none' }}><span className="inputTextDutyPhone" onClick={() => handleFocus('phone')}>Your Contact Phone Number</span></li>
                              <li style = {{ display: validation.ValidPhone ? '' : 'none' }}><span className="inputTextDutyPhone" onClick={() => handleFocus('phone')}>Enter valid Contact Phone Number</span></li>
                              <li style = {{ display: validation.PASCode ? '' : 'none' }}><span className="inputTextPASCODE" onClick={() => handleFocus('pascode')}>PASCODE</span></li>
                              <li style = {{ display: validation.ValidPASCode ? '' : 'none' }}><span className="inputTextPASCODE" onClick={() => handleFocus('pascode')}>Enter valid PASCODE</span></li>
                              <li style = {{ display: validation.Majcom ? '' : 'none' }}><span className="ddlMajcom" onClick={() => handleFocus('majcom')}>MAJCOM/DRU/FOA</span></li>
                              <li style = {{ display: validation.Installation ? '' : 'none' }}><span className="inputTextInstallation" onClick={() => handleFocus('installation')}>Installation/Assigned Location</span></li>
                              <li style = {{ display: validation.ValidInstallation ? '' : 'none' }}><span className="inputTextInstallation" onClick={() => handleFocus('installation')}>Search and Select valid Installation/Assigned Location</span></li>
                              <li style = {{ display: validation.Organization ? '' : 'none' }}><span className="Organization" onClick={() => handleFocus('organization')}>Organization/Unit Name</span></li>
                              <li style = {{ display: validation.ValidOrganization ? '' : 'none' }}><span className="Organization" onClick={() => handleFocus('organization')}>Search and Select valid Organization/Unit Name</span></li>
                            </ul>
                          </div>
                        </div>
                      </div></div>
                <div className='row'>
                    <div className="col-md-12 col-xs-12">
                        <div className="divformbody">
                            <h2>Personal Details</h2>
                        </div>
                    </div>
                    <div className='col-md-12 col-xs-12'>
                        <div className='divflexcontainer'>
                            <div className="divflexitem">
                                <div className="divformgroup">
                                    <label htmlFor="inputTextYourDoDIDNumber">
                                        Your DoD ID Number</label> <span className="mandatory">
                                        *</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.DoDIDNumber}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <input type="text" ref={searchInput} name="Your DoD ID Number" id="inputTextYourDoDIDNumber" maxLength={10} placeholder="1234567890" aria-required="true" value={DodVal} onChange={handleDataValue}
                                        aria-label="DoD ID Number" spellCheck="true" />
                                </div>
                            </div>
                            <div className="divflexitem">
                                <div className="divformgroup">
                                    <label htmlFor="SelectdropdownYourAssignedComponent">Your Assigned Component</label> <span
                                        className="mandatory">
                                        *</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.AssignedComponent}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <select name="Your Assigned Component" id="SelectdropdownYourAssignedComponent"
                                        aria-required="true" aria-label="Your Assigned Component"
                                        data-identifier="Regular Air Force" value = {currentAssignedComp} onChange={changeAssignedComponent}>
                                        <option value="RegAF" data-id="RegAF">RegAF</option>
                                    </select>
                                </div>
                            </div>
                            <div className="divflexitem">
                                <div className="divformgroup">
                                    <label htmlFor="inputTextYourStatus">Your Status</label> <span className="mandatory">
                                        *</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.Status}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <select ref={statusFocus} name='Your Status' id='inputTextYourStatus' aria-required="true" aria-label='Your Status' data-identifier="Your Status" value = {currentStatus} onChange={changeStatus}>
                                        <option value="">Select</option>
                                        <option value="Active Duty">Active Duty</option>
                                        <option value="Civilian">Civilian</option>
                                        <option value="Contractor">Contractor</option>
                                    </select>
                                </div>
                            </div>
                            <div className="divflexitem">
                                <div className="divformgroup">
                                    <label htmlFor="inputTextYourContactPhoneNumber">
                                        Your Contact Phone Number</label> <span className="mandatory">
                                        *</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.PhoneNumber}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <input ref={PhnFocus} type="text" name='PhoneNumber' id="inputTextYourContactPhoneNumber" maxLength={12}
                                        placeholder="Example 123-555-6789" aria-required="true"
                                        aria-label="Your Contact Phone Number" spellCheck="true"
                                        data-identifier="555-754-3010" value = {currentPhone} onChange = {changePhone} onClick = {changePhone} />
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
                                <div className="divformgroup">
                                    <label htmlFor="up_pascode">
                                        Do you know the PASCODE? </label>
                                        <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.PascodeYesorNo}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <div className="divradiobutns" id="pascoderadiobtn" onChange={changePASCodeYesorNo}>
                                        <label htmlFor="inputRadioPASCODEYes">
                                            <input type="radio" name="Unit PASCODE" id="inputRadioPASCODEYes"
                                                aria-label="Yes" value="Yes" checked = {isDisabled}/>
                                            YES
                                        </label>
                                        <label htmlFor="inputRadioPASCODENo">
                                            <input type="radio" name="Unit PASCODE" id="inputRadioPASCODENo" aria-label="No" value="No"
                                                checked = {!isDisabled} />
                                            NO
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="divflexitem" style={{ display: showInfo ? 'block' : 'none' }}>
                                <div className="divformgroup" >
                                    <label htmlFor="inputTextPascode">PASCODE <span className="mandatory">*</span></label>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.PASCODE}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <div className='divAutocompleteInput divpascodeinput'>
                                    <Autocomplete data-class='test'
                                        // Items is the list of suggestions displayed while the user type
                                        items={(Pasvalue !== '' && Pasvalue.length > 1 && (localStorage.getItem('userProfileData' + siteName) !== null && localStorage.getItem('userProfileData' + siteName) !== '[]' ? Pasvalue !== JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')[0].UserPasCode : true)) ? PasCodelistItems : []}

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
                                        ref={pascodeFocus}
                                        value={Pasvalue}
                                       onChange={ onChangeHandler }
                                        onSelect={changePascode}
                                        // Added style in Autocomplete component
                                        inputProps={{
                                          placeholder: 'PASCODE'
                                        }}
                                    />
                                    </div>
                                </div>
                            </div>
                            <div className="divflexitem" style={{ display: showOrgMaj && !isDisabled ? '' : 'none' }}>
                                <div className="divformgroup" >
                                    <label htmlFor="inputTextMajcom">MAJCOM/DRU/FOA</label> <span className="mandatory">*</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.OrgMajcom}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    {RenderMajcomDropdown()}
                                </div>
                            </div>
                            <div className="divflexitem" style={{ display: showOrgMaj && isDisabled ? '' : 'none' }}>
                                <div className="divformgroup" >
                                    <label htmlFor="inputTextMajcom">MAJCOM/DRU/FOA</label> <span className="mandatory">*</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.Majcom}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <input type="text" name='PhoneNumber' id="inputTextMAJCOM" maxLength={16}
                                         aria-required="true" value = {currentMaj} disabled = {isDisabled}/>
                                </div>
                            </div>
                            <div className="divflexitem">
                                <div className="divformgroup" style={{ visibility: showInst ? 'visible' : 'hidden' }}>
                                    <label htmlFor="inputTextInstallation">Installation/Assigned Location</label> <span className="mandatory">*</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.Installation}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
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
                                        ref= {installationfocus}
                                        inputProps={{
                                          style: {
                                            width: '100%'

                                          },
                                          placeholder: 'Search and Select Installation/Assigned Location',
                                          disabled: isDisabled
                                        }}
                                    />
                                    </div>
                                </div>
                            </div>
                            <div className="divflexitem">
                                <div className="divformgroup" style={{ visibility: showOrg ? 'visible' : 'hidden' }}>
                                    <label htmlFor="inputTextOrganization">Organization/Unit Name</label> <span className="mandatory">*</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.Organization}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
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
                                        ref= {orgFocus}
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
                                </div>
                            </div>
                            <div className="divflexitem">
                                <div className="divformgroup" style={{ visibility: showCPTS ? 'visible' : 'hidden' }}>
                                    <label htmlFor="inputTextServicingComptroller">Servicing Comptroller</label> <span className="mandatory">*</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.CPTS}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <input type="text" name="Servicing Comptroller" id="inputTextServicingComptroller" value={CptsVal}
                                        maxLength={10} placeholder="Servicing Comptroller" aria-label="Organization/Unit Name"
                                        disabled={true} />
                                </div>
                            </div>
                            <div className="divflexitem">
                                <div className="divformgroup" style={{ visibility: showCPTS ? 'visible' : 'hidden' }}>
                                    <label htmlFor="inputTextServicingMajcom">Servicing MAJCOM</label> <span className="mandatory">*</span>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{tooltips.Majcom}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <input type="text" name="Servicing MAJCOM" id="inputTextServicingMajcom" maxLength={10} value={MajVal}
                                        placeholder="Servicing Majcom" aria-label="Servicing MAJCOM" disabled={true} />
                                </div>
                            </div>
                            {!isDisabled === true ? PascodeDiv() : '' }
                        </div>
                    </div>
                </div>
                <div className="row">
                      <div className="col-md-12 col-xs-12">
                        <div id="topvalidations" className="divupdatelist" style = {{ display: (isValid.bottom && validation.DataChangedBottom) ? 'none' : 'block' }}>
                        <div style = {{ display: !validation.DataChangedBottom ? 'block' : 'none' }}>
                          <h2>NO CHANGES DETECTED </h2>
                            <a href="javascript:void(0)" className="spancloseicon" title="Close" id="spancloseicon">
                                <span className="icon-Close" onClick={(e) => setStatevalidations({ ...validation, DataChangedBottom: true })}></span>
                            </a>
                            </div>
                          <div style = {{ display: isValid.bottom ? 'none' : 'block' }}>
                            <h2>
                              Please fill the below mandatory fields
                            </h2>
                            <a href="javascript:void(0);" className="spancloseicon" title="Close" id="validateclose"><span className="icon-Close" onClick={(e) => setIsValid({ ...isValid, bottom: true })}></span></a>
                            <ul id="topvalidationsection">
                              <li style = {{ display: validation.DOD ? '' : 'none' }}><span className="inputTextDoDIDNumber" onClick={() => handleFocus('DOD')}>Your DoD ID Number</span></li>
                              <li style = {{ display: validation.ValidDOD ? '' : 'none' }}><span className="inputTextDoDIDNumber" onClick={() => handleFocus('DOD')}>Enter valid DoD ID Number</span></li>
                              <li style = {{ display: validation.UniqueDOD ? '' : 'none' }}><span className="inputTextDoDIDNumber">Already Profile Exists for the Entered DOD ID with given Status.</span></li>
                              <li style = {{ display: validation.AssignedComp ? '' : 'none' }}><span className="ddlYourAssignedComponent">Your Assigned Component</span></li>
                              <li style = {{ display: validation.Status ? '' : 'none' }}><span className="ddlStatus" onClick={() => handleFocus('status')}>Your Status</span></li>
                              <li style = {{ display: validation.Phone ? '' : 'none' }}><span className="inputTextDutyPhone" onClick={() => handleFocus('phone')}>Your Contact Phone Number</span></li>
                              <li style = {{ display: validation.ValidPhone ? '' : 'none' }}><span className="inputTextDutyPhone" onClick={() => handleFocus('phone')}>Enter valid Contact Phone Number</span></li>
                              <li style = {{ display: validation.PASCode ? '' : 'none' }}><span className="inputTextPASCODE" onClick={() => handleFocus('pascode')}>PASCODE</span></li>
                              <li style = {{ display: validation.ValidPASCode ? '' : 'none' }}><span className="inputTextPASCODE" onClick={() => handleFocus('pascode')}>Enter valid PASCODE</span></li>
                              <li style = {{ display: validation.Majcom ? '' : 'none' }}><span className="ddlMajcom" onClick={() => handleFocus('majcom')}>MAJCOM/DRU/FOA</span></li>
                              <li style = {{ display: validation.Installation ? '' : 'none' }}><span className="inputTextInstallation" onClick={() => handleFocus('installation')}>Installation/Assigned Location</span></li>
                              <li style = {{ display: validation.ValidInstallation ? '' : 'none' }}><span className="inputTextInstallation" onClick={() => handleFocus('installation')}>Search and Select valid Installation/Assigned Location</span></li>
                              <li style = {{ display: validation.Organization ? '' : 'none' }}><span className="Organization" onClick={() => handleFocus('organization')}>Organization/Unit Name</span></li>
                              <li style = {{ display: validation.ValidOrganization ? '' : 'none' }}><span className="Organization" onClick={() => handleFocus('organization')}>Search and Select valid Organization/Unit Name</span></li>
                            </ul>
                          </div>
                        </div>
                      </div></div>
                <div className="row">
                    <div className="col-md-12 col-xs-12">
                        <div className="divUpdatebtn">
                            <a href="javascript:void(0)" title="Update" className="anchorupdatebottom" id="anchorupdatebtnbottom" onClick={(e) => onSubmit(e, 'bottom')} ><span
                                className="icon-Update"></span>
                                Update</a>

                        </div>
                    </div>
                </div>
                {/* {state
                  ? (
                <div className="submit-bg" id="pageoverlay">
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>

                    </div>
                </div>)
                  : null } */}
                  {updatemsg && (validation.DataChangedTop && validation.DataChangedBottom)
                    ? (
                      <div className="submit-bg" id="pageoverlay">
                      <div id="formsuccessmsg" className="successmsg " >Profile updated successfully.</div> </div>
                      )

                    : ''}

            </div>
        </>
  )
}

export default ProfilePage
