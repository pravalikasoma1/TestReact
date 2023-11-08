/* eslint-disable jsx-a11y/anchor-is-valid */
import { sp } from '@pnp/sp'
import React, { useEffect, useState } from 'react'
import { ListNames } from '../../../pages/Config'
import { compareDates, convertDate, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import loader from '../../Images/Loader.gif'
const TooltipsSettings = () => {
  const [loaderState, setloaderState] = useState(false)
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [listItems, setListItems] = useState<any>([])
  const [editLabel, seteditLabel] = useState('')
  const [editLabelID, seteditLabelID] = useState('')
  const [editLabelDesc, seteditLabelDesc] = useState('')
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const [TooltipValidations, setTooltipValidations] = useState({
    valid: true,
    TooltipDescription: true
  })
  useEffect(() => {
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  const initEffect = () => {
    toggleLoader(true)

    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('ToolTipListBuildModifiedListDate' + siteName) || ''
      const QLModifiedDate = localStorage.getItem('Tooltip_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, QLModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(ListNames().ToolTipList)
        const endpoint = ['ID', 'Tooltip_x0020_Description', 'Title', 'Label_x0020_Name', 'ToolTipId', 'IsArchived', 'Modified', 'Editor/Id', 'Editor/Title']
        const expand = ['Editor']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          localStorage.setItem('TooltipData' + siteName, JSON.stringify(items))
          localStorage.setItem('Tooltip_LMDate' + siteName, listModifiedDate)
          setListItems(items)
          setTimeout(() => {
            toggleLoader(false)
          }, 1000)
        })
      } else {
        const TooltipData: any = (localStorage.getItem('TooltipData' + siteName) !== undefined && localStorage.getItem('TooltipData' + siteName) !== '' && localStorage.getItem('TooltipData' + siteName) !== null ? JSON.parse(localStorage.getItem('TooltipData' + siteName) || '{}') : [])
        setListItems(TooltipData)
        setTimeout(() => {
          toggleLoader(false)
        }, 2000)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const onEdit = (id: any, name: any, LabelId: any, description: any) => {
    setInEditMode({
      status: true,
      rowKey: id
    })
    seteditLabel(name)
    seteditLabelID(LabelId)
    seteditLabelDesc(description)
    setTooltipValidations({
      ...TooltipValidations,
      valid: true,
      TooltipDescription: true
    })
  }
  const validateQL = (id: any, desc: any) => {
    toggleLoader(true)
    let valid = true
    let LabelDesc = true
    if (desc == '' || desc == undefined || desc == null) {
      valid = false
      LabelDesc = false
    }
    setTooltipValidations({
      ...TooltipValidations,
      valid: valid,
      TooltipDescription: LabelDesc
    })
    if (valid) {
      saveOrUpdateQL(id)
    } else {
      toggleLoader(false)
    }
  }
  const saveOrUpdateQL = (id: any) => {
    setInEditMode({
      status: false,
      rowKey: null
    })
    const updateObj = {
      Tooltip_x0020_Description: editLabelDesc
    }
    sp.web.lists.getByTitle(ListNames().ToolTipList).items.getById(id).update(updateObj).then(function () {
      BuildmodifiedListUpdate()
    })
  }
  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'ToolTipList') {
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
    <div id="divTooltips" className="tabcontent SettingsTooltips page" data-page="Tooltips">
      <div className="divsettingsheader ">
        <h2><span className="icon-Info"></span>
          Tooltips</h2>
      </div>

      <div className="divcontentarea divTooltipscontent">
        <ul id="populateCategory">
          {listItems?.length && listItems?.length > 0
            ? listItems?.map((item: any) =>
              <li key={item.Id}>
                <div className="divcard divnormalcard">
                  <div className="divitem">
                    <p>Label Name</p><span id="CategoryNametext-1">{item.Label_x0020_Name}</span>
                  </div>

                  <div className="divitem">
                    <p>Label Id</p><span id="">{item.ToolTipId}</span>
                  </div>
                  <div className="divitem">
                    <p>Description</p> <span id="qlArchtext-1">{item.Tooltip_x0020_Description}</span>
                  </div>
                  <div className='divitem'>
                    <p>Modified</p> <span>{item.Editor.Title} | {convertDate(item.Modified, 'date')}</span>
                  </div>
                  <div className="divitem">
                    <p>Actions</p>
                    <ul>
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit"
                        id="qlEdit-1" onClick={() => onEdit(item.Id, item.Label_x0020_Name, item.ToolTipId, item.Tooltip_x0020_Description)}> <span className="icon-Edit"></span> Edit</a></li>
                    </ul>
                  </div>

                </div>
                {inEditMode.status && inEditMode.rowKey === item.Id
                  ? (
                    <div id="content-qlEdit1" className="divcardedit divcardeditpopup">
                      <div className="row">
                        <div className="col-xl-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="TootltipLabelName">
                              Label Name </label><span className="mandatory">
                              *</span>
                            <input type="text" name="Tootltip Label Name" id="TootltipLabelName" aria-label="Tootltip Label Name"
                              aria-required="true" placeholder="User Role(s) Available to assign " maxLength={255} value={editLabel} disabled={true} />
                          </div>
                        </div>

                        <div className="col-xl-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="TootltipLabelId">
                              Label Id </label><span className="mandatory">
                              *</span>
                            <input type="text" name="Tootltip Label Id" id="TootltipLabelId" aria-label="Tootltip Label Id"
                              aria-required="true" placeholder="tooltip_available_roles " maxLength={255} value={editLabelID} disabled={true} />
                          </div>
                        </div>

                        <div className="col-xl-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="TootltipDescription">
                              Description </label><span className="mandatory">
                              *</span>
                            <input type="text" name="Description" id="TootltipDescription" aria-label="Description"
                              aria-required="true" placeholder="Select role(s) to add " maxLength={255} value={editLabelDesc} onChange={(event) => seteditLabelDesc(event.target.value)} />
                            {!TooltipValidations.TooltipDescription
                              ? (
                                <span className="errormsg" id="quickLinksTitleErr" >Please enter description </span>)
                              : ''}
                          </div>
                        </div>
                      </div>

                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update"
                            className="anchorsavebtn" id="qlUpdate-1" onClick={() => validateQL(item.Id, editLabelDesc)}> <span className="icon-Update"></span> Update</a>
                          </li>
                          <li><a href="javascript:void(0)" title="Cancel" aria-label="Cancel"
                            className="anchorcancelbtn anchoreditcanel" id="qlCancel-1" onClick={() => { setInEditMode({ ...inEditMode, status: false }) }} > <span
                              className="icon-Close"></span> Cancel</a></li>
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
export default TooltipsSettings
