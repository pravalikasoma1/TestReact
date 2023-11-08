/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js'
import Htmltodraft from 'html-to-draftjs'
import { FileUploader } from 'react-drag-drop-files'
import { compareDates, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import { useIndexedDB } from 'react-indexed-db'
import { ListNames } from '../../../pages/Config'
import { sp } from '@pnp/sp'
import { IItem, Item } from '@pnp/sp/items'
import draftToHtml from 'draftjs-to-html'
import loader from '../../Images/Loader.gif'

const KnowledgeGraphSettings = () => {
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const onEdit = (item: any) => {
    setInEditMode({
      status: true,
      rowKey: item.ID
    })
    const isArchive = item.IsArchived ? 'Yes' : 'No'
    const _contentState = ContentState.createFromText(item.Description)
    const descData = convertToRaw(_contentState)
    seteditDesc(descData)
    const description = item.Description.split('>').slice(1).join('>')
    const blocksFromHTML = Htmltodraft(description)
    setEditorState(
      EditorState.createWithContent(
        ContentState.createFromBlockArray(blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap)
      )
    )
    seteditKbName(item.Title)
    seteditKbsubcat(item.Subcategory)
    seteditKbisArchived(isArchive)
    setexistingfiles([])
    clearValidations()
    setshowAddPopup(false)
    setexistingfiles(item.AttachmentFiles)
    setfilestodelete([])
    setfilesuploaded([])
  }
  const [KBValidations, setKBValidations] = useState({
    valid: true,
    KBtitle: true,
    KBDesc: true,
    KBSubcat: true
  })
  const [loaderState, setloaderState] = useState(false)
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const [Accordion, setAcc] = useState({
    status: false,
    rowKey: null
  })
  const [editKbName, seteditKbName] = useState('')
  const [editKbDesc, seteditKbdesc] = useState('')
  const [editKbsubcat, seteditKbsubcat] = useState('')
  const [editKbisArchived, seteditKbisArchived] = useState('')
  const [AccordionId, setAccordionId] = useState(null)
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [listItems, setListItems] = useState<any>([])
  const siteName = GlobalConstraints().siteName
  const { add } = useIndexedDB('KBArticles' + siteName + '')
  const { getByID } = useIndexedDB('KBArticles' + siteName + '')
  const { update } = useIndexedDB('KBArticles' + siteName + '')
  const [showAccordion, setshowAccordion] = useState(false)
  const _contentState = ContentState.createFromText('Any item of pay or allowance based on your grade will change as a result of your promotion or demotion. This includes basic pay, basic allowance for housing (BAH), cost of living allowance (COLA), and overseas housing allowance (OHA).')
  const raw = convertToRaw(_contentState)
  const [editDesc, seteditDesc] = useState<any>()
  const [existingfiles, setexistingfiles] = useState<any>([])
  const [filesuploaded, setfilesuploaded] = useState<any>([])
  const [filestodelete, setfilestodelete] = useState<any>([])
  const [setshowFileerrormsg, setFileerrormsg] = useState(false)
  // const [contentState, setContentState] = useState(raw)
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const [editorState1, setEditorState1] = useState(() =>
    EditorState.createEmpty()
  )
  const [editorState2, setEditorState2] = useState(() =>
    EditorState.createEmpty()
  )
  // setEditorState(EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(<p>my text</p>))))
  const onEditorStateChange = async (state: any) => {
    await setEditorState(state)
  }
  const [subcat, setsubcat] = useState<any>()
  const [showAddPopup, setshowAddPopup] = useState(false)
  useEffect(() => {
    const desc = '<p>Any item of pay or allowance based on your grade will change as a result of your promotion or demotion. This includes basic pay, basic allowance for housing (BAH), cost of living allowance (COLA), and overseas housing allowance (OHA).</p>'
    const blocksFromHTML = Htmltodraft(desc)
    /* setEditorState(
      EditorState.createWithContent(
        ContentState.createFromBlockArray(blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap)
      )
    ) */
    const desc1 = '<p>You have two options to pay back your travel debt resulting from Civilian PCS travel: Option 1: Submit a check along with Travel Debt Letter to the AFFSC for repayment</p>'
    const blocksFromHTML1 = Htmltodraft(desc1)
    setEditorState2(
      EditorState.createWithContent(
        ContentState.createFromBlockArray(blocksFromHTML1.contentBlocks,
          blocksFromHTML1.entityMap)
      )
    )
    GetBuildModifiedList().then(function () {
      getSubcategoriesMetadata()
      initEffect()
    })
  }, [])
  const initEffect = () => {
    GetKBArticles()
  }
  // eslint-disable-next-line space-before-function-paren
  function GetKBArticles() {
    try {
      const listModifiedDate = localStorage.getItem('KnowledgeBaseArticlesBuildModifiedListDate' + siteName) || ''
      const KBModifiedDate = localStorage.getItem('KB_LMDate' + siteName) || ''
      const needToUpdate = compareDates(listModifiedDate, KBModifiedDate)
      const list = sp.web.lists.getByTitle(ListNames().KnowledgeBaseArticles)
      const endpoint = ['ID', 'Title', 'Description', 'Category', 'Subcategory', 'IsArchived', 'Created', 'viewedcount', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'AttachmentFiles']
      const expand = ['Author', 'Editor', 'AttachmentFiles']
      if (needToUpdate) {
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items: any) {
          setListItems(items)
          getByID(1).then((DBData: any) => {
            if (DBData && DBData.items) {
              update({ id: 1, items: items }).then(
                (result: any) => { console.log('KB Data Stored in DB') }
              )
            } else {
              add({ items: items }).then((DBData: any) => {
              })
            }
          })
          localStorage.setItem('KB_LMDate' + siteName, listModifiedDate)
        })
      } else {
        getByID(1).then((DBData: any) => {
          setListItems(DBData.items)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
  // eslint-disable-next-line space-before-function-paren
  async function getSubcategoriesMetadata() {
    const listName = ListNames().SubCategoriesMetadata
    const siteName = GlobalConstraints().siteName
    try {
      const listModifiedDate = localStorage.getItem('SubCategoriesMetadataBuildModifiedListDate' + siteName)
      const subCategoriesModifiedDate = localStorage.getItem('SubCategoriesMetadata_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, subCategoriesModifiedDate)
      const list = sp.web.lists.getByTitle(listName)
      let subCategories: any = []
      if (needToUpdate) {
        await list.items.get().then((items) => {
          if (items && items.length > 0) {
            items?.map(item => {
              subCategories.push({
                Category: item.Category,
                SubCategory: item.SubCategory,
                IsArchived: item.IsArchived
              })
            })
          }
          localStorage.setItem('subCategoriesMetadata' + siteName, JSON.stringify(subCategories))
          const subcatdata = subCategories?.filter((item: any) => { return item.IsArchived === false })
          setsubcat(subcatdata)
        })
      } else {
        subCategories = JSON.parse(localStorage.getItem('subCategoriesMetadata' + siteName) || '{}')
        const subcatdata = subCategories?.filter((item: any) => { return item.IsArchived === false })
        setsubcat(subcatdata)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const RenderSubcategoryDropDown = () => {
    const defaultOptionValue = 'Select'
    const Majcomset = Array.from(new Set(subcat?.filter((item: { SubCategory: any }) => item.SubCategory).map((item: { SubCategory: any }) => item.SubCategory)))
    if (Majcomset.length > 0) {
      return (
        <select name='"SubCategory"' id='ddlMajcom' value={editKbsubcat} onChange={(e) => seteditKbsubcat(e.target.value)} aria-label="SubCategory" >
          <option value={defaultOptionValue}>{defaultOptionValue}</option>
          {Majcomset.map((SubCategory: any) => <option key={SubCategory} value={SubCategory}>{SubCategory}</option>)}
        </select>
      )
    }
  }
  const onclickADD = () => {
    setshowAddPopup(!showAddPopup)
    setInEditMode({
      status: false,
      rowKey: null
    })
    setKBValidations({
      ...KBValidations,
      valid: true,
      KBtitle: true,
      KBDesc: true,
      KBSubcat: true
    })
    seteditKbsubcat('')
    seteditKbName('')
    clearValidations()
    setEditorState(
      EditorState.createEmpty()
    )
    setexistingfiles([])
  }
  const clearValidations = () => {
    setKBValidations({
      ...KBValidations,
      valid: true,
      KBtitle: true,
      KBDesc: true,
      KBSubcat: true
    })
  }
  const validateKB = (id: any) => {
    toggleLoader(true)
    let valid = true
    let Question = true
    let Description = true
    let subcategory = true
    if (editKbName === '' || editKbName === undefined || editKbName === null) {
      valid = false
      Question = false
    }
    if (!editorState.getCurrentContent().hasText()) {
      valid = false
      Description = false
    }
    if (editKbsubcat === '' || editKbsubcat === 'Select' || editKbsubcat === 'select') {
      valid = false
      subcategory = false
    }
    setKBValidations({
      ...KBValidations,
      valid: valid,
      KBtitle: Question,
      KBDesc: Description,
      KBSubcat: subcategory
    })
    if (valid) {
      saveOrUpdateQA(id)
    } else {
      toggleLoader(false)
    }
  }
  const editdeleteFiles = async (id: any) => {
    if (filestodelete && filestodelete.length > 0) {
      const item: IItem = sp.web.lists.getByTitle(ListNames().KnowledgeBaseArticles).items.getById(id)
      /* const deleteBatch = sp.web.createBatch()
        let i = 0
        if (i < filestodelete.length) {
          item.attachmentFiles.inBatch(deleteBatch).getByName(filestodelete[i].FileName).delete().then(function () {
            console.log('detele item')
            i++
          })
          if (i === filestodelete.length - 1) {
            BuildmodifiedListUpdate()
          }
        } */
      let attachmentNames: any
      // eslint-disable-next-line prefer-const
      attachmentNames = Array.from(new Set(filestodelete.map((v: any) => v.FileName)))
      await item.attachmentFiles.deleteMultiple(...attachmentNames).then(function () {
        BuildmodifiedListUpdate()
      })
    }
  }
  const saveOrUpdateQA = (id: any) => {
    setshowAddPopup(false)
    setInEditMode({
      status: false,
      rowKey: null
    })
    const isArchived = editKbisArchived === 'Yes'
    const addObj = {
      Category: 'NAFFA',
      Title: editKbName,
      Description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      Subcategory: editKbsubcat,
      IsArchived: isArchived
    }

    if (id !== '' && id !== null && id !== undefined) {
      sp.web.lists.getByTitle(ListNames().KnowledgeBaseArticles).items.getById(id).update(addObj).then(async function () {
        const item: IItem = sp.web.lists.getByTitle(ListNames().KnowledgeBaseArticles).items.getById(id)
        BuildmodifiedListUpdate()
        if (filesuploaded && filesuploaded.length > 0) {
          const files = []
          for (let i = 0; i < filesuploaded.length; i++) {
            // const fileNamePath = encodeURI(filesuploaded[i].name)
            files.push({
              name: filesuploaded[i].name,
              content: filesuploaded[i]
            })
          }
          item.attachmentFiles.addMultiple(files).then(function () {
            if (filestodelete && filestodelete.length > 0) {
              editdeleteFiles(id)
            }
            BuildmodifiedListUpdate()
          })
        } else if (filestodelete && filestodelete.length > 0) {
          editdeleteFiles(id)
        }
      })
    } else {
      sp.web.lists.getByTitle(ListNames().KnowledgeBaseArticles).items.add(addObj).then(function (Kbitem) {
        if (filesuploaded && filesuploaded.length > 0) {
          const item: IItem = sp.web.lists.getByTitle(ListNames().KnowledgeBaseArticles).items.getById(Kbitem.data.ID)
          const files = []
          for (let i = 0; i < filesuploaded.length; i++) {
            // const fileNamePath = encodeURI(filesuploaded[i].name)
            files.push({
              name: filesuploaded[i].name,
              content: filesuploaded[i]
            })
          }
          item.attachmentFiles.addMultiple(files).then(function () {
            BuildmodifiedListUpdate()
          })
        } else {
          BuildmodifiedListUpdate()
        }
      })
    }
  }
  const Delete = (id: any) => {
    toggleLoader(true)
    sp.web.lists.getByTitle(ListNames().KnowledgeBaseArticles).items.getById(id).delete().then(function () {
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
      if (buildmodifiedlist[i].Name === 'KnowledgeBaseArticles') {
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
  const uploadFileHandler = (e: any) => {
    console.log(e)
    let uploadedfiles = []
    let existFiles = []
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
      } else if (existingfiles.some(function (el: any) {
        return el.name === e[i].name
      })) {
        isnotvalid = true
      } else if (checkdocfileextension(e[i].name)) {
        isnotvalid = true
      }
    }
    if (isnotvalid) {
      setFileerrormsg(true)
    } else {
      if (filesuploaded && filesuploaded.length > 0) {
        // uploadedfiles = Object.keys(filesuploaded).slice()
        uploadedfiles = [...filesuploaded]
        uploadedfiles.push(...e)
      } else {
        uploadedfiles = [...e]
      }
      setfilesuploaded(uploadedfiles)
      if (existingfiles && existingfiles.length > 0) {
        // uploadedfiles = Object.keys(filesuploaded).slice()
        existFiles = [...existingfiles]
        existFiles.push(...e)
      } else {
        existFiles = [...e]
      }
      setexistingfiles(existFiles)
    }
  }
  const DocumentIconNames = (file: any) => {
    const fileExtension = file.split('.').pop() ? file.split('.').pop().toLowerCase() : ''
    const iconName = (fileExtension === 'ppt' || fileExtension === 'pptx')
      ? 'icon-pptdoc'
      : (fileExtension === 'pdf')
          ? 'icon-pdf'
          : (fileExtension === 'doc' || fileExtension === 'docx')
              ? 'icon-worddoc'
              : (fileExtension === 'xlsx' || fileExtension === 'xls')
                  ? 'icon-excel'
                  : (fileExtension === 'txt')
                      ? 'icon-file'
                      : (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg')
                          ? 'icon-file'
                          : (fileExtension === 'msg') ? 'icon-email' : 'icon-file'
    return (
      <span className= {iconName}></span>
    )
  }
  const checkdocfileextension = (val: any) => {
    // eslint-disable-next-line prefer-regex-literals
    const regex = new RegExp('(.*?)\.(txt|xlsx|xls|doc|docx|ppt|pptx|pdf|png|jpg|jpeg|xlsm|XLSM|XLSX|XLS|DOC|DOCX|PPT|PPTX|PDF|PNG|JPG|JPEG|TXT)$')
    if (!(regex.test(val))) {
      return true
    } else {
      return false
    }
  }
  const removeFile = (e: any) => {
    const filename = e.currentTarget.dataset.filename
    let deletefiles = []
    const existFiles = []
    const currfiles = existingfiles.filter(function (file: any) {
      return file.FileName === filename
    })
    const curruploadFiles = filesuploaded.filter(function (file: any) {
      return file.FileName !== filename
    })
    setfilesuploaded(curruploadFiles)
    if (filestodelete && filestodelete.length > 0) {
      // uploadedfiles = Object.keys(filesuploaded).slice()
      deletefiles = [...filestodelete]
      deletefiles.push(...currfiles)
    } else {
      deletefiles = [...currfiles]
    }
    setfilestodelete(deletefiles)
    const currentfiles = existingfiles.filter(function (file: any) { return file.FileName !== filename })
    setexistingfiles(currentfiles)
  }
  return (
    <div id="knowledge-articles"
      className="tabcontent SettingsKB  page"
      data-page="knowledge-articles">
      <div className="divsettingsheader ">
        <h2><span className="icon-KnowledgeGraph"></span>
          Knowledge Graph</h2>
        <ul className="ulactionitems ulUsergroupsactionitems">

          <li><a href="javascript:void(0)" title="Add"
            className="anchorsettingglobalbtn"
            id="addKnowledgeGraph" onClick={() => { onclickADD() }}>
            <span className="icon-Add"></span>
            Add</a></li>
        </ul>
      </div>
      {showAddPopup
        ? (<div className="divaddpopup divsettingglobalpopup"
          id="addKnowledgeGraphpopup" >
          <h3>Add Knowledge Graph</h3>
          <div className="divcardbody">
            <div className="row">
              <div className="col-xl-12 col-sm-12">
                <div className="divformgroup">
                  <label htmlFor="KBTitle">Title </label><span
                    className="mandatory">
                    *</span>
                  <input type="text" name="KBTitle" autoFocus={true} id="knowledgeGraphTitle" placeholder="Enter Title" maxLength={255} value={editKbName} onChange={(event) => seteditKbName(event.target.value)} />
                  {!KBValidations.KBtitle
                    ? (<p className="errormsg" id="QandATitleErr">Please enter Title.</p>)
                    : ''}
                </div>
              </div>
              <div className="col-xs-12 col-sm-12">
                <div
                  className="divformgroup knowledgeGraphDescription">
                  <label htmlFor="kbDescription">
                    Description  </label><span
                      className="mandatory">
                    *</span>
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={onEditorStateChange}
                    toolbar={{
                      inline: { inDropdown: true },
                      list: { inDropdown: true },
                      textAlign: { inDropdown: true },
                      link: { inDropdown: true },
                      history: { inDropdown: true }
                    }} />
                  {!KBValidations.KBDesc
                    ? (<p className="errormsg" id="QandATitleErr">Please enter description.</p>)
                    : ''}

                </div>
              </div>

              <div className="col-md-12 col-xs-12">
                <div className="divattachments"
                  id="testform">
                  <div className="divformgroup ">
                    <label>Attach File</label>
                    <span className="icon-Info">
                      <span className="info-tooltip">
                        <span className="classic">
                          <span
                            className="tooltipdescp">
                            <p>Attach File
                            </p>
                          </span>
                        </span>
                      </span>
                    </span>
                    <div id="dropzone"
                      className="divattachfile dropzonecontrol"
                      aria-label="Attachment">
                      <FileUploader type="file" name="attachFile" multiple={true} handleChange={uploadFileHandler} accept=".xlsx,.xls,.doc, .docx,.ppt, .pptx,.txt,.pdf,.png, .jpg, .jpeg,.gif, .msg" />
                      <div className="divattachmentsdisplay">
                        <ul id="attachments" className="Ulformattach">
                          {Object.keys(existingfiles).map((file: any) =>
                            <li key={existingfiles[file].name}>
                              <div className='divattachedfiles' title={existingfiles[file].name}>{existingfiles[file].name}</div>
                              <a href="javascript:void(0)" data-filename={existingfiles[file].name} onClick={removeFile} title='Close'><span className="icon-Close"></span></a>
                            </li>
                          )}
                        </ul>
                        {
                          setshowFileerrormsg ? (<span className="errormsg" id="docerrormsg">Uploaded file already exists or contains invalid characters. Please upload valid files</span>) : ''
                        }

                      </div>
                    </div>
                  </div>
                </div>
                <span className="spanhintmgs">
                  Hint: Upload the files which are in
                  the .png, .jpeg, .xlsx, .doc,
                  .ppt,.txt .pptx, .pdf, .gif,
                  .msg files and special characters
                  like #$%^&* will not be used in the
                  document names</span>
              </div>

              <div
                className="col-xs-4 col-sm-4 knowledgeGraphEditSection">
                <div className="divformgroup">
                  <div className="selectdropdown">
                    <label
                      htmlFor="knowledgeGraphCategory">Category
                    </label><span className="mandatory">
                      *</span>
                    <select name="Category" id="knowledgeGraphCategory" disabled={true}>
                      <option value="NAFFA">NAFFA</option>
                    </select>
                    <p className="errormsg hidecomponent"
                      id="knowledgeGraphSectionErr">
                      Please select Dropdown</p>
                  </div>
                </div>
              </div>

              <div
                className="col-xs-4 col-sm-4 knowledgeGraphEditCategory">
                <div className="divformgroup">
                  <div className="selectdropdown">
                    <label
                      htmlFor="knowledgeGraphSubCategory">Sub
                      Category </label><span
                        className="mandatory">
                      *</span>
                    {RenderSubcategoryDropDown()}
                    {!KBValidations.KBSubcat
                      ? (<p className="errormsg" id="QandATitleErr">Please select Sub Category.</p>)
                      : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="divpopupfooter">
              <ul>
                <li><a href="javascript:void(0)"
                  title="Save"
                  className="anchorsavebtn" onClick={() => validateKB('')}>
                  <span className="icon-Save"></span>
                  Save</a></li>
                <li><a href="javascript:void(0)"
                  title="Cancel"
                  className="anchorcancelbtn anchorglobalcancelbtn"
                  id="quicklinkcancelbtn" onClick={() => { setshowAddPopup(false) }}>
                  <span className="icon-Close"></span>
                  Cancel</a></li>
              </ul>
            </div>
          </div>
        </div>)
        : ''}
      <div className="divcontentarea divKAcontent">
        <ul aria-label=" Knowledge Base"
          className="ulaccordians" id="KnowledgeBase">
          {listItems?.length && listItems?.length > 0
            ? listItems?.map((item: any) =>
              <li key={item.Id} onClick={() => setAcc({
                status: (Accordion.rowKey === item.ID) ? !Accordion.status : true,
                rowKey: item.Id
              })}>
                <div className="divcard divaccordiancard" aria-controls="KnowledgeBasecontent-1" aria-expanded={(Accordion.status && Accordion.rowKey === item.ID && !inEditMode.status)} id="accordion-control-1">
                  <div className="divitem">
                    <p>Title</p>
                    <span id="kbTitletext-32">{item.Title}</span>
                  </div>

                  <div className="divitem">
                    <p>Category</p><span id="knowledgeGraphCategoryText-5">{item.Category}</span>
                  </div>
                  <div className="divitem">
                    <p>
                      Sub Category
                    </p>
                    <span>{item.Subcategory}</span>
                  </div>
                  <div className="divitem">
                    <p>Is Archived</p><span>{item.IsArchived ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="divitem">
                    <p>Actions</p>
                    <ul>
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit" id="anchorEditFolderNamepolicy" onClick={() => onEdit(item)}><span className="icon-Edit"></span>Edit</a></li>
                      <li><a href="javascript:void(0)" title="Delete" onClick={() => displayalertDelete(item.ID)}><span className="icon-trash"></span> Delete</a> </li>
                    </ul>
                  </div>
                </div>
                {inEditMode.status && inEditMode.rowKey === item.Id
                  ? (
                    <div className="divcardedit divcardeditpopup divcardadddocument"
                      id="editFolder0">

                      <div className="row">
                        <div className="col-xl-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="KBTitle">Title</label><span className="mandatory">*</span>
                            <input type="text" name="KBTitle" id="KnowledgebaseTitle" value={editKbName} onChange={(event) => seteditKbName(event.target.value)} />
                            {!KBValidations.KBtitle
                              ? (<p className="errormsg" id="QandATitleErr">Please Enter Title.</p>)
                              : ''}
                          </div>
                        </div>
                        <div className="col-xs-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="kbDescription">Description  </label><span className="mandatory"> *</span>
                            <Editor
                              editorState={editorState}
                              onEditorStateChange={onEditorStateChange}
                              toolbar={{
                                inline: { inDropdown: true },
                                list: { inDropdown: true },
                                textAlign: { inDropdown: true },
                                link: { inDropdown: true },
                                history: { inDropdown: true }
                              }} />
                            {!KBValidations.KBDesc
                              ? (<p className="errormsg" id="QandATitleErr">Please Enter Description.</p>)
                              : ''}
                          </div>
                        </div>
                        <div
                          className="col-xs-6 col-sm-6 knowledgeGraphEditSection">
                          <div className="divformgroup">
                            <div className="selectdropdown">
                              <label htmlFor="knowledgeGraphCategory">Category </label><span className="mandatory">*</span>
                              <select name="Category" disabled={true} id="knowledgeGraphCategory">
                                <option value="NAFFA">NAFFA</option>
                              </select>
                              <p className="errormsg hidecomponent" id="knowledgeGraphCategoryErr"> Please select Dropdown</p>
                            </div>
                          </div>
                        </div>

                        <div
                          className="col-xs-6 col-sm-6 knowledgeGraphEditCategory">
                          <div className="divformgroup">
                            <div className="selectdropdown">
                              <label htmlFor="knowledgeGraphSubCategory">Sub Category </label><span className="mandatory"> *</span>
                              {RenderSubcategoryDropDown()}
                              <p className="errormsg hidecomponent" id="knowledgeGraphCategoryErr">Please select Dropdown</p>
                              {!KBValidations.KBSubcat
                                ? (<p className="errormsg" id="QandATitleErr">Please Select Sub Category.</p>)
                                : ''}
                            </div>
                          </div>
                        </div>

                        <div className="col-xs-12 col-sm-12">
                          <div className="divattachments" id="testform">
                            <div className="divformgroup">
                              <label>Attach File(s)</label>

                              <div id="dropzone" className="divattachfile dropzonecontrol"
                                aria-label="Attachment">
                                <FileUploader type="file" name="attachFile" multiple={true} handleChange={uploadFileHandler} accept=".xlsx,.xls,.doc, .docx,.ppt, .pptx,.txt,.pdf,.png, .jpg, .jpeg,.gif, .msg" />
                                <div className="divattachmentsdisplay ">
                                  <ul id="attachments" className="Ulformattach">
                                    {Object.keys(existingfiles).map((file: any) =>
                                      <li key={existingfiles[file].name}>
                                        <div className='divattachedfiles' title={existingfiles[file].FileName}>{existingfiles[file].FileName}</div>
                                        <a href="javascript:void(0)" data-filename={existingfiles[file].FileName} onClick={removeFile} title='Close'><span className="icon-Close"></span></a>
                                      </li>
                                    )}
                                  </ul>
                                  {
                                    setshowFileerrormsg ? (<span className="errormsg" id="docerrormsg">Uploaded file already exists or contains invalid characters. Please upload valid files</span>) : ''
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="spanhintmgs"> Hint: Upload the files which are in the .png, .jpeg, .xlsx, .doc, .ppt,.txt .pptx, .pdf, .gif, .msg files and special characters like #$%^&* will not be used in the document names</span>
                        </div>

                        <div className="col-xs-2 col-sm-2">
                          <div className="divformgroup">
                            <div className="selectdropdown">
                              <label htmlFor="KBArchEdit-kbedit">Is Archived</label>
                              <select name="Is Archieved" id="KnowledgebaseArchived-kbedit32" value={editKbisArchived} onChange={(event) => seteditKbisArchived(event.target.value)}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update" className="anchorsavebtn" onClick={() => validateKB(item.ID)}><span className="icon-Update"></span>Update</a>
                          </li>
                          <li><a href="javascript:void(0)" title="Cancel" onClick={() => {
                            setInEditMode({ ...inEditMode, status: false })
                            setshowAccordion(false)
                          }} aria-label="Cancel" className="anchorcancelbtn anchoreditcanel"><span className="icon-Close"></span>Cancel</a>
                          </li>
                        </ul>
                      </div>
                    </div>)
                  : ''}
                {Accordion.status && Accordion.rowKey === item.Id && !inEditMode.status
                  ? (
                    <div className="divcontentareapopup divcardedit divpolicydocuments"
                      id="KnowledgeBasecontent-1"
                      aria-hidden="true">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="divforminfo" id="">
                            <label>Description</label>
                            <p dangerouslySetInnerHTML={{ __html: item.Description }} ></p>
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="divforminfo divKBattachments" id="">
                            <label>Attachments</label>
                            <ul>
                              {item.AttachmentFiles?.length && item.AttachmentFiles?.length > 0
                                ? item.AttachmentFiles?.map((item: any) =>
                                  <li key={item.FileName}><a href={item.ServerRelativeUrl} target="_blank" title={item.FileName} rel="noreferrer">{DocumentIconNames(item.FileName)}{item.FileName}</a> </li>
                                )
                                : ''}
                            </ul>
                          </div>
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
            // eslint-disable-next-line indent
          )
          : ''
      }
    </div>

  )
}

export default KnowledgeGraphSettings
