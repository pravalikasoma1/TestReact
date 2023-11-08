import React from 'react'
import dateFormat from 'dateformat'
import { format } from 'date-fns'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '@pnp/sp/site-users/web'
import '@pnp/sp/site-groups'
import { HardCodedNames, ListNames } from '../pages/Config'

export async function GetUserGroups () {
  const UserGroupNames: any = []
  const UserGroupIds: any = []
  const siteName = _spPageContextInfo.webAbsoluteUrl.split('/').pop()
  await sp.web.getUserById(_spPageContextInfo.userId).groups().then(function (usergroups) {
    usergroups?.map(item => {
      UserGroupNames.push({ Title: item.Title })
      UserGroupIds.push({ Id: item.Id })
    })
    localStorage.setItem('UserGroupNames' + siteName, JSON.stringify(UserGroupNames))
    localStorage.setItem('UserGroupIds' + siteName, JSON.stringify(UserGroupIds))
  })
}

export function GetUsersfromGroups (groupname: any) {
  const groupusers: any = []
  sp.web.siteGroups.getByName(groupname).users().then(function (users: any) {
    if (users && users.length > 0) {
      groupusers.push({
        Name: users.Title,
        Email: users.UserPrincipalName,
        Id: users.Id
      })
    }
  })
  return groupusers
}

export function LoginUserDetails () {
  const loginuserdetails: any = []
  let isNAFFAOwner = false; let isAFIMSC = false; let isSAFFMCEB = false; let isSME = false; let isAFSVC = false
  let isOwners = false; let isAFIMSCOwner = false
  let isRoleExist = false; let isSubmitter = false; let isEnterpriselevel = false; let isBaselevel = false; let loginuserrole = ''
  const siteName = _spPageContextInfo.webAbsoluteUrl.split('/').pop()
  const UserDetails = JSON.parse(localStorage.getItem('UserGroupNames' + siteName) || '{}')
  const isSiteAdmin = _spPageContextInfo.isSiteAdmin
  if (UserDetails && UserDetails.length > 0) {
    for (let i = 0; i < UserDetails.length; i++) {
      const v = UserDetails[i].Title

      if (v.indexOf('NAFFA Owners') > -1 || v === 'NAFFA Owners') {
        isNAFFAOwner = true
        isRoleExist = true
        isSubmitter = false
        loginuserrole = v
      } else {
        if (v.indexOf('AFIMSC') > -1) {
          if (v.indexOf('Owners') > -1) {
            isAFIMSCOwner = true
            isOwners = true
            isSubmitter = false
            loginuserrole = v
          } else {
            isAFIMSC = true
            isRoleExist = true
            isSubmitter = false
            loginuserrole = v
          }
          isEnterpriselevel = true
        } else if (v.indexOf('SAF FMCEB') > -1) {
          isSAFFMCEB = true
          isRoleExist = true
          isEnterpriselevel = true
          isSubmitter = false
          loginuserrole = v
        } else if (v.indexOf('SME') > -1) {
          isSME = true
          isRoleExist = true
          isBaselevel = true
          isSubmitter = false
          loginuserrole = v
        } else if (v.indexOf('AFSVC') > -1) {
          isAFSVC = true
          isRoleExist = true
          isBaselevel = true
          isSubmitter = false
          loginuserrole = v
        } else {
          if (!isRoleExist && !isOwners) {
            isSubmitter = true
            loginuserrole = v
          } else { isSubmitter = false }
        }
      }
    }
    loginuserdetails.push({
      isSiteAdmin: isSiteAdmin,
      isNAFFAOwner: isNAFFAOwner,
      isAFIMSC: isAFIMSC,
      isSAFFMCEB: isSAFFMCEB,
      isSME: isSME,
      isAFSVC: isAFSVC,
      isEnterpriselevel: isEnterpriselevel,
      isBaselevel: isBaselevel,
      isRoleExist: isRoleExist,
      isOwners: isOwners,
      isAFIMSCOwner: isAFIMSCOwner,
      isSubmitter: isSubmitter,
      loginuserrole: loginuserrole
    })
  } else {
    loginuserdetails.push({
      isSiteAdmin: false,
      isNAFFAOwner: false,
      isAFIMSC: false,
      isSAFFMCEB: false,
      isSME: false,
      isAFSVC: false,
      isEnterpriselevel: false,
      isBaselevel: false,
      isRoleExist: false,
      isSubmitter: true,
      loginuserrole: ''
    })
  }
  return loginuserdetails
}

