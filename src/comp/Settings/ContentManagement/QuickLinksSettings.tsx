/* eslint-disable jsx-a11y/anchor-is-valid */
import { sp } from '@pnp/sp'
import React, { useEffect, useState } from 'react'
import { ListNames } from '../../../pages/Config'
import { compareDates, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import loader from '../../Images/Loader.gif'

const QuickLinksSettings = () => {
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [editQlName, seteditQlName] = useState('')
  const [editQlUrl, seteditQlUrl] = useState('')
  const [editQlArch, seteditQlArch] = useState('')
  const [showAddPopup, setshowAddPopup] = useState(false)
  const [addQLName, setaddQLName] = useState('')
  const [addQLURL, setaddQLURL] = useState('')
  const [listItems, setListItems] = useState<any>([])
  const [QLValidations, setQlValidations] = useState({
    valid: true,
    QLName: true,
    QLURL: true,
    validQLURL: true
  })
  const [loaderState, setloaderState] = useState(false)

  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const onEdit = (id: any, name: any, url: any, isArch: any) => {
    setInEditMode({
      status: true,
      rowKey: id
    })
    const isArchive = isArch ? 'Yes' : 'No'
    setshowAddPopup(false)
    seteditQlName(name)
    seteditQlUrl(url)
    seteditQlArch(isArchive)
    setQlValidations({
      ...QLValidations,
      valid: true,
      QLName: true,
      QLURL: true,
      validQLURL: true
    })
  }
  const listName = ListNames().QuickLinksList
  useEffect(() => {
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  const initEffect = () => {
    toggleLoader(true)

    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('QuickLinksListBuildModifiedListDate' + siteName) || ''
      const QLModifiedDate = localStorage.getItem('QL_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, QLModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        const endpoint = ['ID', 'Title0', 'Category', 'URL', 'IsArchived']
        list.items.select('' + endpoint + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          localStorage.setItem('QLData' + siteName, JSON.stringify(items))
          localStorage.setItem('QL_LMDate' + siteName, listModifiedDate)
          setListItems(items)
          setTimeout(() => {
            toggleLoader(false)
          }, 1000)
        })
      } else {
        const QLData: any = (localStorage.getItem('QLData' + siteName) !== undefined && localStorage.getItem('QLData' + siteName) !== '' && localStorage.getItem('QLData' + siteName) !== null ? JSON.parse(localStorage.getItem('QLData' + siteName) || '{}') : [])
        setListItems(QLData)
        setTimeout(() => {
          toggleLoader(false)
        }, 2000)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const isUrlValid = (url: any) => {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url)
  }
  // eslint-disable-next-line space-before-function-paren
  function changeName(e: any) {
    setaddQLName(e.target.value)
  }
  // eslint-disable-next-line space-before-function-paren
  function changeURL(e: any) {
    setaddQLURL(e.target.value)
  }
  const validateQL = (id: any, name: any, url: any) => {
    toggleLoader(true)
    let valid = true
    let Name = true
    let Url = true
    let validurl = true
    if (name == '' || name == undefined || name == null) {
      valid = false
      Name = false
    }
    if (url == '' || url == undefined || url == null) {
      valid = false
      Url = false
    } else if (!isUrlValid(url)) {
      valid = false
      validurl = false
    }
    setQlValidations({
      ...QLValidations,
      valid: valid,
      QLName: Name,
      QLURL: Url,
      validQLURL: validurl
    })
    if (valid) {
      saveOrUpdateQL(id)
    } else {
      toggleLoader(false)
    }
  }
  const saveOrUpdateQL = (id: any) => {
    console.log(id)
    setshowAddPopup(false)
    setInEditMode({
      status: false,
      rowKey: null
    })
    const isArchived = editQlArch === 'Yes'
    const addObj = {
      Category: 'NAFFA',
      Title0: addQLName,
      URL: {
        Url: addQLURL,
        Description: addQLURL
      }
    }
    const updateObj = {
      Category: 'NAFFA',
      Title0: editQlName,
      URL: {
        Url: editQlUrl,
        Description: editQlUrl
      },
      IsArchived: isArchived
    }
    if (id !== '' && id !== null && id !== undefined) {
      sp.web.lists.getByTitle(ListNames().QuickLinksList).items.getById(id).update(updateObj).then(function () {
        BuildmodifiedListUpdate()
      })
    } else {
      sp.web.lists.getByTitle(ListNames().QuickLinksList).items.add(addObj).then(function () {
        BuildmodifiedListUpdate()
      })
    }
  }
  const Delete = (id: any) => {
    toggleLoader(true)
    sp.web.lists.getByTitle(ListNames().QuickLinksList).items.getById(id).delete().then(function () {
      BuildmodifiedListUpdate()
    })
  }
  const displayalertDelete = (id: any) => {
    const proceed = window.confirm('Are you sure, you want to delete the selected item?')
    if (proceed) {
      Delete(id)
    }
  }
  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'QuickLinksList') {
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
    <div id="quick-links"
      className="tabcontent SettingsQuicklinks divquicklinks page"
      data-page="quick-links">
      <div className="divsettingsheader ">
        <h2><span className="icon-quicklinks"></span>
          Quick Links</h2>
        <ul className="ulactionitems ulUsergroupsactionitems">
          <li><a href="javascript:void(0)" title="Add" onClick={() => {
            setshowAddPopup(!showAddPopup)
            setInEditMode({
              status: false,
              rowKey: null
            })
            setQlValidations({
              ...QLValidations,
              valid: true,
              QLName: true,
              QLURL: true,
              validQLURL: true
            })
            setaddQLName('')
            setaddQLURL('')
          }} className="anchorsettingglobalbtn" id="addquicklink"><span className="icon-Add"></span>Add</a></li>
        </ul>
      </div>
      {
        showAddPopup
          ? (<div className="divaddpopup divsettingglobalpopup" id="addQuickLinksPopup" >
            <h3>Add Quick Link</h3>
            <div className="divcardbody">
              <div className="row">
                <div className="col-xl-12 col-sm-12">
                  <div className="divformgroup"><label htmlFor="quickLinkName">Name </label><span className="mandatory">*</span>
                    <input type="text" name="quickLinkName" id="quickLinksTitle" aria-label="Name" aria-required="true" autoFocus={true} placeholder="Enter Name" maxLength={255} value={addQLName} onChange={changeName} />
                    {!QLValidations.QLName
                      ? (
                        <span className="errormsg" id="quickLinksTitleErr" >Please enter name </span>)
                      : ''}
                  </div>
                </div>
                <div className="col-xl-12 col-sm-12">
                  <div className="divformgroup">
                    <label htmlFor="quickLinksURL">URL </label><span className="mandatory">*</span>
                    <input type="text" name="quickLinksURL" id="quickLinksURL" aria-label="URL" aria-required="true" placeholder="Enter URL" maxLength={255} value={addQLURL} onChange={changeURL} />
                    <span className="hint quickLinksHint">Hint: (http://example.com or https://example.com)</span>
                    <br></br>
                    {!QLValidations.QLURL
                      ? (
                        <span className="errormsg" id="quickLinksURLErr">Please enter URL</span>)
                      : ''}
                    {!QLValidations.validQLURL
                      ? (
                        <span className="errormsg" id="quickLinksURLErr">Please enter valid URL</span>)
                      : ''}
                  </div>
                </div>
              </div>
              <div className="divpopupfooter">
                <ul>
                  <li><a href="javascript:void(0)" title="Save" className="anchorsavebtn" onClick={() => validateQL('', addQLName, addQLURL)}> <span className="icon-Save" ></span>Save</a></li>
                  <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchorglobalcancelbtn" id="quicklinkcancelbtn" onClick={() => { setshowAddPopup(false) }}><span className="icon-Close"></span>Cancel</a></li>
                </ul>
              </div>
            </div>
          </div>)
          : ''
      }

      <div className="divcontentarea divquicklinkcontent">
        <ul id="populatequicklinks">
          {listItems?.length && listItems?.length > 0
            ? listItems?.map((item: any) =>
              <li key={item.URL?.Url}>
                <div className="divcard divnormalcard">
                  <div className="divitem">
                    <p>Name</p><span id="qlNametext-1">{item.Title0}</span>
                  </div>
                  <div className="divitem">
                    <p>URL</p><a href={item.URL?.Url} title="http://ql.co" target="_blank" id="qlURLtext-1" rel="noreferrer">{item.URL?.Url}</a>
                  </div>
                  <div className="divitem">
                    <p>Is Archived</p><span id="qlArchtext-1">{item.IsArchived ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="divitem">
                    <p>Actions</p>
                    <ul>
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit" id="qlEdit-1" onClick={() => onEdit(item.Id, item.Title0, item.URL?.Url, item.IsArchived)}> <span className="icon-Edit"></span>Edit</a></li>
                      <li><a href="javascript:void(0)" title="Delete" id="qlDelete-1" onClick={() => displayalertDelete(item.Id)}> <span className="icon-trash"></span> Delete </a></li>
                    </ul>
                  </div>
                </div>
                {inEditMode.status && inEditMode.rowKey === item.Id
                  ? (
                    <div id="content-qlEdit1" className="divcardedit divcardeditpopup" >
                      <div className="row">
                        <div className="col-xl-12 col-md-12">
                          <div className="divformgroup"><label htmlFor="InputTextQuickLinkNameEdit">Name</label><span className="mandatory">*</span>
                            <input type="text" name="InputTextQuickLinkNameEdit" value={editQlName} onChange={(event) => seteditQlName(event.target.value)} id="quicklinkname-qlEdit1" aria-label="Name" aria-required="true" placeholder="Enter Name" />
                            {!QLValidations.QLName
                              ? (
                                <span className="errormsg" id="quicklinknameval-1">Please enter name</span>)
                              : ''}</div>
                        </div>
                        <div className="col-xl-12 col-md-12">
                          <div className="divformgroup"><label htmlFor="InputTextQuickLinkURLEdit">URL</label><span className="mandatory">*</span>
                            <input type="text" name="URL" value={editQlUrl} onChange={(event) => seteditQlUrl(event.target.value)} id="quicklinkURL-qlEdit1" placeholder="Enter URL" />
                            <span className="hint">Hint:(http://example.com or https://example.com)</span>
                            {!QLValidations.QLURL
                              ? (
                                <span className="errormsg" id="quicklinkURLval-1" >Please enter URL </span>)
                              : ''}
                            {!QLValidations.validQLURL
                              ? (
                                <span className="errormsg" id="quicklinkURLval-1" >Please enter valid URL </span>)
                              : ''}
                          </div>
                        </div>
                        <div className="col-xl-4 col-md-12">
                          <div className="divformgroup">
                            <label htmlFor="SelectDropdownIsArchived">Is Archived</label>
                            <select name="QuicklinkIsArchived"
                              id="QuicklinkIsArchived-qlEdit1" value={editQlArch} onChange={(event) => seteditQlArch(event.target.value)}>
                              <option value="Yes" selected={!item.IsArchived}>Yes </option>
                              <option value="No" selected={!item.IsArchived}>No </option>
                            </select></div>
                        </div>
                      </div>
                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update" className="anchorsavebtn" id="qlUpdate-1" onClick={() => validateQL(item.Id, editQlName, editQlUrl)}> <span className="icon-Update"></span>Update</a>
                          </li>
                          <li><a href="javascript:void(0)" title="Cancel" aria-label="Cancel" className="anchorcancelbtn anchoreditcanel" id="qlCancel-1" onClick={() => { setInEditMode({ ...inEditMode, status: false }) }}> <span className="icon-Close"></span>Cancel</a>
                          </li>
                        </ul>
                      </div>
                    </div>)
                  : ''}
              </li>)
            : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}

        </ul>
      </div>
      <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
        <div className="copying">
          <p id="displaytext">Working on it</p>
          <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
        </div>
      </div>
    </div>
  )
}

export default QuickLinksSettings
