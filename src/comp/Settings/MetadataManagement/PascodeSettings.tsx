/* eslint-disable indent */
/* eslint-disable space-before-function-paren */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { sp } from '@pnp/sp'
import React, { useEffect, useState } from 'react'
import { useIndexedDB } from 'react-indexed-db'
import { ListNames } from '../../../pages/Config'
import { compareDates, GetBuildModifiedList, GetUserProfile, GlobalConstraints } from '../../../pages/Master'
import loader from '../../Images/Loader.gif'
const Pascode = () => {
  const [showAddPopup, setshowAddPopup] = useState(false)
  const [showedit, setshowedit] = useState(false)
  const siteName = GlobalConstraints().siteName
  const { add } = useIndexedDB('PASCODE' + siteName + '')
  const { getByID } = useIndexedDB('PASCODE' + siteName + '')
  const { update } = useIndexedDB('PASCODE' + siteName + '')
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const [emptysearch, setemptysearch] = useState(false)
  const [pasCodeItems, setPasCodeItems] = useState<any>()
  const [editPascodeName, seteditPascodeName] = useState('')
  const [editPascodeMaj, seteditPascodeMaj] = useState('')
  const [editPascodeInsta, seteditPascodeInsta] = useState('')
  const [editPascodeOrg, seteditPascodeOrg] = useState('')
  const [editPascodeOrgMaj, seteditPascodeOrgMaj] = useState('')
  const [editPascodecpts, seteditPascodecpts] = useState('')
  const [editPascodearchived, seteditPascodearchived] = useState('')
  const [ChangeMaj, setChangeMaj] = useState(false)
  const [ChangeOrgMajFilter, setChangeOrgMajFilter] = useState(false)
  const [ChangeMajFilter, setChangeMajFilter] = useState(false)
  const [majCpts, setmajCpts] = useState<any>()
  const [majdropdown, setmajdropdown] = useState<any>()
  const [cptsdropdown, setcptsdropdown] = useState<any>()
  const [filterOrgMaj, setfilterOrgMaj] = useState('')
  const [filterMaj, setfilterMaj] = useState('')
  const [filterCpts, setfilterCpts] = useState('')
  const [filteredItems, setfilteredItems] = useState<any>()
  const [inputValue, setInputValue] = useState('')
  const [PasValidations, setPasValidations] = useState({
    valid: true,
    PASCODE: true,
    MAJCOM: true,
    Installation: true,
    Organization: true,
    OrgMaj: true,
    CPTS: true
  })
  const [loaderState, setloaderState] = useState(false)
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  $('.settingsnavigation a').addClass('active')
  useEffect(() => {
    GetBuildModifiedList().then(function () {
      getPASCode()
    })
  }, [])
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

  function getPASCode() {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('PASCodeMetadataListBuildModifiedListDate' + siteName) || ''
      const PascodeModifiedDate = localStorage.getItem('Pascode_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, PascodeModifiedDate)
      const list = sp.web.lists.getByTitle(ListNames().PASCodeMetadataList)
      const endpoint = ['ID', 'Title', 'Organization', 'Installation', 'MAJCOM', 'ServicingCPTS', 'AssignedComponent', 'IsArchived', 'OrgMAJCOM']
      if (needToUpdate) {
        list.items.select('' + endpoint + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          getByID(1).then((DBData: any) => {
            if (DBData && DBData.items.length > 0) {
              setPasCodeItems(items)
              setfilteredItems(items)
              setcptsdropdown(items)
              update({ id: 1, items: items }).then(
                (result: any) => { console.log('Data Stored in DB') }
              )
            } else {
              add({ items: items }).then((DBData: any) => {
              })
              setPasCodeItems(items)
              setfilteredItems(items)
              setcptsdropdown(items)
            }
          })
          localStorage.setItem('Pascode_LMDate' + siteName, listModifiedDate)
          // setPasCodeItems(items)
        })
      } else {
        getData()
      }
    } catch (error) {
      console.log(error)
    }
  }
  function getData() {
    const pascodeitems: any = []
    getByID(1).then((DBData: any) => {
      if (DBData !== undefined && DBData !== null) {
        if (DBData.items && DBData.items.length > 0) {
          DBData.items?.map((item: any) => {
            pascodeitems.push({
              ID: item.ID,
              Title: item.Title,
              Organization: item.Organization,
              Installation: item.Installation,
              MAJCOM: item.MAJCOM,
              ServicingCPTS: item.ServicingCPTS,
              AssignedComponent: item.AssignedComponent,
              IsArchived: item.IsArchived,
              OrgMAJCOM: item.OrgMAJCOM
            })
          })
        }
      }
      setPasCodeItems(pascodeitems)
      setfilteredItems(pascodeitems)
      setcptsdropdown(pascodeitems)
    })
  }
  const RenderOrgMaj = () => {
    const defaultOptionValue = 'Select'
    let Majcomset = Array.from(new Set(pasCodeItems?.filter((item: { OrgMAJCOM: any }) => item.OrgMAJCOM).map((item: { OrgMAJCOM: any }) => item.OrgMAJCOM)))
    Majcomset = Majcomset?.sort()
    if (Majcomset.length > 0) {
      return (
        <select name='"SubCategory"' id='ddlMajcom' aria-label="SubCategory" value={filterOrgMaj} onChange={(e) => changeOrgMaj(e.target.value)}>
          {Majcomset.length > 1 ? (<option value={defaultOptionValue}>{defaultOptionValue}</option>) : ''}
          {Majcomset.map((OrgMAJCOM: any) => <option key={OrgMAJCOM} value={OrgMAJCOM}>{OrgMAJCOM}</option>)}
        </select>
      )
    }
  }
  const RenderMajFilter = () => {
    const defaultOptionValue = 'Select'
    let Majcomset = ChangeOrgMajFilter
      ? Array.from(new Set(majdropdown?.filter((item: { MAJCOM: any }) => item.MAJCOM).map((item: { MAJCOM: any }) => item.MAJCOM)))
      : Array.from(new Set(pasCodeItems?.filter((item: { MAJCOM: any }) => item.MAJCOM).map((item: { MAJCOM: any }) => item.MAJCOM)))
      Majcomset = Majcomset?.sort()
      if (Majcomset.length > 0) {
      return (
        <select id='ddlMajcom' value={filterMaj} onChange={(e) => changeMajFilter(e.target.value)}>
          {Majcomset.length > 1 ? (<option value={defaultOptionValue}>{defaultOptionValue}</option>) : ''}
          {Majcomset.map((MAJCOM: any) => <option key={MAJCOM} value={MAJCOM}>{MAJCOM}</option>)}
        </select>
      )
    }
  }
  const RenderMaj = () => {
    const defaultOptionValue = 'Select'
    let Majcomset = Array.from(new Set(pasCodeItems?.filter((item: { MAJCOM: any }) => item.MAJCOM).map((item: { MAJCOM: any }) => item.MAJCOM)))
    Majcomset = Majcomset?.sort()
    if (Majcomset.length > 0) {
      return (
        <select name='"SubCategory"' id='ddlMajcom' aria-label="SubCategory" value={editPascodeMaj} onChange={(e) => changeMaj(e.target.value)}>
          {Majcomset.length > 1 ? (<option value={defaultOptionValue}>{defaultOptionValue}</option>) : ''}
          {Majcomset.map((MAJCOM: any) => <option key={MAJCOM} value={MAJCOM}>{MAJCOM}</option>)}
        </select>
      )
    }
  }
  const changeMaj = (val: any) => {
    setChangeMaj(true)
    seteditPascodeMaj(val)
    if (val !== 'Select') {
      const majpascodeitems = pasCodeItems.filter(
        (item: any) => item.MAJCOM === val
      )
      setmajCpts(majpascodeitems)
    } else {
      setmajCpts(pasCodeItems)
    }
  }
  const changeMajFilter = (val: any) => {
    setChangeMajFilter(true)
    setfilterMaj(val)
    setfilterCpts('')
    if (val !== 'Select' && !ChangeOrgMajFilter) {
      const majpascodeitems = pasCodeItems.filter(
        (item: any) => item.MAJCOM === val
      )
      setcptsdropdown(majpascodeitems)
      setfilteredItems(majpascodeitems)
    } else if (ChangeOrgMajFilter) {
      if (val !== 'Select') {
        const majpascodeitems = majdropdown.filter(
          (item: any) => item.MAJCOM === val
        )
        setcptsdropdown(majpascodeitems)
        setfilteredItems(majpascodeitems)
      } else {
        setcptsdropdown(majdropdown)
        setfilteredItems(majdropdown)
      }
    } else {
      setcptsdropdown(pasCodeItems)
      setfilteredItems(pasCodeItems)
    }
  }
  const changeOrgMaj = (val: any) => {
    setChangeOrgMajFilter(true)
    setChangeMajFilter(false)
    setfilterMaj('')
    setfilterCpts('')
    setfilterOrgMaj(val)
    if (val !== 'Select') {
      const orgmajpascodeitems = pasCodeItems.filter(
        (item: any) => item.OrgMAJCOM === val
      )
      setmajdropdown(orgmajpascodeitems)
      setcptsdropdown(orgmajpascodeitems)
      setfilteredItems(orgmajpascodeitems)
    } else {
      setmajdropdown(pasCodeItems)
      setcptsdropdown(pasCodeItems)
      setfilteredItems(pasCodeItems)
    }
  }
  const RenderCpts = () => {
    const defaultOptionValue = 'Select'
    let Majcomset = !ChangeMaj
      ? Array.from(new Set(pasCodeItems?.filter((item: { ServicingCPTS: any }) => item.ServicingCPTS).map((item: { ServicingCPTS: any }) => item.ServicingCPTS)))
      : Array.from(new Set(majCpts?.filter((item: { ServicingCPTS: any }) => item.ServicingCPTS).map((item: { ServicingCPTS: any }) => item.ServicingCPTS)))
      Majcomset = Majcomset?.sort()
      if (Majcomset.length > 0) {
      return (
        <select name='"SubCategory"' id='ddlMajcom' aria-label="SubCategory" value={editPascodecpts} onChange={(e) => seteditPascodecpts(e.target.value)}>
          {Majcomset.length > 1 ? (<option value={defaultOptionValue}>{defaultOptionValue}</option>) : ''}
          {Majcomset.map((ServicingCPTS: any) => <option key={ServicingCPTS} value={ServicingCPTS}>{ServicingCPTS}</option>)}
        </select>
      )
    }
  }
  const RenderCptsFilter = () => {
    const defaultOptionValue = 'Select'
    let Majcomset = ChangeMajFilter
      ? Array.from(new Set(cptsdropdown?.filter((item: { ServicingCPTS: any }) => item.ServicingCPTS).map((item: { ServicingCPTS: any }) => item.ServicingCPTS)))
      : ChangeOrgMajFilter
        ? Array.from(new Set(majdropdown?.filter((item: { ServicingCPTS: any }) => item.ServicingCPTS).map((item: { ServicingCPTS: any }) => item.ServicingCPTS)))
        : Array.from(new Set(pasCodeItems?.filter((item: { ServicingCPTS: any }) => item.ServicingCPTS).map((item: { ServicingCPTS: any }) => item.ServicingCPTS)))
      Majcomset = Majcomset?.sort()
      if (Majcomset.length > 0) {
      return (
        <select name='"SubCategory"' id='ddlMajcom' aria-label="SubCategory" value={filterCpts} onChange={(e) => changeCptsFilter(e.target.value)}>
          {Majcomset.length > 1 ? (<option value={defaultOptionValue}>{defaultOptionValue}</option>) : ''}
          {Majcomset.map((ServicingCPTS: any) => <option key={ServicingCPTS} value={ServicingCPTS}>{ServicingCPTS}</option>)}
        </select>
      )
    }
  }
  const changeCptsFilter = (val: any) => {
    setfilterCpts(val)
    if (val !== 'Select') {
      const cptspascodeitems = cptsdropdown.filter(
        (item: any) => item.ServicingCPTS === val
      )
      setfilteredItems(cptspascodeitems)
    } else {
      setfilteredItems(cptsdropdown)
    }
  }
  const onEdit = (item: any) => {
    clearfieldValuesandValidations()
    const isArchive = item.IsArchived ? 'Yes' : 'No'
    setshowAddPopup(false)
    setInEditMode({
      status: true,
      rowKey: item.ID
    })
    seteditPascodeName(item.Title)
    seteditPascodeInsta(item.Installation)
    seteditPascodeOrg(item.Organization)
    seteditPascodeOrgMaj(item.OrgMAJCOM)
    seteditPascodeMaj(item.MAJCOM)
    seteditPascodecpts(item.ServicingCPTS)
    seteditPascodearchived(isArchive)
    changeMaj(item.MAJCOM)
    setChangeMaj(false)
  }
  const validatePascodeDetails = (id: any) => {
    toggleLoader(true)
    let valid = true
    let Pascode = true
    let SerMaj = true
    let Installation = true
    let Organization = true
    let OrgMaj = true
    let Cpts = true
    if (editPascodeName === '' || editPascodeName === undefined || editPascodeName === null) {
      valid = false
      Pascode = false
    }
    if (editPascodeMaj === '' || editPascodeMaj === undefined || editPascodeMaj === null || editPascodeMaj === 'Select') {
      valid = false
      SerMaj = false
    }
    if (editPascodeInsta === '' || editPascodeInsta === undefined || editPascodeInsta === null || editPascodeInsta === 'Select') {
      valid = false
      Installation = false
    }
    if (editPascodeOrg === '' || editPascodeOrg === undefined || editPascodeOrg === null) {
      valid = false
      Organization = false
    }
    if (editPascodeOrgMaj === '' || editPascodeOrgMaj === undefined || editPascodeOrgMaj === null) {
      valid = false
      OrgMaj = false
    }
    if (editPascodecpts === '' || editPascodecpts === undefined || editPascodecpts === null || editPascodecpts === 'Select') {
      valid = false
      Cpts = false
    }
    setPasValidations({
      ...PasValidations,
      valid: valid,
      PASCODE: Pascode,
      MAJCOM: SerMaj,
      Installation: Installation,
      Organization: Organization,
      OrgMaj: OrgMaj,
      CPTS: Cpts
    })
    if (valid) {
      saveOrUpdatePas(id)
    } else {
      toggleLoader(false)
    }
  }
  const saveOrUpdatePas = (id: any) => {
    console.log(id)
    setshowAddPopup(false)
    setInEditMode({
      status: false,
      rowKey: null
    })
    const isArchived = editPascodearchived === 'Yes'
    const addObj = {
      Title: editPascodeName,
      Organization: editPascodeOrg,
      MAJCOM: editPascodeMaj,
      ServicingCPTS: editPascodecpts,
      Installation: editPascodeInsta,
      AssignedComponent: 'RegAF',
      IsArchived: isArchived,
      OrgMAJCOM: editPascodeOrgMaj
    }

    if (id !== '' && id !== null && id !== undefined) {
      sp.web.lists.getByTitle(ListNames().PASCodeMetadataList).items.getById(id).update(addObj).then(function () {
        BuildmodifiedListUpdate()
      })
    } else {
      sp.web.lists.getByTitle(ListNames().PASCodeMetadataList).items.add(addObj).then(function () {
        BuildmodifiedListUpdate()
      })
    }
  }
  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'PASCodeMetadataList') {
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
        getPASCode()
        toggleLoader(false)
      })
    })
  }
  const onAdd = () => {
    setshowAddPopup(!showAddPopup)
    clearfieldValuesandValidations()
    setInEditMode({
      status: false,
      rowKey: null
    })
    setChangeMajFilter(false)
    setChangeMaj(false)
    setmajCpts(pasCodeItems)
  }
  const clearfieldValuesandValidations = () => {
    seteditPascodeInsta('')
    seteditPascodeMaj('')
    seteditPascodeName('')
    seteditPascodeOrg('')
    seteditPascodecpts('')
    seteditPascodeOrgMaj('')
    setPasValidations({
      ...PasValidations,
      valid: true,
      PASCODE: true,
      MAJCOM: true,
      Installation: true,
      Organization: true,
      OrgMaj: true,
      CPTS: true
    })
  }
  const clearFilters = () => {
    setfilterCpts('')
    setfilterMaj('')
    setfilterOrgMaj('')
    setChangeOrgMajFilter(false)
    setChangeMajFilter(false)
    setfilteredItems(pasCodeItems)
    setInputValue('')
    setemptysearch(false)
  }
  const onSearch = () => {
    const searchword = inputValue
    setInputValue(searchword)
    if (searchword !== '') {
      setemptysearch(false)
      const filtereddata = filteredItems?.filter(
        (data: any) => {
          return (
            data.AssignedComponent.toLowerCase().includes(searchword.toLowerCase()) ||
            String(data.ID).includes(searchword.toLowerCase()) ||
            data.Title.toLowerCase().includes(searchword.toLowerCase()) ||
            data.ServicingCPTS.toLowerCase().includes(searchword.toLowerCase()) ||
            data.Installation.toLowerCase().includes(searchword.toLowerCase()) ||
            data.MAJCOM.toLowerCase().includes(searchword.toLowerCase()) ||
            data.Organization.toLowerCase().includes(searchword.toLowerCase()) ||
            data.OrgMAJCOM.toLowerCase().includes(searchword.toLowerCase())
          )
        }
      )
      setfilteredItems(filtereddata)
    } else {
      setfilteredItems(pasCodeItems)
      setemptysearch(true)
    }
  }
  const displayalertDelete = (id: any) => {
    const proceed = window.confirm('Are you sure, you want to delete the selected item?')
    if (proceed) {
      Delete(id)
    }
  }
  const Delete = (id: any) => {
    toggleLoader(true)
    sp.web.lists.getByTitle(ListNames().PASCodeMetadataList).items.getById(id).delete().then(function () {
      BuildmodifiedListUpdate()
    })
  }
  function Pagination(data: string | any[], RenderComponent: any, title: any, pageLimit: any, dataLimit: number) {
    console.log(data?.length)
    const noPages = Math.round(data?.length / dataLimit)
    console.log(noPages)
    // const [pages, setpages] = useState<any>()
    // setpages(noPages)
    const [currentPage, setCurrentPage] = useState(1)

    function goToNextPage() {
      if (currentPage < noPages) { setCurrentPage((page) => page + 1) }
    }

    function goToPreviousPage() {
      if (currentPage > 1) { setCurrentPage((page) => page - 1) }
    }

    function changePage(event: any) {
      const pageNumber = Number(event.target.textContent)
      setCurrentPage(pageNumber)
    }

    const getPaginatedData = () => {
      const startIndex = currentPage * dataLimit - dataLimit
      const endIndex = startIndex + dataLimit
      return data?.slice(startIndex, endIndex)
    }

    const getPaginationGroup = () => {
      const start = Math.floor((currentPage - 1) / pageLimit) * pageLimit
      return new Array(pageLimit).fill(start).map((_, idx) => start + idx + 1)
    }

    return (
      <>
        {/* show the posts, 10 posts at a time */}
        {(getPaginatedData() as unknown as any[])?.map((d: any, idx: any) => (
          <RenderComponent key={idx} data={d} />
        ))}

        {/* show the pagiantion
        it consists of next and previous  as
        along with page numbers, in our case, 5 page
        numbers at a time
    */}
        <div className="pagination">
          {/* previous  a */}
          {
            currentPage !== 1
              ? (
                < a
                  onClick={goToPreviousPage}
                  className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
                >
                  prev
                </ a>
              )
              : ''
          }

          {/* show page numbers */}
          {getPaginationGroup()?.map((item: any, index: any) => (
            < a
              key={index}
              onClick={changePage}
              className={`paginationItem ${currentPage === item ? 'active' : null}`}
              style={{ display: item <= noPages ? '' : 'none' }}
            >
              <span>{item}</span>
            </ a>
          ))}

          {/* next  a */}
          <a
            onClick={goToNextPage}
            className={`next ${currentPage === noPages ? 'disabled' : ''}`}
            style={{ display: currentPage < noPages ? '' : 'none' }}
          >
            next
          </ a>
        </div>
      </>
    )
  }
  function displaydata(props: any) {
    // eslint-disable-next-line no-lone-blocks
    // { filteredItems?.length && filteredItems?.length > 0
    // ? filteredItems?.map((item: any) =>
    const item = props.data
    return (
      <><tr className="" key={item.Id}>
        <td>{item.AssignedComponent}</td>
        <td>{item.ID}</td>
        <td>{item.Title}</td>
        <td> {item.Installation}</td>
        <td> {item.Organization}</td>
        <td>{item.MAJCOM}</td>
        <td>{item.OrgMAJCOM}</td>
        <td>{item.ServicingCPTS}</td>

        <td id="Archived-5">{item.IsArchived ? 'Yes' : 'No'}</td>
        <td>
          <ul>
            <li><a href="javascript:void(0)" title="Edit" className="edit " onClick={() => { onEdit(item) }}> <span className='icon-Edit'></span></a></li>
            <li><a href="javascript:void(0)" title="Delete" className="delete"><span className="icon-trash" onClick={() => displayalertDelete(item.ID)}></span></a></li>
          </ul>
        </td>
      </tr><tr className='roweditpoup '>
          {inEditMode.status && inEditMode.rowKey === item.ID
            ? (
              <td colSpan={14}>
                <div className="divaddpopup">

                  <div className='divcardbody'>
                    <div className='row'>
                      <div className='col-md-4 col-xs-12'>
                        <div className="divformgroup">
                          <label htmlFor="txtAssignedComponent">Assigned Component</label><span className="mandatory">*</span>
                          <select name="Servicing CPTS" id="txtAssignedComponent">
                            <option value="RegAF">RegAF</option></select>
                        </div>

                      </div>

                      <div className="col-md-4 col-xs-12">
                        <div className="divformgroup">
                          <label htmlFor="PASCode">PAS Code </label><span className="mandatory">*</span>
                          <input type="text" name="EditPASCode" placeholder='Enter Pas Code' maxLength={9} id="txtPascode" value={editPascodeName} onChange={(event) => seteditPascodeName(event.target.value)} />
                          {!PasValidations.PASCODE
                            ? (
                              <span className="errormsg  ">Please enter PAS Code</span>)
                            : ''}
                        </div>
                      </div>

                      <div className="col-md-4 col-xs-12">
                        <div className="divformgroup">
                          <label htmlFor="Servicing MAJCOM">Servicing MAJCOM </label><span className="mandatory">*</span>
                          {RenderMaj()}
                          {!PasValidations.MAJCOM
                            ? (
                              <span className="errormsg  ">Please Select Servicing MAJCOM</span>)
                            : ''}
                        </div>
                      </div>

                      <div className="col-md-4 col-xs-12">
                        <div className="divformgroup">
                          <label htmlFor="Installation/Assigned Location">Installation/Assigned Location </label><span className="mandatory">*</span>
                          <input type="text" name="Installation" id="txtInstallation" placeholder='Enter Installation/Assigned Location ' value={editPascodeInsta} onChange={(event) => seteditPascodeInsta(event.target.value)} />
                          {!PasValidations.Installation
                            ? (
                              <span className="errormsg  ">Please enter Installation/Assigned Location</span>)
                            : ''}
                        </div>
                      </div>
                      <div className="col-md-4 col-xs-12">
                        <div className="divformgroup">
                          <label htmlFor="PASCode">Organization/Unit Name </label> <span className="mandatory">*</span>
                          <input type="text" name="EditOrg" placeholder='Enter Organization/Unit Name' id="txtOrg" value={editPascodeOrg} onChange={(event) => seteditPascodeOrg(event.target.value)} />
                          {!PasValidations.Organization
                            ? (
                              <span className="errormsg  ">Please enter Organization/Unit Name</span>)
                            : ''}
                        </div>
                      </div>
                      <div className="col-md-4 col-xs-12">
                        <div className="divformgroup">
                          <label htmlFor="Organization MAJCOM">Organization MAJCOM </label> <span className="mandatory">*</span>
                          <input type="text" name="EditOrg" placeholder='Enter Organization MAJCOM' id="orgMajcom" value={editPascodeOrgMaj} onChange={(event) => seteditPascodeOrgMaj(event.target.value)} />
                          {!PasValidations.OrgMaj
                            ? (
                              <span className="errormsg  ">Please Enter Organization MAJCOM</span>)
                            : ''}
                        </div>
                      </div>
                      <div className="col-md-4 col-xs-12">
                        <div className="divformgroup">
                          <label htmlFor="Servicing CPTS">Servicing Comptroller </label> <span className="mandatory">*</span>
                          {RenderCpts()}
                          {!PasValidations.CPTS
                            ? (
                              <span className="errormsg  ">Please Select Servicing Comptroller</span>)
                            : ''}
                        </div>
                      </div>

                      <div className="col-md-4 col-xs-12">
                        <div className="divformgroup">
                          <label htmlFor="Is Archived">Is Archived</label>
                          <select name="Is Archieved" value={editPascodearchived} onChange={(event) => seteditPascodearchived(event.target.value)}>
                            <option data-val="false" value="No">No</option>
                            <option data-val="true" value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="divpopupfooter">
                      <ul>
                        <li><a href="javascript:void(0)" title="Update" className="anchorsavebtn" onClick={() => validatePascodeDetails(item.ID)}> <span className="icon-Update"></span>Update</a></li>
                        <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchorglobalcancelbtn" onClick={() => { setInEditMode({ ...inEditMode, status: false }) }}><span className="icon-Close"></span>Cancel</a></li></ul></div>
                  </div>
                </div>
              </td>
            )
            : ''}
        </tr></>)
    // )
    // : <div className={noResultsClass + showStyleClass}> There are no results to display </div> }
  }
  return (
    <>
    {
      isProfileExist
        ? (
    <div className='divcontainer boxsizing divPascodesettings'>
      <div className='divhomeheader'>
        <div className='divtopheading'>
          <h1>PAS Code Settings</h1>
          <div className='divpascodeactions'>

            <div className="divforminline">
              <label htmlFor="Organization MAJCOM">Organization MAJCOM</label>
              {RenderOrgMaj()}
            </div>
            <div className="divforminline"><label htmlFor="Majcom">Servicing MAJCOM</label>{RenderMajFilter()}</div>
            <div className="divforminline">
              <label htmlFor="CPTS">Servicing Comptroller</label>
              {RenderCptsFilter()}
            </div>

          </div>
        </div>
        <div className="divbottomsec">
          <div className='divpascodesearchinfo'>
            <div className="divsearch">
              <div className="searchcontrolwrapper"><input type="text" name="search" placeholder="Search with DoD, Duty Email,Servicing Comptroller, Installation/Assigned Location, Organization, PASCODE" className="" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }} />
                {emptysearch
                  ? (
                    <span className="errormsg spanerromsg" >You cant leave this blank</span>
                  )
                  : ''
                }</div>
              <a href="javascript:void(0)" title="Search" className="anchorsearchbtn" id="search-user-btn" onClick={(e) => onSearch()}><span className="icon-searchleft"></span>Search</a>
              <a href="javascript:void(0)" title="Clear" className="anchorBtn Clearbtn" id="" onClick={() => clearFilters()}><span className="icon-Clear"></span> Clear</a>
              <a href="javascript:void(0)" title="Add" className="anchorBtn addbtn" onClick={() => { onAdd() }}><span className="icon-Add"></span> Add</a>
            </div>
          </div>
        </div>

      </div>
      {
        showAddPopup
          ? (
            <div className="divaddpopup ">
              <h3>ADD PAS CODE</h3>
              <div className='divcardbody'>
                <div className='row'>
                  <div className='col-md-4 col-xs-12'>
                    <div className="divformgroup">
                      <label htmlFor="txtAssignedComponent">Assigned Component</label> <span className="mandatory">*</span>
                      <select name="Servicing CPTS" id="txtAssignedComponent">
                        <option value="RegAF" >RegAF</option>
                      </select>
                    </div>

                  </div>

                  <div className="col-md-4 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="PASCode">PAS Code </label> <span className="mandatory">*</span>
                      <input type="text" name="EditPASCode" placeholder='Enter Pas Code' id="txtPascode" value={editPascodeName} onChange={(event) => seteditPascodeName(event.target.value)} maxLength={9} />
                      {!PasValidations.PASCODE
                        ? (
                          <span className="errormsg  ">Please enter PAS Code</span>)
                        : ''}

                    </div>
                  </div>

                  <div className="col-md-4 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="Servicing MAJCOM">Servicing MAJCOM </label><span className="mandatory">*</span>
                      {RenderMaj()}
                      {!PasValidations.MAJCOM
                        ? (
                          <span className="errormsg  ">Please Select Servicing MAJCOM</span>)
                        : ''}
                    </div>
                  </div>

                  <div className="col-md-4 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="Installation/Assigned Location">Installation/Assigned Location </label><span className="mandatory">*</span>
                      <input type="text" name="Installation" placeholder='Enter Installation/Assigned Location ' id="txtInstallation" value={editPascodeInsta} onChange={(event) => seteditPascodeInsta(event.target.value)} />
                      {!PasValidations.Installation
                        ? (
                          <span className="errormsg  ">Please enter Installation/Assigned Location</span>)
                        : ''}
                    </div>
                  </div>
                  <div className="col-md-4 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="PASCode">Organization/Unit Name </label> <span className="mandatory">*</span>
                      <input type="text" name="EditOrg" placeholder='Enter Organization/Unit Name' id="txtOrg" value={editPascodeOrg} onChange={(event) => seteditPascodeOrg(event.target.value)} />
                      {!PasValidations.Organization
                        ? (
                          <span className="errormsg  ">Please enter Organization/Unit Name</span>)
                        : ''}
                    </div>
                  </div>
                  <div className="col-md-4 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="Organization MAJCOM">Organization MAJCOM </label> <span className="mandatory">*</span>
                      <input type="text" name="EditOrg" placeholder='Enter Organization MAJCOM' id="orgMajcom" value={editPascodeOrgMaj} onChange={(event) => seteditPascodeOrgMaj(event.target.value)} />
                      {!PasValidations.OrgMaj
                        ? (
                          <span className="errormsg  ">Please Enter Organization MAJCOM</span>)
                        : ''}
                    </div>
                  </div>
                  <div className="col-md-4 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="Servicing CPTS">Servicing Comptroller </label> <span className="mandatory">*</span>
                      {RenderCpts()}
                      {!PasValidations.CPTS
                        ? (
                          <span className="errormsg  ">Please Select Servicing Comptroller</span>)
                        : ''}
                    </div>
                  </div>
                </div>
                <div className="divpopupfooter">
                  <ul>
                    <li><a href="javascript:void(0)" title="Save" className="anchorsavebtn" onClick={() => validatePascodeDetails('')}> <span className="icon-Save" ></span>Save</a></li>
                    <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchorglobalcancelbtn" onClick={() => { setshowAddPopup(false) }}><span className="icon-Close"></span>Cancel</a></li></ul></div>
              </div>
            </div>
          )
          : ''
      }

      <div className='divpascodetable'>
        <table>
          <thead>
            <tr>
              <th className="">Assigned Component

              </th>
              <th className="">PAS Code ID

              </th>
              <th className="">PAS Code

              </th>
              <th className="">Installation/Assigned Location

              </th>
              <th className="">Organization/Unit Name

              </th>
              <th className="">Servicing MAJCOM

              </th>
              <th>Organization MAJCOM
              </th>
              <th className="">Servicing Comptroller

              </th>
              <th className="">IS ARCHIVED</th>

              <th className="">Actions

              </th>
            </tr>
          </thead>
          <tbody className="myImscData">
            {Pagination(filteredItems, displaydata, 'PASCODE', 10, 10)}

          </tbody>
        </table>
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
: (
      ProfileExist()
    )
    }
     </>
  )
}

export default Pascode