export async function GetProcessFlowMetadata () {
  const listName = ListNames().ProcessFlowMetadata
  const siteName = _spPageContextInfo.webAbsoluteUrl.split('/').pop()
  const listModifiedDate = localStorage.getItem('ProcessFlowMetadataBuildModifiedListDate' + siteName) || ''
  const oldmodifieddate = localStorage.getItem('ProcessFlowMetadata_LMDate' + siteName) || ''
  const needToUpdate = compareDates(listModifiedDate, oldmodifieddate)
  const processflowmetadata = JSON.parse(localStorage.getItem('ProcessFlowMetadata' + siteName) || '{}')
  const list = sp.web.lists.getByTitle(listName)
  const endpoint = ['ID', 'Title', 'Status/ID', 'Status/Title', 'AssignTo', 'AssignToOptions', 'ElevateTo', 'ElevateToOptions', 'SendTo', 'SendToOptions', 'Respond', 'Complete', 'Cancel', 'PromoteToKB']
  const expand = ['Status']
  if (needToUpdate || (processflowmetadata === [] || processflowmetadata === '' || processflowmetadata === null || processflowmetadata === undefined)) {
    await list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
      const metadata: any = []
      if (items && items.length > 0) {
        items.map((item: any) => {
          metadata.push({
            ID: item.ID,
            Title: item.Title,
            StatusID: item.Status.ID,
            StatusTitle: item.Status.Title,
            AssignTo: item.AssignTo,
            AssignToOptions: item.AssignToOptions,
            ElevateTo: item.ElevateTo,
            ElevateToOptions: item.ElevateToOptions,
            SendTo: item.SendTo,
            SendToOptions: item.SendToOptions,
            Respond: item.Respond,
            Complete: item.Complete,
            Cancel: item.Cancel,
            PromoteToKB: item.PromoteToKB
          })
        })
      }
      localStorage.setItem('ProcessFlowMetadata' + siteName, JSON.stringify(metadata))
    }
    )
  }
}

export function GlobalConstraints () {
  const siteDetails = {
    siteName: _spPageContextInfo.webAbsoluteUrl.split('/').pop()
  }
  return siteDetails
}
export function LoginUserName () {
  const siteName = _spPageContextInfo.webAbsoluteUrl.split('/').pop()
  const userdetails = {
    UserId: _spPageContextInfo.userId,
    UserName: _spPageContextInfo.userDisplayName.toLowerCase(),
    UserEmail: _spPageContextInfo.userEmail.toLowerCase()
  }
  localStorage.setItem('LoginUserDetails' + siteName, JSON.stringify(userdetails))
  return userdetails
}
export async function GetUserProfile () {
  const siteName = _spPageContextInfo.webAbsoluteUrl.split('/').pop()
  const userprofile: any = []
  const listName = ListNames().UserProfile
  const list = sp.web.lists.getByTitle(listName)
  const endpoint = ['ID', 'AssignedComponent', 'CustomerID', 'disName', 'DoDIDNumber', 'DutyEmail', 'DutyPhone', 'Status', 'PasCode/Title', 'PasCode/ServicingCPTS', 'PasCode/ID', 'PasCode/Installation', 'PasCode/MAJCOM', 'PasCode/Organization', 'PasCode/OrgMAJCOM', 'IsArchived']
  const expand = ['PasCode']
  await list.items.select('' + endpoint + '').expand('' + expand + '').filter('CustomerID eq ' + LoginUserName().UserId + '').top(1).get().then(function (items) {
    if (items && items.length > 0) {
      items?.map(item => {
        userprofile.push({
          ID: item.ID,
          UserAssignedComponent: item.AssignedComponent,
          CustomerID: item.CustomerID,
          disName: item.disName,
          DoDIDNumber: item.DoDIDNumber,
          DutyEmail: item.DutyEmail,
          DutyPhone: item.DutyPhone,
          Status: item.Status,
          UserPasCode: item.PasCode.Title,
          UserPasCodeCPTS: item.PasCode.ServicingCPTS,
          UserPasCodeId: item.PasCode.ID,
          UserInstallation: item.PasCode.Installation,
          UserMajcom: item.PasCode.MAJCOM,
          UserOrganization: item.PasCode.Organization,
          IsArchived: item.IsArchived,
          OrgMajcom: item.PasCode.OrgMAJCOM
        })
      })
    }
    localStorage.setItem('userProfileData' + siteName, JSON.stringify(userprofile))
  })
}

