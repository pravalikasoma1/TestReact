import React, { useEffect, useState } from 'react'
import { DBConfig } from './DBConfig'
import { initDB } from 'react-indexed-db'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import { IItem } from '@pnp/sp/items'
import '@pnp/sp/attachments'
import './App.css'
import Navbar from './comp/JS/Navbar'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { GetBuildModifiedList, compareDates, GlobalConstraints } from './pages/Master'
import { ListNames } from './pages/Config'
import Home from './pages/Home'
import Questions from './pages/Questions'
import PolicyMemo from './pages/PolicyMemo'
import PointsofContact from './pages/PointsofContact'
import QuickLinks from './pages/QuickLinks'
import QandA from './pages/QandA'
import Settings from './pages/Settings'
import QuestionForm from './pages/QuestionForm'
import UserProfile from './pages/UserProfile'
import KBInnerview from './comp/JS/KBInnerview'
import Detailedviewpage from './pages/Detailedviewpage'
import UserProfileSettings from './pages/UserProfileSettings'
import PascodeSettings from './pages/PascodeSettings'

initDB(DBConfig)
function App () {
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    GetBuildModifiedList().then(function () {
      getHelpdesk()
    })
  }, [])

  SP.SOD.executeFunc('SP.js', 'SP.ClientContext', fnshowhidemenu)

  function fnshowhidemenu () {
    setTimeout(function () {
      $('#O365_MainLink_Settings').attr('style', 'display: block !important')
      if (_spPageContextInfo.isSiteAdmin) {
        $('#O365_MainLink_Settings,#O365_MainLink_Bell_Container,#O365_MainLink_Help').attr('style', 'display: block !important')
        $('#ribbonBox').attr('style', 'display: block !important')
      } else {
        $('#O365_MainLink_Settings,#O365_MainLink_Bell_Container,#O365_MainLink_Help').attr('style', 'display: none !important')
        $('#ribbonBox').attr('style', 'display: none !important')
        $('#s4-ribbonrow').css('height', 'auto')
      }
    }, 1000)
  }

  $('#anchorhelpdesk').on('click', function () {
    $('#divhelpdeskpopup').toggle()
    $('#divhelpdeskpopup').removeClass('hidden')
    $('#sitefeedbackpopup').hide()
    $('#sitefeedbackpopup').addClass('hidden')
  })

  $('#helpdesk-closebtn').on('click', function () {
    $('#divhelpdeskpopup').addClass('hidden')
    $('#divhelpdeskpopup').css('display', 'none')
  })

  $('#anchorsitefeedbackbtn').on('click', function () {
    $('#sitefeedbackpopup').show()
    $('#sitefeedbackpopup').removeClass('hidden')
    $('#divhelpdeskpopup').addClass('hidden')
    $('#divhelpdeskpopup').css('display', 'none')
    validatefeedback()
  })

  $('#cancelfeedback').on('click', function () {
    $('#sitefeedbackpopup').hide()
    $('#sitefeedbackpopup').addClass('hidden')
    validatefeedback()
  })

  $('#fbsuccclose').on('click', function () {
    $('.sucesupload').fadeOut(500)
  })

  const getHelpdesk = () => {
    const siteName = GlobalConstraints().siteName
    const listModifiedDate = localStorage.getItem('HelpDeskBuildModifiedListDate' + siteName) || ''
    const oldmodifieddate = localStorage.getItem('HelpDesk_LMDate' + siteName) || ''
    const needToUpdate = compareDates(listModifiedDate, oldmodifieddate)
    if (needToUpdate) {
      const list = sp.web.lists.getByTitle(ListNames().HelpDesk)
      const endpoint = ['ID', 'Title', 'PhoneNo', 'EmailAddress']
      list.items.select('' + endpoint + '').get().then(function (items) {
        localStorage.setItem('HelpDeskData' + siteName, JSON.stringify(items))
        localStorage.setItem('HelpDesk_LMDate' + siteName, listModifiedDate)
        buildHelpdesk(items)
      })
    } else {
      const HDData: any = (localStorage.getItem('HelpDeskData' + siteName) !== undefined && localStorage.getItem('HelpDeskData' + siteName) !== '' && localStorage.getItem('HelpDeskData' + siteName) !== null ? JSON.parse(localStorage.getItem('HelpDeskData' + siteName) || '{}') : [])
      buildHelpdesk(HDData)
    }
  }

  const buildHelpdesk = (HDData: any) => {
    let html = ''
    if (HDData && HDData.length > 0) {
      const helpdesk = HDData[0]
      // eslint-disable-next-line quotes
      html += "<h2>" + helpdesk.Title + "</h2>"
      html += "<span class='SpanhoursInfo'>"
      html += "<span class='spanhelpdeskemail'>"
      html += "<span class='icon-mail'></span>"
      // eslint-disable-next-line quotes
      html += "<a href='mailto:' title='" + helpdesk.EmailAddress + "'>" + helpdesk.EmailAddress + "</a>"
      html += '</span>'
      html += "<span class='spanhelpdeskemail'>"
      html += "<span class='icon-phone'></span>"
      // eslint-disable-next-line quotes
      html += "<a href='tel:' title='" + helpdesk.PhoneNo + "'>" + helpdesk.PhoneNo + "</a>"
      html += '</span>'
      html += '</span>'
      $('#helpdeskdata').html(html)
    }
  }

  let invalidFileType = false
  let invalidFileName = false
  let fileArray: any = []
  $('#submitFeedback').on('click', function () {
    invalidFileType = false
    invalidFileName = false
    fileArray = []
    const subjval: any = $('#InputFeedbackSubject').val()
    const charLength = subjval.length
    const feedbackabout = $('#SelectDropdownFeedbackAbout option:selected').text()
    const messageval = $('#TextareaFeedbackMessage').val()
    if (subjval === '') {
      $('.subval').text('This field is required')
    } if (subjval !== '' && charLength >= 225) {
      $('.subval').text('Please enter less than 255 characters')
    } if (messageval === '') {
      $('.msgval').text('This field is required')
    } if (feedbackabout === 'select') {
      $('.fbabout').text('This field is required')
    }

    if (charLength < 225 && feedbackabout !== 'select' && subjval !== '' && messageval !== '') {
      $('.subval, .msgval').text('')
      $('.loadingfb ').removeClass('hidden')
      $('#attachFilesContainer input:file').each(function (e) {
        const data: any = this
        for (let i = 0; i < data.files.length; i++) {
          if (data.files[i]) {
            fileArray.push({
              name: data.files[i].name,
              content: data.files[i]
            })
          }
        }
      })
      const feedbackitem = {
        Title: subjval,
        FeedbackAbout: feedbackabout,
        Message: messageval
      }
      addfeedback(feedbackitem, fileArray)
    }
    if (invalidFileName || invalidFileType) {
      $('.loadingfb ').addClass('hidden')
      $('.submitclk').show()
      $('#btnSubmit').removeClass('disabled')
    }
  })

  const addfeedback = (feedbackitem: any, files: any) => {
    const listName = ListNames().SiteFeedBackList
    sp.web.lists.getByTitle(listName).items.add(feedbackitem).then((items) => {
      if (files && files.length > 0) {
        const item: IItem = sp.web.lists.getByTitle(listName).items.getById(items.data.ID)
        item.attachmentFiles.addMultiple(files)
        validatefeedback()
        sucfeedback()
      } else {
        validatefeedback()
        sucfeedback()
      }
    })
  }

  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'SiteFeedBackList') {
        GetMCount = parseInt(buildmodifiedlist[i].Mcount)
        Id = buildmodifiedlist[i].Id
        GetMCount = JSON.stringify(GetMCount + 1)
      }
    }
    const addObj = {
      Mcount: GetMCount
    }
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(Id).update(addObj).then(function () {
      GetBuildModifiedList()
    })
  }
  function sucfeedback () {
    $('#sitefeedbackpopup').toggleClass('hidden')
    $('#sitefeedbackpopup').hide()
    $('.sucesupload').removeClass('hidden')
    $('.sucesupload').fadeIn()
  }

  function validatefeedback () {
    $('.loadingfb ').removeClass('hidden')
    $('.subval, .msgval').text('')
    $('#InputFeedbackSubject, #TextareaFeedbackMessage, #infringementFiles').val('')
    $('.fbabout').html('')
    $('.loadingfb ').addClass('hidden')
    fileArray = []
  }

  function checkFileName (val: any) {
    const regex = new RegExp("['~#%" + '"' + '\&{}+\|]|\\.\\.|^\\.|\\.$')
    if (regex.test(val.name)) {
      $('.attacherrormsgs').text('Invalid characters in file name')
      $('.attacherrormsgs').show()
      $('.attacherrormsgs').css('display', 'block')
      return false
    } else {
      $('.attacherrormsgs').hide()
      $('.attacherrormsgs').css('display', 'none')
      return true
    }
  }

  function checkFileExtension (val: any) {
    // eslint-disable-next-line prefer-regex-literals
    const regex: any = new RegExp('(.*?)\\.(txt|xlsx|xls|doc|docx|ppt|pptx|pdf|png|jpg|jpeg|msg|XLSX|XLS|DOC|DOCX|PPT|PPTX|PDF|PNG|JPG|JPEG|TXT|MSG)$')
    if (!(regex.test(val.name))) {
      $('.attacherrormsgs').text('Upload valid file format')
      $('.attacherrormsgs').show()
      $('.attacherrormsgs').css('display', 'block')
      return false
    } else {
      if (!invalidFileName) {
        $('.attacherrormsgs').hide()
        $('.attacherrormsgs').css('display', 'none')
      }
      return true
    }
  }

  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path='/' exact component={Home} />
        <Route path='/Questions' exact component={Questions} />
        <Route path="/Questions&:tid" exact component={Questions} />
        <Route path='/PointsofContact' exact component={PointsofContact} />
        <Route path='/PolicyMemo' exact component={PolicyMemo} />
        <Route path='/QuickLinks' exact component={QuickLinks} />
        <Route path='/QandA' exact component={QandA} />
        <Route path='/Settings' exact component={Settings} />
        <Route path='/QuestionForm' exact component={QuestionForm}/>
        <Route path="/QuestionForm/:tid" exact component={QuestionForm} />
        <Route path='/UserProfile' exact component={UserProfile} />
        <Route path='/KBInnerview' exact component={KBInnerview} />
        <Route path='/Detailedviewpage' exact component={Detailedviewpage} />
        <Route path="/Detailedviewpage/:tid" exact component={Detailedviewpage} />
        <Route path='/UserProfileSettings' exact component={UserProfileSettings} />
        <Route path='/PascodeSettings' exact component={PascodeSettings}/>
      </Switch>
    </Router>
  )
}

export default App
