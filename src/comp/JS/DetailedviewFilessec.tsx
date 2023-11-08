import React, { useState, useEffect } from 'react'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/files'
import '@pnp/sp/folders'
import { FileUploader } from 'react-drag-drop-files'
import { saveAs } from 'file-saver'
import { ListNames, EmailTexts } from '../../pages/Config'
import loader from '../Images/Loader.gif'
import { convertDate, checkdocfileextension, sendEmails, readNotificationsMetadata, add, GlobalConstraints, LoginUserName } from '../../pages/Master'

export interface Props {
    data?: any,
    ItemGUID?: any;
    InqID?: any;
    FileslList: any;
    loginuserroles?: any
  }

const DetailedviewFilessec = (props: Props) => {
  const { data = [], ItemGUID = [], InqID = [], loginuserroles = [] } = props
  const AssignedToID = (data[0] && data[0].AssignedTo && data[0].AssignedTo !== undefined && data[0].AssignedTo !== null && data[0].AssignedTo !== '' ? data[0].AssignedTo.ID : '')
  const StatusID = (data[0] && data[0].Status && data[0].Status !== undefined && data[0].Status !== null && data[0].Status !== '' ? data[0].Status.ID : '')
  let allActionUsers: any = []
  let allNotificationUsers: any = []
  const notificationsList = ListNames().NotificationsList
  const listName = ListNames().QuestionsDocumentLibrary
  const siteName = GlobalConstraints().siteName
  const SITE_URL = _spPageContextInfo.webAbsoluteUrl
  const URL = SITE_URL + '/SitePages/Home.aspx#/Detailedviewpage/' + ItemGUID
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [listItems, setListItems] = useState<any>([])
  const [filesChecked, setfilesChecked] = useState<any>([])
  const [isCheckAll, setIsCheckAll] = useState(false)
  const [showFilesPopup, setshowFilesPopup] = useState(false)
  const [filesuploaded, setfilesuploaded] = useState<any>([])
  const [showFileerrormsg, setshowFileerrormsg] = useState(false)
  const [NotificationsMetadata, setNotificationsMetadata] = useState<any>([])
  const [loaderState, setloaderState] = useState(false)
  const UserDetails = JSON.parse(localStorage.getItem('UserGroupNames' + siteName) || '{}')
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    readNotificationsMetadata().then(function () {
      const notificationsmetadata = (localStorage.getItem('NotificationsMetaData') !== undefined && localStorage.getItem('NotificationsMetaData') !== '' && localStorage.getItem('NotificationsMetaData') !== null ? JSON.parse(localStorage.getItem('NotificationsMetaData') || '{}') : [])
      setNotificationsMetadata(notificationsmetadata)
    })
    populateDocument()
  }, [])

  const populateDocument = () => {
    const list = sp.web.getFolderByServerRelativeUrl(listName + '/' + ItemGUID)
    /* const endpoint = ['ID', 'IsForm', 'Name', 'Title', 'UIVersionLabel', 'TimeCreated', 'TimeLastModified', 'ServerRelativeUrl', 'Files/Author/Title', 'ModifiedBy/Title']
    const expand = ['Files', 'Files/ListItemAllFields', 'Files/Author', 'Files/ModifiedBy', 'ListItemAllFields'] */
    const endpoint = ['ID', 'IsForm', 'Name', 'Title', 'UIVersionLabel', 'TimeCreated', 'TimeLastModified', 'ServerRelativeUrl', 'Author/Title', 'ItemCreatedBy/Title']
    const expand = ['listItemAllFields', 'Author', 'ItemCreatedBy']
    list.files.select('' + endpoint + '').expand('' + expand + '').orderBy('Title', true).top(5000).get().then(function (items) {
      setListItems(items)
      props.FileslList(items)
    })
    setloaderState(false)
  }

  const checkboxChecked = (e: any) => {
    const filepath = e.target.dataset.path
    const filename = e.target.attributes.title.value
    let currfiles = []
    if (e.target.checked) {
      currfiles = filesChecked.slice()
      currfiles.push({ name: filename, path: filepath })
    } else {
      currfiles = filesChecked.filter(function (file: any) { return file.name !== filename })
    }
    setfilesChecked(currfiles)
  }

  const deleteFiles = (e: any) => {
    if (filesChecked && filesChecked.length > 0) {
      const dialogConfirm = window.confirm('Are you sure you want to permanently delete the selected document?')
      if (dialogConfirm) {
        const list = sp.web.getFolderByServerRelativeUrl(listName + '/' + ItemGUID)
        const QuestionTitle = data[0].QuestionTitle
        const curStatusTitle = data[0].Status.Title
        for (let i = 0; i < filesChecked.length; i++) {
          list.files.getByName('' + filesChecked[i].path + '').delete()
          if (i === filesChecked.length - 1) {
            const Activity = 'Delete Document'
            const batchGuid = generateUUID()
            const changeSetId = generateUUID()
            const batchRequestHeader = {
              'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
              'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
            }
            const endpoint = SITE_URL + '/_api/$batch'
            toStoreNotificationsData(Activity, batchGuid, changeSetId, 'Delete Document', '', endpoint, batchRequestHeader)
            const sendEmail: any = []
            sendEmail.push({
              to: data[0].DutyEmail,
              subject: 'Your Question ' + "'" + QuestionTitle + "'" + ' - File(s) deleted.',
              bodytext: '',
              clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the file."
            })
            sendEmail.push({
              to: (curStatusTitle === 'Responded' ? 'AFIMSC' : curStatusTitle),
              subject: 'Question ' + "'" + QuestionTitle + "'" + ' - File(s) deleted.',
              bodytext: '',
              clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the file."
            })
            if (sendEmail && sendEmail.length > 0) {
              $(sendEmail).each(function (index, item) {
                const body = emailBody(item.bodytext, item.clickHereText)
                sendEmails(EmailTexts().FROM, item.to, item.subject, body)
              })
            }
            setTimeout(function () {
              setfilesChecked([])
              populateDocument()
            }, 1500)
          }
        }
      }
    } else {
      alert('Please select at least one document to delete.')
    }
  }

  const downloadFiles = (e: any) => {
    if (filesChecked && filesChecked.length > 0) {
      const zip = require('jszip')()
      const promises = []
      for (let file = 0; file < filesChecked.length; file++) {
      // Zip file with the file name.
        promises.push(getBinaryDocsData(filesChecked[file].path, filesChecked[file].name))
      }
      Promise.all(promises).then(function (args: any) {
        for (let i = 0; i < args.length; i++) {
          const name = args[i][0]
          const data = args[i][1]
          zip.file(name, data)
        }
        zip.generateAsync({ type: 'blob' }).then((content: any) => {
          saveAs(content, InqID + '.zip')
        }).catch(function (e: any) {
          console.log(e)
        })
      })
    } else {
      alert('Please select at least one document to download.')
    }
  }

  function getBinaryDocsData (thisurl: any, name: any) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', thisurl, true)
      xhr.responseType = 'arraybuffer'
      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          resolve([name, (new Blob([xhr.response]))])
        } else {
          console.log(xhr)
        }
      })
      xhr.send()
    })
  }

  const selectAll = (value: any) => {
    const currfiles: any = []
    if (isCheckAll) {
      setIsCheckAll(false)
    } else {
      setIsCheckAll(true)
      if (listItems && listItems.length > 0) {
        listItems.map((item: any) =>
          currfiles.push({ name: item.Name, path: item.ServerRelativeUrl })
        )
      }
    }
    setfilesChecked(currfiles)
  }

  const showhidepopup = (e: any) => {
    setfilesuploaded([])
    setshowFileerrormsg(false)
    if (showFilesPopup) {
      setshowFilesPopup(false)
    } else {
      setshowFilesPopup(true)
    }
  }

  function uploadFileHandler (e: any) {
    console.log(e)
    setshowFileerrormsg(false)
    let isnotvalid = false
    for (let i = 0; i < e.length; i++) {
      // eslint-disable-next-line prefer-regex-literals
      let match: any = new RegExp("['~#%\&{}+\|]|\\.\\.|^\\.|\\.$")
      match = match.test(e[i].name)
      if (match) {
        isnotvalid = true
      } else if (filesuploaded.some(function (el: any) {
        return el.name === e[i].name
      }) || listItems.some(function (el: any) {
        return el.Name === e[i].name
      })) {
        isnotvalid = true
      } else if (checkdocfileextension(e[i].name)) {
        isnotvalid = true
      }
    }
    if (isnotvalid) {
      setshowFileerrormsg(true)
    } else {
      let uploadedfiles = []
      if (filesuploaded && filesuploaded.length > 0) {
      // uploadedfiles = Object.keys(filesuploaded).slice()
        uploadedfiles = [...filesuploaded]
        uploadedfiles.push(...e)
      } else {
        uploadedfiles = [...e]
      }
      setfilesuploaded(uploadedfiles)
    }
  }

  function removeFile (e: any) {
    console.log(e)
    const filename = e.currentTarget.dataset.filename
    const currfiles = filesuploaded.filter(function (file: any) { return file.name !== filename })
    setfilesuploaded([...currfiles])
  }

  function uploadFiles () {
    if (filesuploaded && filesuploaded.length > 0) {
      const QuestionTitle = data[0].QuestionTitle
      const curStatusTitle = data[0].Status.Title
      const Activity = 'Add Document'
      const batchGuid = generateUUID()
      const changeSetId = generateUUID()
      const batchRequestHeader = {
        'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
        'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
      }
      const endpoint = SITE_URL + '/_api/$batch'
      toStoreNotificationsData(Activity, batchGuid, changeSetId, 'Add Document', '', endpoint, batchRequestHeader)
      for (let i = 0; i < filesuploaded.length; i++) {
        // const fileNamePath = encodeURI(filesuploaded[i].name)
        setloaderState(true)
        sp.web.getFolderByServerRelativePath(listName + '/' + ItemGUID).files.addUsingPath(filesuploaded[i].name, filesuploaded[i], { Overwrite: true }).then((e) => {
          if (i === filesuploaded.length - 1) {
            const sendEmail: any = []
            sendEmail.push({
              to: data[0].DutyEmail,
              subject: 'Your Question ' + "'" + QuestionTitle + "'" + ' - File(s) uploaded.',
              bodytext: '',
              clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the file."
            })
            sendEmail.push({
              to: (curStatusTitle === 'Responded' ? 'AFIMSC' : curStatusTitle),
              subject: 'Question ' + "'" + QuestionTitle + "'" + ' - File(s) uploaded.',
              bodytext: '',
              clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the file."
            })
            if (sendEmail && sendEmail.length > 0) {
              $(sendEmail).each(function (index, item) {
                const body = emailBody(item.bodytext, item.clickHereText)
                sendEmails(EmailTexts().FROM, item.to, item.subject, body)
              })
            }
            setTimeout(function () {
              setshowFilesPopup(false)
              populateDocument()
            }, 1500)
          }
        }
        )
      }
    } else {
      alert(' Please select atleast one document to Upload ')
    }
  }

  function emailBody (bodytext: any, clickHereText: any) {
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

  const generateUUID = () => {
    let d = new Date().getTime()
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      // eslint-disable-next-line no-mixed-operators
      return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16)
    })
    return uuid
  }

  function toStoreNotificationsData (Activity: any, batchGuid: any, changeSetId: any, action: any, status: any, endpoint: any, batchRequestHeader: any) {
    let role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole)
    if (loginuserroles.isSubmitter && role === '') { role = 'Customer' }
    const userd = $.Deferred()
    let notifications = []
    let actions = []
    notifications = NotificationsMetadata?.filter(function (n: any) { return (n.Activity === Activity && n.StatusId === status && n.Title === role && n.AlertType === 'Notification') })
    actions = NotificationsMetadata?.filter(function (a: any) { return (a.Activity === Activity && a.StatusId === status && a.Title === role && a.AlertType === 'Action') })

    if (actions !== undefined && actions.length > 0) {
      const actionId = (actions !== undefined ? actions[0].Id.toString() : '')
      const actionsubject = actions !== undefined ? actions[0].Subject : ''
      const actiongroups = actions !== undefined ? makeArray(actions[0].ToUserRoles) : []
      allActionUsers = []
      const alertdeferredsaction = GetSomeDeferredStuff(actiongroups, 'Action', Activity)
      $.when.apply(null, alertdeferredsaction).done(function () {
        const batchbody = generateActionsBatchBody(Activity, batchGuid, changeSetId, notificationsList, action, status, role, actionsubject, actionId)
        add(endpoint, batchbody, batchRequestHeader, true).done(function (response: any) {
          console.log(response)
          userd.resolve()
        })
      })
    }

    if (notifications !== undefined && notifications.length > 0) {
      const notisubject = notifications !== undefined ? notifications[0].Subject : ''
      const notificationgroups = notifications !== undefined ? makeArray(notifications[0].ToUserRoles) : []
      allNotificationUsers = []
      const alertdeferreds = GetSomeDeferredStuff(notificationgroups, 'Notification', Activity)
      $.when.apply(null, alertdeferreds).done(function () {
        const batchbody = generateNotificationsBatchBody(Activity, batchGuid, changeSetId, notificationsList, action, status, role, notisubject)
        add(endpoint, batchbody, batchRequestHeader, true).done(function (response: any) {
          console.log(response)
          userd.resolve()
        })
      })
    }
    $.when(userd).done(function () {
      let GetMCount, Id
      const siteName = GlobalConstraints().siteName
      const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
      for (let i = 0; i < buildmodifiedlist.length; i++) {
        if (buildmodifiedlist[i].Name === 'NotificationsList') {
          GetMCount = parseInt(buildmodifiedlist[i].Mcount)
          Id = buildmodifiedlist[i].Id
          GetMCount = JSON.stringify(GetMCount + 1)
        }
      }
      LastModifiedListUpdate(Id, GetMCount)
    })
    // }
  }

  function GetSomeDeferredStuff (groups: any, flag: any, Activity: any) {
    // if pushing a notification to a individual user, use their id.
    const deferreds: any = []
    if (groups.length > 0) {
      $(groups).each(function (i, v) {
        const val = v
        if (val.indexOf('ActiveUserExcludedAssignedUsers') === 0) {
          let AssignedUsers: any = []
          if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
            $.each(data[0].AssignedUsers, function (i, v) {
              AssignedUsers = AssignedUsers.concat(v.Id)
            })
          }
          $(AssignedUsers).each(function (index, item) {
            if (LoginUserName().UserId !== item && item !== AssignedToID) {
              allNotificationUsers.push({
                email: item,
                flag: flag
              })
            }
          })
        } else if (val.indexOf('AssignedUsers') === 0) {
          let AssignedUsers: any = []
          if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
            $.each(data[0].AssignedUsers, function (i, v) {
              AssignedUsers = AssignedUsers.concat(v.Id)
            })
          }
          $(AssignedUsers).each(function (index, item) {
            if (item !== AssignedToID) {
              allNotificationUsers.push({
                email: item,
                flag: flag
              })
            }
          })
        } else if (val.includes('AssignedToIfNotSame')) {
          if (LoginUserName().UserId !== AssignedToID && AssignedToID !== '' && AssignedToID != null && AssignedToID !== undefined) {
            if (flag === 'Action') {
              allActionUsers.push({
                email: AssignedToID,
                flag: flag
              })
            }
          }
          if ((AssignedToID === '' || AssignedToID != null || AssignedToID != undefined) && (data[0].Status.ID === 3 || data[0].Status.ID === 4 || data[0].Status.ID === 5)) {
            const UserDetails = JSON.parse(localStorage.getItem('UserGroupNames' + siteName) || '{}')
            let actionrole
            $.each(UserDetails, function (i, v) {
              if (v.Title === 'AFIMSC') {
                actionrole = 3
              } else if (v.Title === 'SME') {
                actionrole = 4
              } if (v.Title === 'AFSVC') {
                actionrole = 5
              }
            })
            if (actionrole !== data[0].Status.ID) {
              if (flag == 'Action') {
                allActionUsers.push({
                  email: data[0].Status.Title,
                  flag: flag
                })
              } else if (flag == 'Notification') {
                allNotificationUsers.push({
                  email: data[0].Status.Title,
                  flag: flag
                })
              }
            }
          }
        } else if (val.includes('AssignedTo')) {
          allActionUsers.push({
            email: AssignedToID,
            flag: flag
          })
        }
      })
    }
    return deferreds
  }

  function makeArray (value: any) {
    const arr = []
    if (value !== '') {
      const v = value.split(';')
      if (v.length > 0) {
        $(v).each(function (index, item) {
          arr.push(item)
        })
      } else {
        arr.push(v)
      }
    }
    return arr
  }

  function generateActionsBatchBody (Activity: any, batchGuid: any, changeSetId: any, listname: any, action: any, status: any, role: any, notisubject: any, notificationId: any) {
    let batchContents = []
    // const curr_item_configData = alasql("SELECT * FROM ? where UserRole == COALESCE('" + role + "',UserRole) AND Event == COALESCE('" + action + "',Event)", [NotificationsMetadata])
    const newstsid = (status !== undefined && status !== null && status !== '' ? status : StatusID)
    notisubject = notisubject.replace(/\[Question ID]/g, data[0].QuestionTitle)
    const itemType = GetItemTypeForListName(listname)
    if (allActionUsers.length > 0) {
      $(allActionUsers).each(function (i, n) {
        let item: any = []
        item = {
          __metadata: {
            type: itemType
          },
          FromUser: LoginUserName().UserName,
          UserRole: role,
          StatusId: newstsid,
          Event: action,
          To: String(n.email),
          AlertType: n.flag,
          Subject: notisubject,
          QuestionID: data[0].QuestionID,
          QuestionItemID: data[0].ID.toString(),
          ItemGUID: data[0].ItemGUID
        }
        // create the request endpoint
        const endpoint = SITE_URL + "/_api/web/lists/getbytitle(\'" + listname + "\')/items"
        // create the changeset
        batchContents.push('--changeset_' + changeSetId)
        batchContents.push('Content-Type: application/http')
        batchContents.push('Content-Transfer-Encoding: binary')
        batchContents.push('')
        batchContents.push('POST ' + endpoint + ' HTTP/1.1')
        batchContents.push('Content-Type: application/json;odata=verbose')
        batchContents.push('')
        batchContents.push(JSON.stringify(item))
        batchContents.push('')
      })
    }

    // END changeset to update data
    batchContents.push('--changeset_' + changeSetId + '--')
    // generate the body of the batch
    let batchBody = batchContents.join('\r\n')
    // start with a clean array
    batchContents = []
    // create batch for update items
    batchContents.push('--batch_' + batchGuid)
    batchContents.push('Content-Type: multipart/mixed; boundary="changeset_' + changeSetId + '"')
    batchContents.push('Content-Length: ' + batchBody.length)
    batchContents.push('Content-Transfer-Encoding: binary')
    batchContents.push('')
    batchContents.push(batchBody)
    batchContents.push('')
    batchBody = batchContents.join('\r\n')
    // create the batch
    console.debug(batchBody)
    return batchBody
  }

  function generateNotificationsBatchBody (Activity: any, batchGuid: any, changeSetId: any, listname: any, action: any, status: any, role: any, notisubject: any) {
    let batchContents = []
    // const curr_item_configData = alasql("SELECT * FROM ? where UserRole == COALESCE('" + role + "',UserRole) AND Event == COALESCE('" + action + "',Event)", [NotificationsMetadata])
    const newstsid = (status !== undefined && status !== null && status !== '' ? status : StatusID)
    const itemType = GetItemTypeForListName(listname)
    notisubject = notisubject.replace(/\[Question ID]/g, data[0].QuestionTitle)

    if (allNotificationUsers.length > 0) {
      $(allNotificationUsers).each(function (i, n) { // creating headers for notifications
        let item: any = []
        item = {
          __metadata: {
            type: itemType
          },
          FromUser: LoginUserName().UserName,
          UserRole: role,
          StatusId: newstsid,
          Event: action,
          To: String(n.email),
          AlertType: n.flag,
          Subject: notisubject,
          QuestionID: data[0].QuestionID,
          QuestionItemID: data[0].ID.toString(),
          ItemGUID: data[0].ItemGUID
        }
        // create the request endpoint
        const endpoint = SITE_URL + "/_api/web/lists/getbytitle(\'" + listname + "\')/items"
        // create the changeset
        batchContents.push('--changeset_' + changeSetId)
        batchContents.push('Content-Type: application/http')
        batchContents.push('Content-Transfer-Encoding: binary')
        batchContents.push('')
        batchContents.push('POST ' + endpoint + ' HTTP/1.1')
        batchContents.push('Content-Type: application/json;odata=verbose')
        batchContents.push('')
        batchContents.push(JSON.stringify(item))
        batchContents.push('')
      })
    }
    // END changeset to update data
    batchContents.push('--changeset_' + changeSetId + '--')
    // generate the body of the batch
    let batchBody = batchContents.join('\r\n')
    // start with a clean array
    batchContents = []
    // create batch for update items
    batchContents.push('--batch_' + batchGuid)
    batchContents.push('Content-Type: multipart/mixed; boundary="changeset_' + changeSetId + '"')
    batchContents.push('Content-Length: ' + batchBody.length)
    batchContents.push('Content-Transfer-Encoding: binary')
    batchContents.push('')
    batchContents.push(batchBody)
    batchContents.push('')
    batchBody = batchContents.join('\r\n')
    // create the batch
    console.debug(batchBody)
    return batchBody
  }

  function LastModifiedListUpdate (itemid: any, GetMCount: any) {
    const addObj = {
      Mcount: GetMCount
    }
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(itemid).update(addObj).then(function () {

    })
  }

  function GetItemTypeForListName (name: any) {
    return 'SP.Data.' + name.charAt(0).toUpperCase() + name.split(' ').join('').slice(1) + 'ListItem'
  }

  function displaybtns () {
    if (listItems && listItems.length > 0) {
      return (
        <>
        {
                              StatusID === 9 || StatusID === 10
                                ? (
                                    ''
                                  )
                                : (
          <li>
              <a href="javascript:void(0)" title="Delete File" className="anchoreDeletefile" onClick={deleteFiles}><span className="icon-Delete"></span></a>
          </li>) }
          <li>
              <a href="javascript:void(0)" title="Download" className="anchoreDownloadfile" onClick={downloadFiles}><span className="icon-Download"></span> Download</a>
          </li>
        </>
      )
    } else {
      return ('')
    }
  }

  return (
        <div className="row">
            <div className="col-md-12 col-sm-12 col-xl-12">
                <div className="divplaceholder">
                    <header>
                        <h3>{listItems && listItems.length ? <input type="checkbox" name="Files" onChange={(event) => selectAll(event.target.checked)} checked={isCheckAll} /> : null} Files <span className="count">{listItems.length}</span></h3>
                        <ul className="ulactionbtns">
                            <li>{
                              StatusID === 9 || StatusID === 10
                                ? (
                                    ''
                                  )
                                : (
                                <a href="javascript:void(0)" title="Attach" className="anchor Addattachments anchorglobalbtn" id="Addattachmentsbtn" onClick={showhidepopup}><span className="icon-Add"></span>Attach</a>
                                  )
                              }
                                {showFilesPopup
                                  ? <div className="divAttachmentspopup divactionpopup divglobalpopup" id="divfilepopup" >
                                    <div className="row">
                                        <div className="col-md-12 col-xs-12">
                                            <div className="divattachments" id="testform">
                                                <div className="divformgroup">
                                                    <label>Attach File</label>
                                                    <span className="icon-Info">
                                                        <span className="info-tooltip">
                                                            <span className="classic">
                                                                <span className="tooltipdescp"><p>Attach File </p></span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <div className="divfileattachment">
                                                        <FileUploader type="file" name="attachFile" multiple={true} handleChange={uploadFileHandler} accept=".xlsx,.xls,.doc, .docx,.ppt, .pptx,.txt,.pdf,.png, .jpg, .jpeg,.gif, .msg"/>
                                                        <div className="divattachmentsdisplay">
                                                            <ul id="attachments" className="Ulformattach">
                                                            {Object.keys(filesuploaded).map((file: any) =>
                                                              <li key={filesuploaded[file].name}>
                                                                <div className='divattachedfiles'>{filesuploaded[file].name}</div>
                                                                <a href="javascript:void(0)" data-filename={filesuploaded[file].name} onClick={removeFile} title='Close'><span className="icon-Close"></span></a>
                                                              </li>
                                                            )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    {showFileerrormsg ? <span className="errormsg" id="docerrormsg">Uploaded file already exists or contains invalid characters. Please upload valid files</span> : null}
                                                </div>
                                            </div>
                                            <span className="spanhintmgs">Hint: Upload
                                                the files which are in the  .txt, .png, .jpg, .jpeg, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .pdf files
                                                and special characters will not be used in the document names Maximum size for file is 35 MB. Limit is up to 10 files per screen
                                            </span>
                                        </div>
                                        {/* <div className="col-md-12 col-xs-12">
                                            <div className="divfilesinfo">
                                                <h3>Found pii related data in below fields</h3>
                                                <p><span className="icon-arrow"></span>
                                                    AF Form 907 : SSN Number 456-95-5942 has been theimplementation of pre-requisite courses designed to covertopics, which otherwise would be done during a mass-lecturewhen the cadets arrive
                                                </p>
                                                <div className="divfilesinfobtns">
                                                    <span className="spanacceptbtn"> <a href="javascript:void(0)" title="Accept">
                                                    Accept</a></span>
                                                    <span className="spanignorebtn"> <a href="javascript:void(0)" title="Ignore">
                                                    Ignore</a></span>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                    <div className="divpopupbtns">
                                        <ul>
                                            <li className="OkBtn">
                                                <a href="javascript:void(0)" title="Ok" onClick={uploadFiles}><span className="icon-Check"></span> Ok</a>
                                            </li>
                                            <li className="CancelBtn">
                                                <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhidepopup}> <span className="icon-Close"></span> Cancel</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                  : null}
                            </li>
                            {displaybtns()}
                        </ul>
                    </header>
                    <div className='divplaceholderbody'>
                        <div className='divfilescontentarea'>
                            <div className='divfilescontent submenu'>
                                <ul className='scrollbar'>
                                    {listItems && listItems.length > 0
                                      ? listItems.map((item: any) =>
                                        <li key={item.ID}>
                                            <label htmlFor="filename"><input type="checkbox" defaultChecked={false} name="filename" onChange={checkboxChecked} data-path={item.ServerRelativeUrl} title={item.Name} checked={filesChecked.filter((d:any) => d.path === item.ServerRelativeUrl).length > 0}/></label>
                                            <a href={item.ServerRelativeUrl} target="_blank" title={item.Name} rel="noreferrer">{item.Name}</a>
                                            <p>
                                                <span>Submitted  :</span><em>{convertDate(item.TimeCreated, 'date')}</em>
                                            </p>
                                            <p>
                                                <span>Submitted by :</span><em>{item.Author.Title}</em>
                                            </p>
                                        </li>
                                      )
                                      : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                    </div>
                </div>
                </div>
            </div>
        </div>
  )
}

export default DetailedviewFilessec
