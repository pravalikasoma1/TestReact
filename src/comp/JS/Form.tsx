import React, { Component } from 'react'
import '../CSS/Form.css'
import '../CSS/ReactDraft.css'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, ContentState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import Htmltodraft from 'html-to-draftjs'
import { FileUploader } from 'react-drag-drop-files'
import { LoginUserName, compareDates, GetUserProfile, GlobalConstraints, getFiscalYear, sendEmails } from '../../pages/Master'
import { sp } from '@pnp/sp'
import { ListNames, EmailTexts } from '../../pages/Config'
import { format } from 'date-fns'
import loader from '../Images/Loader.gif'

export interface Props {
  tid:any;
}

interface State {
  editorState: EditorState;
  editMode: boolean;
  QTitle: string;
  SubCategories:Array<any>;
  currentSubCategory: string;
  validTitle:boolean;
  validDescription:boolean;
  validTop:boolean;
  validBottom:boolean;
  GUID:any;
  QuestionId:string;
  ID: number;
  Status:number;
  CompUpdated:boolean;
  loader:boolean;
  updateButton:boolean;
  InstructionToggle:boolean;
  filesuploaded: Array<any>;
  filestodelete: Array<any>;
  existingfiles: Array<any>;
  setshowFileerrormsg:boolean;
  submitmsg:boolean;
  updatemsg:boolean;
  savemsg:boolean;
  DutyEmail:string;
  tooltip: Array<any>;
  Category: string;
  SubCategory: string;
  Title: string;
  Description: string;
  AttachFile: string;
  focusTitle: boolean;
  PreviousTitle:string;
  currentDescription: string;
  PreviousDescription: string;
  changeFiles:boolean;
  NochangesBottom:boolean;
  NochangesTop:boolean;
  previousSubcat:string;
}

class Form extends Component<Props, State> {
  editorReference: any
  componentDidUpdate () {
    const url = window.location.href
    const length = url.split('/').length
    let Guid = url.split('/')[length - 1]
    if (Guid.includes('=')) {
      Guid = Guid.split('=')[1]
    }
    if (this.state.GUID !== Guid && this.state.GUID !== '' && !this.state.CompUpdated) {
      this.setState({
        editorState: EditorState.createWithContent(
          ContentState.createFromText('')
        ),
        editMode: true,
        QTitle: '',
        currentSubCategory: '',
        GUID: '',
        QuestionId: '',
        ID: 0,
        Status: 0,
        CompUpdated: true,
        updateButton: false,
        filesuploaded: [],
        filestodelete: [],
        existingfiles: []
      })
      this.forceUpdate()
    }
  }

  componentDidMount () {
    GetUserProfile()
    this.gettooltips()
    this.setState({
      loader: true
    })
    this.getSubcategoriesMetadata()
    const url = window.location.href
    const length = url.split('/').length
    let list = ListNames().QuestionsList
    let Guid = url.split('/')[length - 1]
    if (Guid.includes('=')) {
      Guid = Guid.split('=')[1]
      list = ListNames().SavedQuestionsList
    }
    if (Guid !== 'QuestionForm') {
      sp.web.lists.getByTitle(list).items.filter("ItemGUID eq '" + Guid + "'").get().then((item) => {
        let desc = item[0].QuestionDescription
        desc = desc.split('>').slice(1).join('>')
        const blocksFromHTML = Htmltodraft(desc)
        this.setState({
          editorState: EditorState.createWithContent(
            ContentState.createFromBlockArray(blocksFromHTML.contentBlocks,
              blocksFromHTML.entityMap)
          ),
          editMode: true,
          QTitle: item[0].QuestionTitle,
          currentSubCategory: item[0].SubCategory,
          GUID: Guid,
          QuestionId: item[0].QuestionID,
          ID: item[0].ID,
          Status: item[0].StatusId,
          DutyEmail: item[0].DutyEmail,
          PreviousTitle: item[0].QuestionTitle,
          currentDescription: item[0].QuestionDescription,
          PreviousDescription: item[0].QuestionDescription,
          changeFiles: false,
          NochangesBottom: false,
          NochangesTop: false,
          previousSubcat: item[0].SubCategory
        })
        if (item[0].StatusId > 1) {
          this.setState({
            updateButton: true
          })
        }
        this.populateDocument(Guid)
      })
    }
    setTimeout(() => {
      this.setState({
        loader: false
      })
    }, 1000)
  }

  constructor (props: any) {
    super(props)
    this.state = {
      editorState: EditorState.createWithContent(
        ContentState.createFromText('')
      ),
      editMode: true,
      QTitle: '',
      SubCategories: [],
      currentSubCategory: '',
      validTitle: false,
      validDescription: false,
      validTop: true,
      validBottom: true,
      GUID: '',
      QuestionId: '',
      ID: 0,
      Status: 0,
      CompUpdated: false,
      loader: false,
      updateButton: false,
      InstructionToggle: false,
      filesuploaded: [],
      filestodelete: [],
      existingfiles: [],
      setshowFileerrormsg: false,
      submitmsg: false,
      updatemsg: false,
      savemsg: false,
      DutyEmail: '',
      tooltip: [],
      Category: '',
      SubCategory: '',
      Title: '',
      Description: '',
      AttachFile: '',
      focusTitle: false,
      PreviousTitle: '',
      currentDescription: '',
      PreviousDescription: '',
      changeFiles: false,
      NochangesBottom: false,
      NochangesTop: false,
      previousSubcat: ''
    }
  }