export async function GetBuildModifiedList () {
  const siteName = _spPageContextInfo.webAbsoluteUrl.split('/').pop()
  const BuildModifiedListData: any = []
  const listName = ListNames().BuildModifiedList
  const list = sp.web.lists.getByTitle(listName)
  await list.items.select('Title', 'ID', 'Mcount', 'Modified').orderBy('Modified', false).get().then(function (items) {
    if (items.length > 0) {
      items?.map(item => {
        BuildModifiedListData.push({
          Id: item.ID,
          Name: item.Title,
          Mcount: item.Mcount
        })
        localStorage.setItem(item.Title + 'BuildModifiedListDate' + siteName, item.Modified)
      })
    }
    localStorage.setItem('BuildModifiedListData' + siteName, JSON.stringify(BuildModifiedListData))
  })
}

export async function getSubcategoriesMetadata () {
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
      })
    } else {
      subCategories = JSON.parse(localStorage.getItem('subCategoriesMetadata' + siteName) || '{}')
    }
  } catch (error) {
    console.log(error)
  }
}

export async function readNotificationsMetadata () {
  const NotificationsMetadata: any = []
  const listName = ListNames().NotificationsMetadataList
  const siteName = GlobalConstraints().siteName
  const list = sp.web.lists.getByTitle(listName)
  const lastmodifieddate = localStorage.getItem('NotificationsMetadataBuildModifiedListDate' + siteName) || ''
  const oldmodifieddate = localStorage.getItem('NotificationsMetadataList_LMDate' + siteName) || ''
  const needToUpdate = compareDates(lastmodifieddate, oldmodifieddate)
  if (needToUpdate) {
    await list.items.select('ID', 'Title', 'Status/Id', 'Status/Title', 'Activity', 'ToUserRoles', 'AlertType', 'Subject').expand('Status').get().then(function (items) {
      if (items && items.length > 0) {
        items?.map(item => {
          const statusid = (item.Status && item.Status !== undefined && item.Status !== null && item.Status !== '' ? item.Status.Id : '')
          const statustitle = (item.Status && item.Status !== undefined && item.Status !== null && item.Status !== '' ? item.Status.Title : '')
          NotificationsMetadata.push({
            Id: item.ID,
            StatusId: statusid,
            StatusTitle: statustitle,
            Activity: item.Activity,
            Title: tochecknotnullvalues(item.Title),
            ToUserRoles: item.ToUserRoles,
            AlertType: item.AlertType,
            Subject: item.Subject
          })
        })
      }
    })
    localStorage.setItem('NotificationsMetaData', JSON.stringify(NotificationsMetadata))
    localStorage.setItem('NotificationsMetadataList_LMDate' + siteName, lastmodifieddate)
  }
}
function tochecknotnullvalues (columnval: any) {
  const Columnvalue = (columnval == undefined || columnval == null) ? '' : columnval
  return Columnvalue
}

export function compareDates (dateA: string | number | Date | null | undefined, dateB: string | number | Date | null | undefined) {
  const newmdate = (dateA != null && dateA !== '' && dateA !== undefined ? new Date(dateA) : '')
  const oldmdate = (dateB != null && dateB !== '' && dateB !== undefined && dateB !== 'null' && dateB !== 'undefined' ? new Date(dateB) : '')
  if (oldmdate === '' || newmdate > oldmdate || newmdate === '') {
    return true
  }
  return false
}

