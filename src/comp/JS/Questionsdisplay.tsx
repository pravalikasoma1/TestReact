import React, { useState, useEffect } from 'react'
import '../CSS/Questions.css'
import QuestionActionbtns from './QuestionActionbtns'
import { NavLink as Link } from 'react-router-dom'
import styled from 'styled-components'
import { LoginUserName, convertDate, getNumberofDays, GlobalConstraints } from '../../pages/Master'
import QuestionsDashboardsec from '../JS/QuestionsDashboardsec'
import { ListNames } from '../../pages/Config'
import { sp } from '@pnp/sp'

export const Navlink = styled(Link)`  
    
}`
export interface Props {
    data?: any,
    savedItems?: any,
    loginuserroles?: any,
    ActionCompleted?: any
  }

const Questionsdisplay = (props: Props) => {
  const { data = [], savedItems = [], loginuserroles = [] } = props
  const [showAllQuesTab, setshowAllQuesTab] = useState(true)
  const [showAllQuescontent, setshowAllQuescontent] = useState(true)
  const [AllQuestionsState, setAllQuestions] = useState([])
  const [MyQuestionsState, setMyQuestions] = useState([])
  const [AllQuestionsGrid, setAllQuestionsGrid] = useState([])
  const [MyQuestionsGrid, setMyQuestionsGrid] = useState([])
  const [DashboardDataState, setDashboardData] = useState([])
  const [ddlfilteredVal, setddlfilteredVal] = useState([])
  const [ToggleState, setToggleState] = useState(1)
  const [Fyddl, setFyddl] = useState('')
  const [SubCatddl, setSubCatddl] = useState('')
  const [SubmittedDateddl, setSubmittedDateddl] = useState('')
  const [ddlChange, setddlChange] = useState(false)
  const [kpistatusid, setkpistatusid] = useState('')
  const [SelectFilterVal, setSelectFilterVal] = useState({
    FY: 'ALL',
    SubCategory: 'ALL',
    SubmittedDate: 'ALL'
  })
  const [selectedItemArray, setselectedItemArray] = useState<any>([])
  const noResultsClass = 'divnoresults '
  const hideStyleClass = 'hidecomponent '
  const showStyleClass = 'showcomponent '
  const siteName = GlobalConstraints().siteName
  useEffect(() => {
    $('.questionsnavigation a').addClass('active')
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    initEffect()
  }, [data])

  useEffect(() => {
    const isBackclicked = sessionStorage.getItem('clickedBackBtn' + siteName)
    if (isBackclicked === 'true') {
      const ddlvalFY = sessionStorage.getItem('selectedFY' + siteName) || 'ALL'
      const ddlvalSubcat = sessionStorage.getItem('selectedSubCat' + siteName) || 'ALL'
      const ddlvalSubmittedDate = sessionStorage.getItem('selectedSubmittedDate' + siteName) || 'ALL'
      const selectedTab = sessionStorage.getItem('selectedTab' + siteName) || 1
      const selectedKPI = sessionStorage.getItem('selectedKPI' + siteName) || ''
      setkpistatusid(selectedKPI)
      setToggleState(Number(selectedTab))
      toggleTab(Number(selectedTab))
      setFyddl(ddlvalFY)
      setSubCatddl(ddlvalSubcat)
      setSubmittedDateddl(ddlvalSubmittedDate)
      setSelectFilterVal({
        ...SelectFilterVal,
        FY: ddlvalFY,
        SubCategory: ddlvalSubcat,
        SubmittedDate: ddlvalSubmittedDate
      })
    }
    ddlChangeFilterdata()
    sessionStorage.removeItem('clickedBackBtn' + siteName)
    sessionStorage.removeItem('selectedFY' + siteName)
    sessionStorage.removeItem('selectedSubCat' + siteName)
    sessionStorage.removeItem('selectedSubmittedDate' + siteName)
    sessionStorage.removeItem('selectedTab' + siteName)
  }, [AllQuestionsState])

  const initEffect = () => {
    let allquestions: any = []
    const myquestions: any = []
    data.map((d: any, i: any) => d.CustomerID === LoginUserName().UserId ? myquestions.push(d) : allquestions.push(d))
    allquestions = allquestions.filter((d: any) => { return d.Status.ID !== 1 })
    // myquestions = myquestions.concat(savedItems)
    let selKPI : any
    const tab = window.location.href
    if (tab.includes('&')) {
      selKPI = tab.split('=')[1]
      if (Number(selKPI) === 1) {
        setMyQuestionsGrid(savedItems)
        setToggleState(2)
        setDashboardData(myquestions)
        setddlfilteredVal(myquestions)
        setkpistatusid(selKPI)
        setAllQuestionsGrid(allquestions)
        setshowAllQuescontent(false)
        if (loginuserroles && !loginuserroles.isNAFFAOwner && (loginuserroles.isSubmitter || loginuserroles.isSiteAdmin)) {
          setshowAllQuesTab(false)
        }
      } else {
        const selKPIQues = allquestions.filter((d: any) => { return d.Status.ID === Number(selKPI) })
        sessionStorage.setItem('selectedKPI' + siteName, selKPI)
        setAllQuestionsGrid(selKPIQues)
        setkpistatusid(selKPI)
      }
    } else {
      setAllQuestionsGrid(allquestions)
    }
    setAllQuestions(allquestions)
    setMyQuestions(myquestions)
    ddlChangeFilterdata()
    if (Number(selKPI) !== 1) {
      setMyQuestionsGrid(myquestions)
    }
    // if (LoginUserName().UserName === 'submitter1' || LoginUserName().UserName === 'submitter2') {
    if (loginuserroles && !loginuserroles.isNAFFAOwner && (loginuserroles.isSubmitter || loginuserroles.isSiteAdmin) && Number(selKPI) !== 1) {
      setshowAllQuesTab(false)
      setshowAllQuescontent(false)
      setToggleState(2)
      setDashboardData(myquestions)
      setddlfilteredVal(myquestions)
    } else if (Number(selKPI) !== 1) {
      setDashboardData(allquestions)
      setddlfilteredVal(allquestions)
    }
    // getSavedQuestions()
  }

  const handleClick = (e: any) => {
    // let KPIData: any = []
    setselectedItemArray([])
    sessionStorage.removeItem('selectedKPI' + siteName)
    const statusid = Number(e.dataset.statusid)
    setkpistatusid(e.dataset.statusid)
    const KPIclickId = e.id
    $('#s4-workspace').animate({
      scrollTop: 0
    }, 500)
    if (KPIclickId === 'clearAll') {
      if (ToggleState === 1) {
        setAllQuestionsGrid(AllQuestionsState)
        setddlfilteredVal(AllQuestionsState)
        setDashboardData(AllQuestionsState)
      } else {
        setMyQuestionsGrid(MyQuestionsState)
        setddlfilteredVal(MyQuestionsState)
        setDashboardData(MyQuestionsState)
      }
      setFyddl('ALL')
      setSubCatddl('ALL')
      setSubmittedDateddl('ALL')
      setSelectFilterVal({ ...SelectFilterVal, FY: 'ALL', SubCategory: 'ALL', SubmittedDate: 'ALL' })
    } else if (KPIclickId === 'totalques') {
      // const KPIData = ddlfilteredVal.filter((d: any) => { return d.Status.ID === statusid })
      if (ToggleState === 1) {
        setAllQuestionsGrid(ddlfilteredVal)
      } else if (ToggleState === 2) {
        setMyQuestionsGrid(ddlfilteredVal)
      }
    } else if (ToggleState === 1) {
      const KPIData = ddlfilteredVal.filter((d: any) => { return d.Status.ID === statusid })
      setAllQuestionsGrid(KPIData)
    } else if (ToggleState === 2) {
      let KPIData = []
      if (KPIclickId === 'savedQues') {
        KPIData = savedItems.filter((d: any) => { return d.Status.ID === statusid })
      } else {
        KPIData = ddlfilteredVal.filter((d: any) => { return d.Status.ID === statusid })
      }
      setMyQuestionsGrid(KPIData)
    }
  }

  const handleChange = (e: any) => {
    setselectedItemArray([])
    sessionStorage.removeItem('selectedKPI' + siteName)
    const ddlid = e.currentTarget.id
    const ddlvalue = e.currentTarget.value
    if (ddlid === 'Selectfy') {
      setFyddl(ddlvalue)
      setSelectFilterVal({ ...SelectFilterVal, FY: ddlvalue })
    } else if (ddlid === 'selectSubCategory') {
      setSubCatddl(ddlvalue)
      setSelectFilterVal({ ...SelectFilterVal, SubCategory: ddlvalue })
    } else if (ddlid === 'SelectSubmittedDate') {
      setSubmittedDateddl(ddlvalue)
      setSelectFilterVal({ ...SelectFilterVal, SubmittedDate: ddlvalue })
    }
    setkpistatusid('')
    setddlChange(true)
  }

  useEffect(() => {
    if (ddlChange === true) {
      ddlChangeFilterdata()
    }
  }, [ddlChange])

  const ddlChangeFilterdata = () => {
    const filterData: any = (ToggleState === 1 ? AllQuestionsState : MyQuestionsState)
    const filtervals: any = []
    setSelectFilterVal({
      ...SelectFilterVal,
      FY: Fyddl,
      SubCategory: SubCatddl,
      SubmittedDate: SubmittedDateddl
    })
    const selectedKPI = sessionStorage.getItem('selectedKPI' + siteName) || ''
    if (filterData.length > 0) {
      for (let i = 0; i < filterData.length; i++) {
        let submitteddatescalc: any = getNumberofDays(filterData[i].Created)
        submitteddatescalc = (submitteddatescalc < 0 || isNaN(submitteddatescalc) ? 0 : submitteddatescalc)
        if ((Fyddl === 'ALL' || Fyddl === null || Fyddl === '' ? true : Fyddl === filterData[i].FY) &&
    (SubCatddl === 'ALL' || SubCatddl === null || SubCatddl === '' ? true : SubCatddl === filterData[i].SubCategory) &&
    (SubmittedDateddl === 'ALL' || SubmittedDateddl === null || SubmittedDateddl === '' ? true : SubmittedDateddl === '31' ? submitteddatescalc > SubmittedDateddl : submitteddatescalc <= SubmittedDateddl)) {
          filtervals.push(filterData[i])
        }
      }
      const tab = window.location.href
      let selKPI
      if (tab.includes('&')) {
        selKPI = tab.split('=')[1]
      }
      if (ToggleState === 1) {
        setAllQuestionsGrid(filtervals)
      } else if (Number(selKPI) !== 1) {
        setMyQuestionsGrid(filtervals)
      }// else if (Number(selKPI) == 1) {
      //   window.location.href = `${window.location.origin + window.location.pathname}#/Questions`
      // }
      setDashboardData(filtervals)
      setddlfilteredVal(filtervals)
      setddlChange(false)
      if (selectedKPI !== '' && selectedKPI !== 'undefined' && selectedKPI !== null && selectedKPI !== undefined && selectedKPI !== 'null') {
        setkpistatusid(selectedKPI)
        setKPIQuestions(selectedKPI)
        // setkpistatusid(kpistatusid)
      } /* else {
        setKPIQuestions(selectedKPI)
      } */
    }
  }

  const setKPIQuestions = (selectedKPI : any) => {
    if (ToggleState === 1) {
      const KPIData = ddlfilteredVal.filter((d: any) => { return d.Status.ID === Number(selectedKPI) })
      setAllQuestionsGrid(KPIData)
    } else if (ToggleState === 2) {
      let KPIData = []
      if (selectedKPI === '1') {
        KPIData = savedItems.filter((d: any) => { return d.Status.ID === Number(selectedKPI) })
      } else {
        KPIData = ddlfilteredVal.filter((d: any) => { return d.Status.ID === Number(selectedKPI) })
      }
      setMyQuestionsGrid(KPIData)
      setkpistatusid(selectedKPI)
      // sessionStorage.removeItem('selectedKPI' + siteName)
    }
  }

  useEffect(() => {
    const selectedKPI = sessionStorage.getItem('selectedKPI' + siteName) || ''
    if (selectedKPI !== '') {
      setKPIQuestions(selectedKPI)
    }
  }, [ddlfilteredVal])

  const toggleTab = (index: any) => {
    if (index === 1) {
      setDashboardData(AllQuestionsState)
      setddlfilteredVal(AllQuestionsState)
      setshowAllQuescontent(true)
    } else {
      setDashboardData(MyQuestionsState)
      setddlfilteredVal(MyQuestionsState)
      setshowAllQuescontent(false)
    }
    setFyddl('')
    setSubmittedDateddl('')
    setSubCatddl('')
    setSelectFilterVal({ ...SelectFilterVal, FY: 'ALL', SubCategory: 'ALL', SubmittedDate: 'ALL' })
    setAllQuestionsGrid(AllQuestionsState)
    setMyQuestionsGrid(MyQuestionsState)
    setkpistatusid('')
    setToggleState(index)
  }
  const Deletesaveditem = (id : any) => {
    const proceed = window.confirm('Are you sure, you want to delete the selected item?')
    if (proceed) {
      sp.web.lists.getByTitle(ListNames().SavedQuestionsList).items.getById(id).delete().then(function (data) {
        props.ActionCompleted()
        setMyQuestionsGrid(savedItems)
        document.location = `${window.location.origin + window.location.pathname}#/Questions&card=1`
      })
    }
  }

  const storefiltervalues = () => {
    if (SelectFilterVal.FY !== null && SelectFilterVal.FY !== undefined) { sessionStorage.setItem('selectedFY' + siteName, SelectFilterVal.FY) }
    if (SelectFilterVal.SubCategory !== null && SelectFilterVal.SubCategory !== undefined) { sessionStorage.setItem('selectedSubCat' + siteName, SelectFilterVal.SubCategory) }
    if (SelectFilterVal.SubmittedDate !== null && SelectFilterVal.SubmittedDate !== undefined) { sessionStorage.setItem('selectedSubmittedDate' + siteName, SelectFilterVal.SubmittedDate) }
    if (ToggleState !== null && ToggleState !== undefined) { sessionStorage.setItem('selectedTab' + siteName, String(ToggleState)) }
    if (kpistatusid !== null && kpistatusid !== undefined) { sessionStorage.setItem('selectedKPI' + siteName, String(kpistatusid)) }
  }
  const getActiveClass = (index: any, className: any) =>
    ToggleState === index ? className : ''

  const checkboxChecked = (e: any) => {
    const itemId = e.target.dataset.id
    const itemGUID = e.target.dataset.itemguid
    const StatusID = e.target.dataset.statusid
    const StatusTitle = e.target.dataset.statusTitle
    const QuestionTitle = e.target.dataset.questiontitle
    const DutyEmail = e.target.dataset.dutyemail
    const QuestionId = e.target.dataset.questionid
    const AssignedToId = e.target.dataset.assignedtoid
    const assignusers = e.target.dataset.assignedusers
    let curritem = []
    if (e.target.checked) {
      curritem = selectedItemArray.slice()
      curritem.push({ itemId: itemId, itemGUID: itemGUID, StatusID: StatusID, StatusTitle: StatusTitle, QuestionTitle: QuestionTitle, DutyEmail: DutyEmail, QuestionID: QuestionId, AssignedToId: AssignedToId, AssignedUsers: assignusers })
    } else {
      curritem = selectedItemArray.filter(function (file: any) { return file.itemGUID !== itemGUID })
    }
    setselectedItemArray(curritem)
  }

  const handleAction = () => {
    setselectedItemArray([])
    setkpistatusid('')
    props.ActionCompleted()
  }

  return (
      <>
        <div className='col-xl-9 col-sm-12'>
            <div className="divquestionsTab" id="divquestionsTab">
                <div className="divtabs">
                    <ul className="ulnav" role="tablist">
                        <li className={`tab ${getActiveClass(1, 'active')}`} onClick={() => toggleTab(1)} id="AllQuestiontab" style={{ display: showAllQuesTab ? 'block' : 'none' }}>
                            <a href="javascript:void(0)" role="tab" aria-controls="anchorAllQuestionsTab" tabIndex={0} title="Questions">
                                All Questions <span className="spancount">{AllQuestionsGrid.length}</span></a>
                        </li>
                        <li className={`tab ${getActiveClass(2, 'active')}`} onClick={() => toggleTab(2)} id="MyQuestionstab">
                            <a href="javascript:void(0)" role="tab" aria-controls="anchorMyQuestionsTab" tabIndex={-1} title="My Questions">
                                My Questions <span className="spancount">{MyQuestionsGrid.length}</span></a>
                        </li>
                    </ul>
                    <div className="divheaderactionbtns">
                        <ul>
                          {
                            window.location.href.includes('&')
                              ? (
                            <QuestionActionbtns data={(Number(kpistatusid) === 1) ? savedItems : AllQuestionsGrid } tabid={(Number(kpistatusid) === 1) ? 2 : 1} statusid={kpistatusid} loginuserroles={loginuserroles} selectedArray={selectedItemArray} actionPerformed={handleAction}/>
                                )
                              : <QuestionActionbtns data={showAllQuescontent ? AllQuestionsGrid : MyQuestionsGrid} tabid={ToggleState} statusid={kpistatusid} loginuserroles={loginuserroles} selectedArray={selectedItemArray} actionPerformed={handleAction}/>
                          }

                        </ul>
                    </div>
                </div>
                <div className="divborderline"></div>
                <div className="tab-content">
                    <div className={`content ${getActiveClass(1, 'active-content')}`} id='AllgridResults' style={{ display: showAllQuescontent ? 'block' : 'none' }}>
                        <div className="divquestionslist">
                            <ul>
                                {AllQuestionsGrid.length && AllQuestionsGrid.length > 0
                                  ? AllQuestionsGrid?.map((item: any) =>
                                    <li key={item.ID}>
                                        <span className="spanquestion">
                                            <input type="checkbox" name="" data-id={item.Id} data-itemguid={item.ItemGUID} data-dutyemail={item.DutyEmail} data-statusid={item.Status.ID} data-statusTitle={item.Status.Title} data-questiontitle={item.QuestionTitle} data-questionID ={item.QuestionID} data-assignedusers = {(item && item.AssignedUsers && item.AssignedUsers !== undefined && item.AssignedUsers !== null && item.AssignedUsers !== '' ? item.AssignedUsers.ID : '')} data-assignedToId = {(item && item.AssignedTo && item.AssignedTo !== undefined && item.AssignedTo !== null && item.AssignedTo !== '' ? item.AssignedTo.ID : '')} onChange={checkboxChecked} checked={selectedItemArray.filter((d:any) => d.itemGUID === item.ItemGUID).length > 0}/>
                                            <Navlink to={{ pathname: `Detailedviewpage/${item.ItemGUID}` }} title={item.QuestionTitle} data-itemID={item.ItemGUID} onClick={() => storefiltervalues()}>{item.QuestionTitle}</Navlink>
                                        </span>
                                        <div className="divquestionstatus">
                                            <div className="divitem">
                                                <p>Category</p><h5>{item.Category}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Sub Category</p><h5>{item.SubCategory}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Submitted by</p><h5>{item.ItemCreatedBy.Title}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Submitted Date</p><h5>{convertDate(item.ItemCreated, 'date')}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Status</p>
                                                {
                                                    ((loginuserroles.loginuserrole === 'NAFFA Owners' || loginuserroles.loginuserrole === 'AFIMSC' || loginuserroles.isAFIMSCOwner) && item.Status.Title === 'Responded')
                                                      ? (
                                                      <h5 kpi-color={item.Status.ID}>Response Received</h5>
                                                        )
                                                      : (
                                                      <h5 kpi-color={item.Status.ID}>{item.Status.Title}</h5>
                                                        )
                                                }
                                            </div>
                                        </div>
                                    </li>
                                  )
                                  : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}
                            </ul>
                        </div>
                    </div>
                    <div className={`content ${getActiveClass(2, 'active-content')}`} id='MygridResults'>
                        <div className="divquestionslist">
                            <ul>
                                {MyQuestionsGrid.length && MyQuestionsGrid.length > 0
                                  ? MyQuestionsGrid?.map((item: any) =>
                                    <li key={item.Id}>
                                        <span className="spanquestion">
                                            {item.Status.ID === 1 ? (<Link to={{ pathname: `QuestionForm/s=${item.ItemGUID}` }} title={item.QuestionTitle} >{item.QuestionTitle}</Link>) : (<Link to={{ pathname: `Detailedviewpage/${item.ItemGUID}` }} title={item.QuestionTitle} onClick={() => storefiltervalues()}>{item.QuestionTitle}</Link>) }
                                        </span>
                                        <div className="divquestionstatus">
                                            <div className="divitem">
                                                <p>Category</p><h5>{item.Category}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Sub Category</p><h5>{item.SubCategory}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Submitted by</p><h5>{item.ItemCreatedBy.Title}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Submitted Date</p><h5>{convertDate(item.ItemCreated, 'date')}</h5>
                                            </div>
                                            <div className="divitem">
                                                <p>Status</p><h5 kpi-color={item.Status.ID}>{item.Status.Title}</h5>
                                            </div>
                                            {
                                              item.Status.ID === 1
                                                ? (
                                                <div className="divitem">
                                              <span className='spandelete' title='Delete' onClick={() => Deletesaveditem(item.Id)}><span className='icon-delete'></span></span>
                                            </div>
                                                  )
                                                : ''
                                            }

                                        </div>
                                    </li>
                                  )
                                  : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <QuestionsDashboardsec data={DashboardDataState} tabid={ToggleState} filtervals={SelectFilterVal} savedItems={savedItems} loginuserroles={loginuserroles} onClick={handleClick} onChange={handleChange} clickedKpi = {kpistatusid}/>
    </>
  )
}

export default Questionsdisplay
