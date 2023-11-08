/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'
import { NavLink as Link } from 'react-router-dom'
import '../CSS/ReactDraft.css'
import styled from 'styled-components'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/site-groups'
import { IItem } from '@pnp/sp/items'
import '@pnp/sp/attachments'
import { FileUploader } from 'react-drag-drop-files'
import { Editor } from 'react-draft-wysiwyg'
import { EditorState, ContentState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import Htmltodraft from 'html-to-draftjs'
import { GetProcessFlowMetadata, GlobalConstraints, LoginUserName, getSubcategoriesMetadata, checkdocfileextension, sendEmails, readNotificationsMetadata, add, getData, GetBuildModifiedList } from '../../pages/Master'
import { StatusIDs, ListNames, EmailTexts } from '../../pages/Config'
import loader from '../Images/Loader.gif'

export const Navlink = styled(Link)`  
    
}`

export interface Props {
    data?: any,
    ItemGUID?: any,
    loginuserroles?: any,
    actionPerformed?: any,
    customerID?: any
  }

const DetailedviewActionbtns = (props: Props) => {
  const { data = [], ItemGUID = [], loginuserroles = [], customerID = '' } = props
  let AssignedToID = (data[0] && data[0].AssignedTo && data[0].AssignedTo !== undefined && data[0].AssignedTo !== null && data[0].AssignedTo !== '' ? data[0].AssignedTo.ID : '')
  let StatusID = (data[0] && data[0].Status && data[0].Status !== undefined && data[0].Status !== null && data[0].Status !== '' ? data[0].Status.ID : '')
  let allActionUsers: any = []
  let allNotificationUsers: any = []
  const notificationsList = ListNames().NotificationsList
  const siteName = GlobalConstraints().siteName
  const SITE_URL = _spPageContextInfo.webAbsoluteUrl
  const URL = SITE_URL + '/SitePages/Home.aspx#/Detailedviewpage/' + ItemGUID
  const [ProcessFlowMetaData, setProcessFlowMetaData] = useState([])
  const [btnshowhide, setbtnshowhide] = useState({
    AssignTo: false,
    ElevateTo: false,
    SendTo: false,
    Respond: false,
    Complete: false,
    Cancel: false,
    PromoteToKB: false,
    CustomerActionReq: false,
    ReturnToAFIMSC: false
  })
  const [showActionpopups, setshowActionpopups] = useState({
    showcancelpopup: false,
    showAssignTopopup: false,
    showSendTopopup: false,
    showElevateTopopup: false,
    showCompletepopup: false,
    showRespondpopup: false,
    showPromoteToKBpopup: false,
    showCustomerActionRequired: false,
    showbackToAFIMSC: false
  })
  const [ActionComments, setActionComments] = useState({
    AssignToCommentVal: '',
    SendToCommentVal: '',
    ElevateToCommentVal: '',
    CompleteCommentVal: '',
    RespondCommentVal: EditorState.createEmpty(),
    CancelCommentVal: '',
    actionRequiredVal: '',
    backToAfimscVal: ''
  })
  const [SendToValidations, setSendToValidations] = useState({
    SendTo: false,
    Comment: false
  })
  const [ElevateToValidations, setElevateToValidations] = useState({
    ElevateTo: false,
    Comment: false
  })
  const [AssignToValidations, setAssignToValidations] = useState({
    AssignTo: false,
    AssignToId: false,
    Comment: false
  })
  const [PromoteToKBValidations, setPromoteToKBValidations] = useState({
    Title: false,
    Description: false,
    SubCategory: false
  })
  const [CompleteValidations, setCompleteValidations] = useState(false)
  const [CancelValidations, setCancelValidations] = useState(false)
  const [CustactionReq, setCustactionReq] = useState(false)
  const [backtoAFIMSCValidation, setbacktoAFIMSCValidation] = useState(false)
  const [RespondValidations, setRespondValidations] = useState(false)
  const [SendToOptions, setSendToOptions] = useState([])
  const [ShowSendToUser, setShowSendToUser] = useState(false)
  const [SendToUsers, setSendToUsers] = useState([])
  const [showAssignTofields, setshowAssignTofields] = useState(false)
  const [AssignToOptions, setAssignToOptions] = useState([])
  const [AssignToUsers, setAssignToUsers] = useState([])
  const [showhideradiobtn, setshowhideradiobtn] = useState(false)
  const [radioEnable, setradioEnable] = useState(false)
  const [ElevateToOptions, setElevateToOptions] = useState([])
  const [ElevateToUsers, setElevateToUsers] = useState([])
  const [SelectedSendTo, setSelectedSendTo] = useState<any>('')
  const [SelectedElevateTo, setSelectedElevateTo] = useState<any>('')
  const [SelectedAssignTo, setSelectedAssignTo] = useState<any>('')
  const [SelectedAssignToUser, setSelectedAssignToUser] = useState<any>('')
  const [SelectedAssignToUserEmail, setSelectedAssignToUserEmail] = useState<any>({
    Email: '',
    Name: ''
  })
  const [SelectedElevateToUser, setSelectedElevateToUser] = useState('')
  const [SelectedElevateToUserEmail, setSelectedElevateToUserEmail] = useState({
    Email: '',
    Name: ''
  })
  const [SelectedSendToUser, setSelectedSendToUser] = useState('')
  const [SelectedSendToUserEmail, setSelectedSendToUserEmail] = useState({
    Email: '',
    Name: ''
  })
  const [SubCategoryData, setSubCategoryData] = useState([])
  const [QuesTitle, setQuesTitle] = useState('')
  const [QuesSubCategory, setQuesSubCategory] = useState('')
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  )
  const onEditorStateChange = async (state:any) => {
    await setActionComments({
      ...ActionComments,
      RespondCommentVal: state
    })
  }
  const [showFileerrormsg, setshowFileerrormsg] = useState(false)
  const [filesuploaded, setfilesuploaded] = useState<any>([])
  const [loaderState, setloaderState] = useState(false)
  const [NotificationsMetadata, setNotificationsMetadata] = useState<any>([])
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    readNotificationsMetadata().then(function () {
      const notificationsmetadata = (localStorage.getItem('NotificationsMetaData') !== undefined && localStorage.getItem('NotificationsMetaData') !== '' && localStorage.getItem('NotificationsMetaData') !== null ? JSON.parse(localStorage.getItem('NotificationsMetaData') || '{}') : [])
      setNotificationsMetadata(notificationsmetadata)
    })
    GetProcessFlowMetadata().then(function () {
      setProcessFlowvalues()
    })
    sessionStorage.setItem('clickedBackBtn' + siteName, 'false')
    generateNotifyBatchBody()
  }, [data])

  function setProcessFlowvalues () {
    setbtnshowhide({
      ...btnshowhide,
      AssignTo: false,
      ElevateTo: false,
      SendTo: false,
      Respond: false,
      Complete: false,
      Cancel: false,
      PromoteToKB: false,
      CustomerActionReq: false,
      ReturnToAFIMSC: false
    })
    let isSubmitter = false
    if (customerID === _spPageContextInfo.userId) {
      isSubmitter = true
    }
    const processflowmetadata = JSON.parse(localStorage.getItem('ProcessFlowMetadata' + siteName) || '{}')
    setProcessFlowMetaData(processflowmetadata)

    if (processflowmetadata && processflowmetadata.length > 0 && !isSubmitter) {
      if (loginuserroles.isRoleExist) {
        const validationset = {
          AssignTo: false,
          ElevateTo: false,
          SendTo: false,
          Respond: false,
          Complete: false,
          Cancel: false,
          PromoteToKB: false,
          CustomerActionReq: false
        }
        let isCustActionReq = false

        if ((loginuserroles.loginuserrole === 'AFIMSC' || loginuserroles.loginuserrole === 'NAFFA Owners') && data[0].Status.Title !== 'Customer Action Required' && ((Number(data[0].Status.ID) === 3) || (Number(data[0].Status.ID) === 7))) {
          isCustActionReq = true
        }
        // processflowmetadata.map((item: any) => {
        for (let i = 0; i < processflowmetadata.length; i++) {
          if (processflowmetadata[i].StatusID === Number(data[0].Status.ID) && loginuserroles.loginuserrole === processflowmetadata[i].Title && data[0].Status.Title !== 'Customer') {
            validationset.AssignTo = processflowmetadata[i].AssignTo
            validationset.ElevateTo = processflowmetadata[i].ElevateTo
            validationset.SendTo = processflowmetadata[i].SendTo
            validationset.Respond = processflowmetadata[i].Respond
            validationset.Complete = processflowmetadata[i].Complete
            validationset.Cancel = processflowmetadata[i].Cancel
            validationset.PromoteToKB = processflowmetadata[i].PromoteToKB
          }
          const assigntoid = (data[0].AssignedTo && data[0].AssignedTo !== undefined ? data[0].AssignedTo.ID : '')
          if (validationset.Respond === true && assigntoid !== '' && assigntoid !== LoginUserName().UserId) {
            validationset.Respond = false
          }
          if (validationset.Cancel === true && assigntoid !== '' && assigntoid !== LoginUserName().UserId && !loginuserroles.isNAFFAOwner && !loginuserroles.isAFIMSC) {
            validationset.Cancel = false
          }
        }
        // })
        setbtnshowhide({
          ...btnshowhide,
          AssignTo: validationset.AssignTo,
          ElevateTo: validationset.ElevateTo,
          SendTo: validationset.SendTo,
          Respond: validationset.Respond,
          Complete: validationset.Complete,
          Cancel: validationset.Cancel,
          PromoteToKB: validationset.PromoteToKB,
          CustomerActionReq: isCustActionReq
        })
      }
    } else if (isSubmitter && Number(data[0].Status.ID === 3)) {
      setbtnshowhide({
        ...btnshowhide,
        Cancel: true
      })
    } else if (isSubmitter && Number(data[0].Status.ID === 11)) {
      setbtnshowhide({
        ...btnshowhide,
        Cancel: true,
        ReturnToAFIMSC: true
      })
    }
  }
  const showhidecancel = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setCancelValidations(false)
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: ''
    })
    if (showActionpopups.showcancelpopup) {
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: false
      })
    } else {
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: true,
        showAssignTopopup: false,
        showSendTopopup: false,
        showElevateTopopup: false,
        showCompletepopup: false,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showbackToAFIMSC: false,
        showCustomerActionRequired: false
      })
    }
  }

  const showhidecustomerActionReq = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setCustactionReq(false)
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: '',
      actionRequiredVal: ''
    })
    if (showActionpopups.showCustomerActionRequired) {
      setshowActionpopups({
        ...showActionpopups,
        showCustomerActionRequired: false
      })
    } else {
      setshowActionpopups({
        ...showActionpopups,
        showCustomerActionRequired: true,
        showAssignTopopup: false,
        showSendTopopup: false,
        showElevateTopopup: false,
        showCompletepopup: false,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showcancelpopup: false,
        showbackToAFIMSC: false
      })
    }
  }
  const showhideReturnToAFIMSC = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setbacktoAFIMSCValidation(false)
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: '',
      actionRequiredVal: '',
      backToAfimscVal: ''
    })
    if (showActionpopups.showbackToAFIMSC) {
      setshowActionpopups({
        ...showActionpopups,
        showbackToAFIMSC: false
      })
    } else {
      setshowActionpopups({
        ...showActionpopups,
        showbackToAFIMSC: true,
        showAssignTopopup: false,
        showSendTopopup: false,
        showElevateTopopup: false,
        showCompletepopup: false,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showcancelpopup: false,
        showCustomerActionRequired: false
      })
    }
  }
  const showhideAssignTo = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setSelectedAssignToUser('')
    setSelectedAssignToUserEmail({
      ...SelectedAssignToUserEmail,
      Email: '',
      Name: ''
    })
    setAssignToValidations({
      ...AssignToValidations,
      AssignTo: false,
      AssignToId: false,
      Comment: false
    })
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: ''
    })
    if (showActionpopups.showAssignTopopup) {
      setshowActionpopups({
        ...showActionpopups,
        showAssignTopopup: false
      })
    } else {
      const assignedid = (data[0].AssignedTo && data[0].AssignedTo !== undefined ? data[0].AssignedTo.ID : '')
      if (assignedid !== '' && Number(assignedid) === LoginUserName().UserId) {
        setshowhideradiobtn(false)
        setradioEnable(false)
        setshowAssignTofields(true)
        setAssigntoOptions()
      } else {
        setshowhideradiobtn(true)
        setradioEnable(true)
        setshowAssignTofields(false)
        setSelectedAssignToUser(LoginUserName().UserId)
        setSelectedAssignToUserEmail({
          ...SelectedAssignToUserEmail,
          Email: LoginUserName().UserEmail,
          Name: LoginUserName().UserName
        })
      }
      setSelectedAssignTo(loginuserroles.loginuserrole)
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: false,
        showAssignTopopup: true,
        showSendTopopup: false,
        showElevateTopopup: false,
        showCompletepopup: false,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showbackToAFIMSC: false,
        showCustomerActionRequired: false
      })
    }
  }

  const showhideElevateTo = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setElevateToValidations({
      ...SendToValidations,
      ElevateTo: false,
      Comment: false
    })
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: ''
    })
    if (showActionpopups.showElevateTopopup) {
      setshowActionpopups({
        ...showActionpopups,
        showElevateTopopup: false
      })
      setSelectedElevateTo('')
    } else {
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: false,
        showAssignTopopup: false,
        showSendTopopup: false,
        showElevateTopopup: true,
        showCompletepopup: false,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showbackToAFIMSC: false,
        showCustomerActionRequired: false
      })
      const elevatetoarray: any = []
      const groupusers: any = []
      const userPermissions: any = ProcessFlowMetaData.filter((item: any) => { return (item.Title === loginuserroles.loginuserrole && item.StatusID === Number(data[0].Status.ID)) })
      const elevatetooptions = userPermissions[0].ElevateToOptions.split(';')
      if (elevatetooptions && elevatetooptions.length > 0) {
        elevatetooptions.map((v: any) => {
          elevatetoarray.push(v)
        })
      }
      setSelectedElevateTo(elevatetoarray[0])
      sp.web.siteGroups.getByName(elevatetoarray[0]).users().then(function (users: any) {
        if (users && users.length > 0) {
          const assignedtoid = (data[0].AssignedTo && data[0].AssignedTo !== undefined ? data[0].AssignedTo.ID : '')
          users.map((v: any) => {
            if (assignedtoid !== v.Id) {
              groupusers.push({
                Name: v.Title,
                Email: v.UserPrincipalName,
                Id: v.Id
              })
            }
          })
        }
        if (groupusers && groupusers.length === 1) {
          setSelectedElevateToUser(groupusers[0].Id)
          setSelectedElevateToUserEmail({
            ...SelectedElevateToUserEmail,
            Email: groupusers[0].Email,
            Name: groupusers[0].Name
          })
        }
        setElevateToUsers(groupusers)
      })
      setElevateToOptions(elevatetoarray)
    }
  }

  const showhideSendTo = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setSendToValidations({
      ...SendToValidations,
      SendTo: false,
      Comment: false
    })
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: ''
    })
    setSelectedSendTo('')
    setShowSendToUser(false)
    if (showActionpopups.showSendTopopup) {
      setshowActionpopups({
        ...showActionpopups,
        showSendTopopup: false
      })
    } else {
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: false,
        showAssignTopopup: false,
        showSendTopopup: true,
        showElevateTopopup: false,
        showCompletepopup: false,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showbackToAFIMSC: false,
        showCustomerActionRequired: false
      })
      const sendtoarray: any = []
      const userPermissions: any = ProcessFlowMetaData.filter((item: any) => { return (item.Title === loginuserroles.loginuserrole && item.StatusID === Number(data[0].Status.ID)) })
      const sendtooptions = userPermissions[0].SendToOptions.split(';')
      if (sendtooptions && sendtooptions.length > 0) {
        sendtooptions.map((v: any) => {
          sendtoarray.push(v)
        })
      }
      setSendToOptions(sendtoarray)
    }
  }

  const showhideRespond = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setRespondValidations(false)
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: ''
    })
    if (showActionpopups.showRespondpopup) {
      setshowActionpopups({
        ...showActionpopups,
        showRespondpopup: false
      })
    } else {
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: false,
        showAssignTopopup: false,
        showSendTopopup: false,
        showElevateTopopup: false,
        showCompletepopup: false,
        showRespondpopup: true,
        showPromoteToKBpopup: false,
        showbackToAFIMSC: false,
        showCustomerActionRequired: false
      })
    }
  }

  const showhideComplete = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setCompleteValidations(false)
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: ''
    })
    if (showActionpopups.showCompletepopup) {
      setshowActionpopups({
        ...showActionpopups,
        showCompletepopup: false
      })
    } else {
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: false,
        showAssignTopopup: false,
        showSendTopopup: false,
        showElevateTopopup: false,
        showCompletepopup: true,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showbackToAFIMSC: false,
        showCustomerActionRequired: false
      })
    }
  }

  const showhidePromoteToKB = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    setPromoteToKBValidations({
      ...PromoteToKBValidations,
      Title: false,
      Description: false,
      SubCategory: false
    })
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: '',
      SendToCommentVal: '',
      ElevateToCommentVal: '',
      CompleteCommentVal: '',
      RespondCommentVal: EditorState.createEmpty(),
      CancelCommentVal: ''
    })
    setfilesuploaded([])
    setshowFileerrormsg(false)
    if (showActionpopups.showPromoteToKBpopup) {
      setshowActionpopups({
        ...showActionpopups,
        showPromoteToKBpopup: false
      })
    } else {
      getSubcategoriesMetadata().then(function () {
        const subcat = JSON.parse(localStorage.getItem('subCategoriesMetadata' + siteName) || '{}')
        const subcatdata = subcat?.filter((item: any) => { return item.IsArchived === false })
        setSubCategoryData(subcatdata)
        let desc = data[0].QuestionDescription
        desc = desc.split('>').slice(1).join('>')
        const blocksFromHTML = Htmltodraft(desc)
        setEditorState(EditorState.createWithContent(
          ContentState.createFromBlockArray(blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap)))
        setQuesTitle(data[0].QuestionTitle)
        setQuesSubCategory(data[0].SubCategory)
        setshowActionpopups({
          ...showActionpopups,
          showcancelpopup: false,
          showAssignTopopup: false,
          showSendTopopup: false,
          showElevateTopopup: false,
          showCompletepopup: false,
          showRespondpopup: false,
          showbackToAFIMSC: false,
          showCustomerActionRequired: false,
          showPromoteToKBpopup: true
        })
      })
    }
  }

  const showhideSendToUser = (e: any) => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    const val = e.currentTarget.value
    setSelectedSendTo(val)
    if (val !== 'Select') {
      const groupusers: any = []
      sp.web.siteGroups.getByName(val).users().then(function (users: any) {
        if (users && users.length > 0) {
          const assignedtoid = (data[0].AssignedTo && data[0].AssignedTo !== undefined ? data[0].AssignedTo.ID : '')
          users.map((v: any) => {
            if (assignedtoid !== v.Id) {
              groupusers.push({
                Name: v.Title,
                Email: v.UserPrincipalName,
                Id: v.Id
              })
            }
          })
        }
        if (groupusers && groupusers.length === 1) {
          setSelectedSendToUser(groupusers[0].Id)
          setSelectedSendToUserEmail({
            ...SelectedSendToUserEmail,
            Email: groupusers[0].Email,
            Name: groupusers[0].Name
          })
        }
        setSendToUsers(groupusers)
      })
      setShowSendToUser(true)
    } else {
      setSendToUsers([])
      setShowSendToUser(false)
    }
  }

  const changeSelfOther = (e: any) => {
    setSelectedAssignToUser('')
    setSelectedAssignToUserEmail({
      ...SelectedAssignToUserEmail,
      Email: '',
      Name: ''
    })
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: ''
    })
    setAssignToValidations({
      ...AssignToValidations,
      AssignTo: false,
      AssignToId: false,
      Comment: false
    })
    if (e.target.defaultValue === 'Self') {
      setSelectedAssignToUser(LoginUserName().UserId)
      setSelectedAssignToUserEmail({
        ...SelectedAssignToUserEmail,
        Email: LoginUserName().UserEmail,
        Name: LoginUserName().UserName
      })
      setradioEnable(true)
      setshowAssignTofields(false)
    } else {
      setradioEnable(false)
      setshowAssignTofields(true)
      setAssigntoOptions()
    }
  }

  function setAssigntoOptions () {
    const assigntoarray: any = []
    const groupusers: any = []
    const userPermissions: any = ProcessFlowMetaData.filter((item: any) => { return (item.Title === loginuserroles.loginuserrole && item.StatusID === Number(data[0].Status.ID)) })
    const assigntooptions = userPermissions[0].AssignToOptions.split(';')
    if (assigntooptions && assigntooptions.length > 0) {
      assigntooptions.map((v: any) => {
        assigntoarray.push(v)
      })
    }
    setSelectedAssignTo(assigntoarray[0])
    sp.web.siteGroups.getByName(assigntoarray[0]).users().then(function (users: any) {
      if (users && users.length > 0) {
        const assignedtoid = (data[0].AssignedTo && data[0].AssignedTo !== undefined ? data[0].AssignedTo.ID : '')
        users.map((v: any) => {
          if (assignedtoid !== v.Id && v.Id !== LoginUserName().UserId) {
            groupusers.push({
              Name: v.Title,
              Email: v.UserPrincipalName,
              Id: v.Id
            })
          }
        })
      }
      if (groupusers && groupusers.length === 1) {
        setSelectedAssignToUser(groupusers[0].Id)
        setSelectedAssignToUserEmail({
          ...SelectedAssignToUserEmail,
          Email: groupusers[0].Email,
          Name: groupusers[0].Name
        })
      }
      setAssignToUsers(groupusers)
    })
    setAssignToOptions(assigntoarray)
  }

  function buildAssignToUsersddl (Users: any) {
    if (Users && Users.length > 0) {
      if (Users.length === 1) {
        return (
          <>
            <select name="AssignTo" id="selectAssignTo" onChange={changeddlUsers} aria-label="Select User" aria-required="true">
              {Users.map((val: any) =>
                <option key={val.Id} value={val.Id} data-email={val.Email}>{val.Name}</option>
              )}
            </select>
            <span style = {{ display: AssignToValidations.AssignToId ? '' : 'none' }} className="errormsg"> Please Select User</span>
          </>
        )
      } else {
        return (
          <>
            <select name="AssignTo" id="selectAssignTo" onChange={changeddlUsers} aria-label="Select User" aria-required="true">
              <option value="">Select</option>
              {Users.map((val: any) =>
                <option key={val.Id} value={val.Id} data-email={val.Email}>{val.Name}</option>
              )}
            </select>
            <span style = {{ display: AssignToValidations.AssignToId ? '' : 'none' }} className="errormsg"> Please Select User</span>
          </>
        )
      }
    } else {
      return (
        <select name="AssignTo" id="selectAssignTo" aria-label="Select User" aria-required="true">
        <option value="None">None</option>
        </select>
      )
    }
  }

  function buildSendToUsersddl (Users: any) {
    if (Users && Users.length > 0) {
      if (Users.length === 1) {
        return (
          <select name="AssignTo" id="selectSendTo" onChange={changeddlUsers} aria-label="Select User" aria-required="true">
            {Users.map((val: any) =>
              <option key={val.Id} value={val.Id} data-email={val.Email}>{val.Name}</option>
            )}
          </select>
        )
      } else {
        return (
          <>
            <select name="AssignTo" id="selectSendTo" onChange={changeddlUsers} aria-label="Select User" aria-required="true">
              <option value="" data-email="">Select</option>
              {Users.map((val: any) =>
                <option key={val.Id} value={val.Id} data-email={val.Email}>{val.Name}</option>
              )}
            </select>
          </>
        )
      }
    } else {
      return (
        <select name="AssignTo" id="selectSendTo" aria-label="Select User" aria-required="true">
        <option value="None">None</option>
        </select>
      )
    }
  }

  function buildElevateToUsersddl (Users: any) {
    if (Users && Users.length > 0) {
      if (Users.length === 1) {
        return (
          <select name="AssignTo" id="selectElevateTo" onChange={changeddlUsers} aria-label="Select User" aria-required="true">
            {Users.map((val: any) =>
              <option key={val.Id} value={val.Id} data-email={val.Email}>{val.Name}</option>
            )}
          </select>
        )
      } else {
        return (
          <>
            <select name="AssignTo" id="selectElevateTo" onChange={changeddlUsers} aria-label="Select User" aria-required="true">
              <option value="">Select</option>
              {Users.map((val: any) =>
                <option key={val.Id} value={val.Id} data-email={val.Email}>{val.Name}</option>
              )}
            </select>
          </>
        )
      }
    } else {
      return (
        <select name="AssignTo" id="selectSendTo" aria-label="Select User" aria-required="true">
        <option value="None">None</option>
        </select>
      )
    }
  }

  const changeddlUsers = (e: any) => {
    const action = e.currentTarget.id
    const userid = e.currentTarget.value
    const useremail = e.currentTarget.selectedOptions[0].dataset.email
    const username = e.currentTarget.selectedOptions[0].innerText
    if (action === 'selectSendTo') {
      setSelectedSendToUser(userid)
      setSelectedSendToUserEmail({
        ...SelectedSendToUserEmail,
        Email: useremail,
        Name: username
      })
    } else if (action === 'selectAssignTo') {
      setSelectedAssignToUser(userid)
      setSelectedAssignToUserEmail({
        ...SelectedAssignToUserEmail,
        Email: useremail,
        Name: username
      })
    } else if (action === 'selectElevateTo') {
      setSelectedElevateToUser(userid)
      setSelectedElevateToUserEmail({
        ...SelectedElevateToUserEmail,
        Email: useremail,
        Name: username
      })
    }
  }

  const SendToComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      SendToCommentVal: e.target.value
    })
  }

  const SendToAction = () => {
    const comment = ActionComments.SendToCommentVal
    const SendToVal = SelectedSendTo
    let isValid = true
    const validationset = {
      SendTo: false,
      Comment: false
    }
    if (SendToVal === '') {
      isValid = false
      validationset.SendTo = true
    }
    if (comment === '') {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const CustomerEmail = data[0].DutyEmail
      const curStatus = Number(data[0].Status.ID)
      const status = (SendToVal === 'SME' ? StatusIDs().SME : StatusIDs().AFSVC)
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const SendToUserId = (SelectedSendToUser !== '' && SelectedSendToUser !== null ? Number(SelectedSendToUser) : null)
      const Action = 'Send To ' + SendToVal
      const dt = new Date()
      let AssignedUsers: any = []
      if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
        $.each(data[0].AssignedUsers, function (i, v) {
          if (v.Id != null) {
            AssignedUsers = AssignedUsers.concat(v.Id)
          }
        })
      }
      AssignedUsers = LoginUserName().UserId ? AssignedUsers.concat(LoginUserName().UserId) : AssignedUsers
      AssignedUsers = LoginUserName().UserId && LoginUserName().UserId !== AssignedToID && AssignedToID ? AssignedUsers.concat(JSON.parse(AssignedToID)) : AssignedUsers

      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Comment: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Private',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: Action,
        Role: role,
        AssignedToId: SendToUserId,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: 'SendTo',
        StatusModifiedDate: dt,
        AssignedToId: SendToUserId,
        ItemModified: dt,
        AssignedUsersId: AssignedUsersadd,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, commentitem, '').then(() => {
          AssignedToID = SendToUserId
          StatusID = status
          const Activity = 'SendTo'
          const batchGuid = generateUUID()
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData(Activity, batchGuid, changeSetId, 'SendTo', status, endpoint, batchRequestHeader)
          const sendEmail: any = []
          let to = ''
          if (SendToUserId !== null && SendToUserId !== undefined) {
            to = SelectedSendToUserEmail.Email
          } else {
            to = SendToVal
          }
          sendEmail.push({
            to: CustomerEmail,
            subject: 'Question ' + "'" + QuestionTitle + "'" + ' has been sent to ' + SendToVal + ' for action.',
            bodytext: '',
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
          })
          sendEmail.push({
            to: to,
            subject: 'Question ' + "'" + QuestionTitle + "'" + ' has been sent to ' + SendToVal + '.',
            bodytext: '',
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to review and respond to the question."
          })
          if (sendEmail && sendEmail.length > 0) {
            $(sendEmail).each(function (index, item) {
              const body = emailBody(item.bodytext, item.clickHereText)
              sendEmails(EmailTexts().FROM, item.to, item.subject, body)
            })
          }
        })
      })
    } else {
      setSendToValidations({
        ...SendToValidations,
        SendTo: validationset.SendTo,
        Comment: validationset.Comment
      })
    }
  }

  const ElevateToComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      ElevateToCommentVal: e.target.value
    })
  }

  const ElevateToAction = () => {
    const comment = ActionComments.ElevateToCommentVal
    const ElevateToVal = SelectedElevateTo
    let isValid = true
    const validationset = {
      ElevateTo: false,
      Comment: false
    }
    if (ElevateToVal === '') {
      isValid = false
      validationset.ElevateTo = true
    }
    if (comment === '') {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const CustomerEmail = data[0].DutyEmail
      const curStatus = Number(data[0].Status.ID)
      const status = StatusIDs().SAFFMCEB
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const ElevateToUserId = (SelectedElevateToUser !== '' && SelectedElevateToUser !== null ? Number(SelectedElevateToUser) : null)
      const Action = 'Elevate To ' + ElevateToVal
      const dt = new Date()
      let AssignedUsers: any = []
      if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
        $.each(data[0].AssignedUsers, function (i, v) {
          if (v.Id != null) {
            AssignedUsers = AssignedUsers.concat(v.Id)
          }
        })
      }
      AssignedUsers = LoginUserName().UserId ? AssignedUsers.concat(LoginUserName().UserId) : AssignedUsers
      AssignedUsers = LoginUserName().UserId && LoginUserName().UserId !== AssignedToID && AssignedToID ? AssignedUsers.concat(JSON.parse(AssignedToID)) : AssignedUsers

      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Comment: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Private',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: 'Elevated',
        Role: role,
        AssignedToId: ElevateToUserId,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: 'Elevated',
        StatusModifiedDate: dt,
        AssignedToId: ElevateToUserId,
        ItemModified: dt,
        AssignedUsersId: AssignedUsersadd,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, commentitem, '').then(() => {
          StatusID = status
          AssignedToID = ElevateToUserId
          const Activity = 'Elevated'
          const batchGuid = generateUUID()
          const batchContents = []
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData(Activity, batchGuid, changeSetId, 'Elevated', status, endpoint, batchRequestHeader)
          const sendEmail: any = []
          let to = ''
          if (ElevateToUserId !== null && ElevateToUserId !== undefined) {
            to = SelectedElevateToUserEmail.Email
          } else {
            to = ElevateToVal
          }
          sendEmail.push({
            to: CustomerEmail,
            subject: 'Question ' + "'" + QuestionTitle + "'" + ' has been elevated to ' + ElevateToVal + ' for action.',
            bodytext: '',
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
          })
          sendEmail.push({
            to: to,
            subject: 'Question ' + "'" + QuestionTitle + "'" + ' has been elevated to ' + ElevateToVal + '.',
            bodytext: '',
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to review and respond to the question."
          })
          if (sendEmail && sendEmail.length > 0) {
            $(sendEmail).each(function (index, item) {
              const body = emailBody(item.bodytext, item.clickHereText)
              sendEmails(EmailTexts().FROM, item.to, item.subject, body)
            })
          }
        })
      })
    } else {
      setElevateToValidations({
        ...ElevateToValidations,
        ElevateTo: validationset.ElevateTo,
        Comment: validationset.Comment
      })
    }
  }

  const CompleteComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      CompleteCommentVal: e.target.value
    })
  }

  const CompleteAction = () => {
    const comment = ActionComments.CompleteCommentVal
    let isValid = true
    const validationset = {
      Comment: false
    }
    if (comment === '') {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      const QuestionTitle = data[0].QuestionTitle
      const CustomerEmail = data[0].DutyEmail
      setloaderState(true)
      const curStatus = Number(data[0].Status.ID)
      const status = StatusIDs().Completed
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const Action = 'Completed'
      const dt = new Date()
      let AssignedUsers: any = []
      if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
        $.each(data[0].AssignedUsers, function (i, v) {
          AssignedUsers = AssignedUsers.concat(v.Id)
        })
      }
      AssignedUsers = AssignedUsers.concat(LoginUserName().UserId)
      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Comment: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Complete',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: Action,
        Role: role,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: Action,
        AssignedUsersId: AssignedUsersadd,
        StatusModifiedDate: dt,
        AssignedToId: LoginUserName().UserId,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, commentitem, '').then(() => {
          AssignedToID = ''
          StatusID = status
          const Activity = 'Completed'
          const batchGuid = generateUUID()
          const batchContents = []
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData(Activity, batchGuid, changeSetId, 'Completed', status, endpoint, batchRequestHeader)
          const clickheretext = "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
          const subject = 'Question ' + "'" + QuestionTitle + "'" + ' has been reviewed and completed'
          const bodytext = 'Question has been reviewed and completed'
          const to = CustomerEmail
          const body = emailBody(bodytext, clickheretext)
          sendEmails(EmailTexts().FROM, to, subject, body)
        })
      })
    } else {
      setCompleteValidations(validationset.Comment)
    }
  }

  const CancelComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      CancelCommentVal: e.target.value
    })
  }
  const ActionReqComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      actionRequiredVal: e.target.value
    })
  }
  const backToAfimscComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      backToAfimscVal: e.target.value
    })
  }
  const CancelAction = () => {
    const comment = ActionComments.CancelCommentVal
    let isValid = true
    const validationset = {
      Comment: false
    }
    if (comment === '') {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const CustomerEmail = data[0].DutyEmail
      const curStatusTitle = data[0].Status.Title
      const curStatus = Number(data[0].Status.ID)
      const status = StatusIDs().Canceled
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const Action = 'Canceled'
      const dt = new Date()
      let AssignedUsers: any = []
      if (loginuserroles.loginuserrole !== '') {
        if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
          $.each(data[0].AssignedUsers, function (i, v) {
            AssignedUsers = AssignedUsers.concat(v.Id)
          })
        }
        AssignedUsers = AssignedUsers.concat(LoginUserName().UserId)
      }
      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Comment: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Public',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: Action,
        Role: role,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: Action,
        AssignedUsersId: AssignedUsersadd,
        StatusModifiedDate: dt,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, commentitem, '').then(() => {
          AssignedToID = ''
          StatusID = status
          const Activity = 'Canceled'
          const batchGuid = generateUUID()
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData('Cancel', batchGuid, changeSetId, 'Cancel', status, endpoint, batchRequestHeader)
          const sendEmail: any = []
          const to = (curStatus === 7 ? 'AFIMSC' : curStatusTitle)
          sendEmail.push({
            to: CustomerEmail,
            subject: 'Your Question ' + "'" + QuestionTitle + "'" + ' has been Canceled.',
            bodytext: 'Your question has been canceled',
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
          })
          sendEmail.push({
            to: to,
            subject: 'Question ' + "'" + QuestionTitle + "'" + ' Canceled.',
            bodytext: '',
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the canceled question."
          })
          if (sendEmail && sendEmail.length > 0) {
            $(sendEmail).each(function (index, item) {
              const body = emailBody(item.bodytext, item.clickHereText)
              sendEmails(EmailTexts().FROM, item.to, item.subject, body)
            })
          }
        })
      })
    } else {
      setCancelValidations(validationset.Comment)
    }
  }

  const CustomerActionRequired = () => {
    const comment = ActionComments.actionRequiredVal
    let isValid = true
    const validationset = {
      Comment: false
    }
    if (comment === '') {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const CustomerEmail = data[0].DutyEmail
      const curStatusTitle = data[0].Status.Title
      const curStatus = Number(data[0].Status.ID)
      const status = StatusIDs().Customer
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const Action = 'Customer Action Required'
      const dt = new Date()
      let AssignedUsers: any = []
      if (loginuserroles.loginuserrole !== '') {
        if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
          $.each(data[0].AssignedUsers, function (i, v) {
            AssignedUsers = AssignedUsers.concat(v.Id)
          })
        }
        AssignedUsers = AssignedUsers.concat(LoginUserName().UserId)
      }
      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Comment: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Public',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: Action,
        Role: role,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId,
        AssignedToId: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: Action,
        AssignedUsersId: AssignedUsersadd,
        StatusModifiedDate: dt,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        AssignedToId: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, commentitem, '').then(() => {
          StatusID = status
          const Activity = 'Canceled'
          const batchGuid = generateUUID()
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData('CustomerActionRequired', batchGuid, changeSetId, 'CustomerActionRequired', status, endpoint, batchRequestHeader)
          const sendEmail: any = []
          const to = (curStatus === 7 ? 'AFIMSC' : curStatusTitle)
          sendEmail.push({
            to: CustomerEmail,
            subject: 'Your Question ' + "'" + QuestionTitle + "'" + '  Customer Action Required.',
            bodytext: "Additional Information is needed to complete your question '" + QuestionTitle + "'.",
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the required action."
          })
          if (sendEmail && sendEmail.length > 0) {
            $(sendEmail).each(function (index, item) {
              const body = emailBody(item.bodytext, item.clickHereText)
              sendEmails(EmailTexts().FROM, item.to, item.subject, body)
            })
          }
        })
      })
    } else {
      setCustactionReq(validationset.Comment)
    }
  }
  const backToAFIMSCAction = () => {
    const comment = ActionComments.backToAfimscVal
    let isValid = true
    const validationset = {
      Comment: false
    }
    if (comment === '') {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const CustomerEmail = data[0].DutyEmail
      const curStatusTitle = data[0].Status.Title
      const curStatus = Number(data[0].Status.ID)
      const status = StatusIDs().AFIMSCNAFFA
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const Action = 'Return To AFIMSC'
      const dt = new Date()
      let AssignedUsers: any = []
      if (loginuserroles.loginuserrole !== '') {
        if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
          $.each(data[0].AssignedUsers, function (i, v) {
            AssignedUsers = AssignedUsers.concat(v.Id)
          })
        }
        AssignedUsers = AssignedUsers.concat(LoginUserName().UserId)
      }
      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Comment: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Public',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: Action,
        Role: role,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId,
        AssignedToId: AssignedToID
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: Action,
        StatusModifiedDate: dt,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, commentitem, '').then(() => {
          setshowActionpopups({
            ...showActionpopups,
            showbackToAFIMSC: false
          })
          setbtnshowhide({
            ...btnshowhide,
            ReturnToAFIMSC: false
          })
          StatusID = status
          const batchGuid = generateUUID()
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData('ReturnToAFIMSC', batchGuid, changeSetId, 'ReturnToAFIMSC', status, endpoint, batchRequestHeader)
          const sendEmail: any = []
          const to = (curStatus === 11 ? 'AFIMSC' : curStatusTitle)
          sendEmail.push({
            to: to,
            subject: 'Question ' + "'" + QuestionTitle + "'" + 'has been returned from customer.',
            bodytext: "Customer has provided the information in the question '" + QuestionTitle + "'.",
            clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the details."
          })
          if (sendEmail && sendEmail.length > 0) {
            $(sendEmail).each(function (index, item) {
              const body = emailBody(item.bodytext, item.clickHereText)
              sendEmails(EmailTexts().FROM, item.to, item.subject, body)
            })
          }
        })
      })
    } else {
      setbacktoAFIMSCValidation(validationset.Comment)
    }
  }

  const RespondAction = () => {
    const comment = draftToHtml(convertToRaw(ActionComments.RespondCommentVal.getCurrentContent()))
    let isValid = true
    const validationset = {
      Comment: false
    }
    if (!ActionComments.RespondCommentVal.getCurrentContent().hasText()) {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const curStatusTitle = data[0].Status.Title
      const curStatus = Number(data[0].Status.ID)
      const status = StatusIDs().Responded
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const Action = 'Responded'
      const dt = new Date()
      let AssignedUsers: any = []
      if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
        $.each(data[0].AssignedUsers, function (i, v) {
          AssignedUsers = AssignedUsers.concat(v.Id)
        })
      }
      AssignedUsers = AssignedUsers.concat(LoginUserName().UserId)
      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Response: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: Action,
        Role: role,
        StatusId: status,
        PreviousStatusId: curStatus,
        AssignedToId: null,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: Action,
        AssignedToId: null,
        AssignedUsersId: AssignedUsersadd,
        StatusModifiedDate: dt,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, commentitem, 'respond').then(() => {
          StatusID = status
          AssignedToID = ''
          const Activity = 'Respond'
          const batchGuid = generateUUID()
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData(Activity, batchGuid, changeSetId, 'Respond', status, endpoint, batchRequestHeader)
          const clickheretext = "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
          const subject = 'Question ' + "'" + QuestionTitle + "'" + ' - ' + "'" + curStatusTitle + "'" + ' response added'
          const bodytext = ''
          const to = (status === 7 ? 'AFIMSC' : '')
          const body = emailBody(bodytext, clickheretext)
          sendEmails(EmailTexts().FROM, to, subject, body)
        })
      })
    } else {
      setRespondValidations(validationset.Comment)
    }
  }

  const AssignToComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      AssignToCommentVal: e.target.value
    })
  }

  const AssignToAction = () => {
    const comment = ActionComments.AssignToCommentVal
    const AssignToVal = SelectedAssignTo
    const AssignToId = SelectedAssignToUser
    let isValid = true
    const validationset = {
      AssignTo: false,
      AssignToId: false,
      Comment: false
    }
    if (AssignToVal === '') {
      isValid = false
      validationset.AssignTo = true
    }
    if (AssignToId === '') {
      isValid = false
      validationset.AssignToId = true
    }
    if (comment === '') {
      isValid = false
      validationset.Comment = true
    }
    if (isValid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const curStatus = Number(data[0].Status.ID)
      const status = (AssignToVal === 'SME' ? StatusIDs().SME : AssignToVal === 'AFSVC' ? StatusIDs().AFSVC : StatusIDs().SAFFMCEB)
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const Action = 'Assigned'
      const SelfOther = (LoginUserName().UserId === AssignToId ? 'Self' : 'Other')
      const dt = new Date()
      let AssignedUsers: any = []
      if (data[0].AssignedUsers && data[0].AssignedUsers.length > 0) {
        $.each(data[0].AssignedUsers, function (i, v) {
          if (LoginUserName().UserId !== v.Id) {
            AssignedUsers = AssignedUsers.concat(v.Id)
          }
        })
      }
      if (!AssignedUsers.includes(AssignedToID) && (AssignedToID !== '' && AssignedToID != null)) {
        AssignedUsers = AssignedUsers.concat(JSON.parse(AssignedToID))
      }
      const AssignedUsersadd = {
        results: AssignedUsers
      }
      const commentitem = {
        Title: Action,
        Comment: comment,
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Private',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: comment,
        Action: Action,
        Role: role,
        AssignedToId: AssignToId,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: Action,
        AssignedToId: AssignToId,
        StatusModifiedDate: dt,
        ItemModified: dt,
        AssignedUsersId: AssignedUsersadd,
        ItemModifiedById: LoginUserName().UserId
      }
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AssignedToID = AssignToId
        StatusID = status
        AddHistoryNewItem(historyitem, commentitem, '').then(() => {
          const ActivityName = (SelfOther === 'Self' ? 'Self Assigned' : 'Assigned To Other')
          const Activity = ActivityName
          const batchGuid = generateUUID()
          const changeSetId = generateUUID()
          const batchRequestHeader = {
            'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
            'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
          }
          const endpoint = SITE_URL + '/_api/$batch'
          generateNotifyBatchBody()
          toStoreNotificationsData(Activity, batchGuid, changeSetId, 'Assigned', status, endpoint, batchRequestHeader)
          const clickheretext = "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to review and respond to the question."
          let subject = ''
          if (AssignToId === LoginUserName().UserId) {
            subject = 'Question ' + "'" + QuestionTitle + "'" + ' has been assigned to ' + "'" + SelectedAssignToUserEmail.Name + "'" + ''
          } else {
            subject = 'Question ' + "'" + QuestionTitle + "'" + ' has been assigned to ' + "'" + SelectedAssignToUserEmail.Name + "'" + ' by ' + "'" + LoginUserName().UserName + "'" + ''
          }
          const bodytext = 'This question has been assigned for your action.'
          const to = SelectedAssignToUserEmail.Email
          const body = emailBody(bodytext, clickheretext)
          sendEmails(EmailTexts().FROM, to, subject, body)
        })
      })
    } else {
      setAssignToValidations({
        ...AssignToValidations,
        AssignTo: validationset.AssignTo,
        AssignToId: validationset.AssignToId,
        Comment: validationset.Comment
      })
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

  const changeQuesTitle = (e: any) => {
    setQuesTitle(e.target.value)
  }

  const changeQuesSubcategory = (e: any) => {
    setQuesSubCategory(e.target.value)
  }

  function uploadFileHandler (e: any) {
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
    const filename = e.currentTarget.dataset.filename
    const currfiles = filesuploaded.filter(function (file: any) { return file.name !== filename })
    setfilesuploaded([...currfiles])
  }

  const PromoteToKBAction = () => {
    const title = QuesTitle
    const description = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const subcat = QuesSubCategory
    let isvalid = true
    const validationset = {
      Title: false,
      Description: false,
      SubCategory: false
    }
    if (title === '') {
      isvalid = false
      validationset.Title = true
    }
    if (description === '') {
      isvalid = false
      validationset.Description = true
    }
    if (subcat === '') {
      isvalid = false
      validationset.SubCategory = true
    }
    if (isvalid) {
      setloaderState(true)
      const QuestionTitle = data[0].QuestionTitle
      const CustomerEmail = data[0].DutyEmail
      const curStatus = Number(data[0].Status.ID)
      const status = StatusIDs().PromotedtoKB
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const Action = 'Promoted to Knowledge Graph'
      const dt = new Date()
      const KBitem = {
        Title: title,
        Description: description,
        Category: 'NAFFA',
        Subcategory: subcat,
        IsArchived: false
      }
      const historyitem = {
        QuestionsItemID: String(data[0].ID),
        ItemGUID: data[0].ItemGUID,
        Description: Action,
        Action: Action,
        Role: role,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      }
      const addObj = {
        StatusId: status,
        PreviousStatusId: curStatus,
        Action: Action,
        StatusModifiedDate: dt,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId
      }
      const batchGuid = generateUUID()
      const changeSetId = generateUUID()
      const batchRequestHeader = {
        'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
        'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
      }
      const endpoint = SITE_URL + '/_api/$batch'
      sp.web.lists.getByTitle(ListNames().QuestionsList).items.getById(data[0].ID).update(addObj).then((data) => {
        AddHistoryNewItem(historyitem, KBitem, 'promotetokb').then(() => {
          const clickheretext = "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
          const subject = 'Question ' + "'" + QuestionTitle + "'" + ' has been Promoted to Knowledge Graph'
          const bodytext = 'Question got Promoted to Knowledge Graph'
          const to = CustomerEmail
          const body = emailBody(bodytext, clickheretext)
          sendEmails(EmailTexts().FROM, to, subject, body)
          toStoreNotificationsData('PromoteToKB', batchGuid, changeSetId, 'SendTo', status, endpoint, batchRequestHeader)
        })
      })
    } else {
      setPromoteToKBValidations({
        ...AssignToValidations,
        Title: validationset.Title,
        Description: validationset.Description,
        SubCategory: validationset.SubCategory
      })
    }
  }

  async function AddHistoryNewItem (HistItem: any, DiscItem: any, action: any) {
    sp.web.lists.getByTitle(ListNames().QuestionsHistoryList).items.add(HistItem).then((data) => {
      if (action === 'promotetokb') {
        AddKBItem(DiscItem).then(() => {})
        BuildmodifiedListUpdate()
      } else {
        AddDiscussionItem(DiscItem, action).then(() => {})
      }
    })
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
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(Id).update(addObj).then(function () {})
  }

  async function AddDiscussionItem (Discitem: any, action: any) {
    const listname = (action === 'respond' ? ListNames().QuestionsResponseList : ListNames().QuestionsDiscussionsList)
    sp.web.lists.getByTitle(listname).items.add(Discitem).then((data) => {
      setshowActionpopups({
        ...showActionpopups,
        showcancelpopup: false,
        showAssignTopopup: false,
        showSendTopopup: false,
        showElevateTopopup: false,
        showCompletepopup: false,
        showRespondpopup: false,
        showPromoteToKBpopup: false,
        showbackToAFIMSC: false,
        showCustomerActionRequired: false
      })
      props.actionPerformed()
      setloaderState(false)
    })
  }

  async function AddKBItem (KBitem: any) {
    const listName = ListNames().KnowledgeBaseArticles
    sp.web.lists.getByTitle(listName).items.add(KBitem).then((kbitem) => {
      if (filesuploaded && filesuploaded.length > 0) {
        const item: IItem = sp.web.lists.getByTitle(listName).items.getById(kbitem.data.ID)
        const files = []
        for (let i = 0; i < filesuploaded.length; i++) {
          // const fileNamePath = encodeURI(filesuploaded[i].name)
          files.push({
            name: filesuploaded[i].name,
            content: filesuploaded[i]
          })
        }
        item.attachmentFiles.addMultiple(files)
        // sp.web.getFolderByServerRelativePath(listName).files.addUsingPath(filesuploaded[i].name, filesuploaded[i], { Overwrite: true })
        setshowActionpopups({
          ...showActionpopups,
          showPromoteToKBpopup: false
        })
        props.actionPerformed()
        setloaderState(false)
      } else {
        setshowActionpopups({
          ...showActionpopups,
          showPromoteToKBpopup: false
        })
        props.actionPerformed()
        setloaderState(false)
      }
    })
  }
  const BackbuttonClick = () => {
    sessionStorage.setItem('clickedBackBtn' + siteName, 'true')
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
    const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? (data[0].Status.Title === 'Responded' ? 'AFIMSC' : data[0].Status.Title) : loginuserroles.loginuserrole)
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
        add(endpoint, batchbody, batchRequestHeader, true).done(function (response) {
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
          if (data[0].AssignedUsers.length > 0) {
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
          if (data[0].AssignedUsers.length > 0) {
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
          if (loginuserroles.loginuserrole === 'AFIMSC' && (Activity === 'Elevated' || Activity === 'SendTo')) {
            allNotificationUsers.push({
              email: LoginUserName().UserId,
              flag: flag
            })
          } else if (LoginUserName().UserId !== AssignedToID && AssignedToID !== '' && AssignedToID != null && AssignedToID !== undefined) {
            if (flag === 'Notification' && Activity !== 'Elevated') {
              allNotificationUsers.push({
                email: AssignedToID,
                flag: flag
              })
            } else if (flag === 'Action') {
              allActionUsers.push({
                email: AssignedToID,
                flag: flag
              })
            }
          }
        } else if (val === 'Customer') {
          const getcustomerInfoUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/siteusers/getbyemail('" + data[0].DutyEmail + "')"
          const getcustomerinfod = $.Deferred()
          deferreds.push(getData(getcustomerInfoUrl, getcustomerinfod, true).then(function (data: any) {
            if (flag === 'Notification') {
              allNotificationUsers.push({
                email: data.d.Id,
                flag: flag
              })
            } else if (flag === 'Action') {
              allActionUsers.push({
                email: data.d.Id,
                flag: flag
              })
            }
          }))
        } else if (val.includes('AssignedTo')) {
          if (flag === 'Action' && (StatusID === 4 || StatusID === 5 || StatusID === 6)) {
            allActionUsers.push({
              email: AssignedToID,
              flag: flag
            })
          } else if (AssignedToID !== '' && AssignedToID !== null && AssignedToID !== undefined) {
            if (flag === 'Action') {
              allActionUsers.push({
                email: AssignedToID,
                flag: flag
              })
            } else if (flag === 'Notification') {
              allNotificationUsers.push({
                email: AssignedToID,
                flag: flag
              })
            }
          }
        } else { // if val == groupname
          if (flag === 'Action') {
            if (val === 'AFIMSC') {
              allActionUsers.push({
                email: 'AFIMSC',
                flag: flag
              })
            } else if (val === 'SAF FMCEB') {
              allActionUsers.push({
                email: 'SAF FMCEB',
                flag: flag
              })
            } else if (val === 'SME') {
              allActionUsers.push({
                email: 'SME',
                flag: flag
              })
            } else if (val === 'AFSVC') {
              allActionUsers.push({
                email: 'AFSVC',
                flag: flag
              })
            }
          }
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
    notisubject = notisubject.replace(/\[Question ID]/g, '' + data[0].QuestionTitle + '')
    if (Activity === 'Self Assigned') {
      notisubject = notisubject.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
    } else if (Activity === 'Assigned To Other') {
      notisubject = notisubject.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
      notisubject = notisubject.replace(/\[Assigned by User Name]/g, LoginUserName().UserName)
    } else if (Activity === 'Elevated') {
      notisubject = notisubject.replace(/\[Elevated by User Name]/g, LoginUserName().UserName)
    } else if (Activity === 'SendTo') {
      notisubject = notisubject.replace(/\[Sent by User Name]/g, LoginUserName().UserName)
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

  function generateNotificationsBatchBody (Activity: any, batchGuid: any, changeSetId: any, listname: any, action: any, status: any, role: any, notisubject: any) {
    let batchContents = []
    // const curr_item_configData = alasql("SELECT * FROM ? where UserRole == COALESCE('" + role + "',UserRole) AND Event == COALESCE('" + action + "',Event)", [NotificationsMetadata])
    const newstsid = (status !== undefined && status !== null && status !== '' ? status : StatusID)
    const itemType = GetItemTypeForListName(listname)
    notisubject = notisubject.replace(/\[Question ID]/g, '' + data[0].QuestionTitle + '')
    if (Activity === 'Self Assigned') {
      notisubject = notisubject.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
    } else if (Activity === 'Assigned To Other') {
      notisubject = notisubject.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
      notisubject = notisubject.replace(/\[Assigned by User Name]/g, LoginUserName().UserName)
    } else if (Activity === 'Elevated') {
      notisubject = notisubject.replace(/\[Elevated by User Name]/g, LoginUserName().UserName)
    } else if (Activity === 'SendTo') {
      notisubject = notisubject.replace(/\[Sent by User Name]/g, LoginUserName().UserName)
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

  function LastModifiedListUpdate (itemid: any, GetMCount: any) {
    const addObj = {
      Mcount: GetMCount
    }
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(itemid).update(addObj).then(function () {
      console.log('updated')
    })
  }

  function GetItemTypeForListName (name: any) {
    return 'SP.Data.' + name.charAt(0).toUpperCase() + name.split(' ').join('').slice(1) + 'ListItem'
  }
  /* function updateItemtoIsread () {

    generateNotifyBatchBody(batchGuid, changeSetId, notificationsList)
  } */
  const NotificationsBuildmodifiedListUpdate = () => {
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
    const addObj = {
      Mcount: GetMCount
    }
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(Id).update(addObj).then(function () {
      GetBuildModifiedList().then(function () {
        // initEffect()
      })
    })
  }

  function generateNotifyBatchBody () {
    let notifications = []
    notifications = JSON.parse(sessionStorage.getItem('NotificationsData' + siteName) || '{}')
    const Isread = sessionStorage.getItem('Isread_' + siteName)
    const itemid = ItemGUID
    // const curraction = (curr_item.Action == 'Assigned' && curr_item.StatusId != curr_item.PreviousStatusId ? 'Self Assigned' : curr_item.Action == 'Assigned' && curr_item.StatusId == curr_item.PreviousStatusId ? 'Assigned To Other' : curr_item.Action)
    let MultiUserGroup = ''
    const UserDetails = JSON.parse(localStorage.getItem('UserGroupNames' + siteName) || '{}')
    if (UserDetails && UserDetails.length > 0) {
      $.each(UserDetails, function (i, v) {
        if (UserDetails.length - 1 == i) {
          MultiUserGroup = MultiUserGroup + "To eq '" + v + "'"
        } else {
          MultiUserGroup = MultiUserGroup + "To eq '" + v + "' or "
        }
      })
    }
    const batchContents = []
    const loginUserGroupIds : any = localStorage.getItem('UserGroupIds' + siteName)
    $(notifications).each(function (i, n) {
      let ReadUsers : any[] = []
      let UserRead = false
      $(n.Read).each(function (i, v) {
        if (v.Id == LoginUserName().UserId || ($.inArray(v.Id, loginUserGroupIds) != -1)) {
          UserRead = true
        }
        ReadUsers = ReadUsers.concat(v.Id)
      })
      ReadUsers = ReadUsers.concat((LoginUserName().UserId))
      const ReadUsersadd = {
        results: ReadUsers
      }
      // if (n.InqItemID == itemid) {
      if (n.ItemGUID == itemid) {
        let itemupdate = false
        let item : any
        if (UserRead == false && n.StatusID == StatusID) {
          item = {
            ReadId: ReadUsersadd
          }
          itemupdate = true
        } else if (n.StatusID !== StatusID && StatusID !== '' && StatusID !== undefined && StatusID !== null) {
          item = {
            IsRead: true
          }
          itemupdate = true
        }

        if (itemupdate) {
          const list = sp.web.lists.getByTitle(ListNames().NotificationsList)
          list.items.getById(n.ID).update(item).then(function () {
            NotificationsBuildmodifiedListUpdate()
            localStorage.setItem('NotificationsList_LMDate' + siteName, '')
          })
        }
      }
    })
  }

  return (
        <>
            <ul>
                {btnshowhide.Cancel
                  ? <li className="liCancelbtn">
                        <a href="javascript:void(0)" title="Cancel" className="anchorglobalbtn" onClick={showhidecancel}><span className="icon-Close"></span>Cancel</a>
                        {showActionpopups.showcancelpopup
                          ? <div className="divactionpopup divglobalpopup cancelpopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="Inputcomments">Comment <span className="mandatory">*</span> </label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Comment </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <textarea name="comment" id="Inputcomments" placeholder="Enter your Comment" aria-label="Comment" onChange={CancelComment}></textarea>
                                            <span style = {{ display: CancelValidations ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={CancelAction}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhidecancel}> <span className="icon-Close"></span>Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                  : null}
                  {btnshowhide.CustomerActionReq
                    ? <li className="liCustomerRequiredCbtn">
                        <a href="javascript:void(0)" title="Customer Action Required" className="anchorglobalbtn" onClick={showhidecustomerActionReq}><span className="icon-userscheck"></span>Customer Action Required</a>
                        {showActionpopups.showCustomerActionRequired
                          ? <div className="divactionpopup divglobalpopup Returnpopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="Inputcomments">Comment <span className="mandatory">*</span> </label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Comment </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <textarea name="comment" id="Inputcomments" placeholder="Enter your Comment" aria-label="Comment" onChange={ActionReqComment}></textarea>
                                            <span style = {{ display: CustactionReq ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={CustomerActionRequired}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhidecustomerActionReq}> <span className="icon-Close"></span>Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                    : null}
                    {btnshowhide.ReturnToAFIMSC
                      ? <li className="liRetuntoAFIMSCbtn">
                        <a href="javascript:void(0)" title="Return to AFIMSC" className="anchorglobalbtn" onClick={showhideReturnToAFIMSC}><span className="icon-reopen"></span>Return To AFIMSC</a>
                        {showActionpopups.showbackToAFIMSC
                          ? <div className="divactionpopup divglobalpopup Returnpopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="Inputcomments">Comment <span className="mandatory">*</span> </label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Comment </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <textarea name="comment" id="Inputcomments" placeholder="Enter your Comment" aria-label="Comment" onChange={backToAfimscComment}></textarea>
                                            <span style = {{ display: backtoAFIMSCValidation ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={backToAFIMSCAction}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideReturnToAFIMSC}> <span className="icon-Close"></span>Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                      : null}
                {btnshowhide.AssignTo
                  ? <li className="liAssignTobtn">
                        <a href="javascript:void(0)" title="Assign to" className="anchorglobalbtn" onClick={showhideAssignTo}> <span className="icon-Assignto"></span> Assign to</a>
                        {showActionpopups.showAssignTopopup
                          ? <div className="divactionpopup divglobalpopup AssignedTopopup">
                                <div className="row">
                                  <div className="col-md-12 col-xs-12">
                                    {showhideradiobtn
                                      ? <div className="divradiobuttons" onChange={changeSelfOther}>
                                        <label htmlFor="radioSelf">
                                          <input type="radio" name="assignoptions" checked={radioEnable} value="Self" aria-label="Self" />
                                            Self
                                        </label>
                                        <label htmlFor="radioOther">
                                          <input type="radio" name="assignoptions" value="Other" checked={!radioEnable} aria-label="Other" />
                                            Other
                                        </label>
                                      </div>
                                      : null}
                                  </div>
                                </div>
                                <div className="row">
                                  {showAssignTofields
                                    ? <>
                                      <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="selectdropdownAssignTo">Assign To <span className="mandatory">*</span></label>
                                            <span className="icon-info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp">
                                                            <p>Assign To</p>
                                                        </span>
                                                    </span>
                                                </span>
                                            </span>
                                            <select name="Sub Category" id="selectdropdownAssignTo" aria-label="Assign To" aria-required="true">
                                            {AssignToOptions && AssignToOptions.length > 0
                                              ? AssignToOptions.map((val: any) =>
                                                <option key={val} value={val}>{val}</option>
                                              )
                                              : null
                                            }
                                            </select>
                                            <span style = {{ display: AssignToValidations.AssignTo ? '' : 'none' }} className="errormsg"> Please Select Dropdown</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-xs-12">
                                        <div
                                            className="divformgroup">
                                            <label htmlFor="selectdropdownSelectUser">Select User <span className="mandatory">*</span></label>
                                            <span className="icon-info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp">
                                                            <p>Select User</p>
                                                        </span>
                                                    </span>
                                                </span>
                                            </span>
                                            {buildAssignToUsersddl(AssignToUsers)}
                                        </div>
                                    </div>
                                    </>
                                    : null}
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="InputOthercomments">Comment
                                                <span className="mandatory">*</span>
                                            </label>
                                            <span className="icon-info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp">
                                                            <p>Comment</p>
                                                        </span>
                                                    </span>
                                                </span>
                                            </span>
                                            <textarea name="comment" id="InputOthercomments" placeholder="Enter your Comment" aria-label="Comment" aria-required="true" onChange={AssignToComment}></textarea>
                                            <span style = {{ display: AssignToValidations.Comment ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={AssignToAction}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideAssignTo}> <span className="icon-Close"></span> Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                  : null}
                {btnshowhide.SendTo
                  ? <li className="liSendTobtn">
                        <a href="javascript:void(0)" title="Send To" className="anchorglobalbtn" onClick={showhideSendTo}> <span className="icon-GraphSearch"></span> Send To</a>
                        {showActionpopups.showSendTopopup
                          ? <div className="divactionpopup divglobalpopup SendTopopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="selectdropdownSendTo">Send To <span className="mandatory">*</span></label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Send To </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <select name="Send To" onChange={showhideSendToUser}>
                                            <option value="Select">Select</option>
                                            {SendToOptions && SendToOptions.length > 0
                                              ? SendToOptions.map((val: any) =>
                                                <option key={val} value={val}>{val}</option>
                                              )
                                              : null
                                            }
                                            </select>
                                            <span style = {{ display: SendToValidations.SendTo ? '' : 'none' }} className="errormsg"> Please Select Dropdown</span>
                                        </div>
                                    </div>
                                    {ShowSendToUser
                                      ? <div className="col-md-12 col-xs-12">
                                            <div className="divformgroup">
                                                <label htmlFor="selectdropdownSelectUser">Select User </label>
                                                <span className="icon-Info">
                                                    <span className="info-tooltip">
                                                        <span className="classic">
                                                            <span className="tooltipdescp"><p>Select User </p></span>
                                                        </span>
                                                    </span>
                                                </span>
                                                {buildSendToUsersddl(SendToUsers)}
                                            </div>
                                        </div>
                                      : null}
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="InputSelfcomments">Comment <span className="mandatory">*</span> </label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Comment </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <textarea name="comment" id="InputSelfcomments" placeholder="Enter your Comment" aria-label="Comment" aria-required="true" onChange={SendToComment}></textarea>
                                            <span style = {{ display: SendToValidations.Comment ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={SendToAction}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideSendTo}> <span className="icon-Close"></span> Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                  : null}
                {btnshowhide.ElevateTo
                  ? <li className="liElevateTobtn">
                        <a href="javascript:void(0)" title="Elevate To" className="anchorglobalbtn" onClick={showhideElevateTo}><span className="icon-Elevate"></span> Elevate To</a>
                        {showActionpopups.showElevateTopopup
                          ? <div className="divactionpopup divglobalpopup elevatepopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="SelectDropdownElevateTo ">Elevate To <span
                                                    className="mandatory">*</span> </label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Elevate To </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <select name="Elevate To" id="SelectDropdownElevateTo"
                                                aria-label="Elevate To" aria-required="true">
                                                {ElevateToOptions && ElevateToOptions.length > 0
                                                  ? ElevateToOptions.map((val: any) =>
                                                        <option key={val} value={val}>{val}</option>
                                                  )
                                                  : <option value='None'>None</option>
                                                }
                                            </select>
                                            <span style = {{ display: ElevateToValidations.ElevateTo ? '' : 'none' }} className="errormsg"> Please select dropdown</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-xs-12">
                                        <div
                                            className="divformgroup">
                                            <label htmlFor="selectdropdownSelectUser">Select User </label>
                                            <span className="icon-info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp">
                                                            <p>Select User</p>
                                                        </span>
                                                    </span>
                                                </span>
                                            </span>
                                            {buildElevateToUsersddl(ElevateToUsers)}
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="Inputcomments">Comment <span className="mandatory">*</span></label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Comment </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <textarea name="comment" id="Inputcomments" placeholder="Enter your Comment" aria-label="Comment" onChange={ElevateToComment}></textarea>
                                            <span style = {{ display: ElevateToValidations.Comment ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={ElevateToAction}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideElevateTo}> <span className="icon-Close"></span> Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                  : null}
                {btnshowhide.Respond
                  ? <li className="liRespondlbtn">
                        <a href="javascript:void(0)" title="Respond" className="anchorglobalbtn" onClick={showhideRespond}><span className="icon-Respond"></span>Respond</a>
                        {showActionpopups.showRespondpopup
                          ? <div className="divactionpopup divglobalpopup respondpopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="Inputcomments">Comment <span className="mandatory">*</span> </label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Comment </p></span>
                                                    </span>
                                                </span>
                                            </span>
                            {/* <input className="comment" id="Inputcomments" placeholder="Enter your Comment" aria-label="Comment" onChange={RespondComment}></input> */}
                            <Editor editorState={ActionComments.RespondCommentVal} onEditorStateChange={onEditorStateChange}toolbar={{ inline: { inDropdown: true }, list: { inDropdown: true }, textAlign: { inDropdown: true }, link: { inDropdown: true }, history: { inDropdown: true } }} />
<span style = {{ display: RespondValidations ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                       </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={RespondAction}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideRespond}> <span className="icon-Close"></span> Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                  : null}
                {btnshowhide.PromoteToKB
                  ? <li className="lipromotebtn">
                        <a href="javascript:void(0)" title="Promote To Knowledge Graph" className="anchorglobalbtn" onClick={showhidePromoteToKB}><span className="icon-Promote"></span>Promote To Knowledge Graph</a>
                        {showActionpopups.showPromoteToKBpopup
                          ? <div className="divactionpopup divglobalpopup promoteToKBpopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="inputTextQuestion">Question <span className="mandatory">*</span></label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp">
                                                            <p>Question </p>
                                                        </span>
                                                    </span>
                                                </span>
                                            </span>
                                            <input type="text" name="Question" id="inputTextQuestion" aria-label="Question" aria-required="true" placeholder="Question" value={QuesTitle} onChange={changeQuesTitle}/>
                                            <span style = {{ display: PromoteToKBValidations.Title ? '' : 'none' }} className="errormsg"> Please Enter Question</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="InputtextareainqResponse"> Response </label> <span className="mandatory">*</span>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p> Response </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <Editor editorState={ActionComments.RespondCommentVal} onEditorStateChange={onEditorStateChange}toolbar={{ inline: { inDropdown: true }, list: { inDropdown: true }, textAlign: { inDropdown: true }, link: { inDropdown: true }, history: { inDropdown: true } }} />
                                            <span style = {{ display: PromoteToKBValidations.Description ? '' : 'none' }} className="errormsg"> Please Enter Question</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-xs-6">
                                        <div className="divformgroup">
                                            <div className="selectdropdown">
                                                <label htmlFor="SelectdropdownCategory">Category <span className="mandatory">*</span>
                                                    <span className="icon-Info">
                                                        <span className="info-tooltip">
                                                            <span className="classic">
                                                                <span className="tooltipdescp"><p> Category </p></span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </label>
                                                <input type='text' id='InputtextCategory' aria-label='Category' placeholder='NAFFA' value='NAFFA' disabled></input>
                                                <p className="errormsg hidecomponent" id="knowledgeGraphSectionErr"> Please select Dropdown</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-xs-6">
                                        <div className="divformgroup">
                                            <div className="selectdropdown">
                                                <label htmlFor="SelectdropdownSubCategory">Sub Category <span className="mandatory">*</span>
                                                    <span className="icon-Info">
                                                        <span className="info-tooltip">
                                                            <span className="classic">
                                                                <span className="tooltipdescp"><p>Sub Category </p></span>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </label>
                                                <select name="Sub Category" value={QuesSubCategory} onChange={changeQuesSubcategory}>
                                                    <option value="">Select</option>
                                                    {SubCategoryData.map((item: any) => <option key={item.SubCategory} value={item.SubCategory}>{item.SubCategory}</option>)}
                                                </select>
                                                <span style = {{ display: PromoteToKBValidations.SubCategory ? '' : 'none' }} className="errormsg">Please select Sub Category</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divattachments" id="testform">
                                            <div className="divformgroup">
                                                <label>Attach File</label>
                                                <span className="icon-Info">
                                                    <span className="info-tooltip">
                                                        <span className="classic">
                                                            <span className="tooltipdescp">
                                                                <p>Attach File </p>
                                                            </span>
                                                        </span>
                                                    </span>
                                                </span>
                                                <div className="divattachfile dropzonecontrol" aria-label="Attachment">
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
                                                        {showFileerrormsg ? <span className="errormsg" id="docerrormsg">Uploaded file already exists or contains invalid characters. Please upload valid files</span> : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="spanhintmgs"> Hint: Upload the files which are in the .png, .jpeg, .xlsx, .doc, .ppt,.txt .pptx, .pdf, .gif, .msg files and special characters like #$%^&* will not be used in the document names </span>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn">
                                            <a href="javascript:void(0)" title="Ok" onClick={PromoteToKBAction}> <span className="icon-Check"></span> Ok</a>
                                        </li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhidePromoteToKB}> <span className="icon-Close"></span> Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                  : null}
                {btnshowhide.Complete
                  ? <li className="liCompletebtn">
                        <a href="javascript:void(0)" title="Complete" className="anchorglobalbtn" onClick={showhideComplete}> <span className="icon-Check"></span> Complete</a>
                        {showActionpopups.showCompletepopup
                          ? <div className="divactionpopup divglobalpopup completepopup">
                                <div className="row">
                                    <div className="col-md-12 col-xs-12">
                                        <div className="divformgroup">
                                            <label htmlFor="Inputcomments">Comment <span className="mandatory">*</span> </label>
                                            <span className="icon-Info">
                                                <span className="info-tooltip">
                                                    <span className="classic">
                                                        <span className="tooltipdescp"><p>Comment </p></span>
                                                    </span>
                                                </span>
                                            </span>
                                            <textarea name="comment" id="Inputcomments" placeholder="Enter your Comment" aria-label="Comment" onChange={CompleteComment}></textarea>
                                            <span style = {{ display: CompleteValidations ? '' : 'none' }} className="errormsg"> Please enter comment</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="divpopupbtns">
                                    <ul>
                                        <li className="OkBtn"><a href="javascript:void(0)" title="Ok" onClick={CompleteAction}><span className="icon-Check"></span> Ok</a></li>
                                        <li className="CancelBtn">
                                            <a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideComplete}> <span className="icon-Close"></span> Cancel</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                          : null}
                    </li>
                  : null}
                  <li className="liBackbtn">
                    <Navlink to='/Questions' title='Back' exact onClick={() => BackbuttonClick()}> <span className="icon-left-arrow"></span> Back</Navlink>
                  </li>
            </ul>
            <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
              <div className="copying">
                    <p id="displaytext">Working on it</p>
                    <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                </div>
            </div>
        </>
  )
}

export default DetailedviewActionbtns
