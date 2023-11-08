/* eslint-disable no-script-url */
/* eslint-disable space-before-function-paren */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import { HardCodedNames, ListNames, EmailTexts } from '../../pages/Config'
import { convertDate, LoginUserName, sendEmails, readNotificationsMetadata, add, GlobalConstraints } from '../../pages/Master'
import { Item } from '@pnp/sp/items'
import Highlighter from 'react-highlight-words'

export interface Props {
  data?: any,
  ItemGUID?: any;
  customerID?: any;
  loginuserroles?: any;
  Fileslist?: any
}

const Detailedviewdiscussions = (props: Props) => {
  const { data = [], ItemGUID = [], customerID = '', loginuserroles = [], Fileslist = [] } = props
  const AssignedToID = (data[0] && data[0].AssignedTo && data[0].AssignedTo !== undefined && data[0].AssignedTo !== null && data[0].AssignedTo !== '' ? data[0].AssignedTo.ID : '')
  const StatusID = (data[0] && data[0].Status && data[0].Status !== undefined && data[0].Status !== null && data[0].Status !== '' ? data[0].Status.ID : '')
  let allActionUsers: any = []
  let allNotificationUsers: any = []
  const notificationsList = ListNames().NotificationsList
  const listName = ListNames().QuestionsDiscussionsList
  const SITE_URL = _spPageContextInfo.webAbsoluteUrl
  const URL = SITE_URL + '/SitePages/Home.aspx#/Detailedviewpage/' + ItemGUID
  const [listItems, setListItems] = useState<any>([])
  const [ParentComments, setParentComments] = useState<any>([])
  const [showdiscpopup, setshowdiscpopup] = useState(false)
  const [showreplypopup, setshowreplypopup] = useState(false)
  const [showhideradiobtns, setshowhideradiobtns] = useState(true)
  const [showhidechildcomments, setshowhidechildcomments] = useState(true)
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [DiscCommentType, setCommentType] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [replyItemId, setreplyItemId] = useState('')
  const [DiscData, setDiscData] = useState({
    DiscComment: '',
    DiscSubject: ''
  })
  const [clicked, setClicked] = useState('0')
  const [validation, setDiscvalidations] = useState({
    DiscComment: false,
    DiscSubj: false
  })
  const [replyvalidation, setreplyvalidation] = useState(false)
  const [replyComment, setreplyComment] = useState('')
  const [selectedFiles, setselectedFiles] = useState('')
  const [searchValue, setsearchValue] = useState('')
  const [ParentcommentuserId, setParentcommentuserId] = useState('')
  const [NotificationsMetadata, setNotificationsMetadata] = useState<any>([])

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    readNotificationsMetadata().then(function () {
      const notificationsmetadata = (localStorage.getItem('NotificationsMetaData') !== undefined && localStorage.getItem('NotificationsMetaData') !== '' && localStorage.getItem('NotificationsMetaData') !== null ? JSON.parse(localStorage.getItem('NotificationsMetaData') || '{}') : [])
      setNotificationsMetadata(notificationsmetadata)
    })
    getDiscussions()
  }, [data])

  function getDiscussions() {
    const list = sp.web.lists.getByTitle(listName)
    const endpoint = ['ID', 'Title', 'QuestionsItemID', 'ItemGUID', 'Role', 'ParentCommentID', 'Comment', 'CommentType', 'CommentDocumentName', 'IsActionComment',
      'ItemCreatedBy/Id', 'ItemCreatedBy/Title', 'ItemCreatedBy/EMail', 'ItemModifiedBy/Id', 'ItemModifiedBy/Title', 'ItemModified', 'ItemCreated',
      'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'Modified', 'Created']
    const expand = ['ItemCreatedBy', 'ItemModifiedBy', 'Author', 'Editor']
    list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).filter("ItemGUID eq '" + ItemGUID + "'").top(5000).get().then(function (items) {
      setListItems(items)
      populateComments(items)
    })
  }

  // eslint-disable-next-line space-before-function-paren
  function populateComments(comments: any) {
    const rootComments = sortRootComments(comments)
    let displaycomments = []
    let isSubmitter = false
    if (customerID === LoginUserName().UserId) {
      isSubmitter = true
    }
    if (isSubmitter) {
      for (let i = 0; i < rootComments.length; i++) {
        if (rootComments[i].CommentType !== 'Private') {
          displaycomments.push(rootComments[i])
        }
      }
    } else {
      displaycomments = rootComments
    }
    setParentComments(displaycomments)
  }

  function sortRootComments(comments: any) {
    const sortedParentComments = []
    for (let i = 0; i < comments.length; i++) {
      let currentParentFound = false
      // Finding the parent of the current reply in the sorted array
      if (sortedParentComments.length > 0) {
        for (let j = 0; j < sortedParentComments.length; j++) {
          // reply check else parent check
          if (comments[i].ParentCommentID != null) {
            if (sortedParentComments[j].Id === parseInt(comments[i].ParentCommentID)) { currentParentFound = true }
          } else {
            if (sortedParentComments[j].Id === comments[i].Id) { currentParentFound = true }
          }
        }
      }
      // If the current comment is not found in the sorted array then adding new entry
      if (!currentParentFound) {
        // if the current comment is child the pulling the parent from the main array (commentsData)
        if (comments[i].ParentCommentID != null) {
          // searching for the parent in the filtered items.
          let parentComment = comments?.filter((comment: any) => { return (comment.Id === parseInt(comments[i].ParentCommentID)) })
          // searching for the parent in the global items when not found in the filter items.
          if (parentComment.length === 0) {
            parentComment = listItems?.filter((comment: any) => { return (comment.Id === parseInt(comments[i].ParentCommentID)) })
          }
          if (parentComment[0] !== undefined) {
            sortedParentComments.push(parentComment[0])
          }
        } else {
          sortedParentComments.push(comments[i])
        }
      }
    }
    return sortedParentComments
  }

  function displayDocuments(item: any) {
    if (item.CommentDocumentName !== '' && item.CommentDocumentName !== null && item.CommentDocumentName !== undefined) {
      const WEBSERVER_URL = _spPageContextInfo.webServerRelativeUrl
      const docpath = WEBSERVER_URL + '/' + ListNames().QuestionsDocumentLibrary + '/' + ItemGUID + '/' + item.CommentDocumentName + getWebPath(item.CommentDocumentName)
      if (IsDocExist(docpath)) {
        return (
          <div className="divAttachments">
            <ul>
              <li>
                <a href={docpath} title={item.CommentDocumentName} target="_blank" rel="noreferrer"><Highlighter highlightClassName="YourHighlightClass" searchWords={[searchValue]} textToHighlight={item.CommentDocumentName} /></a>
              </li>
            </ul>
          </div>
        )
      } else {
        return (
          <div className="divAttachments">
            <ul>
              <li>
                <span title={item.CommentDocumentName} className='doc-deleted'><Highlighter highlightClassName="YourHighlightClass" searchWords={[searchValue]} textToHighlight={item.CommentDocumentName} /></span>
              </li>
            </ul>
          </div>
        )
      }
    } else {
      return ('')
    }
  }

  function IsDocExist(backendUrl: any) {
    let flag = true
    $.ajax({
      type: 'GET',
      url: backendUrl,
      async: false
    }).done(function (result) {
      flag = true
    }).fail(function () {
      flag = false
    })
    return flag
  }

  function getWebPath(doc: any) {
    const slice4 = doc.slice(-4)
    const slice5 = doc.slice(-5)
    switch (slice4) {
      case '.doc':
      case '.ppt':
      case '.xls':
        return '?web=1'
    }
    switch (slice5) {
      case '.docx':
      case '.pptx':
      case '.xlsx':
        return '?web=1'
    }
    return ''
  }

  const showhidepopup = (e: any) => {
    const idclicked = e.currentTarget.id
    setselectedFiles('')
    let isSubmitter = false
    if (customerID === LoginUserName().UserId) {
      isSubmitter = true
    }
    if (idclicked === 'addDiscbtn' || idclicked === 'addDisccancelbtn') {
      if (isSubmitter) {
        setshowhideradiobtns(false)
      }
      setDiscvalidations({
        ...validation,
        DiscSubj: false,
        DiscComment: false
      })
      setDiscData({
        ...DiscData,
        DiscSubject: '',
        DiscComment: ''
      })
      setCommentType('Public')
      setIsDisabled(true)
      if (showdiscpopup) {
        setshowdiscpopup(false)
      } else {
        setshowdiscpopup(true)
      }
    } else if (idclicked === 'replybtn' || idclicked === 'replycancelbtn') {
      const replyid = e.currentTarget.dataset.itemid
      if (idclicked === 'replycancelbtn') {
        setreplyComment('')
      }
      setreplyItemId(replyid)
      if (showreplypopup) {
        setshowreplypopup(false)
      } else {
        setshowreplypopup(true)
      }
    }
  }

  function commentType(e: any) {
    const selectedType = e.target.defaultValue
    if (selectedType === 'Private') {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
    setCommentType(selectedType)
  }

  function DiscussionSubject(e: any) {
    setDiscData({
      ...DiscData,
      DiscSubject: e.target.value
    })
  }

  function DiscussionComment(e: any) {
    setDiscData({
      ...DiscData,
      DiscComment: e.target.value
    })
  }

  function getreplyComment(e: any) {
    setreplyComment(e.target.value)
  }

  function addDiscussions() {
    let isValid = true
    const validationset = {
      DiscSubj: false,
      DiscComment: false
    }
    const SubjectVal = DiscData.DiscSubject
    const CommentVal = DiscData.DiscComment
    if (SubjectVal === '') {
      isValid = false
      validationset.DiscSubj = true
    }
    if (CommentVal === '') {
      isValid = false
      validationset.DiscComment = true
    }
    if (isValid) {
      const QuestionTitle = data[0].QuestionTitle
      const curStatusTitle = data[0].Status.Title
      const CustomerEmail = data[0].DutyEmail
      const date = new Date()
      const addObj = {
        Title: SubjectVal,
        ItemGUID: ItemGUID,
        Role: '',
        Comment: CommentVal,
        CommentType: DiscCommentType,
        IsActionComment: false,
        CommentDocumentName: selectedFiles,
        ItemCreated: date,
        ItemCreatedById: LoginUserName().UserId,
        ItemModified: date,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(listName).items.add(addObj).then(function (items) {
        const ActivityName = (DiscCommentType === 'Public' ? 'Add Customer Discussion' : 'Add Internal Discussion')
        const Activity = ActivityName
        const batchGuid = generateUUID()
        const changeSetId = generateUUID()
        const batchRequestHeader = {
          'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
          'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
        }
        const endpoint = SITE_URL + '/_api/$batch'
        toStoreNotificationsData(Activity, batchGuid, changeSetId, ActivityName, '', endpoint, batchRequestHeader)
        const clickheretext = "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view all comment(s)."
        const subject = 'Question ' + "'" + QuestionTitle + "'" + ' - New comment added.'
        const bodytext = ''
        const to = (DiscCommentType === 'Public' ? CustomerEmail : curStatusTitle)
        const body = emailBody(SubjectVal, CommentVal, bodytext, clickheretext)
        sendEmails(EmailTexts().FROM, to, subject, body)
        setshowdiscpopup(false)
        getDiscussions()
        setDiscData({
          ...DiscData,
          DiscSubject: '',
          DiscComment: ''
        })
      }).catch(function (e) {
        console.log(e)
      })
    } else {
      setDiscvalidations({
        ...validation,
        DiscSubj: validationset.DiscSubj,
        DiscComment: validationset.DiscComment
      })
    }
  }

  function addDiscussionReply(e: any) {
    const parentID = e.currentTarget.dataset.id
    let isValid = true
    let validationset = false
    if (replyComment === '') {
      isValid = false
      validationset = true
    }
    if (isValid) {
      const QuestionTitle = data[0].QuestionTitle
      const curStatusTitle = data[0].Status.Title
      const CustomerEmail = data[0].DutyEmail
      const parentcommType = e.currentTarget.dataset.commentType
      const parentTitle = e.currentTarget.dataset.Title
      const parentuseremail = e.currentTarget.dataset.parentuseremail
      const parentuserid = e.currentTarget.dataset.parentuserid
      setParentcommentuserId(parentuserid)
      const date = new Date()
      const addObj = {
        ItemGUID: ItemGUID,
        Role: '',
        Comment: replyComment,
        IsActionComment: false,
        ParentCommentID: parentID,
        ItemCreated: date,
        CommentDocumentName: selectedFiles,
        ItemCreatedById: LoginUserName().UserId,
        ItemModified: date,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(listName).items.add(addObj).then(function (items) {
        const ActivityName = (parentcommType === 'Public' ? 'Reply Discussion Customer' : 'Reply Discussion Internal')
        const Activity = ActivityName
        const batchGuid = generateUUID()
        const changeSetId = generateUUID()
        const batchRequestHeader = {
          'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
          'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
        }
        const endpoint = SITE_URL + '/_api/$batch'
        toStoreNotificationsData(Activity, batchGuid, changeSetId, ActivityName, '', endpoint, batchRequestHeader)
        const clickheretext = "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view all comment(s)."
        const subject = 'Question ' + "'" + QuestionTitle + "'" + ' - New reply added.'
        const bodytext = ''
        const to = (parentcommType === 'Public' ? CustomerEmail : parentuseremail)
        const body = emailBodyReply(replyComment, bodytext, clickheretext)
        sendEmails(EmailTexts().FROM, to, subject, body)
        setshowreplypopup(false)
        setreplyItemId('')
        getDiscussions()
        setreplyComment('')
      }).catch(function (e) {
        console.log(e)
      })
    } else {
      setreplyvalidation(validationset)
    }
  }

  function emailBody(Title: any, comment: any, bodytext: any, clickHereText: any) {
    let body = ''
    body += '<!doctype html>'
    body += '<HTML><HEAD> <META name=GENERATOR content="MSHTML 11.00.10570.1001"></HEAD> <BODY>'
    body += "<TABLE style=\"FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; FONT-WEIGHT: 600; MARGIN: 0px auto\" cellSpacing=0 cellPadding=0 width=620 border=0>"
    body += '<TBODY>'
    body += '<TR><TD style="BORDER-COLLAPSE: collapse; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 15px; MARGIN: 0px; BACKGROUND-COLOR: #efeff7" vAlign=top border="0" cellpadding="0" cellspacing="0">'
    body += '<H1 style="FONT-SIZE: 24px; MARGIN-BOTTOM: 0px; FONT-FAMILY: Orbitron, sans-serif; MARGIN-TOP: 0px; FONT-WEIGHT: bold; COLOR: #0E2982; PADDING-BOTTOM: 0px; PADDING-TOP: 0px;">AFIMSC</H1>'
    body += '<H2 style="FONT-SIZE: 12px; MARGIN-BOTTOM: 0px; FONT-FAMILY: Arial, Helvetica, sans-serif; MARGIN-TOP: 0px; FONT-WEIGHT: bold; COLOR: #717C00; PADDING-BOTTOM: 0px; PADDING-TOP: 0px">NAFFA</H2>'
    body += '</TD></TR>'
    body += '<TR><TD>'
    body += '<TABLE style="BORDER-RIGHT: #B7B7B7 1px solid; BORDER-LEFT: #B7B7B7 1px solid" cellSpacing=0 cellPadding=0 width=620>'
    body += '<TBODY>'
    body += "<TR><TD style=\"FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-RIGHT: #efeff7 1px solid; COLOR: #323232; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 10px; PADDING-RIGHT: 10px\">"
    body += '<TABLE style="FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,\' sans-serif\'" cellSpacing=0 cellPadding=0 width=620>'
    body += '<TBODY>'
    body += "<TR><TD style=\"FONT-SIZE: 14px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-BOTTOM: #88a6db 1px solid; COLOR: #88a6db; PADDING-BOTTOM: 5px\">Subject"
    body += '</TD></TR>'
    body += "<TR><TD style=\"FONT-SIZE: 12px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; COLOR: #333333; PADDING-BOTTOM: 5px; PADDING-TOP: 5px\">"
    body += '' + Title + ''
    body += '</TD></TR>'
    body += "<TR><TD style=\"FONT-SIZE: 14px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-BOTTOM: #c8a2cd 1px solid; COLOR: #c8a2cd; PADDING-BOTTOM: 5px\">Comment"
    body += '</TD></TR>'
    body += "<TR> <TD style=\"FONT-SIZE: 12px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; COLOR: #333333; PADDING-BOTTOM: 5px; PADDING-TOP: 5px\">"
    body += '<P> ' + comment + ' </P><P> ' + bodytext + ' </P>'
    body += '</TD></TR>'
    body += "<TR> <TD style=\"FONT-SIZE: 12px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; COLOR: #333333; PADDING-BOTTOM: 5px; PADDING-TOP: 5px\">"
    body += '' + clickHereText + ''
    body += '</TD></TR>'
    body += '</TBODY>'
    body += '</TABLE>'
    body += '</TD></TR>'
    body += "<TR> <TD style=\"FONT-SIZE: 12px; BORDER-TOP: #B7B7B7 1px solid; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-RIGHT: #B7B7B7 1px solid; BORDER-BOTTOM: #B7B7B7 1px solid; COLOR: #555555; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 10px; PADDING-RIGHT: 10px\">"
    body += EmailTexts().EndingEmailMessage
    body += '</TD></TR></TBODY></TABLE>'
    body += '</TD></TR></TBODY></TABLE></BODY></HTML>'

    return body
  }
  function emailBodyReply(comment: any, bodytext: any, clickHereText: any) {
    let body = ''
    body += '<!doctype html>'
    body += '<HTML><HEAD> <META name=GENERATOR content="MSHTML 11.00.10570.1001"></HEAD> <BODY>'
    body += "<TABLE style=\"FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; FONT-WEIGHT: 600; MARGIN: 0px auto\" cellSpacing=0 cellPadding=0 width=620 border=0>"
    body += '<TBODY>'
    body += '<TR><TD style="BORDER-COLLAPSE: collapse; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 15px; MARGIN: 0px; BACKGROUND-COLOR: #efeff7" vAlign=top border="0" cellpadding="0" cellspacing="0">'
    body += '<H1 style="FONT-SIZE: 24px; MARGIN-BOTTOM: 0px; FONT-FAMILY: Orbitron, sans-serif; MARGIN-TOP: 0px; FONT-WEIGHT: bold; COLOR: #0E2982; PADDING-BOTTOM: 0px; PADDING-TOP: 0px;">AFIMSC</H1>'
    body += '<H2 style="FONT-SIZE: 12px; MARGIN-BOTTOM: 0px; FONT-FAMILY: Arial, Helvetica, sans-serif; MARGIN-TOP: 0px; FONT-WEIGHT: bold; COLOR: #717C00; PADDING-BOTTOM: 0px; PADDING-TOP: 0px">NAFFA</H2>'
    body += '</TD></TR>'
    body += '<TR><TD>'
    body += '<TABLE style="BORDER-RIGHT: #B7B7B7 1px solid; BORDER-LEFT: #B7B7B7 1px solid" cellSpacing=0 cellPadding=0 width=620>'
    body += '<TBODY>'
    body += "<TR><TD style=\"FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-RIGHT: #efeff7 1px solid; COLOR: #323232; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 10px; PADDING-RIGHT: 10px\">"
    body += '<TABLE style="FONT-SIZE: 13px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,\' sans-serif\'" cellSpacing=0 cellPadding=0 width=620>'
    body += '<TBODY>'
    body += "<TR><TD style=\"FONT-SIZE: 14px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-BOTTOM: #c8a2cd 1px solid; COLOR: #c8a2cd; PADDING-BOTTOM: 5px\">Comment"
    body += '</TD></TR>'
    body += "<TR> <TD style=\"FONT-SIZE: 12px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; COLOR: #333333; PADDING-BOTTOM: 5px; PADDING-TOP: 5px\">"
    body += '<P> ' + comment + ' </P><P> ' + bodytext + ' </P>'
    body += '</TD></TR>'
    body += "<TR> <TD style=\"FONT-SIZE: 12px; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; COLOR: #333333; PADDING-BOTTOM: 5px; PADDING-TOP: 5px\">"
    body += '' + clickHereText + ''
    body += '</TD></TR>'
    body += '</TBODY>'
    body += '</TABLE>'
    body += '</TD></TR>'
    body += "<TR> <TD style=\"FONT-SIZE: 12px; BORDER-TOP: #B7B7B7 1px solid; FONT-FAMILY: Segoe, Segoe UI, DejaVu Sans, Trebuchet MS, Verdana,' sans-serif'; BORDER-RIGHT: #B7B7B7 1px solid; BORDER-BOTTOM: #B7B7B7 1px solid; COLOR: #555555; PADDING-BOTTOM: 10px; PADDING-TOP: 10px; PADDING-LEFT: 10px; PADDING-RIGHT: 10px\">"
    body += EmailTexts().EndingEmailMessage
    body += '</TD></TR></TBODY></TABLE>'
    body += '</TD></TR></TBODY></TABLE></BODY></HTML>'

    return body
  }

  const handleToggle = (index: any) => {
    if (clicked === index) {
      return setClicked('0')
    }
    setClicked(index)
  }

  function displayChildComment(id: any) {
    const replycomments = listItems?.filter((comment: any) => { return (parseInt(comment.ParentCommentID) === id) })
    if (replycomments && replycomments.length > 0) {
      return (
        replycomments.map((item: any) =>
          <div key={item.ID} className={clicked === id ? 'col-md-12 col-xs-12 divChildcomment' : 'col-md-12 col-xs-12 divChildcomment open'} style={{ display: clicked === id ? 'none' : '' }} id={`${id}`}>
            <p className="divReplycomment" dangerouslySetInnerHTML={{ __html: searchFilter(removehtmltags(item.Comment)) }}></p>
            {displayDocuments(item)}
            <div className="commentinfo">
              <p>By: <span>{item.ItemCreatedBy.Title}</span> </p>
              <p>{convertDate(item.ItemCreated, 'date')}</p>
            </div>
          </div>
        )
      )
    } else {
      return ('')
    }
  }

  function onFilesChanged(e: any) {
    const filename = e.target.value
    setselectedFiles(filename)
  }

  function searchDiscussions(e: any) {
    const searchword = e.target.value
    setsearchValue(searchword)
    if (searchword !== '') {
      const filtereddata = listItems?.filter(
        (data: any) => {
          const comment = removehtmltags(data.Comment)
          const Title = (data.Title !== null ? data.Title : '')
          const commentType = (data.CommentType !== null ? data.CommentType : '')
          const commentDocumentName = (data.CommentDocumentName !== null ? data.CommentDocumentName : '')
          return (
            Title.toLowerCase().includes(searchword.toLowerCase()) ||
            comment.toLowerCase().includes(searchword.toLowerCase()) ||
            commentType.toLowerCase().includes(searchword.toLowerCase()) ||
            commentDocumentName.toLowerCase().includes(searchword.toLowerCase()) ||
            data.ItemCreatedBy.Title.toLowerCase().includes(searchword.toLowerCase()) ||
            data.ItemCreated.toLowerCase().includes(searchword.toLowerCase())
          )
        }
      )
      populateComments(filtereddata)
    } else {
      populateComments(listItems)
    }
  }

  function removehtmltags(data: any) {
    return data.replace(/<[^>]+>/g, '')
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

  function toStoreNotificationsData(Activity: any, batchGuid: any, changeSetId: any, action: any, status: any, endpoint: any, batchRequestHeader: any) {
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

  function GetSomeDeferredStuff(groups: any, flag: any, Activity: any) {
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
            // if (LoginUserName().UserId !== item && item !== AssignedToID) {
            if (flag === 'Notification') {
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
            const siteName = GlobalConstraints().siteName
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
          if (AssignedToID !== '' && AssignedToID !== null && AssignedToID !== undefined) {
            if (flag === 'Action') {
              allActionUsers.push({
                email: AssignedToID,
                flag: flag
              })
            }
          }
        } else if (val === 'InvolvedParentUsers') {
          allActionUsers.push({
            email: ParentcommentuserId,
            flag: flag
          })
        }
      })
    }
    return deferreds
  }

  function makeArray(value: any) {
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

  function generateActionsBatchBody(Activity: any, batchGuid: any, changeSetId: any, listname: any, action: any, status: any, role: any, notisubject: any, notificationId: any) {
    let batchContents = []
    // const curr_item_configData = alasql("SELECT * FROM ? where UserRole == COALESCE('" + role + "',UserRole) AND Event == COALESCE('" + action + "',Event)", [NotificationsMetadata])
    const newstsid = (status !== undefined && status !== null && status !== '' ? status : StatusID)
    notisubject = notisubject.replace(/\[Question ID]/g, data[0].QuestionTitle)
    if (Activity === 'Add Customer Discussion' || Activity === 'Add Internal Discussion') {
      notisubject = notisubject.replace(/\[Comment submitter]/g, LoginUserName().UserName)
    } else if (Activity === 'Reply Discussion Internal' || Activity === 'Reply Discussion Customer') {
      notisubject = notisubject.replace(/\[Comment Submitter]/g, LoginUserName().UserName)
    }
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

  function generateNotificationsBatchBody(Activity: any, batchGuid: any, changeSetId: any, listname: any, action: any, status: any, role: any, notisubject: any) {
    let batchContents = []
    // const curr_item_configData = alasql("SELECT * FROM ? where UserRole == COALESCE('" + role + "',UserRole) AND Event == COALESCE('" + action + "',Event)", [NotificationsMetadata])
    const newstsid = (status !== undefined && status !== null && status !== '' ? status : StatusID)
    const itemType = GetItemTypeForListName(listname)
    notisubject = notisubject.replace(/\[Question ID]/g, data[0].QuestionTitle)
    if (Activity === 'Add Customer Discussion' || Activity === 'Add Internal Discussion') {
      notisubject = notisubject.replace(/\[Comment submitter]/g, LoginUserName().UserName)
    } else if (Activity === 'Reply Discussion Internal' || Activity === 'Reply Discussion Customer') {
      notisubject = notisubject.replace(/\[Comment Submitter]/g, LoginUserName().UserName)
    }

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

  function LastModifiedListUpdate(itemid: any, GetMCount: any) {
    const addObj = {
      Mcount: GetMCount
    }
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(itemid).update(addObj).then(function () {

    })
  }

  function GetItemTypeForListName(name: any) {
    return 'SP.Data.' + name.charAt(0).toUpperCase() + name.split(' ').join('').slice(1) + 'ListItem'
  }
  const searchFilter = (item: any) => {
    const lowerCaseComment = item.comment.toLowerCase()
    if (searchValue.trim().toLowerCase() !== '' && lowerCaseComment.includes(searchValue.trim().toLowerCase())) {
      const searchArray = lowerCaseComment.split(searchValue.trim().toLowerCase())
      searchArray.forEach((ele: string, index: string | number) => {
        if (index !== 0) {
          searchArray[index] = `<span class="highlight">${searchValue}</span>` + ele
        }
      })
      return searchArray.reduce((accumulator: any, currentValue: any) => {
        return accumulator + currentValue
      })
    }
  }
  return (
    <div className="divplaceholder">
      <header>
        <h3>Discussions <span className="count">{ParentComments.length}</span> </h3>
        <ul className="ulactionbtns uldiscussionactionbtns">
          {listItems && listItems.length > 0
            ? <li>
              <div className="divsearch">
                <input type="text" name="Search" placeholder="Search" onChange={searchDiscussions} value={searchValue} />
                <a href="javascript:void(0)" title="Search"><span className="icon-Search"></span></a>
              </div>
            </li>
            : null
          }
          <li>
          {
                              StatusID === 9 || StatusID === 10
                                ? (
                                    ''
                                  )
                                : (
            <a href="javascript:void(0)" title="Add Discussions" className="anchorglobalbtn" id='addDiscbtn' onClick={showhidepopup}><span className="icon-Add"></span><span className="spanAddDiscussion">NEW DISCUSSION</span></a>
                                  )
}
            {showdiscpopup
              ? <div className="divactionpopup divglobalpopup divadddiscussionpopup" id="divadddiscussionpopup">
                <div className='row'>
                  {showhideradiobtns
                    ? <div className="col-md-12 col-xs-12">
                      <div className="divradiobtns" onChange={commentType}>
                        <label htmlFor="DiscussionCustomer">
                          <input type="radio" name="Discussionoptions" checked={isDisabled} value="Public" aria-label="Customer" id='DiscussionCustomer' />Customer
                        </label>
                        <label htmlFor="DiscussionInternal">
                          <input type="radio" name="Discussionoptions" checked={!isDisabled} value="Private" aria-label="Other" id='DiscussionInternal' />Internal
                        </label>
                      </div>
                    </div>
                    : null}
                  <div className="col-md-12 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="InputTextSubject">Subject <span className="mandatory">*</span> </label>
                      <input type="text" name="Subject" value={DiscData.DiscSubject} aria-label="Subject" aria-required="true" placeholder="Need More Information" onChange={DiscussionSubject} />
                      <span style={{ display: validation.DiscSubj ? '' : 'none' }} className="errormsg">Please enter your subject</span>
                    </div>
                  </div>
                  <div className="col-md-12 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="InputTextCommentFor">Comment For (Optional)</label>
                      <select name="commentfor" id="InputTextCommentFor" onChange={onFilesChanged} value={selectedFiles}>
                        <option value="">Select Document</option>
                        {Fileslist.map((file: any) => <option key={file.ID} value={file.Name}>{file.Name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-12 col-xs-12">
                    <div className="divformgroup">
                      <label htmlFor="InputTextComment">Comment <span className="mandatory">*</span></label>
                      <textarea name="Comment" value={DiscData.DiscComment} placeholder="Enter your Comment" aria-label="Comment" aria-required="true" onChange={DiscussionComment}></textarea>
                      <span style={{ display: validation.DiscComment ? '' : 'none' }} className="errormsg">Please enter your comment</span>
                    </div>
                  </div>
                  {/* <div className="col-md-12 col-xs-12">
                                    <div className="divfilesinfo">
                                        <h3>Found pii related data in below fields</h3>
                                        <p><span className="icon-arrow"></span>Comment : SSN Number 456-95-5942 has been the implementation of pre-requisite courses designed to cover topics,
                                            which otherwise would be done during a mass-lecture when the cadets arrive
                                        </p>
                                        <div className="divfilesinfobtns">
                                            <span className="spanacceptbtn">
                                                <a href="javascript:void(0)" title="Accept">Accept</a>
                                            </span>
                                            <span className="spanignorebtn">
                                                <a href="javascript:void(0)" title="Ignore">Ignore</a>
                                            </span>
                                        </div>
                                    </div>
                                </div> */}
                </div>
                <div className="divpopupbtns">
                  <ul>
                    <li className="OkBtn">
                      <a href="javascript:void(0);" title="Ok" onClick={addDiscussions}><span className="icon-Check"></span> Ok</a>
                    </li>
                    <li className="CancelBtn">
                      <a href="javascript:void(0);" title="Cancel" className="cancelbtn globalcancelbtn" id='addDisccancelbtn' onClick={showhidepopup}><span className="icon-Close"></span> Cancel</a>
                    </li>
                  </ul>
                </div>
              </div>
              : null}
          </li>
        </ul>
      </header>
      <div className="divplaceholderbody">
        <div className="divDiscussionscomment divDiscussion">
          <article>
            <div className="Comment">
              {ParentComments && ParentComments.length > 0
                ? ParentComments.map((item: any) =>
                  <div key={item.ID} className="divParentcomment">
                    <span className="label spanCustomerlabel"><Highlighter highlightClassName="YourHighlightClass" searchWords={[searchValue]} textToHighlight={item.CommentType === 'Private' ? 'Internal' : 'Customer'} /></span>
                    <p className="Commentheader"><Highlighter highlightClassName="YourHighlightClass" searchWords={[searchValue]} textToHighlight={item.Title} /></p>
                    <p className="Commentarea" dangerouslySetInnerHTML={{ __html: searchValue?.length > 0 ? searchFilter({ comment: removehtmltags(item.Comment) }) : item.Comment } }></p>
                    {displayDocuments(item)}
                    <div className="row">
                      <div className="col-md-8 col-xs-12 commentinfo">
                        <p>By: <span><Highlighter highlightClassName="YourHighlightClass" searchWords={[searchValue]} textToHighlight={item.ItemCreatedBy.Title} /></span> </p>
                        <p>{convertDate(item.ItemCreated, 'date')}</p>
                      </div>
                      <div className="col-md-4 col-xs-12">
                        <ul className="Replybuttons">
                          <li className={$('#' + item.ID).hasClass('open') ? 'open' : ''}>
                            {(listItems?.filter((comment: any) => { return (parseInt(comment.ParentCommentID) === item.ID) }).length) > 0
                              // eslint-disable-next-line jsx-a11y/anchor-is-valid
                              ? (<a href="javascript:void(0)" title="Replies" style ={{ display: (StatusID === 9 || StatusID === 10) ? 'none' : '' }}className="anchorglobalbtn" id='replybtn' data-itemid={item.ID} onClick={() => {
                                // eslint-disable-next-line indent
                                setshowhidechildcomments(!showhidechildcomments)// eslint-disable-next-line indent
                                // eslint-disable-next-line indent
                                handleToggle(item.ID)
                                // eslint-disable-next-line indent
                              }}>{(listItems?.filter((comment: any) => { return (parseInt(comment.ParentCommentID) === item.ID) }).length)} Replies <span className='icon-portal'></span></a>)
                              : ''}
                          </li>
                          <li>
                          {
                              StatusID === 9 || StatusID === 10
                                ? (
                                    ''
                                  )
                                : (
                            <a href="javascript:void(0)" title="Reply" className="anchorglobalbtn" id='replybtn' data-itemid={item.ID} onClick={showhidepopup}>Reply</a>
                                  )
}
                            {showreplypopup && parseInt(replyItemId) === item.ID
                              ? <div className="divReplycommentpopup divactionpopup divglobalpopup" id="divReplycommentpopup">
                                <div className="divformgroup">
                                  <label htmlFor="CommentFor">Comment For </label>
                                  <select name="commentfor" id="commentfor" onChange={onFilesChanged} value={selectedFiles}>
                                    <option value="">Select Document</option>
                                    {Fileslist.map((file: any) => <option key={file.ID} value={file.Name}>{file.Name}</option>)}
                                  </select>
                                </div>
                                <div className="divformgroup">
                                  <label htmlFor="comment">Comment <span className="mandatory">*</span></label>
                                  <textarea name="comment" placeholder="Enter your Comment" value={replyComment} aria-required="true" aria-label="Comment" onChange={getreplyComment}></textarea>
                                  <span style={{ display: replyvalidation ? '' : 'none' }} className="errormsg">Please enter comment</span>
                                </div>
                                <div className="divpopupbtns">
                                  <ul>
                                    <li className="OkBtn">
                                      <a href="javascript:void(0);" title="Ok" data-id={item.ID} data-parentuseremail={item.ItemCreatedBy.EMail} data-parentuserid={item.ItemCreatedBy.ID} data-commentType={item.CommentType === 'Private' ? 'Internal' : 'Customer'} data-Title={item.Title} onClick={addDiscussionReply}> <span className="icon-Check"></span> Ok</a>
                                    </li>
                                    <li className="CancelBtn">
                                      <a href="javascript:void(0);" title="Cancel" className="cancelbtn globalcancelbtn" id='replycancelbtn' onClick={showhidepopup}> <span className="icon-Close"></span> Cancel</a>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                              : null}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className='row'>
                      <div className='col-md-12 col-xs-12'>
                        {displayChildComment(item.ID)}
                      </div>
                    </div>
                  </div>
                )
                : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

export default Detailedviewdiscussions