      onEditorStateChange = (editorState: EditorState) => {
        this.setState({
          editorState
        })
        this.setState({ focusTitle: false })
        const DescriptionArea = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
        this.setState({
          currentDescription: DescriptionArea
        })
      };

       setEditorReference = (ref: any) => { this.editorReference = ref }
       public isValidForm (pos: any, action: any) {
         this.setState({ validTop: true, validTitle: false, validDescription: false, validBottom: true, NochangesTop: false, NochangesBottom: false })
         let valid = true
         let validTitle = false
         let validDesc = false
         if (this.state.QTitle === '' || this.state.QTitle === null) {
           validTitle = true
           valid = false
         }
         if (!this.state.editorState.getCurrentContent().hasText() && action === 'submit') {
           validDesc = true
           valid = false
         }
         if (pos === 'top') {
           this.setState({ validTop: valid, validTitle: validTitle, validDescription: validDesc, validBottom: true })
         } else {
           this.setState({ validBottom: valid, validTitle: validTitle, validDescription: validDesc, validTop: true })
         }
         if (this.state.updateButton) {
           if (this.state.PreviousTitle === this.state.QTitle && ((this.state.currentDescription + '</div>' === this.state.PreviousDescription.split('>').slice(1).join('>')) || (this.state.currentDescription.split('>').slice(1).join('>') === this.state.PreviousDescription.split('>').slice(1).join('>'))) && !this.state.changeFiles && this.state.currentSubCategory === this.state.previousSubcat) {
             if (pos === 'top') { this.setState({ NochangesTop: true }) } else { this.setState({ NochangesBottom: true }) }
             valid = false
           }
         }
         return valid
       }

