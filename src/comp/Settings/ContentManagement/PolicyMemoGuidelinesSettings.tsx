/* eslint-disable space-before-function-paren */
import { sp } from '@pnp/sp'
import { IFileAddResult } from '@pnp/sp/files'
import React, { useEffect, useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { ListNames } from '../../../pages/Config'
import { checkdocfileextension, compareDates, convertDate, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import loader from '../../Images/Loader.gif'
const PolicyMemoGuidelinesSettings = () => {
  const [showAddPopup, setshowAddPopup] = useState(false)
  const listName = ListNames().PolicyMemoandGuidelines
  const [PolciyMemoData, setPolicyMemoData] = useState<any>([])
  const [filesuploaded, setfilesuploaded] = useState<any>([])
  const [loaderState, setloaderState] = useState(false)
  const [Fileerrormsg, setFileerrormsg] = useState(false)
  const [nofileselected, setnofileselected] = useState(false)
  const [emptyfilename, setemptyfilename] = useState(false)
  useEffect(() => {
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const [filename, setfilename] = useState('')
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const onEdit = (item: any) => {
    setInEditMode({
      status: true,
      rowKey: item.ListItemAllFields.ID
    })
    setfilename((item.Name).split('.')[0])
    setshowAddPopup(false)
  }
  const initEffect = async () => {
    const siteName = GlobalConstraints().siteName
    const listModifiedDate = localStorage.getItem('PolicyMemoandGuidelinesBuildModifiedListDate' + siteName) || ''
    const PolicyMemoModifiedDate = localStorage.getItem('PolicyMemo_LMDate_' + siteName)
    const needToUpdate = compareDates(listModifiedDate, PolicyMemoModifiedDate)
    if (needToUpdate) {
      const list = sp.web.getFolderByServerRelativeUrl(listName)
      const endpoint = ['ID', 'Name', 'Title', 'UIVersionLabel', 'TimeCreated', 'TimeLastModified', 'ServerRelativeUrl', 'Author/Title', 'ItemCreatedBy/Title', 'Editor/Title']
      const expand = ['listItemAllFields', 'Author', 'ItemCreatedBy', 'Editor', 'ListItemAllFields/FieldValuesAsText']
      list.files.select('' + endpoint + '').expand('' + expand + '').orderBy('TimeLastModified', false).top(5000).get().then(function (items) {
        localStorage.setItem('PolicyMemoData_' + siteName, JSON.stringify(items))
        localStorage.setItem('PolicyMemo_LMDate_' + siteName, listModifiedDate)
        setPolicyMemoData(items)
      })
    } else {
      const PolicyMemoData: any = (localStorage.getItem('PolicyMemoData_' + siteName) !== undefined && localStorage.getItem('PolicyMemoData_' + siteName) !== '' && localStorage.getItem('PolicyMemoData_' + siteName) !== null ? JSON.parse(localStorage.getItem('PolicyMemoData_' + siteName) || '{}') : [])
      setPolicyMemoData(PolicyMemoData)
    }
    setTimeout(() => {
      toggleLoader(false)
    }, 2000)
  }
  const uploadFileHandler = (e: any) => {
    console.log(e)
    let uploadedfiles = []
    setFileerrormsg(false)
    let isnotvalid = false
    for (const item of e) {
      item.FileName = item.name
    }
    for (let i = 0; i < e.length; i++) {
      // eslint-disable-next-line prefer-regex-literals
      let match: any = new RegExp("['~#%\&{}+\|]|\\.\\.|^\\.|\\.$")
      match = match.test(e[i].name)
      if (match) {
        isnotvalid = true
      } else if (checkdocfileextension(e[i].name)) {
        isnotvalid = true
      }
    }
    if (isnotvalid) {
      setFileerrormsg(true)
    } else {
      uploadedfiles = [...e]
      setfilesuploaded(uploadedfiles)
    }
  }

  const saveorupdate = async (items: any) => {
    if (items !== '') {
      setInEditMode({
        status: false,
        rowKey: null
      })
      if (filename === '' || filename === undefined || filename === null) {
        setemptyfilename(true)
      } else {
        setloaderState(true)
        const folder = sp.web.getFolderByServerRelativePath(listName + '/' + items.Name) // equivalent

        folder.getItem()
          .then(item => item.update({ FileLeafRef: filename }))
          .then(function () {
            BuildmodifiedListUpdate()
          })
      }
    } else {
      let emptyfile = false
      if (filesuploaded === [] || filesuploaded.length <= 0 || filesuploaded === undefined) {
        setnofileselected(true)
        emptyfile = true
      }
      if (!Fileerrormsg && !emptyfile) {
        setshowAddPopup(false)
      }
      for (let i = 0; i < filesuploaded.length; i++) {
        setloaderState(true)
        sp.web.getFolderByServerRelativePath('PolicyMemoandGuidelines').files.addUsingPath(filesuploaded[i].name, filesuploaded[i], { Overwrite: true }).then((e) => {
          console.log('done')
          BuildmodifiedListUpdate()
          if (i === filesuploaded.length - 1) {
            BuildmodifiedListUpdate()
          }
        })
      }
    }
  }
  function BuildmodifiedListUpdate() {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'PolicyMemoandGuidelines') {
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
  const removeFile = (e: any) => {
    console.log(e)
    const filename = e.currentTarget.dataset.filename
    console.log(filename)
    const curruploadFiles = filesuploaded.filter(function (file: any) {
      return file.FileName !== filename
    })
    setfilesuploaded(curruploadFiles)
  }
  const Delete = (filename: any) => {
    toggleLoader(true)
    const list = sp.web.getFolderByServerRelativeUrl(listName)
    list.files.getByName('' + filename + '').delete().then(function () {
      BuildmodifiedListUpdate()
    })
  }
  const displayalertDelete = (name: any) => {
    const proceed = window.confirm('Are you sure, you want to delete the selected item?')
    if (proceed) {
      Delete(name)
    }
  }
  return (
    <div id="pmg" className="tabcontent Settingspolicymemo divpolicy page" data-page="pmg">
      <div className="divsettingsheader">
        <h2> <span className="icon-policymemosnew"></span> Policy Memos & Guidelines </h2>
        <ul className="ulactionitems ulUsergroupsactionitems">
          <li><a href="javascript:void(0)" title="Add Document" onClick={() => {
            setshowAddPopup(!showAddPopup)
            setInEditMode({
              status: false,
              rowKey: null
            })
            setFileerrormsg(false)
            setnofileselected(false)
          }} className="anchorsettingglobalbtn" id="adddocument"><span className="icon-Add"></span>Add Document</a></li>
        </ul>
      </div>
      <div className="divcontentarea divpolicymemocontent">
        <ul aria-label="Policy Memos & Guidelines" className="ulaccordians">
          <li>
            {showAddPopup
              ? (
                <div className="divcardedit divcardeditpopup divcardadddocument">
                  <h3>ADD Document</h3>
                  <div className="row">
                    <div className="col-xl-12 col-md-12">

                      <div className="divattachments" id="testform">
                        <div className="divformgroup">
                          <label>Attach File
                          </label>
                          <span className="mandatory">
                            *</span>

                          <div id="dropzone" className="divattachfile dropzonecontrol" aria-label="Attachment">
                            <FileUploader type="file" name="attachFile" multiple={true} handleChange={uploadFileHandler} accept=".xlsx,.xls,.doc, .docx,.ppt, .pptx,.txt,.pdf,.png, .jpg, .jpeg,.gif, .msg" />
                            <div className="divattachmentsdisplay">
                              <ul id="attachments"
                                className="Ulformattach">
                                {Object.keys(filesuploaded).map((file: any) =>
                                  <li key={filesuploaded[file].name}>
                                    <div className='divattachedfiles' title={filesuploaded[file].name}>{filesuploaded[file].name}</div>
                                    <a href="javascript:void(0)" data-filename={filesuploaded[file].name} onClick={removeFile} title='Close'><span className="icon-Close"></span></a>
                                  </li>
                                )}
                              </ul>
                              {
                                Fileerrormsg ? (<span className="errormsg" id="docerrormsg"> Uploaded file already exists or contains invalid characters. Please upload valid files </span>) : ''
                              }
                              {
                                nofileselected ? (<span className="errormsg" id="docerrormsg"> Please choose file(s) to upload </span>) : ''
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="spanhintmgs">
                        Hint: Upload the files which are in the .png, .jpeg, .xlsx, .doc, .ppt,.txt .pptx, .pdf, .gif,
                        .msg files and special characters like #$%^&* will not be used in the document names </span>

                    </div>
                  </div>
                  <div className="divpopupfooter">
                    <ul>
                      <li><a href="javascript:void(0)" title="Add" className="anchorsavebtn" onClick={() => {
                        saveorupdate('')
                        setfilesuploaded([])
                      }}> <span
                        className="icon-Save"></span> Save</a></li>
                      <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchoreditcanel" onClick={() => setshowAddPopup(false)}> <span
                        className="icon-Close"></span> Cancel</a></li>
                    </ul>
                  </div>
                </div>)
              : ''}
          </li>
          {PolciyMemoData?.length && PolciyMemoData?.length > 0
            ? PolciyMemoData?.map((item: any) =>
              <li key={item.ID}>
                <div className="divcard divaccordiancard" aria-controls="content-5" aria-expanded="false"
                  id="accordion-control-5">
                  <div className="divitem">
                    <span className="icon-document"></span>
                    <h3><a href={item.ServerRelativeUrl} target="_blank" rel="noreferrer"> {item.Name}</a></h3>
                  </div>
                  <div className="divitem">
                    <p>Created</p>
                    <span>{item.Author.Title} | {convertDate(item.TimeCreated, 'date')}</span>
                  </div>
                  <div className="divitem">
                    <p>Modified</p>
                    <span>{item.ListItemAllFields.FieldValuesAsText.Editor} | {convertDate(item.TimeLastModified, 'date')}</span>
                  </div>
                  <div className="divitem">
                    <p>Actions</p>
                    <ul><li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit" id="qlEdit-1" onClick={() => onEdit(item)}> <span className="icon-Edit"></span>Edit</a></li><li><a href="javascript:void(0)" title="Delete" id="qlDelete-1" onClick={() => displayalertDelete(item.Name)}> <span className="icon-trash"></span> Delete </a></li></ul>
                  </div>
                </div>
                {inEditMode.status && inEditMode.rowKey === item.ListItemAllFields.ID
                  ? (
                    <div id="content-qlEdit1" className="divcardedit divcardeditpopup" >
                      <div className="row">
                        <div className="col-xl-12 col-md-12">
                          <div className="divformgroup"><label htmlFor="InputTextQuickLinkNameEdit">Name</label><span className="mandatory">*</span>
                            <input type="text" name="InputTextQuickLinkNameEdit" value={filename} onChange={(e) => setfilename(e.target.value)} id="quicklinkname-qlEdit1" aria-label="Name" aria-required="true" placeholder="Enter Name" /> <span className='spanExtensionname'>{(item.Name).split('.')[1]}</span>
                            {
                              emptyfilename
                                ? (
                                  <span className="errormsg" id="quicklinknameval-1">Please enter document name</span>
                                  // eslint-disable-next-line indent
                                )
                                : ''
                            }
                          </div>
                        </div>

                      </div>
                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update" className="anchorsavebtn" id="qlUpdate-1" onClick={() => saveorupdate(item)}> <span className="icon-Update"></span>Update</a>
                          </li>
                          <li><a href="javascript:void(0)" title="Cancel" aria-label="Cancel" className="anchorcancelbtn anchoreditcanel" id="qlCancel-1" onClick={() => setInEditMode({
                            status: false,
                            rowKey: null
                          })}> <span className="icon-Close"></span>Cancel</a>
                          </li>
                        </ul>
                    </div>
                </div>)
                  : ''}
                            </li>)
            : <div className='divnoresults showcomponent'> There are no results to display </div>}
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
                          : '' }
    </div>
  )
}

export default PolicyMemoGuidelinesSettings
