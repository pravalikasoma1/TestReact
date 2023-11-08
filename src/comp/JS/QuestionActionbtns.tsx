/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react'
import '../CSS/Questions.css'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import format from 'date-fns/format'
import { parseISO } from 'date-fns'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/site-groups'
import { ListNames, StatusIDs, EmailTexts, alertMessages } from '../../pages/Config'
import { add, getData, GetProcessFlowMetadata, GlobalConstraints, LoginUserName, readNotificationsMetadata, sendEmails } from '../../pages/Master'
import loader from '../Images/Loader.gif'

export interface Props {
    data?: any,
    tabid?: number,
    statusid?: any,
    loginuserroles?: any,
    selectedArray?: any,
    actionPerformed?: any,
}
const QuestionActionbtns = (props: Props) => {
  let allActionUsers: any = []
  let allNotificationUsers: any = []
  const SITE_URL = _spPageContextInfo.webAbsoluteUrl
  const { data = [], tabid = [], statusid = [], loginuserroles = [], selectedArray = [] } = props
  const StatusID = (data[0] && data[0].Status && data[0].Status !== undefined && data[0].Status !== null && data[0].Status !== '' ? data[0].Status.ID : '')
  let AssignedToID = (data[0] && data[0].AssignedTo && data[0].AssignedTo !== undefined && data[0].AssignedTo !== null && data[0].AssignedTo !== '' ? data[0].AssignedTo.ID : '')

  const siteName = GlobalConstraints().siteName
  const filename = 'Questions'
  const [ProcessFlowMetaData, setProcessFlowMetaData] = useState([])
  const [btnshowhide, setbtnshowhide] = useState({
    AssignTo: false,
    ElevateTo: false,
    SendTo: false
  })
  const [showActionpopups, setshowActionpopups] = useState({
    showAssignTopopup: false,
    showSendTopopup: false,
    showElevateTopopup: false
  })
  const [SendToOptions, setSendToOptions] = useState([])
  const [ShowSendToUser, setShowSendToUser] = useState(false)
  const [SendToUsers, setSendToUsers] = useState([])
  const [showAssignTofields, setshowAssignTofields] = useState(false)
  const [AssignToOptions, setAssignToOptions] = useState([])
  const [AssignToUsers, setAssignToUsers] = useState([])
  const [ElevateToOptions, setElevateToOptions] = useState([])
  const [ElevateToUsers, setElevateToUsers] = useState([])
  const [SelectedElevateTo, setSelectedElevateTo] = useState<any>('')
  const [SelectedElevateToUser, setSelectedElevateToUser] = useState('')
  const [SelectedElevateToUserEmail, setSelectedElevateToUserEmail] = useState({
    Email: '',
    Name: ''
  })
  const [SelectedSendTo, setSelectedSendTo] = useState<any>('')
  const [SelectedSendToUser, setSelectedSendToUser] = useState('')
  const [SelectedSendToUserEmail, setSelectedSendToUserEmail] = useState({
    Email: '',
    Name: ''
  })
  const [SelectedAssignTo, setSelectedAssignTo] = useState<any>('')
  const [SelectedAssignToUser, setSelectedAssignToUser] = useState<any>('')
  const [SelectedAssignToUserEmail, setSelectedAssignToUserEmail] = useState<any>({
    Email: '',
    Name: ''
  })
  const [radioEnable, setradioEnable] = useState(false)

  const [ElevateToValidations, setElevateToValidations] = useState(false)
  const [AssignToValidations, setAssignToValidations] = useState({
    AssignTo: false,
    AssignToId: false,
    Comment: false
  })
  const [SendToValidations, setSendToValidations] = useState({
    SendTo: false,
    Comment: false
  })
  const [ActionComments, setActionComments] = useState({
    AssignToCommentVal: '',
    SendToCommentVal: '',
    ElevateToCommentVal: ''
  })
  const [loaderState, setloaderState] = useState(false)
  const [NotificationsMetadata, setNotificationsMetadata] = useState<any>([])
  const notificationsList = ListNames().NotificationsList
  const [Assignedtouser, setAssignedtouser] = useState<any>('')

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
  }, [data])

  function exportfunction () {
    //  <ExportToExcel apiData={data} fileName={filename}/>
    setbtnshowhide({
      ...btnshowhide,
      AssignTo: false,
      ElevateTo: false,
      SendTo: false
    })
    const filteredData: any[] = []
    const fileType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'
    const apiData = props.data
    apiData.map((elem: any) => {
      filteredData.push({
        QuestionID: elem.QuestionID,
        Title: elem.QuestionTitle,
        Category: elem.Category,
        SubCategory: elem.SubCategory,
        SubmittedBy: elem.disName,
        SubmittedDate: elem.ItemCreated !== null ? format(parseISO(elem.ItemCreated), 'MM/dd/yyyy') : '',
        Status: elem.Status.Title,
        AssignedTo: elem.AssignedTo !== undefined ? elem.AssignedTo.Title : '',
        PromotedToKnowledgeGraph: elem.PromotedToKnowledgeGraph
      })
    })
    const fileName = filename
    const ws = XLSX.utils.json_to_sheet(filteredData)
    ws['!cols'] = [{ width: 20 }, { width: 50 }, { width: 10 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }]
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, fileName + fileExtension)
  }

  function setProcessFlowvalues () {
    setbtnshowhide({
      ...btnshowhide,
      AssignTo: false,
      ElevateTo: false,
      SendTo: false
    })
    const processflowmetadata = JSON.parse(localStorage.getItem('ProcessFlowMetadata' + siteName) || '{}')
    setProcessFlowMetaData(processflowmetadata)
    if ((data && data.length > 0) && (processflowmetadata && processflowmetadata.length > 0) && tabid === 1) {
      if (loginuserroles.isRoleExist && statusid !== '') {
        processflowmetadata.map((item: any) => {
          if (item.StatusID === Number(statusid) && loginuserroles.loginuserrole === item.Title) {
            setbtnshowhide({
              ...btnshowhide,
              AssignTo: item.AssignTo,
              ElevateTo: item.ElevateTo,
              SendTo: item.SendTo
            })
            window.location.href = `${window.location.origin + window.location.pathname}#/Questions`
          }
        })
      }
      if (loginuserroles.isRoleExist && loginuserroles.loginuserrole === 'AFIMSC' && (statusid === '' || statusid.length === 0)) {
        setbtnshowhide({
          ...btnshowhide,
          AssignTo: false,
          ElevateTo: true,
          SendTo: true
        })
      }
      if (loginuserroles.isRoleExist && (statusid === '' || statusid.length === 0) && (loginuserroles.loginuserrole === 'SME' || loginuserroles.loginuserrole === 'AFSVC' || loginuserroles.loginuserrole === 'SAF FMCEB')) {
        setbtnshowhide({
          ...btnshowhide,
          AssignTo: true,
          ElevateTo: false,
          SendTo: false
        })
      }
      if (loginuserroles.isRoleExist && loginuserroles.loginuserrole === 'NAFFA Owners' && (statusid === '' || statusid.length === 0)) {
        setbtnshowhide({
          ...btnshowhide,
          AssignTo: true,
          ElevateTo: true,
          SendTo: true
        })
      }
    }
  }

  const showhideSendTo = (e: any) => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    let correctSelection = true
    let statusval = Number(statusid)
    if (selectedArray && selectedArray.length > 0) {
      selectedArray.some((element: any) => {
        if (element.StatusID !== selectedArray[0].StatusID) {
          correctSelection = false
        }
      })
      if (!correctSelection) {
        selectedArray.some((element: any) => {
          if (Number(element.StatusID) === 3) {
            correctSelection = true
          } else if (Number(element.StatusID) === 7) {
            correctSelection = true
          } else {
            correctSelection = false
          }
        })
      }
      const status = Number(selectedArray[0].StatusID) === 4 ? 'SME' : Number(selectedArray[0].StatusID) === 5 ? 'AFSVC' : (Number(selectedArray[0].StatusID) === 3 || Number(selectedArray[0].StatusID) === 7) ? 'AFIMSC' : Number(selectedArray[0].StatusID) === 6 ? 'SAF FMCEB' : ''

      if (loginuserroles.loginuserrole !== status && loginuserroles.loginuserrole !== 'NAFFA Owners' && correctSelection) {
        correctSelection = false
      } else if (loginuserroles.isNAFFAOwner) {
        if (Number(selectedArray[0].StatusID) !== 3 && Number(selectedArray[0].StatusID) !== 7) {
          correctSelection = false
        }
      }
    }

    if (selectedArray && selectedArray.length > 0 && correctSelection && selectedArray !== '') {
      if (statusid === '' || statusid.length === 0) {
        if (loginuserroles.loginuserrole === 'SME') {
          statusval = 4
        } else if (loginuserroles.loginuserrole === 'AFSVC') {
          statusval = 5
        } else if (loginuserroles.loginuserrole === 'SAF FMCEB') {
          statusval = 6
        } else if (loginuserroles.loginuserrole === 'AFIMSC') {
          statusval = 3
        } else if (loginuserroles.loginuserrole === 'NAFFA Owners' && correctSelection) {
          statusval = Number(selectedArray[0].StatusID)
        }
      }
      setSendToValidations({
        ...SendToValidations,
        SendTo: false,
        Comment: false
      })
      setActionComments({
        ...ActionComments,
        AssignToCommentVal: '',
        SendToCommentVal: '',
        ElevateToCommentVal: ''
      })
      setSelectedSendTo('')
      setShowSendToUser(false)
      if (showActionpopups.showSendTopopup) {
        setshowActionpopups({
          ...showActionpopups,
          showSendTopopup: false
        })
      } else {
        const sendtoarray: any = []
        setshowActionpopups({
          ...showActionpopups,
          showAssignTopopup: false,
          showSendTopopup: true,
          showElevateTopopup: false
        })
        const userPermissions: any = ProcessFlowMetaData.filter((item: any) => { return (item.Title === loginuserroles.loginuserrole && item.StatusID === Number(statusval)) })
        console.log(userPermissions)
        const sendtooptions = userPermissions[0].SendToOptions.split(';')
        if (sendtooptions && sendtooptions.length > 0) {
          sendtooptions.map((v: any) => {
            sendtoarray.push(v)
          })
        }
        setSendToOptions(sendtoarray)
      }
    } else if (!correctSelection) {
      if (loginuserroles.isNAFFAOwner) {
        alert(alertMessages().SendTo)
      } else {
        alert(alertMessages().SendTo)
      }
    } else {
      alert(alertMessages().SelectMsg)
    }
  }

  const showhideSendToUser = (e: any) => {
    const val = e.currentTarget.value
    setSelectedSendTo(val)
    if (val !== 'Select') {
      const groupusers: any = []
      sp.web.siteGroups.getByName(val).users().then(function (users: any) {
        if (users && users.length > 0) {
          users.map((v: any) => {
            groupusers.push({
              Name: v.Title,
              Email: v.UserPrincipalName,
              Id: v.Id
            })
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
            <span style = {{ display: AssignToValidations.AssignToId ? '' : 'none' }} className="errormsg"> Please Select Dropdown</span>
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
            <span style = {{ display: AssignToValidations.AssignToId ? '' : 'none' }} className="errormsg"> Please Select Dropdown</span>
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
        <select name="AssignTo" id="selectElevateTo" aria-label="Select User" aria-required="true">
        <option value="None">None</option>
        </select>
      )
    }
  }

  const showhideElevateTo = (e: any) => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    let statusval = Number(statusid)
    let correctSelection = true
    if (selectedArray && selectedArray.length > 0) {
      selectedArray.some((element: any) => {
        if (Number(element.StatusID) !== Number(selectedArray[0].StatusID)) {
          correctSelection = false
        }
      })
      if (!correctSelection) {
        selectedArray.some((element: any) => {
          if (Number(element.StatusID) === 3) {
            correctSelection = true
          } else if (Number(element.StatusID) === 7) {
            correctSelection = true
          } else {
            correctSelection = false
          }
        })
      }
      const status = Number(selectedArray[0].StatusID) === 4 ? 'SME' : Number(selectedArray[0].StatusID) === 5 ? 'AFSVC' : (Number(selectedArray[0].StatusID) === 3 || Number(selectedArray[0].StatusID) === 7) ? 'AFIMSC' : Number(selectedArray[0].StatusID) === 6 ? 'SAF FMCEB' : ''

      if (loginuserroles.loginuserrole !== status && loginuserroles.loginuserrole !== 'NAFFA Owners' && correctSelection) {
        correctSelection = false
      } else if (loginuserroles.isNAFFAOwner) {
        if (Number(selectedArray[0].StatusID) !== 3 && Number(selectedArray[0].StatusID) !== 7) {
          correctSelection = false
        }
      }
    }

    if (selectedArray && selectedArray.length > 0 && selectedArray !== '' && correctSelection) {
      if (statusid === '' || statusid.length === 0) {
        if (loginuserroles.loginuserrole === 'SME') {
          statusval = 4
        } else if (loginuserroles.loginuserrole === 'AFSVC') {
          statusval = 5
        } else if (loginuserroles.loginuserrole === 'SAF FMCEB') {
          statusval = 6
        } else if (loginuserroles.loginuserrole === 'AFIMSC') {
          statusval = 3
        } else if (loginuserroles.loginuserrole === 'NAFFA Owners' && correctSelection) {
          if (selectedArray[0] !== undefined) { statusval = Number(selectedArray[0].StatusID) }
        }
      }
      setActionComments({
        ...ActionComments,
        AssignToCommentVal: '',
        SendToCommentVal: '',
        ElevateToCommentVal: ''
      })
      setElevateToValidations(false)
      if (showActionpopups.showElevateTopopup) {
        setshowActionpopups({
          ...showActionpopups,
          showElevateTopopup: false
        })
        setSelectedElevateTo('')
      } else {
        setshowActionpopups({
          ...showActionpopups,
          showAssignTopopup: false,
          showSendTopopup: false,
          showElevateTopopup: true
        })
        const elevatetoarray: any = []
        const groupusers: any = []
        const userPermissions: any = ProcessFlowMetaData.filter((item: any) => { return (item.Title === loginuserroles.loginuserrole && item.StatusID === Number(statusval)) })
        console.log(userPermissions)
        const elevatetooptions = userPermissions[0].ElevateToOptions.split(';')
        if (elevatetooptions && elevatetooptions.length > 0) {
          elevatetooptions.map((v: any) => {
            elevatetoarray.push(v)
          })
        }
        setSelectedElevateTo(elevatetoarray[0])
        sp.web.siteGroups.getByName(elevatetoarray[0]).users().then(function (users: any) {
          if (users && users.length > 0) {
            users.map((v: any) => {
              groupusers.push({
                Name: v.Title,
                Email: v.UserPrincipalName,
                Id: v.Id
              })
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
    } else if (!correctSelection) {
      if (loginuserroles.isNAFFAOwner) {
        alert(alertMessages().ElevateTo)
      } else {
        alert(alertMessages().ElevateTo)
      }
    } else {
      alert(alertMessages().SelectMsg)
    }
  }

  const showhideAssignTo = () => {
    $('.popupcommon').hide()
    $('.popupcommon').addClass('hidden')
    let correctSelection = true
    if (selectedArray && selectedArray.length > 0) {
      selectedArray.some((element: any) => {
        if (element.StatusID !== selectedArray[0].StatusID) {
          correctSelection = false
        }
      })
      const status = Number(selectedArray[0].StatusID) === 4 ? 'SME' : Number(selectedArray[0].StatusID) === 5 ? 'AFSVC' : (Number(selectedArray[0].StatusID) === 3 || Number(selectedArray[0].StatusID) === 7) ? 'AFIMSC' : Number(selectedArray[0].StatusID) === 6 ? 'SAF FMCEB' : ''

      if (loginuserroles.loginuserrole !== status && loginuserroles.loginuserrole !== 'NAFFA Owners' && correctSelection) {
        correctSelection = false
      } else if (loginuserroles.isNAFFAOwner) {
        if (Number(selectedArray[0].StatusID) !== 4 && Number(selectedArray[0].StatusID) !== 5 && Number(selectedArray[0].StatusID) !== 6) {
          correctSelection = false
        }
      }
    }
    if (selectedArray && selectedArray.length > 0 && correctSelection) {
      setSelectedAssignToUser('')
      setSelectedAssignToUserEmail({
        ...SelectedAssignToUserEmail,
        Email: '',
        Name: ''
      })
      setActionComments({
        ...ActionComments,
        AssignToCommentVal: '',
        SendToCommentVal: '',
        ElevateToCommentVal: ''
      })
      setAssignToValidations({
        ...AssignToValidations,
        AssignTo: false,
        AssignToId: false,
        Comment: false
      })
      if (showActionpopups.showAssignTopopup) {
        setshowActionpopups({
          ...showActionpopups,
          showAssignTopopup: false
        })
        setSelectedAssignTo('')
      } else {
        setradioEnable(true)
        setshowAssignTofields(false)
        setshowActionpopups({
          ...showActionpopups,
          showAssignTopopup: true,
          showSendTopopup: false,
          showElevateTopopup: false
        })
        setSelectedAssignToUser(LoginUserName().UserId)
        setSelectedAssignToUserEmail({
          ...SelectedAssignToUserEmail,
          Email: LoginUserName().UserEmail,
          Name: LoginUserName().UserName
        })
        setSelectedAssignTo(loginuserroles.loginuserrole)
      }
    } else if (!correctSelection) {
      if (loginuserroles.isNAFFAOwner) {
        alert(alertMessages().AssignToNaffaOwner)
      } else {
        const status = loginuserroles.loginuserrole === 'SME' ? alertMessages().AssigntoSME : loginuserroles.loginuserrole === 'AFSVC' ? alertMessages().AssigntoAFSVC : loginuserroles.loginuserrole === 'SAF FMCEB' ? alertMessages().AssigntoSAFFMCEB : ''
        alert(status)
      }
    } else {
      alert('Please select atleast one question')
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
    let statusval = statusid
    if (statusid === '' || statusid.length === 0) {
      if (loginuserroles.loginuserrole === 'SME') {
        statusval = 4
      } else if (loginuserroles.loginuserrole === 'AFSVC') {
        statusval = 5
      } else if (loginuserroles.loginuserrole === 'SAF FMCEB') {
        statusval = 6
      } else if (loginuserroles.loginuserrole === 'AFIMSC') {
        statusval = 3
      } else if (loginuserroles.loginuserrole === 'NAFFA Owners') {
        statusval = Number(selectedArray[0].StatusID)
      }
    }
    const userPermissions: any = ProcessFlowMetaData.filter((item: any) => { return (item.Title === loginuserroles.loginuserrole && item.StatusID === Number(statusval)) })
    const assigntooptions = userPermissions[0].AssignToOptions.split(';')
    if (assigntooptions && assigntooptions.length > 0) {
      assigntooptions.map((v: any) => {
        assigntoarray.push(v)
      })
    }
    setSelectedAssignTo(assigntoarray[0])
    sp.web.siteGroups.getByName(assigntoarray[0]).users().then(function (users: any) {
      if (users && users.length > 0) {
        users.map((v: any) => {
          if (v.Id !== LoginUserName().UserId) {
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

  const ElevateToComment = (e: any) => {
    setActionComments({
      ...ActionComments,
      ElevateToCommentVal: e.target.value
    })
  }

  const ElevateAction = () => {
    const comment = ActionComments.ElevateToCommentVal
    const ElevateToVal = SelectedElevateTo
    const curStatus = selectedArray[0].StatusID
    const status = StatusIDs().SAFFMCEB
    const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
    const ElevateToUserId = (SelectedElevateToUser !== '' && SelectedElevateToUser !== null ? Number(SelectedElevateToUser) : null)
    const Action = 'Elevate To ' + ElevateToVal
    const dt = new Date()
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
      const list = sp.web.lists.getByTitle(ListNames().QuestionsList)
      const batch = sp.web.createBatch()
      selectedArray.forEach(function (item: any) {
        list.items.getById(item.itemId).inBatch(batch).update({
          StatusId: status,
          PreviousStatusId: curStatus,
          Action: 'Elevated',
          StatusModifiedDate: dt,
          AssignedToId: ElevateToUserId,
          ItemModified: dt,
          ItemModifiedById: LoginUserName().UserId
        })
      })
      setAssignedtouser(ElevateToUserId)
      AssignedToID = ElevateToUserId
      batch.execute().then(d =>
        AddHistoryNewItem(comment, ElevateToVal, curStatus, status, role, ElevateToUserId, Action, dt, 'Elevated')
      )
    } else {
      setElevateToValidations(validationset.Comment)
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
      const curStatus = selectedArray[0].StatusID
      const status = (SendToVal === 'SME' ? StatusIDs().SME : StatusIDs().AFSVC)
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const SendToUserId = (SelectedSendToUser !== '' && SelectedSendToUser !== null ? Number(SelectedSendToUser) : null)
      const Action = 'Send To ' + SendToVal
      const dt = new Date()
      const list = sp.web.lists.getByTitle(ListNames().QuestionsList)
      const batch = sp.web.createBatch()
      selectedArray.forEach(function (item: any) {
        list.items.getById(item.itemId).inBatch(batch).update({
          StatusId: status,
          PreviousStatusId: curStatus,
          Action: 'SendTo',
          StatusModifiedDate: dt,
          AssignedToId: SendToUserId,
          ItemModified: dt,
          ItemModifiedById: LoginUserName().UserId
        })
      })
      AssignedToID = SendToUserId
      setAssignedtouser(SendToUserId)
      batch.execute().then(d =>
        AddHistoryNewItem(comment, SendToVal, curStatus, status, role, SendToUserId, Action, dt, Action)
      )
    } else {
      setSendToValidations({
        ...SendToValidations,
        SendTo: validationset.SendTo,
        Comment: validationset.Comment
      })
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
      const curStatus = selectedArray[0].StatusID
      const status = (AssignToVal === 'SME' ? StatusIDs().SME : AssignToVal === 'AFSVC' ? StatusIDs().AFSVC : AssignToVal === 'SAFFMCEB' ? StatusIDs().SAFFMCEB : curStatus)
      const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? data[0].Status.Title : loginuserroles.loginuserrole === '' ? 'Customer' : loginuserroles.loginuserrole)
      const AssignToUserId = (SelectedAssignToUser !== '' && SelectedAssignToUser !== null ? Number(SelectedAssignToUser) : null)
      const Action = 'Assigned'
      const dt = new Date()
      const list = sp.web.lists.getByTitle(ListNames().QuestionsList)
      const batch = sp.web.createBatch()
      selectedArray.forEach(function (item: any) {
        list.items.getById(item.itemId).inBatch(batch).update({
          StatusId: status,
          PreviousStatusId: curStatus,
          Action: Action,
          AssignedToId: AssignToId,
          StatusModifiedDate: dt,
          ItemModified: dt,
          ItemModifiedById: LoginUserName().UserId
        })
      })
      batch.execute().then(d =>
        AddHistoryNewItem(comment, AssignToVal, curStatus, status, role, AssignToUserId, Action, dt, Action)
      )
    } else {
      setAssignToValidations({
        ...AssignToValidations,
        AssignTo: validationset.AssignTo,
        AssignToId: validationset.AssignToId,
        Comment: validationset.Comment
      })
      setAssignedtouser(AssignToId)
      AssignedToID = AssignToId
    }
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
  function AddHistoryNewItem (comment: any, userval: any, curStatus: any, status: any, role: any, UserId: any, Action: any, dt: any, actionbtn: any) {
    const list = sp.web.lists.getByTitle(ListNames().QuestionsHistoryList)
    const batch = sp.web.createBatch()
    selectedArray.forEach(function (item: any) {
      list.items.inBatch(batch).add({
        QuestionsItemID: item.itemId,
        ItemGUID: item.itemGUID,
        Description: comment,
        Action: actionbtn,
        Role: role,
        AssignedToId: UserId,
        StatusId: status,
        PreviousStatusId: curStatus,
        ItemModified: dt,
        ItemModifiedById: LoginUserName().UserId,
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      })
    })
    batch.execute().then(d => {
      AddDiscussionItem(comment, userval, curStatus, status, role, UserId, Action, dt, actionbtn)
      test(actionbtn, status)
    })
  }
  function test (action: any, status: any) {
    let actionperformed
    let Activity
    if (action.includes('Send To')) {
      actionperformed = 'SendTo'
    } else {
      actionperformed = action
    }
    if (action === 'Assigned') {
      const ActivityName = (radioEnable ? 'Self Assigned' : 'Assigned To Other')
      Activity = ActivityName
    } else {
      Activity = actionperformed
    }
    // AssignedToID = Number(SelectedSendToUser)
    console.log(AssignedToID)
    // StatusID = status
    const batchGuid = generateUUID()
    const changeSetId = generateUUID()
    const batchRequestHeader = {
      'X-RequestDigest': jQuery('#__REQUESTDIGEST').val(),
      'Content-Type': 'multipart/mixed; boundary="batch_' + batchGuid + '"'
    }
    const endpoint = SITE_URL + '/_api/$batch'
    toStoreNotificationsData(selectedArray, Activity, batchGuid, changeSetId, actionperformed, status, endpoint, batchRequestHeader)
  }
  function toStoreNotificationsData (assignedArray: any, Activity: any, batchGuid: any, changeSetId: any, action: any, status: any, endpoint: any, batchRequestHeader: any) {
    const role = (loginuserroles.loginuserrole === 'NAFFA Owners' ? (data[0].Status.Title === 'Responded' ? 'AFIMSC' : data[0].Status.Title) : loginuserroles.loginuserrole)
    const userd = $.Deferred()
    let notifications = []
    let actions = []
    notifications = NotificationsMetadata?.filter(function (n: any) { return (n.Activity === Activity && n.StatusId === Number(status) && n.Title === role && n.AlertType === 'Notification') })
    actions = NotificationsMetadata?.filter(function (a: any) { return (a.Activity === Activity && a.StatusId === Number(status) && a.Title === role && a.AlertType === 'Action') })

    if (actions !== undefined && actions.length > 0) {
      const actionId = (actions !== undefined ? actions[0].Id.toString() : '')
      const actionsubject = actions !== undefined ? actions[0].Subject : ''
      const actiongroups = actions !== undefined ? makeArray(actions[0].ToUserRoles) : []
      allActionUsers = []
      const alertdeferredsaction = GetSomeDeferredStuff(actiongroups, 'Action', Activity)
      $.when.apply(null, alertdeferredsaction).done(function () {
        const batchbody : any = generateActionsBatchBody(assignedArray, Activity, batchGuid, changeSetId, notificationsList, action, status, role, actionsubject, actionId)
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
      let alertdeferreds : any
      $(assignedArray).each(function (i, v) {
        // AssignedToID = v.AssignedToId
        alertdeferreds = GetNotificationsStuff(notificationgroups, 'Notification', v, Activity)
      })
      // const alertdeferreds = GetSomeDeferredStuff(notificationgroups, 'Notification', Activity)
      $.when.apply(null, alertdeferreds).done(function () {
        const batchbody = generateNotificationsBatchBody(assignedArray, Activity, batchGuid, changeSetId, notificationsList, action, status, role, notisubject)
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
  }
  function generateNotificationsBatchBody (assignedArray: any, Activity: any, batchGuid: any, changeSetId: any, listname: any, action: any, status: any, role: any, notisubject: any) {
    let batchContents = []
    // const curr_item_configData = alasql("SELECT * FROM ? where UserRole == COALESCE('" + role + "',UserRole) AND Event == COALESCE('" + action + "',Event)", [NotificationsMetadata])
    $(assignedArray).each((_i: any, v: any) => {
      const newstsid = (status !== undefined && status !== null && status !== '' ? status : StatusID)
      let notiSub = notisubject
      const itemType = GetItemTypeForListName(listname)
      notiSub = notiSub.replace(/\[Question ID]/g, '' + v.QuestionTitle + '')
      if (Activity === 'Self Assigned') {
        notiSub = notiSub.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
      } else if (Activity === 'Assigned To Other') {
        notiSub = notiSub.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
        notiSub = notiSub.replace(/\[Assigned by User Name]/g, LoginUserName().UserName)
      } else if (Activity === 'Elevated') {
        notiSub = notiSub.replace(/\[Elevated by User Name]/g, LoginUserName().UserName)
      } else if (Activity === 'SendTo') {
        notiSub = notiSub.replace(/\[Sent by User Name]/g, LoginUserName().UserName)
      }

      if (allNotificationUsers.length > 0) {
        $(allNotificationUsers).each(function (i, n) { // creating headers for notifications
          if (parseInt(v.itemId) === parseInt(n.ID)) {
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
              Subject: notiSub,
              QuestionID: v.QuestionID,
              QuestionItemID: v.itemId.toString(),
              ItemGUID: v.itemGUID
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
          }
        })
      }
    })
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
  function generateActionsBatchBody (assignedArray: any, Activity: any, batchGuid: any, changeSetId: any, listname: any, action: any, status: any, role: any, notisubject: any, notificationId: any) {
    let batchContents: string[] = []
    listname = ListNames().NotificationsList
    // const curr_item_configData = alasql("SELECT * FROM ? where UserRole == COALESCE('" + role + "',UserRole) AND Event == COALESCE('" + action + "',Event)", [NotificationsMetadata])
    $(assignedArray).each((_i: any, v: any) => {
      const test = v.status
      console.log(v.QuestionTitle)
      const newstsid = (status !== undefined && status !== null && status !== '' ? status : StatusID)
      let notiSub = notisubject
      notiSub = notiSub.replace(/\[Question ID]/g, '' + v.QuestionTitle + '')
      if (Activity === 'Self Assigned') {
        notiSub = notiSub.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
      } else if (Activity === 'Assigned To Other') {
        notiSub = notiSub.replace(/\[Assigned Technician Name]/g, SelectedAssignToUserEmail.Name)
        notiSub = notiSub.replace(/\[Assigned by User Name]/g, LoginUserName().UserName)
      } else if (Activity === 'Elevated') {
        notiSub = notiSub.replace(/\[Elevated by User Name]/g, LoginUserName().UserName)
      } else if (Activity === 'SendTo') {
        notiSub = notiSub.replace(/\[Sent by User Name]/g, LoginUserName().UserName)
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
            Subject: notiSub,
            QuestionID: v.QuestionID,
            QuestionItemID: v.itemId.toString(),
            ItemGUID: v.itemGUID
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
    })
    // END changeset to update data
    batchContents.push('--changeset_' + changeSetId + '--')
    // generate the body of the batch
    let batchBody: any = batchContents.join('\r\n')
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
                email: radioEnable ? LoginUserName().UserId : AssignedToID,
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
  function GetNotificationsStuff (groups: any, flag: any, QuesItem: any, Activity: any) {
    // if pushing a notification to a individual user, use their id.
    // AssignedToID = Number(SelectedSendToUser)
    const deferreds: any = []
    if (groups.length > 0) {
      $(groups).each(function (i, v) {
        const val = v
        console.log(val)
        if (val.indexOf('ActiveUserExcludedAssignedUsers') === 0) {
          let AssignedUsers: any = []
          if (QuesItem.AssignedUsers && QuesItem.AssignedUsers.length > 0) {
            $.each(QuesItem.AssignedUsers, function (i, v) {
              AssignedUsers = AssignedUsers.concat(v.Id)
            })
          }
          $(AssignedUsers).each(function (index, item) {
            if (LoginUserName().UserId !== item && item !== AssignedToID) {
              allNotificationUsers.push({
                email: item,
                flag: flag,
                ID: QuesItem.itemId
              })
            }
          })
        } else if (val.indexOf('AssignedUsers') === 0) {
          let AssignedUsers: any = []
          if (QuesItem.AssignedUsers && QuesItem.AssignedUsers.length > 0) {
            $.each(QuesItem.AssignedUsers, function (i, v) {
              AssignedUsers = AssignedUsers.concat(v.Id)
            })
          }
          $(AssignedUsers).each(function (index, item) {
            if (item !== AssignedToID) {
              allNotificationUsers.push({
                email: item,
                flag: flag,
                ID: QuesItem.itemId
              })
            }
          })
        } else if (val.includes('AssignedToIfNotSame')) {
          if ((loginuserroles.loginuserrole === 'AFIMSC') && (Activity === 'Elevated' || Activity === 'SendTo')) {
            allNotificationUsers.push({
              email: LoginUserName().UserId,
              flag: flag,
              ID: QuesItem.itemId
            })
          } else if (LoginUserName().UserId !== AssignedToID && AssignedToID !== '' && AssignedToID != null && AssignedToID !== undefined) {
            if (flag === 'Notification' && Activity !== 'Elevated') {
              allNotificationUsers.push({
                email: AssignedToID,
                flag: flag,
                ID: QuesItem.itemId
              })
            } else if (flag === 'Action') {
              allActionUsers.push({
                email: AssignedToID,
                flag: flag
              })
            }
          }
        } else if (val === 'Customer') {
          const getcustomerInfoUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/siteusers/getbyemail('" + QuesItem.DutyEmail + "')"
          const getcustomerinfod = $.Deferred()
          deferreds.push(getData(getcustomerInfoUrl, getcustomerinfod, true).then(function (data: any) {
            if (flag === 'Notification') {
              allNotificationUsers.push({
                email: data.d.Id,
                flag: flag,
                ID: QuesItem.itemId
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
                email: radioEnable ? LoginUserName().UserId : AssignedToID,
                flag: flag,
                ID: QuesItem.itemId
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
  function AddDiscussionItem (comment: any, userval: any, curStatus: any, status: any, role: any, UserId: any, Action: any, dt: any, actionbtn: any) {
    const list = sp.web.lists.getByTitle(ListNames().QuestionsDiscussionsList)
    const batch = sp.web.createBatch()
    selectedArray.forEach(function (item: any) {
      list.items.inBatch(batch).add({
        Title: Action,
        Comment: comment,
        QuestionsItemID: item.itemId,
        ItemGUID: item.itemGUID,
        Role: role,
        IsActionComment: true,
        CommentType: 'Private',
        ItemCreated: dt,
        ItemCreatedById: LoginUserName().UserId
      })
    })
    batch.execute().then(d =>
      hidepopups(userval, UserId, actionbtn)
    )
  }

  function hidepopups (userval: any, UserId: any, actionbtn: any) {
    const SITE_URL = _spPageContextInfo.webAbsoluteUrl
    selectedArray.forEach(function (item: any) {
      const URL = SITE_URL + '/SitePages/Home.aspx#/Detailedviewpage/' + item.itemGUID
      if (actionbtn === 'Assigned') {
        const clickheretext = "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to review and respond to the question."
        let subject = ''
        if (UserId === LoginUserName().UserId) {
          subject = 'Question ' + "'" + item.QuestionTitle + "'" + ' has been assigned to ' + "'" + SelectedAssignToUserEmail.Name + "'" + ''
        } else {
          subject = 'Question ' + "'" + item.QuestionTitle + "'" + ' has been assigned to ' + "'" + SelectedAssignToUserEmail.Name + "'" + ' by ' + "'" + LoginUserName().UserName + "'" + ''
        }
        const bodytext = 'This question has been assigned for your action.'
        const to = SelectedAssignToUserEmail.Email
        const body = emailBody(bodytext, clickheretext)
        sendEmails(EmailTexts().FROM, to, subject, body)
      } else if (actionbtn === 'Elevated') {
        const sendEmail: any = []
        let to = ''
        if (UserId !== null && UserId !== undefined) {
          to = SelectedElevateToUserEmail.Email
        } else {
          to = userval
        }
        sendEmail.push({
          to: item.DutyEmail,
          subject: 'Question ' + "'" + item.QuestionTitle + "'" + ' has been elevated to ' + userval + ' for action.',
          bodytext: '',
          clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
        })
        sendEmail.push({
          to: to,
          subject: 'Question ' + "'" + item.QuestionTitle + "'" + ' has been elevated to ' + userval + '.',
          bodytext: '',
          clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to review and respond to the question."
        })
        if (sendEmail && sendEmail.length > 0) {
          $(sendEmail).each(function (index, item) {
            const body = emailBody(item.bodytext, item.clickHereText)
            sendEmails(EmailTexts().FROM, item.to, item.subject, body)
          })
        }
      } else {
        const sendEmail: any = []
        let to = ''
        if (UserId !== null && UserId !== undefined) {
          to = SelectedSendToUserEmail.Email
        } else {
          to = userval
        }
        sendEmail.push({
          to: item.DutyEmail,
          subject: 'Question ' + "'" + item.QuestionTitle + "'" + ' has been sent to ' + userval + ' for action.',
          bodytext: '',
          clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to view the question."
        })
        sendEmail.push({
          to: to,
          subject: 'Question ' + "'" + item.QuestionTitle + "'" + ' has been sent to ' + userval + '.',
          bodytext: '',
          clickHereText: "Please <a style=\"FONT-SIZE: 12px; TEXT-DECORATION: none; VERTICAL-ALIGN: top; FONT-WEIGHT: 600; COLOR: #199059; MARGIN-LEFT: 2px; MARGIN-RIGHT: 2px\" href='" + URL + "'>Click Here</a> to review and respond to the question."
        })
        if (sendEmail && sendEmail.length > 0) {
          $(sendEmail).each(function (index, item) {
            const body = emailBody(item.bodytext, item.clickHereText)
            sendEmails(EmailTexts().FROM, item.to, item.subject, body)
          })
        }
      }
    })
    setshowActionpopups({
      ...showActionpopups,
      showAssignTopopup: false,
      showSendTopopup: false,
      showElevateTopopup: false
    })
    setloaderState(false)
    props.actionPerformed()
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

  return (
        <>
          {btnshowhide.SendTo
            ? <li className="liSendTobtn">
                <a href="javascript:void(0)" title="Send To" className="anchorglobalbtn" onClick={showhideSendTo}> <span className="icon-GraphSearch"></span> Send To</a>
                {showActionpopups.showSendTopopup
                  ? <div className='divactionpopup divglobalpopup divSendTo'>
                    <div className="row">
                      <div className="col-md-12 col-xs-12">
                          <div className="divformgroup">
                              <label htmlFor="selectdropdownSendTo">Send To <span className="mandatory">*</span></label>
                              <span className="icon-Info">
                                  <span className="info-tooltip">
                                      <span className="classic">
                                          <span className="tooltipdescp">
                                            <p>Send To </p>
                                          </span>
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
                              <span style = {{ display: SendToValidations.SendTo ? '' : 'none' }} className="errormsg">Please Select Dropdown</span>
                          </div>
                      </div>
                      {ShowSendToUser
                        ? <div className="col-md-12 col-xs-12">
                          <div className="divformgroup">
                              <label htmlFor="selectdropdownSelectUser">Select User </label>
                              <span className="icon-Info">
                                  <span className="info-tooltip">
                                      <span className="classic">
                                          <span className="tooltipdescp">
                                            <p>Select User </p>
                                          </span>
                                      </span>
                                  </span>
                              </span>
                              {buildSendToUsersddl(SendToUsers)}
                              <span className="errormsgs hidecomponent">
                                  Please Select Dropdown</span>
                          </div>
                        </div>
                        : null}
                      <div className="col-md-12 col-xs-12">
                          <div className="divformgroup">
                              <label htmlFor="InputSelfcomments">Comment <span className="mandatory">*</span> </label>
                              <span className="icon-Info">
                                  <span className="info-tooltip">
                                      <span className="classic">
                                          <span className="tooltipdescp">
                                            <p>Comment </p>
                                          </span>
                                      </span>
                                  </span>
                              </span>
                              <textarea name="comment" id="InputSelfcomments" placeholder="Enter your Comment" aria-label="Comment" aria-required="true" onChange={SendToComment}></textarea>
                              <span style = {{ display: SendToValidations.Comment ? '' : 'none' }} className="errormsg">Please enter comment</span>
                          </div>
                      </div>
                    </div>
                    <div className="divpopupbtns">
                        <ul>
                            <li className="OkBtn"><a href="javascript:void(0)" title="Ok" onClick={SendToAction}> <span className="icon-Check"></span>
                                Ok</a></li>
                            <li className="CancelBtn"><a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideSendTo}> <span className="icon-Close"></span>
                                Cancel</a>
                            </li>
                        </ul>
                    </div>
                  </div>
                  : null}
            </li>
            : null
          }
          {btnshowhide.AssignTo
            ? <li className="liAssignTobtn">
                <a href="javascript:void(0)" title="Assign To" className="anchorglobalbtn" onClick={showhideAssignTo}> <span className="icon-Assignto"></span> Assign To</a>
                {showActionpopups.showAssignTopopup
                  ? <div className="divactionpopup divglobalpopup divAssignedTo">
                    <div className="row">
                      <div className="col-md-12 col-xs-12">
                        <div className="divradiobuttons" onChange={changeSelfOther}>
                          <label htmlFor="radioSelf">
                            <input type="radio" name="assignoptions" checked={radioEnable} value="Self" aria-label="Self" />
                              Self
                          </label>
                          <label htmlFor="radioOther">
                            <input type="radio" name="assignoptions" value="Other" checked={!radioEnable} aria-label="Other" />
                              Other
                          </label>
                        </div>
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
                            <li className="OkBtn"><a href="javascript:void(0)" title="Ok" onClick={AssignToAction}> <span className="icon-Check"></span>
                                    Ok</a></li>
                            <li className="CancelBtn"><a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideAssignTo}> <span className="icon-Close"></span>
                                    Cancel</a>
                            </li>
                        </ul>
                    </div>
                  </div>
                  : null}
            </li>
            : null
          }
          {btnshowhide.ElevateTo
            ? <li className="liElevateTobtn">
                <a href="javascript:void(0)" title="Elevate To" className="anchorglobalbtn" onClick={showhideElevateTo}> <span className="icon-Elevate"></span> Elevate To</a>
                {showActionpopups.showElevateTopopup
                  ? <div className="divactionpopup divglobalpopup divElevatepopup" id="dicElevateToPopup">
                      <div className="row">
                        <div className="col-md-12 col-xs-12">
                          <div className="divformgroup">
                              <label htmlFor="SelectDropdownElevateTo ">Elevate To <span className="mandatory">*</span> </label>
                              <span className="icon-Info">
                                  <span className="info-tooltip">
                                      <span className="classic">
                                          <span className="tooltipdescp">
                                              <p>Elevate To </p>
                                          </span>
                                      </span>
                                  </span>
                              </span>
                              <select name="Elevate To" aria-label="Elevate To" aria-required="true">
                              {ElevateToOptions && ElevateToOptions.length > 0
                                ? ElevateToOptions.map((val: any) =>
                                    <option key={val} value={val}>{val}</option>
                                )
                                : <option value='None'>None</option>
                                }
                              </select>
                              <span className="errormsgs hidecomponent">
                                  Please select dropdown</span>
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
                                            <span className="tooltipdescp">
                                                <p>Comment </p>
                                            </span>
                                        </span>
                                    </span>
                                </span>
                                <textarea name="comment" placeholder="Enter your Comment" aria-label="Comment" onChange={ElevateToComment}></textarea>
                                <span style = {{ display: ElevateToValidations ? '' : 'none' }} className="errormsg">Please enter comment</span>
                            </div>
                        </div>
                      </div>
                      <div className="divpopupbtns">
                          <ul>
                              <li className="OkBtn"><a href="javascript:void(0)" title="Ok" onClick={ElevateAction}> <span className="icon-Check"></span>
                                      Ok</a></li>
                              <li className="CancelBtn"><a href="javascript:void(0)" title="Cancel" className="cancelbtn globalcancelbtn" onClick={showhideElevateTo}> <span className="icon-Close"></span>
                                      Cancel</a>
                              </li>
                          </ul>
                      </div>
                  </div>
                  : null}
            </li>
            : null
          }
            <li className="liExcelbtn" style={{ display: props.data.length !== 0 ? '' : 'none' }}>
                <a href="javascript:void(0)" title="Export to Excel" className="anchorglobalbtn" onClick={() => exportfunction()}> <span className="icon-Exporttoexcel"></span> Export to Excel</a>
            </li>
            <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
              <div className="copying">
                    <p id="displaytext">Working on it</p>
                    <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                </div>
            </div>
        </>
  )
}

export default QuestionActionbtns