       public generateUUID () {
         let d = new Date().getTime()
         const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
           const r = (d + Math.random() * 16) % 16 | 0
           d = Math.floor(d / 16)
           // eslint-disable-next-line no-mixed-operators
           return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16)
         })
         return uuid
       }

       async AddhistorynewItem (Guid:any, QuesID: any) {
         const list = ListNames().QuestionsHistoryList
         const addObj = {
           QuestionsItemID: QuesID.toString(),
           Action: 'Submitted',
           Description: 'Submitted',
           StatusId: 3,
           PreviousStatusId: 3,
           ItemGUID: Guid,
           ItemCreated: new Date(),
           ItemCreatedById: LoginUserName().UserId,
           ItemModified: new Date(),
           ItemModifiedById: LoginUserName().UserId,
           Role: 'Customer'
         }
         sp.web.lists.getByTitle(list).items.add(addObj).then((data) => {
           this.createFolder(Guid, '').then(() => {
             const sendEmail: any = []
             const SITE_URL = _spPageContextInfo.webAbsoluteUrl
             const URL = SITE_URL + '/SitePages/Home.aspx#/Detailedviewpage/' + Guid
             const to = 'AFIMSC'
             sendEmail.push({
               to: LoginUserName().UserEmail,
               subject: 'Question ' + "'" + this.state.QTitle + "'" + ' Submitted.',
               bodytext: 'Your question has been submitted successfully.',
               clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
             })
             sendEmail.push({
               to: to,
               subject: 'Question ' + "'" + this.state.QTitle + "'" + ' Submitted',
               bodytext: 'New question has been submitted for your review.',
               clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
             })
             if (sendEmail && sendEmail.length > 0) {
               $(sendEmail).each((index, item: any) => {
                 const body = this.emailBody(item.bodytext, item.clickHereText)
                 sendEmails(EmailTexts().FROM, item.to, item.subject, body)
               })
             }
             console.log('created')
           })
         })
       }

       async createFolder (Foldername: any, action:any) {
         const serverRelativeUrlToFolder = _spPageContextInfo.webServerRelativeUrl + '/QuestionsDocumentLibrary/' + Foldername
         sp.web.folders.add(serverRelativeUrlToFolder).then(() => {
           console.log('Folder created')
           if (this.state.filesuploaded && this.state.filesuploaded.length > 0) {
             for (let i = 0; i < this.state.filesuploaded.length; i++) {
               sp.web.getFolderByServerRelativePath('QuestionsDocumentLibrary/' + Foldername).files.addUsingPath(this.state.filesuploaded[i].name, this.state.filesuploaded[i], { Overwrite: true }).then((e) => {
                 console.log(e)
                 if (i === this.state.filesuploaded.length - 1) {
                   if (action !== 'save') {
                     this.displaymsg(1)
                     setTimeout(() => {
                       document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${Foldername}`
                     }, 1000)
                   } else {
                     this.displaymsg(3)
                     document.location = `${window.location.origin + window.location.pathname}#/QuestionForm/s=${Foldername}`
                   }
                 }
               })
             }
           } else {
             // document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${Foldername}`
             if (action !== 'save') { document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${Foldername}` } else { document.location = `${window.location.origin + window.location.pathname}#/QuestionForm/s=${Foldername}` }
           }
         }).catch(function (data) {
           console.log('Folder is not created at ' + data.data.ServerRelativeUrl)
         })
       }

       async checkUpdateorDeleteDocs (Foldername: any, action: any) {
         if (action === 'submit') {
           const sendEmail: any = []
           const SITE_URL = _spPageContextInfo.webAbsoluteUrl
           const URL = SITE_URL + '/SitePages/Home.aspx#/Detailedviewpage/' + Foldername
           const to = 'AFIMSC'
           const QuestionTitle = this.state.QTitle
           sendEmail.push({
             to: this.state.DutyEmail,
             subject: 'Question ' + "'" + QuestionTitle + "'" + ' Modified.',
             bodytext: 'Your question has been updated successfully.',
             clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
           })
           sendEmail.push({
             to: to,
             subject: 'Question ' + "'" + QuestionTitle + "'" + ' Modified.',
             bodytext: 'New question has been updated successfully.',
             clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
           })
           if (sendEmail && sendEmail.length > 0) {
             $(sendEmail).each((index, item: any) => {
               const body = this.emailBody(item.bodytext, item.clickHereText)
               sendEmails(EmailTexts().FROM, item.to, item.subject, body)
             })
           }
         }

         if (this.state.filesuploaded && this.state.filesuploaded.length > 0) {
           for (let i = 0; i < this.state.filesuploaded.length; i++) {
             sp.web.getFolderByServerRelativePath('QuestionsDocumentLibrary/' + Foldername).files.addUsingPath(this.state.filesuploaded[i].name, this.state.filesuploaded[i], { Overwrite: true }).then((e) => {
               console.log('done')
               if (i === this.state.filesuploaded.length - 1) {
                 if (action == 'submit') {
                   this.displaymsg(2)
                   setTimeout(() => {
                     document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${Foldername}`
                   }, 1000)
                 }
               }
             })
           }
         } else if (this.state.filestodelete && this.state.filestodelete.length <= 0) {
           if (action == 'submit') {
             this.displaymsg(2)
             setTimeout(() => {
               document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${Foldername}`
             }, 1000)
           }
         }
         if (this.state.filestodelete && this.state.filestodelete.length > 0) {
           const listName = ListNames().QuestionsDocumentLibrary
           const list = sp.web.getFolderByServerRelativeUrl(listName + '/' + Foldername)
           for (let i = 0; i < this.state.filestodelete.length; i++) {
             list.files.getByName('' + this.state.filestodelete[i].ServerRelativeUrl + '').delete().then((e) => {
               console.log('done')
               if (action == 'submit') {
                 this.displaymsg(2)
                 setTimeout(() => {
                   document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${Foldername}`
                 }, 1000)
               }
             })
           }
         } else if (this.state.filesuploaded && this.state.filesuploaded.length <= 0) {
           if (action == 'submit') {
             this.displaymsg(2)
             setTimeout(() => {
               document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${Foldername}`
             }, 1000)
           }
         }
       }

       populateDocument = (ItemGUID: any) => {
         const listName = ListNames().QuestionsDocumentLibrary
         const list = sp.web.getFolderByServerRelativeUrl(listName + '/' + ItemGUID)
         /* const endpoint = ['ID', 'IsForm', 'Name', 'Title', 'UIVersionLabel', 'TimeCreated', 'TimeLastModified', 'ServerRelativeUrl', 'Files/Author/Title', 'ModifiedBy/Title']
        const expand = ['Files', 'Files/ListItemAllFields', 'Files/Author', 'Files/ModifiedBy', 'ListItemAllFields'] */
         const endpoint = ['ID', 'IsForm', 'Name', 'Title', 'UIVersionLabel', 'TimeCreated', 'TimeLastModified', 'ServerRelativeUrl', 'Author/Title', 'ItemCreatedBy/Title']
         const expand = ['listItemAllFields', 'Author', 'ItemCreatedBy']
         list.files.select('' + endpoint + '').expand('' + expand + '').orderBy('Title', true).top(5000).get().then((items) => {
           // eslint-disable-next-line no-return-assign
           items.forEach((item: any) => item.name = item.Name)
           this.setState({
             existingfiles: items
           })
         })
       }

       public FormSubmit (e: any, pos: any, action: any) {
         const siteName = GlobalConstraints().siteName
         const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
         const DescriptionArea = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
         this.setState({
           currentDescription: DescriptionArea
         })
         if (loginUserProfile && loginUserProfile.length > 0) {
           const validate = this.isValidForm(pos, action)
           let QCount: any = []
           const Datenow = new Date()
           let list = ''
           let statusID: number
           const createdDate = format(Datenow, 'yyyyMMddhhmmss')
           if (action === 'submit') {
             list = ListNames().QuestionsList
             statusID = 3
           } else if (action === 'save') {
             list = ListNames().SavedQuestionsList
             statusID = 1
           }
           if (validate) {
             this.setState({
               loader: true
             })
             if (this.state.GUID === '' || this.state.GUID === undefined) {
               const numObj = {
                 Title: loginUserProfile[0].DoDIDNumber
               }
               const url = window.location.href
               const length = url.split('/').length
               let Guid = url.split('/')[length - 1]
               if (Guid.includes('=')) {
                 Guid = Guid.split('=')[1]
               }
               if (action === 'submit') {
                 const datenow = new Date()
                 sp.web.lists.getByTitle(ListNames().QuestionNumGenerationList).items.add(numObj).then((data) => {
                   if (data !== undefined) {
                     const nid = data.data.ID
                     QCount = this.generateID(nid)
                   }
                   const addObj = {
                     QuestionID: loginUserProfile[0].DoDIDNumber + '-' + QCount,
                     QuestionTitle: this.state.QTitle,
                     QuestionDescription: DescriptionArea,
                     Category: 'NAFFA',
                     SubCategory: this.state.currentSubCategory,
                     StatusId: statusID,
                     PreviousStatusId: statusID,
                     ItemGUID: Guid === 'QuestionForm' ? this.generateUUID() : Guid,
                     StatusModifiedDate: new Date(),
                     CustomerID: LoginUserName().UserId,
                     DutyEmail: LoginUserName().UserEmail,
                     disName: LoginUserName().UserName,
                     ItemCreatedById: LoginUserName().UserId,
                     ItemModifiedById: LoginUserName().UserId,
                     ItemModified: new Date(),
                     ItemCreated: new Date(),
                     FY: String(getFiscalYear(datenow))
                   }
                   if (Guid === 'QuestionForm') {
                     sp.web.lists.getByTitle(list).items.add(addObj).then((data) => {
                       this.AddhistorynewItem(data.data.ItemGUID, data.data.ID).then(() => {
                         this.setState({
                           loader: false
                         })
                         this.displaymsg(1)
                         sessionStorage.setItem('terms', '1')
                         // document.location = `${window.location.origin + window.location.pathname}#/Questions&card=myquestion`
                         // document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${data.data.ItemGUID}`
                       })
                     })
                   } else {
                     sp.web.lists.getByTitle(list).items.add(addObj).then((data) => {
                       this.AddhistorynewItem(data.data.ItemGUID, data.data.ID).then(() => {
                         sp.web.lists.getByTitle(ListNames().SavedQuestionsList).items.filter("ItemGUID eq '" + Guid + "'").get().then((item) => {
                           sp.web.lists.getByTitle(ListNames().SavedQuestionsList).items.getById(item[0].ID).delete().then((item) => {
                             this.setState({
                               loader: false
                             })
                             this.displaymsg(1)
                           })
                         })
                         // document.location = `${window.location.origin + window.location.pathname}#/Questions&card=myquestion`
                         // document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${data.data.ItemGUID}`
                       })
                     })
                   }
                 })
               } else {
                 const statusId = (action === 'submit') ? 3 : 1
                 const addObj = {
                   QuestionID: createdDate,
                   QuestionTitle: this.state.QTitle,
                   QuestionDescription: DescriptionArea,
                   Category: 'NAFFA',
                   SubCategory: this.state.currentSubCategory,
                   StatusId: statusId,
                   PreviousStatusId: statusId,
                   ItemGUID: Guid === 'QuestionForm' ? this.generateUUID() : Guid,
                   StatusModifiedDate: new Date(),
                   CustomerID: LoginUserName().UserId,
                   DutyEmail: LoginUserName().UserEmail,
                   disName: LoginUserName().UserName,
                   ItemCreatedById: LoginUserName().UserId,
                   ItemModifiedById: LoginUserName().UserId,
                   ItemModified: new Date(),
                   ItemCreated: new Date(),
                   FY: String(getFiscalYear(Datenow))
                 }
                 const updateobj = {
                   QuestionID: createdDate,
                   QuestionTitle: this.state.QTitle,
                   QuestionDescription: DescriptionArea,
                   Category: 'NAFFA',
                   SubCategory: this.state.currentSubCategory,
                   ItemGUID: Guid === 'QuestionForm' ? this.generateUUID() : Guid,
                   StatusModifiedDate: new Date(),
                   CustomerID: LoginUserName().UserId,
                   DutyEmail: LoginUserName().UserEmail,
                   disName: LoginUserName().UserName,
                   ItemCreatedById: LoginUserName().UserId,
                   ItemModifiedById: LoginUserName().UserId,
                   ItemModified: new Date(),
                   ItemCreated: new Date(),
                   FY: String(getFiscalYear(Datenow))
                 }
                 if (Guid === 'QuestionForm') {
                   sp.web.lists.getByTitle(list).items.add(addObj).then((data) => {
                     this.createFolder(data.data.ItemGUID, action).then((data) => {
                       console.log('done')
                       this.setState({
                         loader: false
                       })
                       this.displaymsg(3)
                     })
                     // document.location = `${window.location.href}/s=${data.data.ItemGUID}`
                   })
                 } else {
                   sp.web.lists.getByTitle(ListNames().SavedQuestionsList).items.filter("ItemGUID eq '" + Guid + "'").get().then((item) => {
                     sp.web.lists.getByTitle(list).items.getById(item[0].ID).update(updateobj).then((data) => {
                       this.checkUpdateorDeleteDocs(Guid, action).then((data) => {
                         console.log('done')
                         this.setState({
                           loader: false
                         })
                         this.displaymsg(3)
                         // document.location = `${window.location.href}/s=${Guid}`
                       })
                     })
                   })
                 }
               }
             } else {
               if (this.state.Status === 1 && action === 'submit') {
                 const numObj = {
                   Title: loginUserProfile[0].DoDIDNumber
                 }
                 sp.web.lists.getByTitle(ListNames().QuestionNumGenerationList).items.add(numObj).then((data) => {
                   if (data !== undefined) {
                     const nid = data.data.ID
                     QCount = this.generateID(nid)
                   }
                   const addObj = {
                     QuestionID: loginUserProfile[0].DoDIDNumber + '-' + QCount,
                     QuestionTitle: this.state.QTitle,
                     QuestionDescription: DescriptionArea,
                     Category: 'NAFFA',
                     SubCategory: this.state.currentSubCategory,
                     StatusId: statusID,
                     PreviousStatusId: statusID,
                     ItemGUID: this.state.GUID,
                     StatusModifiedDate: new Date(),
                     CustomerID: LoginUserName().UserId,
                     DutyEmail: LoginUserName().UserEmail,
                     disName: LoginUserName().UserName,
                     ItemCreatedById: LoginUserName().UserId,
                     ItemModifiedById: LoginUserName().UserId,
                     ItemModified: new Date(),
                     ItemCreated: new Date(),
                     FY: String(getFiscalYear(Datenow))
                   }

                   sp.web.lists.getByTitle(list).items.add(addObj).then((data) => {
                     this.AddhistorynewItem(data.data.ItemGUID, data.data.ID).then(() => {
                       sp.web.lists.getByTitle(ListNames().SavedQuestionsList).items.getById(this.state.ID).delete().then(() => {
                         this.setState({
                           loader: false
                         })
                         this.displaymsg(1)
                         // document.location = `${window.location.origin + window.location.pathname}#/Questions`
                         // document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${this.state.GUID}`
                       })
                     })
                   })
                 })
               } else {
                 statusID = action === 'submit' ? 3 : 1
                 const addObj = {
                   QuestionID: this.state.QuestionId,
                   QuestionTitle: this.state.QTitle,
                   QuestionDescription: DescriptionArea,
                   Category: 'NAFFA',
                   SubCategory: this.state.currentSubCategory,
                   StatusId: statusID,
                   PreviousStatusId: statusID,
                   ItemGUID: this.state.GUID,
                   ItemModifiedById: LoginUserName().UserId,
                   ItemModified: new Date(),
                   FY: String(getFiscalYear(Datenow))

                 }
                 const updateobj = {
                   QuestionID: this.state.QuestionId,
                   QuestionTitle: this.state.QTitle,
                   QuestionDescription: DescriptionArea,
                   Category: 'NAFFA',
                   SubCategory: this.state.currentSubCategory,
                   ItemGUID: this.state.GUID,
                   ItemModifiedById: LoginUserName().UserId,
                   ItemModified: new Date(),
                   FY: String(getFiscalYear(Datenow))

                 }
                 sp.web.lists.getByTitle(list).items.getById(this.state.ID).update(updateobj).then((data) => {
                   this.checkUpdateorDeleteDocs(this.state.GUID, action).then((data) => {
                     this.setState({
                       loader: false
                     })
                     this.displaymsg(2)
                     if (action === 'submit') { // document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${this.state.GUID}`
                     }
                   })
                 })
               }
             }
           }
         } else {
           alert('Please create profile to Save/Submit a Question')
         }
       }

       public displaymsg (id: any) {
         if (id === 1) {
           this.setState({
             submitmsg: true
           })
         }
         if (id === 2) {
           this.setState({
             updatemsg: true
           })
         }
         if (id === 3) {
           this.setState({
             savemsg: true
           })
           setTimeout(() => {
             this.setState({
               savemsg: false
             })
           }, 500)
         }
       }

       public RenderSubcategoryDropDown () {
         const defaultOptionValue = 'Select'
         const Majcomset = Array.from(new Set(this.state.SubCategories?.filter((item: { SubCategory: any }) => item.SubCategory).map((item: { SubCategory: any }) => item.SubCategory)))
         if (Majcomset.length > 0) {
           return (
          <select name='"SubCategory"' id='ddlMajcom' value = {this.state.currentSubCategory} onChange={this.changeSubCategory} aria-label="SubCategory" >
              <option value={defaultOptionValue}>{defaultOptionValue}</option>
            {Majcomset.map((SubCategory: any) => <option key={SubCategory} value={SubCategory}>{SubCategory}</option>)}
          </select>
           )
         }
       }

       public generateID (rcount: any) {
         let count = '0000001'
         if (rcount !== '' && rcount != null && rcount !== undefined) {
           const invcount = Number(rcount)
           const pad = '0000000'
           const ctxt = '' + invcount
           count = pad.substr(0, pad.length - ctxt.length) + ctxt
         }
         return count
       }

      TitleChange = (e: any) => {
        this.setState({ QTitle: e.target.value })
      }

      changeSubCategory = (e: any) => {
        this.setState({ focusTitle: false })
        this.setState({ currentSubCategory: e.target.value })
      }

       ToggleInstruction = () => {
         this.setState(
           { InstructionToggle: !this.state.InstructionToggle }
         )
       }

       closeRedirect = () => {
         const url = window.location.href
         const length = url.split('/').length
         const Guid = url.split('/')[length - 1]
         if (this.state.updateButton) {
           document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${this.state.GUID}`
         } else if (Guid.includes('=')) {
           document.location = `${window.location.origin + window.location.pathname}#/Questions&card=1`
         } else {
           document.location = `${window.location.origin + window.location.pathname}#/Questions`
         }
       }

       public async getSubcategoriesMetadata () {
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
               this.setState({ SubCategories: subcatdata })
             })
           } else {
             subCategories = JSON.parse(localStorage.getItem('subCategoriesMetadata' + siteName) || '{}')
             const subcatdata = subCategories?.filter((item: any) => { return item.IsArchived === false })
             this.setState({ SubCategories: subcatdata })
           }
         } catch (error) {
           console.log(error)
         }
       }

       uploadFileHandler = (e: any) => {
         this.setState({ focusTitle: false })
         this.setState({ changeFiles: true })
         console.log(e)
         let uploadedfiles = []
         let existFiles = []
         this.setState({
           setshowFileerrormsg: false
         })
         let isnotvalid = false
         for (let i = 0; i < e.length; i++) {
           // eslint-disable-next-line prefer-regex-literals
           let match: any = new RegExp("['~#%\&{}+\|]|\\.\\.|^\\.|\\.$")
           match = match.test(e[i].name)
           if (match) {
             isnotvalid = true
           } else if (this.state.existingfiles.some(function (el: any) {
             return el.name === e[i].name
           })) {
             isnotvalid = true
           } else if (this.checkdocfileextension(e[i].name)) {
             isnotvalid = true
           }
         }
         if (isnotvalid) {
           this.setState({
             setshowFileerrormsg: true
           })
         } else {
           if (this.state.filesuploaded && this.state.filesuploaded.length > 0) {
           // uploadedfiles = Object.keys(filesuploaded).slice()
             uploadedfiles = [...this.state.filesuploaded]
             uploadedfiles.push(...e)
           } else {
             uploadedfiles = [...e]
           }
           this.setState({ filesuploaded: uploadedfiles })
           if (this.state.existingfiles && this.state.existingfiles.length > 0) {
           // uploadedfiles = Object.keys(filesuploaded).slice()
             existFiles = [...this.state.existingfiles]
             existFiles.push(...e)
           } else {
             existFiles = [...e]
           }
           this.setState({ existingfiles: existFiles })
         }
       }

       checkdocfileextension (val: any) {
         // eslint-disable-next-line prefer-regex-literals
         const regex = new RegExp('(.*?)\.(txt|xlsx|xls|doc|docx|ppt|pptx|pdf|png|jpg|jpeg|xlsm|XLSM|XLSX|XLS|DOC|DOCX|PPT|PPTX|PDF|PNG|JPG|JPEG|TXT)$')
         if (!(regex.test(val))) {
           return true
         } else {
           return false
         }
       }

       removeFile = (e: any) => {
         this.setState({ changeFiles: true })
         console.log(e)
         const filename = e.currentTarget.dataset.filename
         console.log(filename)
         let deletefiles = []
         const existFiles = []
         const currfiles = this.state.existingfiles.filter(function (file: any) {
           return file.name === filename
         })
         const curruploadFiles = this.state.filesuploaded.filter(function (file: any) {
           return file.name !== filename
         })
         this.setState({
           filesuploaded: curruploadFiles
         })
         if (this.state.filestodelete && this.state.filestodelete.length > 0) {
           // uploadedfiles = Object.keys(filesuploaded).slice()
           deletefiles = [...this.state.filestodelete]
           deletefiles.push(...currfiles)
         } else {
           deletefiles = [...currfiles]
         }
         this.setState({
           filestodelete: deletefiles
         })
         const currentfiles = this.state.existingfiles.filter(function (file: any) { return file.name !== filename })
         this.setState({
           existingfiles: currentfiles
         })
         /* if (this.state.existingfiles && this.state.existingfiles.length > 0) {
           // uploadedfiles = Object.keys(filesuploaded).slice()
           existFiles = [...this.state.existingfiles]
           existFiles.push(...e)
         } else {
           existFiles = [...e]
         } */
       }

       emailBody = (bodytext: any, clickHereText: any) => {
         let body = ''
         body += '<!doctype html>'
         body += '<HTML>'
         body += '<HEAD> '
         body += '<META name=GENERATOR content="MSHTML 11.00.9600.18538">'
         body += '</HEAD>'
         body += '<BODY>'
         body += "<TABLE style=\"FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; FONT-WEIGHT: 600; MARGIN: 0px auto\" cellSpacing=0 cellPadding=0 width=620 border=0>"
         body += ' <TBODY>'
         body += ' <TR>'
         body += ' <TD style="BORDER-COLLAPSE: collapse; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 15px; MARGIN: 0px; BACKGROUND-COLOR: #efeff7" vAlign=top cellspacing="0" cellpadding="0" border="0">'
         body += '<H1 style="FONT-SIZE: 24px; MARGIN-BOTTOM: 0px; FONT-FAMILY: Orbitron, sans-serif; MARGIN-TOP: 0px; FONT-WEIGHT: bold; COLOR: #0E2982; PADDING-BOTTOM: 0px; PADDING-TOP: 0px;">AFIMSC</H1>'
         body += '<H2 style="FONT-SIZE: 12px; MARGIN-BOTTOM: 0px; FONT-FAMILY: Arial, Helvetica, sans-serif; MARGIN-TOP: 0px; FONT-WEIGHT: bold; COLOR: #717C00; PADDING-BOTTOM: 0px; PADDING-TOP: 0px">NAFFA</H2>'
         body += ' </TD>'
         body += ' </TR>'
         body += ' <TR>'
         body += ' <TD> <TABLE style="BORDER-RIGHT: #B7B7B7 1px solid; BORDER-LEFT: #B7B7B7 1px solid" cellSpacing=0 cellPadding=0 width=620>'
         body += ' <TBODY> '
         if (bodytext != '') {
           body += ' <TR>'
           body += " <TD style=\"FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-RIGHT: #B7B7B7 1px solid; BORDER-TOP: #B7B7B7 1px solid; COLOR: #323232; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 10px; PADDING-RIGHT: 10px\">"
           body += '' + bodytext + ''
           body += ' </TD>'
           body += ' </TR> '
         }
         if (clickHereText != '') {
           body += ' <TR>'
           body += " <TD style=\"FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-RIGHT: #B7B7B7 1px solid; BORDER-TOP: #B7B7B7 1px solid; COLOR: #323232; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 10px; PADDING-RIGHT: 10px\">"
           body += ' ' + clickHereText + ''
           body += ' </TD>'
           body += ' </TR> '
         }
         body += ' <TR>'
         body += " <TD style=\"FONT-SIZE: 12px; BORDER-TOP: #B7B7B7 1px solid; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-RIGHT: #B7B7B7 1px solid; BORDER-BOTTOM: #B7B7B7 1px solid; COLOR: #555555; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 10px; PADDING-RIGHT: 10px\">"
         body += EmailTexts().EndingEmailMessage
         body += ' </TD>'
         body += ' </TR>'
         body += ' </TBODY></TABLE></TD></TR></TBODY></TABLE></BODY></HTML>'

         return body
       }

       async gettooltips (this: any) {
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
         this.setState({
           tooltip: userprofile
         })
         for (let i = 0; i < userprofile.length; i++) {
           let test = ''
           test = userprofile[i].tooltip

           this.setState({
             [test]: userprofile[i].tooltipdesc
           })
         }
       }

       render () {
         return (
            <div>
                <div className='divformheader'>
                    <h1>Questions</h1>
                    <a href='javascript:void(0)' title='Instructions' className={!this.state.InstructionToggle ? 'anchorInsbtn' : 'anchorInsbtn opened'} onClick={() => this.ToggleInstruction()}> Instructions <span className='icon-DownCaret'></span></a>
                    <div className='actionbtns divTopactionButtons'>
                        <ul>
                            <li>
                                <a href='javascript:void(0)' title='Close' onClick={() => this.closeRedirect()}><span className='icon-Close'></span> Close</a>
                            </li>
                            <li style = {{ display: this.state.updateButton ? '' : 'none' }}>
                                <a href='javascript:void(0)' title='Submit' className='anchorSubmitbtn' onClick={(e) => this.FormSubmit(e, 'top', 'submit')}><span className='icon-Update'></span> Update</a>
                            </li>
                            <li style = {{ display: this.state.updateButton ? 'none' : '' }}>
                                <a href='javascript:void(0)' title='Save As Draft' onClick={(e) => this.FormSubmit(e, 'top', 'save')}><span className='icon-Save'></span> Save As Draft</a>
                            </li>
                            <li style = {{ display: this.state.updateButton ? 'none' : '' }}>
                                <a href='javascript:void(0)' title='Submit' className='anchorSubmitbtn' onClick={(e) => this.FormSubmit(e, 'top', 'submit')}><span className='icon-Submit'></span> Submit</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='divformbody'>
                    <div className='row'>
                        <div className='col-md-12 col-xs-12'>
                            <div className='divforminstructions ' style = {{ display: this.state.InstructionToggle ? '' : 'none' }}>
                                <ul>
                                    <li><span>All fields marked <span className='spanstar'>*</span> must be completed</span></li>
                                    <li><span>Use the Save as Draft button to save your changes.</span></li>
                                    <li><span>Use Submit/Update button to submit/Update your request.</span></li>
                                    <li><span>Use Close button to close the request.</span></li>
                                </ul>
                            </div>
                        </div>
                        <div className='col-md-12 col-xs-12'>
                        <div style={{ display: this.state.NochangesTop ? '' : 'none' }} className='divformsubmitlist'><h2>NO CHANGES DETECTED </h2><a href="javascript:void(0)" className="spancloseicon" title="Close" id="spancloseicon"><span className="icon-Close" onClick={(e) => this.setState({ NochangesTop: false })} ></span></a></div>
                            <div className='divformsubmitlist' id='divformsubmitlist' style = {{ display: this.state.validTop ? 'none' : 'block' }}>
                                <h2>Please fill the below mandatory fields</h2>
                                <a href='javascript:void(0)' className='spancloseicon' title='Close' id='spancloseicon'><span className='icon-Close' onClick={(e) => this.setState({ validTop: true, focusTitle: false })}></span></a>
                                <ul>
                                    <li style = {{ display: this.state.validTitle ? '' : 'none' }}><span onClick={() => this.setState({ focusTitle: true })}>Title</span></li>
                                    <li style = {{ display: this.state.validDescription ? '' : 'none' }}><span onClick={() => this.editorReference.focus()}>Description</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-3 col-xs-12'>
                            <div className='divformgroup'>
                                <label htmlFor='InputtextCategory'>Category</label>
                                <span className='icon-Info'>
                                    <span className='info-tooltip'>
                                        <span className='classic'>
                                            <span className='tooltipdescp'>
                                                <p>{this.state.Category} </p>
                                            </span>
                                        </span>
                                    </span>
                                </span>

                                <input type='text' id='InputtextCategory' aria-label='Category' placeholder='NAFFA' value='NAFFA' disabled></input>
                            </div>
                        </div>
                        <div className='col-md-3 col-xs-12'>
                            <div className='divformgroup'>
                                <label htmlFor='SelectDropdownSubCategory'>Sub Category</label>
                                <span className='icon-Info'>
                                    <span className='info-tooltip'>
                                        <span className='classic'>
                                            <span className='tooltipdescp'>
                                                <p>{this.state.SubCategory} </p>
                                            </span>
                                        </span>
                                    </span>
                                </span>
                               {this.RenderSubcategoryDropDown()}
                            </div>
                        </div>
                        <div className='col-md-6 col-xs-12'>
                            <div className='divformgroup'>
                                <label htmlFor='InputtextTitle'>Title</label>
                                <span className='mandatory'>*</span>
                                <span className='icon-Info'>
                                    <span className='info-tooltip'>
                                        <span className='classic'>
                                            <span className='tooltipdescp'>
                                                <p>{this.state.Title} </p>
                                            </span>
                                        </span>
                                    </span>
                                </span>
                                <input type="text" ref={ this.state.focusTitle ? (input) => { input && input.focus() } : ''} id="InputtextTitle" name="Title" aria-label="Title" aria-required="true" placeholder="Title" value={this.state.QTitle} onChange={this.TitleChange} ></input>
                            </div>
                        </div>
                        <div className="col-md-12 col-xs-12">
                            <div className="divformgroup">
                                <label htmlFor="InputtextareainqDescription">Description  </label>
                                <span className="mandatory">*</span>
                                <span className="icon-Info">
                                    <span className="info-tooltip">
                                        <span className="classic">
                                            <span className="tooltipdescp">
                                                <p>{this.state.Description}</p>
                                            </span>
                                        </span>
                                    </span>
                                </span>
                                <Editor
                                    editorRef={this.setEditorReference}
                                    editorState={this.state.editorState}
                                    onEditorStateChange={this.onEditorStateChange}
                                    toolbar={{
                                      inline: { inDropdown: true },
                                      list: { inDropdown: true },
                                      textAlign: { inDropdown: true },
                                      link: { inDropdown: true },
                                      history: { inDropdown: true }
                                    }}/>
                                </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-xs-12">
                            <div className="divattachments" id="testform">
                                <div className="divformgroup">
                                    <label>Attach File</label>
                                    <span className="icon-Info">
                                        <span className="info-tooltip">
                                            <span className="classic">
                                                <span className="tooltipdescp">
                                                    <p>{this.state.AttachFile}</p>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
                                    <div className="divfileattachment">
                                        <FileUploader type="file" name="attachFile" multiple={true} handleChange={this.uploadFileHandler} accept=".xlsx,.xls,.doc, .docx,.ppt, .pptx,.txt,.pdf,.png, .jpg, .jpeg,.gif, .msg"/>
                                        <div className="divattachmentsdisplay">
                                            <ul id="attachments" className="Ulformattach">
                                            {Object.keys(this.state.existingfiles).map((file: any) =>
                                              <li key={this.state.existingfiles[file].name}>
                                                <div className='divattachedfiles' title={this.state.existingfiles[file].name}>{this.state.existingfiles[file].name}</div>
                                                <a href="javascript:void(0)" data-filename={this.state.existingfiles[file].name} onClick={this.removeFile} title='Close'><span className="icon-Close"></span></a>
                                              </li>
                                            )}
                                            </ul>
                                            <span className="errormsg fileerrormsg" id="docerrormsg" style = {{ display: this.state.setshowFileerrormsg ? '' : 'none' }}> Uploaded file already exists or contains invalid characters. Please upload valid files</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className="spanhintmgs">
                                Hint: Upload the files which are in the .png, .jpeg, .xlsx,.txt .doc, .pdf files and special characters will not be used in the document names Maximum size for file is 10 MB. Limit is up to 5 files per screen
                            </span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-xs-12">
                        <div style={{ display: this.state.NochangesBottom ? '' : 'none' }} className='divformsubmitlist'><h2>NO CHANGES DETECTED </h2><a href="javascript:void(0)" className="spancloseicon" title="Close" id="spancloseicon"><span className="icon-Close" onClick={(e) => this.setState({ NochangesBottom: false })}></span></a></div>
                            <div className="divformsubmitlistbottom" id="divformsubmitlistbottom" style = {{ display: this.state.validBottom ? 'none' : 'block' }}>
                                <h2>Please fill the below mandatory fields </h2>
                                <a href="javascript:void(0)" className="spancloseicon" title="Close" id="spanbottomcloseicon">

                                    <span className="icon-Close" onClick={(e) => { this.setState({ validBottom: true, focusTitle: false }) }}></span>
                                </a>
                                <ul>
                                    <li style = {{ display: this.state.validTitle ? '' : 'none' }}><span onClick={() => this.setState({ focusTitle: true })}>Title</span></li>
                                    <li style = {{ display: this.state.validDescription ? '' : 'none' }}><span onClick={() => this.editorReference.focus()}>Description</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="divformfooter">
                    <div className="actionbtns divTopactionButtons">
                        <ul>
                            <li><a href="javascript:void(0)" title="Close" onClick={() => this.closeRedirect()}> <span className="icon-Close" ></span>
                                Close</a></li>
                                <li style = {{ display: this.state.updateButton ? '' : 'none' }}>
                                <a href='javascript:void(0)' title='Submit' className='anchorSubmitbtn' onClick={(e) => this.FormSubmit(e, 'bottom', 'submit')}><span className='icon-Update'></span> Update</a>
                            </li>
                            <li style = {{ display: this.state.updateButton ? 'none' : '' }}><a href="javascript:void(0)" title="Save As Draft" onClick={(e) => this.FormSubmit(e, 'bottom', 'save')}> <span className="icon-Save"></span>
                                Save As Draft</a></li>

                            <li style = {{ display: this.state.updateButton ? 'none' : '' }}><a href="javascript:void(0)" title="Submit" className="anchorsubmitbottom" onClick={(e) => this.FormSubmit(e, 'bottom', 'submit')} > <span
                                className="icon-Submit"></span>
                                Submit</a></li>
                        </ul>
                    </div>
                </div>
                {this.state.loader
                  ? (
                <div className="submit-bg" id="pageoverlay">
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>

                    </div>
                </div>)
                  : null }
                  {this.state.submitmsg
                    ? (
                  <div id="formsuccessmsg" className="successmsg " >Question submitted successfully.</div>
                      )
                    : ''}
                     {this.state.updatemsg
                       ? (
                  <div id="formsuccessmsg" className="successmsg " >Question updated successfully.</div>
                         )
                       : ''}
                       {this.state.savemsg
                         ? (
                  <div id="formsuccessmsg" className="successmsg " >Question saved successfully.</div>
                           )
                         : ''}
            </div>
         )
       }
}

export default Form
