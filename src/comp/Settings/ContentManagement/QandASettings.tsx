/* eslint-disable space-before-function-paren */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, ContentState, convertToRaw } from 'draft-js'
import { FileUploader } from 'react-drag-drop-files'
import Htmltodraft from 'html-to-draftjs'
import { compareDates, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import { ListNames } from '../../../pages/Config'
import { sp } from '@pnp/sp'
import draftToHtml from 'draftjs-to-html'
import loader from '../../Images/Loader.gif'
import { IItem } from '@pnp/sp/items'

const QandASettings = () => {
  const [Accordion, setAcc] = useState({
    status: false,
    rowKey: null
  })
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const [editorStateAnswer, setEditorStateAnswer] = useState(() =>
    EditorState.createEmpty()
  )
  const onEditorStateChange = async (state: any) => {
    await setEditorState(state)
  }
  const onEditorStateChangeAnswer = async (state: any) => {
    await setEditorStateAnswer(state)
  }
  const [showAddPopup, setshowAddPopup] = useState(false)
  const [QAValidations, setQAValidations] = useState({
    valid: true,
    QAQues: true,
    QADesc: true,
    QAAns: true,
    QASubcat: true
  })
  const [loaderState, setloaderState] = useState(false)
  const [editQAArch, seteditQAArch] = useState('')
  const [editsubcat, seteditsubcat] = useState('')
  const [listItems, setListItems] = useState<any>()
  const [subcat, setsubcat] = useState<any>()
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const [Ques, setQues] = useState('')
  const [setshowFileerrormsg, setFileerrormsg] = useState(false)
  const [existingfiles, setexistingfiles] = useState<any>([])
  const [filesuploaded, setfilesuploaded] = useState<any>([])
  const [filestodelete, setfilestodelete] = useState<any>([])
  const onEdit = (item: any) => {
    setInEditMode({
      status: true,
      rowKey: item.ID
    })
    setexistingfiles([])
    setfilestodelete([])
    setfilesuploaded([])
    const isArchive = item.IsArchived ? 'Yes' : 'No'
    // const _contentState = ContentState.createFromText(item.Description)
    // const descData = convertToRaw(_contentState)
    // seteditDesc(descData)
    const description = item.Description.split('>').slice(1).join('>')
    const blocksFromHTML = Htmltodraft(description)
    setEditorState(
      EditorState.createWithContent(
        ContentState.createFromBlockArray(blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap)
      )
    )
    // const _contentStateAns = ContentState.createFromText(item.Answer)
    // const Ans = convertToRaw(_contentStateAns)
    // setAns(Ans)
    const Answer = item.Answer.split('>').slice(1).join('>')
    const AnsblocksFromHTML = Htmltodraft(Answer)
    setEditorStateAnswer(
      EditorState.createWithContent(
        ContentState.createFromBlockArray(AnsblocksFromHTML.contentBlocks,
          AnsblocksFromHTML.entityMap)
      )
    )
    seteditQAArch(isArchive)
    seteditsubcat(item.Subcategory)
    setQues(item.Title)
    clearValidations()
    setshowAddPopup(false)
    setexistingfiles(item.AttachmentFiles)
  }
  const clearValidations = () => {
    setQAValidations({
      ...QAValidations,
      valid: true,
      QAQues: true,
      QADesc: true,
      QAAns: true,
      QASubcat: true
    })
  }
  useEffect(() => {
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      getSubcategoriesMetadata()
      initEffect()
    })
  }, [])
  const initEffect = () => {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('QandABuildModifiedListDate' + siteName) || ''
      const QandAModifiedDate = localStorage.getItem('QandA_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, QandAModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(ListNames().QandA)
        const endpoint = ['ID', 'Title', 'Description', 'Answer', 'Category', 'Subcategory', 'IsArchived', 'Created', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'AttachmentFiles']
        const expand = ['Author', 'Editor', 'AttachmentFiles']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          localStorage.setItem('QandAData' + siteName, JSON.stringify(items))
          localStorage.setItem('QandA_LMDate' + siteName, listModifiedDate)
          setListItems(items)
        })
      } else {
        const QandAData: any = (localStorage.getItem('QandAData' + siteName) !== undefined && localStorage.getItem('QandAData' + siteName) !== '' && localStorage.getItem('QandAData' + siteName) !== null ? JSON.parse(localStorage.getItem('QandAData' + siteName) || '{}') : [])
        setListItems(QandAData)
      }
    } catch (error) {
      console.log(error)
    }
    setTimeout(() => {
      toggleLoader(false)
    }, 2000)
  }
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
        <select name='"SubCategory"' id='ddlMajcom' value={editsubcat} onChange={(e) => seteditsubcat(e.target.value)} aria-label="SubCategory" >
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
    setQAValidations({
      ...QAValidations,
      valid: true,
      QAQues: true,
      QADesc: true,
      QAAns: true,
      QASubcat: true
    })
    seteditsubcat('')
    setQues('')
    clearValidations()
    setEditorStateAnswer(
      EditorState.createEmpty()
    )
    setEditorState(
      EditorState.createEmpty()
    )
    setexistingfiles([])
  }
  const validateQA = (id: any) => {
    toggleLoader(true)
    let valid = true
    let Question = true
    let Description = true
    let Answer = true
    let subcategory = true
    if (Ques === '' || Ques === undefined || Ques === null) {
      valid = false
      Question = false
    }
    if (!editorStateAnswer.getCurrentContent().hasText()) {
      valid = false
      Answer = false
    }
    if (!editorState.getCurrentContent().hasText()) {
      valid = false
      Description = false
    }
    if (editsubcat === '' || editsubcat === 'Select' || editsubcat === 'select') {
      valid = false
      subcategory = false
    }
    setQAValidations({
      ...QAValidations,
      valid: valid,
      QAQues: Question,
      QADesc: Description,
      QAAns: Answer,
      QASubcat: subcategory
    })
    if (valid) {
      saveOrUpdateQA(id)
    } else {
      toggleLoader(false)
    }
  }
  const saveOrUpdateQA = (id: any) => {
    setshowAddPopup(false)
    setInEditMode({
      status: false,
      rowKey: null
    })
    const isArchived = editQAArch === 'Yes'
    const addObj = {
      Category: 'NAFFA',
      Title: Ques,
      Description: draftToHtml(convertToRaw(editorState.getCurrentContent())),
      Answer: draftToHtml(convertToRaw(editorStateAnswer.getCurrentContent())),
      Subcategory: editsubcat,
      IsArchived: isArchived
    }

    if (id !== '' && id !== null && id !== undefined) {
      sp.web.lists.getByTitle(ListNames().QandA).items.getById(id).update(addObj).then(async function () {
        const item: IItem = sp.web.lists.getByTitle(ListNames().QandA).items.getById(id)
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
            BuildmodifiedListUpdate()
          })
        } if (filestodelete && filestodelete.length > 0) {
          const item: IItem = sp.web.lists.getByTitle(ListNames().QandA).items.getById(id)
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
      })
    } else {
      sp.web.lists.getByTitle(ListNames().QandA).items.add(addObj).then(function (Qaitem) {
        if (filesuploaded && filesuploaded.length > 0) {
          const item: IItem = sp.web.lists.getByTitle(ListNames().QandA).items.getById(Qaitem.data.ID)
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
    sp.web.lists.getByTitle(ListNames().QandA).items.getById(id).delete().then(function () {
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
      if (buildmodifiedlist[i].Name === 'QandA') {
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
    console.log(e)
    const filename = e.currentTarget.dataset.filename
    console.log(filename)
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
    console.log(deletefiles)
    setfilestodelete(deletefiles)
    const currentfiles = existingfiles.filter(function (file: any) { return file.FileName !== filename })
    setexistingfiles(currentfiles)
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
  return (
    <div id="qa" className="tabcontent SettingsQA  page " data-page="qa">
      <div className="divsettingsheader ">
        <h2><span className="icon-addcomment"></span>
          Q & A</h2>
        <ul className="ulactionitems ulUsergroupsactionitems">

          <li><a href="javascript:void(0)" title="Add" className="anchorsettingglobalbtn" id="addqa" onClick={() => { onclickADD() }}>
            <span className="icon-Add"></span>
            Add</a></li>
        </ul>
      </div>
      {showAddPopup
        ? (
          <div className="divaddpopup divsettingglobalpopup" id="addqapopup" >
            <h3>ADD Q & A</h3>
            <div className="divcardbody">
              <div className="row">
                <div className="col-xl-12 col-sm-12">
                  <div className="divformgroup">
                    <label htmlFor="QATitle">Question </label><span className="mandatory">*</span>
                    <input type="text" name="QATitle" id="QandATitle" placeholder="Enter Question" autoFocus={true} value={Ques} onChange={(e) => setQues(e.target.value)} />
                    {!QAValidations.QAQues
                      ? (<p className="errormsg" id="QandATitleErr">Please enter question.</p>)
                      : ''}
                  </div>
                </div>
                <div className="col-xs-12 col-sm-12">
                  <div className="divformgroup">
                    <label htmlFor="QuestionDescription">Description  </label><span className="mandatory">*</span>
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
                    {!QAValidations.QADesc
                      ? (<p className="errormsg" id="KnowledgebaseDescriptionErr">Please enter description.</p>)
                      : ''}
                  </div>
                </div>
                <div className="col-xs-12 col-sm-12">
                  <div className="divformgroup">
                    <label htmlFor="AnswerDescription">Answer</label><span className="mandatory">*</span>
                    <Editor
                      editorState={editorStateAnswer}
                      onEditorStateChange={onEditorStateChangeAnswer}
                      toolbar={{
                        inline: { inDropdown: true },
                        list: { inDropdown: true },
                        textAlign: { inDropdown: true },
                        link: { inDropdown: true },
                        history: { inDropdown: true }
                      }} />
                    {!QAValidations.QAAns
                      ? (<p className="errormsg" id="KnowledgebaseDescriptionErr">Please enter Answer.</p>)
                      : ''}
                  </div>
                </div>
                <div className="col-xs-12 col-sm-12">
                  <div className="divattachments" id="testform">
                    <div className="divformgroup">
                      <label>Attach File(s)</label>

                      <div id="dropzone"
                        className="divattachfile dropzonecontrol" aria-label="Attachment">
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
                  <span className="spanhintmgs">Hint: Upload the files which are in the .png, .jpeg, .xlsx, .doc, .ppt,.txt .pptx, .pdf, .gif,.msg files and special characters like #$%^&* will not be used in the document names </span>
                </div>
                <div className="col-xs-6 col-sm-6">
                  <div className="divformgroup">
                    <div className="selectdropdown">
                      <label htmlFor="knowledgeGraphCategory">Category </label><span className="mandatory">*</span>
                      <select name="Category" id="knowledgeGraphCategory" disabled={true}>
                        <option value="NAFFA">NAFFA</option>
                      </select>
                      <p className="errormsg hidecomponent" id="knowledgeGraphSectionErr">Please select Dropdown</p>
                    </div>
                  </div>
                </div>
                <div className="col-xs-6 col-sm-6">
                  <div className="divformgroup">
                    <div className="selectdropdown">
                      <label htmlFor="knowledgeGraphSubCategory">Sub Category</label><span className="mandatory">*</span>
                      {RenderSubcategoryDropDown()}
                      {!QAValidations.QASubcat
                        ? (<p className="errormsg" id="KnowledgebaseDescriptionErr">Please select Sub Category.</p>)
                        : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="divpopupfooter">
                <ul>
                  <li><a href="javascript:void(0)" title="Save" className="anchorsavebtn" onClick={() => validateQA('')}>
                    <span className="icon-Save"></span>Save</a></li>
                  <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchorglobalcancelbtn" id="quicklinkcancelbtn" onClick={() => { setshowAddPopup(false) }}>
                    <span className="icon-Close"></span>Cancel</a></li>
                </ul>
              </div>
            </div>
          </div>)
        : ''}
      <div className="divcontentarea divQAcontent">
        <ul aria-label="Policy Memos &amp; Guidelines" className="ulaccordians" id="populateQandA">
          {listItems?.length && listItems?.length > 0
            ? listItems?.map((item: any) =>
              <li key={item.Id} onClick={() => setAcc({
                status: (Accordion.rowKey === item.ID) ? !Accordion.status : true,
                rowKey: item.Id
              })}>
                <div className="divcard divaccordiancard" aria-controls="qacontent-1" aria-expanded={(Accordion.status && Accordion.rowKey === item.ID && !inEditMode.status)} id="accordion-control-2">
                  <div className="divitem">
                    <p>Question</p>
                    <span id="kbTitletext-32">{item.Title}</span>
                  </div>
                  <div className="divitem">
                    <p>
                      Category
                    </p>
                    <span>{item.Category}</span>
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
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit"
                        id="addqaedit" onClick={() => onEdit(item)}><span className="icon-Edit"></span> Edit</a></li>
                      <li><a href="javascript:void(0)" title="Delete" onClick={() => displayalertDelete(item.ID)}><span className="icon-trash"></span>
                        Delete</a>
                      </li>

                    </ul>
                  </div>

                </div>
                {inEditMode.status && inEditMode.rowKey === item.ID
                  ? (
                    <div className="divcardedit divcardeditpopup divcardadddocument" id="addqaedit" >
                      <div className="row">
                        <div className="col-xl-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="QATitle">Question </label><span className="mandatory">*</span>
                            <input type="text" name="QATitle" id="QATitle" placeholder="TDY Actions. Authentication" value={Ques} onChange={(e) => setQues(e.target.value)} />
                            {!QAValidations.QAQues
                              ? (<p className="errormsg" id="QandATitleErr">Please enter question.</p>)
                              : ''}
                          </div>
                        </div>
                        <div className="col-xs-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="kbDescription">Description  </label> <span className="mandatory">*</span>
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
                            {!QAValidations.QADesc
                              ? (<p className="errormsg" id="KnowledgebaseDescriptionErr">Please enter description.</p>)
                              : ''}
                          </div>
                        </div>

                        <div className="col-xs-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="kbDescription">Answer  </label><span className="mandatory">*</span>
                            <Editor
                              editorState={editorStateAnswer}
                              onEditorStateChange={onEditorStateChangeAnswer}
                              toolbar={{
                                inline: { inDropdown: true },
                                list: { inDropdown: true },
                                textAlign: { inDropdown: true },
                                link: { inDropdown: true },
                                history: { inDropdown: true }
                              }} />
                            {!QAValidations.QAAns
                              ? (<p className="errormsg" id="KnowledgebaseDescriptionErr">Please enter Answer.</p>)
                              : ''}
                          </div>
                        </div>
                        <div className="col-xs-12 col-sm-12">
                          <div className="divattachments" id="testform">
                            <div className="divformgroup">
                              <label>Attach File(s)</label>

                              <div id="dropzone"
                                className="divattachfile dropzonecontrol" aria-label="Attachment">
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
                          <span className="spanhintmgs">
                            Hint: Upload the files which are in the .png, .jpeg, .xlsx, .doc, .ppt,.txt .pptx, .pdf,
                            .gif, .msg files and special characters like #$%^&* will not be used in the document names
                          </span>
                        </div>
                        <div className="col-xs-6 col-sm-6">
                          <div className="divformgroup">
                            <div className="selectdropdown">
                              <label htmlFor="knowledgeGraphCategory">Category </label><span className="mandatory">*</span>
                              <select name="Category" id="knowledgeGraphCategory" disabled>
                                <option value="NAFFA">NAFFA</option>
                              </select>
                              <p className="errormsg hidecomponent" id="knowledgeGraphCategoryErr">Please select Dropdown</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-xs-6 col-sm-6 knowledgeGraphEditCategory">
                          <div className="divformgroup">
                            <div className="selectdropdown">
                              <label htmlFor="knowledgeGraphSubCategory">Sub Category </label><span className="mandatory">*</span>
                              {RenderSubcategoryDropDown()}
                              {!QAValidations.QASubcat
                                ? (<p className="errormsg" id="KnowledgebaseDescriptionErr">Please select Dropdown.</p>)
                                : ''}
                            </div>
                          </div>
                        </div>

                        <div className="col-xs-6 col-sm-6">
                          <div className="divformgroup">
                            <div className="selectdropdown">
                              <label htmlFor="KBArchEdit-kbedit">Is Archived</label>
                              <select name="Is Archieved" id="KnowledgebaseArchived-kbedit32" value={editQAArch} onChange={(event) => seteditQAArch(event.target.value)}>
                                <option value="No" >No</option>
                                <option value="Yes">Yes</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update"
                            className="anchorsavebtn" onClick={() => validateQA(item.ID)}><span className="icon-Update"></span>Update</a></li>
                          <li><a href="javascript:void(0)" title="Cancel" aria-label="Cancel"
                            className="anchorcancelbtn anchoreditcanel" onClick={() => {
                              setInEditMode({
                                status: false,
                                rowKey: null
                              })
                            }}><span className="icon-Close"></span>Cancel</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    // eslint-disable-next-line indent
                  )
                  : ''}
                {Accordion.status && Accordion.rowKey === item.Id && !inEditMode.status
                  ? (
                    <div className="divcontentareapopup divcardedit divpolicydocuments" id="qacontent-1"
                      aria-hidden="true">
                      <div className="row">
                        <div className="col-md-12">
                          <div className="divforminfo" id="">
                            <label>Description</label>
                            <p
                              dangerouslySetInnerHTML={{ __html: item.Description }} ></p>
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="divforminfo" id="">
                            <label>Answer</label>
                            <p dangerouslySetInnerHTML={{ __html: item.Answer }}></p>
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="divforminfo" id="">
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
                    </div>
                    // eslint-disable-next-line indent
                  )
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

export default QandASettings
