import React, { useState, useEffect } from 'react'
import { NavLink as Link } from 'react-router-dom'
import styled from 'styled-components'
import { GlobalConstraints, compareDates, LoginUserName, convertDate, GetUserGroups, getNumberofDays, LoginUserDetails, GetBuildModifiedList } from '../../pages/Master'
import { ListNames } from '../../pages/Config'
import { sp } from '@pnp/sp'

export const Navlink = styled(Link)`  
    
}`

const Notificationssec = () => {
  let userrole = ''
  const SITE_URL = _spPageContextInfo.webAbsoluteUrl
  const sitename = GlobalConstraints().siteName
  const listName = ListNames().NotificationsList
  const [ToggleState, setToggleState] = useState(1)
  const [showNotificationAddPopup, setNotificationshowAddPopup] = useState(false)
  const [NotificationsData, setNotificationsData] = useState<any>([])
  const [AllNotifications, setAllNotifications] = useState<any>([])
  const [Notifications, setNotifications] = useState<any>([])
  const [Actions, setActions] = useState<any>([])
  const [FilterByddl, setFilterByddl] = useState('')
  const [Dateddl, setDateddl] = useState('')
  const [unReadNotificationscount, setunReadNotificationscount] = useState(0)
  const [unReadactioncount, setunReadactioncount] = useState(0)
  const [unReadNoticount, setunReadNoticount] = useState(0)
  const [SelectFilterVal, setSelectFilterVal] = useState({
    FilterBy: 'ALL',
    Date: 'ALL'
  })
  const [ddlChange, setddlChange] = useState(false)
  const toggleTab = (index: React.SetStateAction<number>) => {
    setToggleState(index)
  }
  const [time, setTime] = useState(Date.now())
  const getActiveClass = (index: number, className: string) =>
    ToggleState === index ? className : ''

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    GetUserGroups().then(function () {
      const UserDetails = JSON.parse(localStorage.getItem('UserGroupNames' + sitename) || '{}')
      if (UserDetails && UserDetails.length > 0) {
        $.each(UserDetails, function (i, v) {
          if (UserDetails.length - 1 === i) {
            userrole = userrole + "To eq '" + v.Title + "'"
          } else {
            userrole = userrole + "To eq '" + v.Title + "' or "
          }
        })
      } else {
        userrole = userrole + "To eq 'Customer'"
      }
      togetNotificationsData()
    })
    const interval = setInterval(() => {
      setTime(Date.now())
      const lastmodifieddate = localStorage.getItem('NotificationsListBuildModifiedListDate' + sitename) || ''
      const oldmodifieddate = localStorage.getItem('NotificationsList_LMDate' + sitename)
      const needToUpdate = compareDates(lastmodifieddate, oldmodifieddate)
      if (needToUpdate || sessionStorage.getItem('NotificationsData' + sitename) === null) { togetNotificationsData() }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  $(document).on('click', '#notify', function (e) {
    $('#notificationpopup').toggleClass('hidecomponent')
  })

  const togetNotificationsData = () => {
    const lastmodifieddate = localStorage.getItem('NotificationsListBuildModifiedListDate' + sitename) || ''
    const oldmodifieddate = localStorage.getItem('NotificationsList_LMDate' + sitename)
    const needToUpdate = compareDates(lastmodifieddate, oldmodifieddate)
    let notifydata: any = []
    if (needToUpdate || sessionStorage.getItem('NotificationsData' + sitename) === null) {
      const list = sp.web.lists.getByTitle(listName)
      const endpoint = ['ID', 'QuestionID', 'QuestionItemID', 'ItemGUID', 'FromUser', 'UserRole', 'Event', 'To', 'Read/Id', 'Read/Title', 'AlertType', 'Subject', 'IsRead', 'Status/ID', 'Status/Title', 'Modified', 'Created']
      const expand = ['Status', 'Read']
      list.items.select('' + endpoint + '').expand('' + expand + '').filter('(' + userrole + ' or To eq ' + LoginUserName().UserId + ') and IsRead eq false').orderBy('Modified', false).top(5000).get().then(function (items) {
        if (items && items.length > 0) {
          $.each(items, function (i, item) {
            const Read = (item.Read && item.Read !== undefined && item.Read !== null ? item.Read : '')
            notifydata.push({
              ID: item.ID,
              QuestionID: item.InquiryID,
              QuestionItemID: item.InquiryItemID,
              AlertType: item.AlertType,
              Action: item.Event,
              StatusID: item.Status.ID,
              StatusTitle: item.Status.Title,
              UserRole: item.UserRole,
              Modified: item.Modified,
              Subject: item.Subject,
              EmailBody: item.EmailBody,
              EmailID: item.To,
              Read: Read,
              Isread: item.IsRead,
              Created: item.Created,
              ItemGUID: item.ItemGUID
            })
          })
        }
        sessionStorage.setItem('NotificationsData' + sitename, JSON.stringify(notifydata))
        localStorage.setItem('NotificationsList_LMDate' + sitename, lastmodifieddate)
        setNotificationsData(notifydata)
        buildNotifications(notifydata)
      })
    } else {
      notifydata = (sessionStorage.getItem('NotificationsData' + sitename) !== undefined && sessionStorage.getItem('NotificationsData' + sitename) !== '' && sessionStorage.getItem('NotificationsData' + sitename) !== null ? JSON.parse(sessionStorage.getItem('NotificationsData' + sitename) || '{}') : [])
      setNotificationsData(notifydata)
      buildNotifications(notifydata)
    }
  }

  function buildNotifications (notifydata: any) {
    let count = notifydata.length
    let unReadAction = 0
    let unReadNotification = 0
    const allnotify: any = []
    const actions: any = []
    const notifications: any = []
    if (notifydata != null && notifydata !== undefined && notifydata.length > 0) {
      $.each(notifydata, function (i, v) {
        allnotify.push(v)
        if (v.AlertType === 'Action') {
          actions.push(v)
        } else if (v.AlertType === 'Notification') {
          notifications.push(v)
        }
        $.each(v.Read, function (i, n) {
          if (n.Id === LoginUserName().UserId || v.Isread === true) {
            count--
            if (v.AlertType === 'Action') {
              unReadAction++
            } else {
              unReadNotification++
            }
          }
        })
      })
    }
    setunReadactioncount(actions.length - unReadAction)
    setunReadNoticount(notifications.length - unReadNotification)
    setunReadNotificationscount(count)
    setAllNotifications(allnotify)
    setActions(actions)
    setNotifications(notifications)
  }

  function removehtmltags (data: any) {
    return data.replace(/<[^>]+>/g, '')
  }

  function displayDate (date: any) {
    const Inquirydate = convertDate(date, 'date')
    const Date = Inquirydate.split(' ')
    return '' + Date[0] + ' | ' + Date[1] + ' ' + Date[2] + ''
  }

  function readunread (items: any) {
    let ItemRead
    // const Read: any = item.Read
    $(items.Read).each(function (index, item) {
      if (item.Id === LoginUserName().UserId) {
        ItemRead = true
      }
    })
    const isreadcls = (ItemRead === true ? 'read' : 'unread')
    return isreadcls
  }

  function circleiconclass (item: any) {
    const iconclass = (item.AlertType === 'Action' ? 'cricle-action' : 'cricle-notifications')
    return iconclass
  }

  const handleOnChange = (e: any) => {
    const ddlid = e.currentTarget.id
    const ddlvalue = e.currentTarget.value
    if (ddlid === 'filterby') {
      setFilterByddl(ddlvalue)
      setSelectFilterVal({ ...SelectFilterVal, FilterBy: ddlvalue })
    } else if (ddlid === 'selectdate') {
      setDateddl(ddlvalue)
      setSelectFilterVal({ ...SelectFilterVal, Date: ddlvalue })
    }
    setddlChange(true)
  }

  useEffect(() => {
    if (ddlChange === true) {
      ddlChangeFilterdata()
    }
  }, [ddlChange])

  const ddlChangeFilterdata = () => {
    const filtervals: any = []
    setSelectFilterVal({
      ...SelectFilterVal,
      FilterBy: FilterByddl,
      Date: Dateddl
    })

    if (NotificationsData.length > 0) {
      const NotifyFilter: any = (FilterByddl === 'Read' ? true : FilterByddl === 'UnRead' ? false : 'ALL')
      for (let i = 0; i < NotificationsData.length; i++) {
        let ItemRead = false
        $(NotificationsData[i].Read).each(function (index, item) {
          if (item.Id === LoginUserName().UserId) {
            ItemRead = true
          }
        })
        let submitteddatescalc: any = getNumberofDays(NotificationsData[i].Created)
        submitteddatescalc = (submitteddatescalc < 0 || isNaN(submitteddatescalc) ? 0 : submitteddatescalc)
        if (((NotifyFilter === '' || NotifyFilter === null || NotifyFilter === 'ALL') ? true : NotifyFilter === ItemRead) && (Dateddl === 'ALL' || Dateddl === null || Dateddl === '' ? true : Dateddl === '16' ? submitteddatescalc > Dateddl : submitteddatescalc <= Dateddl)) {
          filtervals.push(NotificationsData[i])
        }
      }
      buildNotifications(filtervals)
      setddlChange(false)
    }
  }

  const MarkasRead = (alerttype: any) => {
    let notifications
    if (alerttype === 2) {
      notifications = Actions
    } else if (alerttype === 3) {
      notifications = Notifications
    }

    notifications = (notifications != null && notifications != undefined && notifications != 'undefined' && notifications != '' ? notifications : [])
    const batchContents = []
    const loginUserGroupIds : any = localStorage.getItem('UserGroupIds' + sitename)
    $(notifications).each(function (i, n) {
      if (alerttype === 3 || alerttype === 2) {
        let ReadUsers: any[] = []
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
        if ((n.AlertType == 'Notification' || n.AlertType == 'Action') && UserRead == false) {
          const list = sp.web.lists.getByTitle(ListNames().NotificationsList)
          const batch = sp.web.createBatch()
          list.items.getById(n.ID).update({
            ReadId: { results: ReadUsers }
            // Title: 'test'
          }).then(function () {
            NotificationsBuildmodifiedListUpdate()
            localStorage.setItem('NotificationsList_LMDate' + sitename, '')
          })
        }
      }
    })
  }
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
  return (
        <>
            <a href='javascript:void(0)' title='Notifications' className='BtnNotification' onClick={() => {
              setNotificationshowAddPopup(!showNotificationAddPopup)
              $('.divnotificationpopup').show()
            }}>
                <span className='icon-Notification'></span>
                <span className='spannotifycount notify-count'>{unReadNotificationscount}</span>
            </a>
            {showNotificationAddPopup
              ? (
                <div className="divnotificationpopup ">
                <span className="spanarrowup"></span>
                <span className='spananchorcloseBtn' onClick={() => { setNotificationshowAddPopup(false) }} title="Close"><span className='icon-Close'></span></span>
                <div className="divpopupheader">
                    <h1>
                        <span className="icon-Notification"></span> Alerts
                    </h1>
                    <div className='divnotificationfilters'>
                        <div className='divitem'>
                            <div className="divforminline">
                                <label htmlFor="FilterBy">Filter By</label>
                                <select name="Filter By" id='filterby' value={SelectFilterVal.FilterBy} onChange={(e) => handleOnChange(e)}>
                                    <option value="ALL">ALL</option>
                                    <option value="Read">Read </option>
                                    <option value="UnRead">UnRead </option>
                                </select>
                            </div>
                        </div>
                        <div className='divitem'>
                            <div className="divforminline">
                                <label htmlFor="date">Date</label>
                                <select name="Date" id='selectdate' value={SelectFilterVal.Date} onChange={(e) => handleOnChange(e)}>
                                    <option value="ALL" >ALL</option>
                                    <option value="3" >Last 3</option>
                                    <option value="5">Last 5</option>
                                    <option value="7" >Last 7</option>
                                    <option value="10">Last 10</option>
                                    <option value="15">Last 15</option>
                                    <option value="16">More than 15</option>
                                </select>
                                <span className="spandays">days</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-md-12 col-sm-12 col-xs-12'>
                        <div className='divnotificationtabs'>
                            <div className='divtabsheader'>
                                <ul>
                                    <li className={`tabs ${getActiveClass(1, 'active')}`} onClick={() => toggleTab(1)} title="All">
                                        ALL <span className="spannoticount allnotifycount">({AllNotifications.length})</span>
                                    </li>
                                    <li className={`tabs ${getActiveClass(2, 'active')}`} onClick={() => toggleTab(2)} title="Actions">
                                        <span className="cricle-action"></span> Actions <span className="spannoticount actionscount">({Actions.length})</span>
                                    </li>
                                    <li className={`tabs ${getActiveClass(3, 'active')}`} onClick={() => toggleTab(3)} title="Notifications">
                                        <span className="cricle-notifications"></span> Notifications <span className="spannoticount notificationscount">({Notifications.length})</span>
                                    </li>
                                </ul>
                                {
                                   (ToggleState === 3 && unReadNoticount > 0)
                                     ? (
                                    <span className="notificationmark" >
                                    <a href="javascript:void(0)" onClick = {() => MarkasRead(ToggleState)} title= 'Mark All as Read'>Mark All as Read</a>
                                      </span>
                                       )
                                     : ''
                                }

                            </div>
                        </div>
                        <div className="divnotificationtabscontent">
                            <div className="tab-info-loader hidecomponent">
                                <div className="loader">
                                    <p>Please wait</p>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                            <div className={`divtabcontent ${getActiveClass(1, 'divactivecontent')}`} id='all'>
                                <div className='divtabinfo scrollbar'>
                                    <ul>
                                        {AllNotifications && AllNotifications.length > 0
                                          ? AllNotifications.map((item: any) =>
                                            <li id = {String(time)} key={item.ID} className={readunread(item)}>
                                                <Link to={{ pathname: `/Detailedviewpage/${item.ItemGUID}` }} onClick={() => {
                                                  document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${item.ItemGUID}`
                                                  window.location.reload()
                                                }} data-itemID={item.ItemGUID}>
                                                    <span className={circleiconclass(item)}></span>
                                                    <span className='spannoti'>{removehtmltags(item.Subject)}</span>
                                                    <span className="spannotificationdate">{displayDate(item.Created)}</span>
                                                </Link>
                                            </li>
                                          )
                                          : <div className="divnoresults"> There are no results to display </div>}
                                    </ul>
                                </div>
                            </div>
                            <div className={`divtabcontent ${getActiveClass(2, 'divactivecontent')}`} id="Actions">
                                <div className='divtabinfo scrollbar'>
                                    <ul>
                                        {Actions && Actions.length > 0
                                          ? Actions.map((item: any) =>
                                            <li key={item.ID} className={readunread(item)}>
                                                <Link to={{ pathname: `/Detailedviewpage/${item.ItemGUID}` }} onClick={() => {
                                                  document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${item.ItemGUID}`
                                                  window.location.reload()
                                                }} data-itemID={item.ItemGUID}>
                                                    <span className="cricle-action"></span>
                                                    <span className='spannoti'>{removehtmltags(item.Subject)}</span>
                                                    <span className="spannotificationdate">{displayDate(item.Created)}</span>
                                                </Link>
                                            </li>
                                          )
                                          : <div className="divnoresults"> There are no results to display </div>}
                                    </ul>
                                </div>
                            </div>
                            <div className={`divtabcontent ${getActiveClass(3, 'divactivecontent')}`} id="Notifications">
                                <div className='divtabinfo scrollbar'>
                                    <ul>
                                        {Notifications && Notifications.length > 0
                                          ? Notifications.map((item: any) =>
                                            <li key={item.ID} className={readunread(item)}>
                                                <Link to={{ pathname: `/Detailedviewpage/${item.ItemGUID}` }} onClick={() => {
                                                  document.location = `${window.location.origin + window.location.pathname}#/Detailedviewpage/${item.ItemGUID}`
                                                  window.location.reload()
                                                }}data-itemID={item.ItemGUID}>
                                                    <span className="cricle-notifications"></span>
                                                    <span className='spannoti'>{removehtmltags(item.Subject)}</span>
                                                    <span className="spannotificationdate">{displayDate(item.Created)}</span>
                                                </Link>
                                            </li>
                                          )
                                          : <div className="divnoresults"> There are no results to display </div>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                )
              : ''}
        </>
  )
}

export default Notificationssec