export function convertDate (serverDate: string | number | Date | null | undefined, formatter: string) {
  let createdDate = ''
  if (serverDate !== '' && serverDate != null && serverDate !== undefined) {
    const dt = new Date(serverDate)
    // createdDate = dateFormat(dt, 'MM/dd/yyyy')
    createdDate = format(dt, 'MM/dd/yyyy')
    if (formatter === 'date') {
      // createdDate = dateFormat(dt, 'MM/dd/yyyy hh:mm tt')
      createdDate = format(dt, 'MM/dd/yyyy hh:mm a')
    } else if (formatter === 'newdate') {
      createdDate = dateFormat(dt, 'mmm dd, yyyy')
      // createdDate = format(dt, 'MM dd, yyyy')
    }
  }
  return createdDate
}

export function checkdocfileextension (val: any) {
  // eslint-disable-next-line prefer-regex-literals
  const regex = new RegExp('(.*?)\.(txt|xlsx|xls|doc|docx|ppt|pptx|pdf|png|jpg|jpeg|xlsm|XLSM|XLSX|XLS|DOC|DOCX|PPT|PPTX|PDF|PNG|JPG|JPEG|TXT)$')
  if (!(regex.test(val))) {
    return true
  } else {
    return false
  }
}

export function getFiscalYear (date: any) {
  let fyear = ''
  const currentMonth = date.getMonth() + 1
  if (currentMonth >= 10) {
    fyear = date.getFullYear() + 1
  } else {
    fyear = date.getFullYear()
  }
  return fyear
}

export function getNumberofDays (ndate: any) {
  let nodays = 0
  try {
    const start: any = new Date(ndate)
    const end: any = new Date()
    let days = (end - start) / 1000 / 60 / 60 / 24
    // which you need to offset as below
    days = days - (end.getTimezoneOffset() - start.getTimezoneOffset()) / (60 * 24)
    nodays = Math.floor(days)
  } catch (e) {
    return nodays
  }
  return nodays
}

export function sendEmails (from: any, to: any, subject: any, body: any) {
  const siteurl = _spPageContextInfo.webServerRelativeUrl
  const urlTemplate = siteurl + '/_api/SP.Utilities.Utility.SendEmail'
  const taMailBody = {
    properties: {
      __metadata: { type: 'SP.Utilities.EmailProperties' },
      From: from,
      To: { results: [to] },
      Body: body,
      Subject: subject
    }
  }
  const digest: any = $('#__REQUESTDIGEST').val()
  $.ajax({
    contentType: 'application/json',
    url: urlTemplate,
    type: 'POST',
    data: JSON.stringify(taMailBody),
    headers: {
      // eslint-disable-next-line quote-props
      'Accept': 'application/json;odata=verbose',
      'content-type': 'application/json;odata=verbose',
      'X-RequestDigest': digest
    },
    success: function (data) {
      console.log('success1')
      // AddMailnewitem(incid, usrole, action, from, to, subject, body, true, 'Success', navURL);
      // alert('success2');
    },
    error: function (data) {
      console.log('Error: ' + JSON.stringify(data))
      // AddMailnewitem(incid, usrole, action, from, to, subject, body, false, error.responseText, navURL);
    }
  })
}

export function add (url: any, items: any, requestheader: any, async: any) {
  const d = $.Deferred()
  $.ajax({
    url: url,
    type: 'POST',
    contentType: 'application/json;odata=verbose',
    data: items,
    async: async,
    headers: requestheader,
    success: function (data) {
      d.resolve(data)
    },
    error: function (xhr) { // OnError
      d.reject(jQuery.parseJSON(xhr.responseText))
    }
  })
  return d.promise()
}

export function getData (url: any, d: any, async: any) {
  $.ajax({
    url: url,
    method: 'GET',
    async: async,
    headers: {
      Accept: 'application/json; odata=verbose'
    },
    success: function (data) {
      d.resolve(data)
    }
  })
  return d.promise()
}
