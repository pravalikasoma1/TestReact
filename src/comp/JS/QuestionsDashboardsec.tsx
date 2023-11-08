import React, { useEffect, useState } from 'react'
import '../CSS/Questions.css'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import { getFiscalYear, compareDates, GlobalConstraints } from '../../pages/Master'
import { ListNames, StatusIDs } from '../../pages/Config'

export interface Props {
  data?: any,
  tabid?: any,
  onClick?: any,
  filtervals?: any,
  loginuserroles?: any,
  onChange?: any,
  savedItems?: any,
  clickedKpi?: any
}

const QuestionsDashboardsec = (props: Props) => {
  const { data = [], savedItems = [], loginuserroles = [] } = props
  const tabid = props.tabid
  const selectedfilterval = props.filtervals
  const [SubCategoriesData, setSubCategoriesData] = useState<any>([])
  const savedQues = []
  const submittedQues = []
  const AFIMSCNAFFAQues = []
  const SMEQues = []
  const AFSVCQues = []
  const SAFFMQues = []
  const respondedQues = []
  const completedQues = []
  const canceledQues = []
  const PromotedtoKBQues = []
  const custActionReq = []
  const date = new Date()
  const clickedKpi = props.clickedKpi
  const currentfy = getFiscalYear(date)
  const fyhtml = buildfiscalyear('2022')

  const showSavedKPI = () => {
    if (tabid === 2) {
      return (
        <>
          <div className='divhr'></div>
          <div className="divkpifull">
            <a href="javascript:void(0)" title="Saved" data-statusid={StatusIDs().Saved} kpi-color="1" id='savedQues' onClick={(e) => handleOnClick(e)} className={clickedKpi === '1' ? 'selected' : ''}>
              <p>Saved</p><h2>{savedItems.length}</h2>
            </a>
          </div>

        </>
      )
    }
  }

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    initEffect()
  }, [])

  const initEffect = () => {
    const siteName = GlobalConstraints().siteName
    let subcategoriesdata: any = []
    const listName = ListNames().SubCategoriesMetadata
    const listModifiedDate = localStorage.getItem('SubCategoriesMetadataBuildModifiedListDate' + siteName) || ''
    const QandAModifiedDate = localStorage.getItem('SubCategoriesMetadata_LMDate' + siteName)
    const needToUpdate = compareDates(listModifiedDate, QandAModifiedDate)
    if (needToUpdate) {
      const list = sp.web.lists.getByTitle(listName)
      list.items.select('ID', 'Category', 'SubCategory', 'IsArchived').orderBy('Modified', false).get().then(function (items) {
        if (items.length > 0) {
          items?.map(item => {
            subcategoriesdata.push({
              Id: item.ID,
              Category: item.Category,
              SubCategory: item.SubCategory,
              IsArchived: item.IsArchived
            })
          })
        }
        const subcatdata = subcategoriesdata?.filter((item: any) => { return item.IsArchived === false })
        setSubCategoriesData(subcatdata)
        localStorage.setItem('SubCategoriesMetadata_LMDate' + siteName, listModifiedDate)
        localStorage.setItem('subCategoriesMetadata' + siteName, JSON.stringify(subcategoriesdata))
      })
    } else {
      subcategoriesdata = (localStorage.getItem('subCategoriesMetadata' + siteName) !== undefined && localStorage.getItem('subCategoriesMetadata' + siteName) !== '' && localStorage.getItem('subCategoriesMetadata' + siteName) !== null ? JSON.parse(localStorage.getItem('subCategoriesMetadata' + siteName) || '{}') : [])
      const subcatdata = subcategoriesdata?.filter((item: any) => { return item.IsArchived === false })
      setSubCategoriesData(subcatdata)
    }
  }

  // eslint-disable-next-line space-before-function-paren
  function buildfiscalyear(year: any) {
    let Fyhtml = ''
    if (String(currentfy) !== year) {
      Fyhtml = "<option value='ALL'>ALL</option>"
    }
    for (let i: any = currentfy; i >= year; i--) {
      Fyhtml += "<option value='" + i + "'>" + i + '</option>'
    }
    return Fyhtml
  }

  for (let i = 0; i < data.length; i++) {
    if (data[i].Status.ID === 1) {
      savedQues.push(data[i])
    } else if (data[i].Status.ID === 2 || data[i].Status.ID === 3) {
      AFIMSCNAFFAQues.push(data[i])
    } else if (data[i].Status.ID === 4) {
      SMEQues.push(data[i])
    } else if (data[i].Status.ID === 5) {
      AFSVCQues.push(data[i])
    } else if (data[i].Status.ID === 6) {
      SAFFMQues.push(data[i])
    } else if (data[i].Status.ID === 7) {
      respondedQues.push(data[i])
    } else if (data[i].Status.ID === 8) {
      completedQues.push(data[i])
    } else if (data[i].Status.ID === 9) {
      canceledQues.push(data[i])
    } else if (data[i].Status.ID === 10) {
      PromotedtoKBQues.push(data[i])
    } else if (data[i].Status.ID === 11) {
      custActionReq.push(data[i])
    }
    // window.location.href = `${window.location.origin + window.location.pathname}#/Questions`
  }

  const handleOnClick = (e: any) => {
    props.onClick(e.currentTarget)
  }

  const handleOnChange = (e: any) => {
    props.onChange(e)
  }
  return (
    <div className='col-xl-3 col-sm-12'>
      <aside>
        <div className="divrightcontainer">
          <header>
            <h1><span className="icon-Dashboard"></span>Dashboard</h1>
            <div className="divfiscalyear">
              <label htmlFor="Selectdropdownyear">Fiscal Year </label>
              <select name="Year" value={selectedfilterval.FY} id="Selectfy" dangerouslySetInnerHTML={{ __html: fyhtml }} onChange={(e) => handleOnChange(e)}>
              </select>
            </div>
            <a href="javascript:void(0)" className="anchorclearalllink" title="Clear" id='clearAll' onClick={(e) => handleOnClick(e)}><span className="icon-Clear"></span> Clear</a>
          </header>
          <div className="divfilters divformgroup">
            <div className="divfilterrow">
              <div className="divfilterfield">
                <label htmlFor="SelectdropdownServicedBy">Category</label>
                <select name="Servicing By" aria-label="Servicing By" id="SelectdropdownServicedBy">
                  <option value="NAFFA">NAFFA</option>
                </select>
              </div>
              <div className="divfilterfield">
                <label htmlFor="selectdropdownSubCategory">Sub Category</label>
                <select name="Sub Category" value={selectedfilterval.SubCategory} id="selectSubCategory" onChange={(e) => handleOnChange(e)}>
                  <option value="ALL">ALL</option>
                  {SubCategoriesData.map((item: any) => <option key={item.SubCategory} value={item.SubCategory}>{item.SubCategory}</option>)}
                </select>
              </div>
            </div>
            <div className="divfilterfield">
              <label htmlFor="SelectdropdownSubmittedDate">Submitted Date</label>
              <select name="Servicing Organization" aria-label="Submitted Date" value={selectedfilterval.SubmittedDate}
                id="SelectSubmittedDate" onChange={(e) => handleOnChange(e)}>
                <option value="ALL">ALL</option>
                <option value="1">Last 24 hours</option>
                <option value="2">Last 48 hours</option>
                <option value="3">Last 3 days</option>
                <option value="7">Last 7 days</option>
                <option value="15">Last 15 days</option>
                <option value="30">Last 30 days</option>
                <option value="31">More than 30 days</option>
              </select>
            </div>
            <div className="divkpis">
              <div className="divtotalbg" tabIndex={0} id='totalques' onClick={(e) => handleOnClick(e)}>
                <div className="divtotalbgdetails">
                  <p> Total Questions</p>
                </div>
                <div className="divcount">
                  <span id="spantotalCount">{data.length}</span>
                </div>
              </div>
            </div>
            <div className="divkpisaccordions">
              <div className="divsubtopkpis">
                <ul>
                  <li data-statusid={StatusIDs().AFIMSCNAFFA} onClick={(e) => handleOnClick(e)}>
                    <a href="javascript:void(0)" kpi-color="3" title="AFIMSC" className={clickedKpi === '3' ? 'selected' : ''}>
                      <h2>{AFIMSCNAFFAQues.length}</h2><p>AFIMSC</p>
                    </a>
                  </li>
                  <li data-statusid={StatusIDs().SME} onClick={(e) => handleOnClick(e)} >
                    <a href="javascript:void(0)" kpi-color="4" title="SME Review" className={clickedKpi === '4' ? 'selected' : ''}>
                      <h2>{SMEQues.length}</h2><p>SME Review</p>
                    </a>
                  </li>
                  <li data-statusid={StatusIDs().AFSVC} onClick={(e) => handleOnClick(e)} >
                    <a href="javascript:void(0)" kpi-color="5" title="AFSVC" className={clickedKpi === '5' ? 'selected' : ''}>
                      <h2>{AFSVCQues.length}</h2><p>AFSVC</p>
                    </a>
                  </li>
                  <li data-statusid={StatusIDs().SAFFMCEB} onClick={(e) => handleOnClick(e)} >
                    <a href="javascript:void(0)" kpi-color="6" title="SAF FMCEB" className={clickedKpi === '6' ? 'selected' : ''}>
                      <h2>{SAFFMQues.length}</h2><p>SAF FMCEB</p>
                    </a>
                  </li>
                </ul>
              </div>
              <div className='divkpifulllist'>
                <div className="divkpifull">
                  <a href="javascript:void(0)" title="Customer Action Required" kpi-color="11" data-statusid={StatusIDs().Customer} onClick={(e) => handleOnClick(e)} className={clickedKpi === '11' ? 'selected' : ''}>
                    <p>Customer Action Required</p><h2>{custActionReq.length}</h2>
                  </a>
                </div>
              </div>

              <div className="divhr"></div>
              <div className="divkpifulllist">
                <div className="divkpifull">
                  <a href="javascript:void(0)" title="Response Received" kpi-color="7" data-statusid={StatusIDs().Responded} onClick={(e) => handleOnClick(e)} className={clickedKpi === '7' ? 'selected' : ''}>
                    {
                      loginuserroles.loginuserrole === 'AFIMSC' || loginuserroles.loginuserrole === 'NAFFA Owners' || loginuserroles.isAFIMSCOwner
                        ? (<><p>Response Received</p><h2>{respondedQues.length}</h2> </>)
                        : (<><p>Responded</p><h2>{respondedQues.length}</h2></>)}
                  </a>
                </div>
                <div className="divkpifull">
                  <a href="javascript:void(0)" title="Completed" kpi-color="8" data-statusid={StatusIDs().Completed} onClick={(e) => handleOnClick(e)} className={clickedKpi === '8' ? 'selected' : ''}>
                    <p>Completed</p><h2>{completedQues.length}</h2>
                  </a>
                </div>
                <div className="divkpifull">
                  <a href="javascript:void(0)" title="Promoted To Knowledge Graph" data-statusid={StatusIDs().PromotedtoKB} kpi-color="10" onClick={(e) => handleOnClick(e)} className={clickedKpi === '10' ? 'selected' : ''}>
                    <p>Promoted To Knowledge Graph</p><h2>{PromotedtoKBQues.length}</h2>
                  </a>
                </div>
                <div className="divkpifull">
                  <a href="javascript:void(0)" title="Canceled" data-statusid={StatusIDs().Canceled} kpi-color="9" onClick={(e) => handleOnClick(e)} className={clickedKpi === '9' ? 'selected' : ''}>
                    <p>Canceled</p><h2>{canceledQues.length}</h2>
                  </a>
                </div>
                {showSavedKPI()}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default QuestionsDashboardsec
