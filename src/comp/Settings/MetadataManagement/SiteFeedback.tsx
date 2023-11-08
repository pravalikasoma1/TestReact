/* eslint-disable jsx-a11y/anchor-is-valid */
import { sp } from '@pnp/sp'
import saveAs from 'file-saver'
import React, { useEffect, useState } from 'react'
import { ListNames } from '../../../pages/Config'
import { compareDates, convertDate, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import loader from '../../Images/Loader.gif'

declare global {
  interface Navigator {
      msSaveBlob?: (blob: any, defaultName?: string) => boolean
  }
}
const SiteFeedback = () => {
  const listName = ListNames().SiteFeedBackList
  const [loaderState, setloaderState] = useState(false)
  const [listItems, setListItems] = useState<any>([])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  useEffect(() => {
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])
  const initEffect = () => {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('SiteFeedBackListBuildModifiedListDate' + siteName) || ''
      const POCModifiedDate = localStorage.getItem('SF_LMDate' + siteName) || ''
      const needToUpdate = compareDates(listModifiedDate, POCModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        const endpoint = ['ID', 'Title', 'FeedbackAbout', 'Message', 'Editor/Id', 'Editor/Title', 'Modified', 'Attachments', 'AttachmentFiles']
        const expand = ['Editor', 'AttachmentFiles']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          const siteName = GlobalConstraints().siteName
          localStorage.setItem('FeedbackData' + siteName, JSON.stringify(items))
          localStorage.setItem('SF_LMDate' + siteName, listModifiedDate)
          setListItems(items)
        })
      } else {
        const HDData: any = (localStorage.getItem('FeedbackData' + siteName) !== undefined && localStorage.getItem('FeedbackData' + siteName) !== '' && localStorage.getItem('FeedbackData' + siteName) !== null ? JSON.parse(localStorage.getItem('FeedbackData' + siteName) || '{}') : [])
        setListItems(HDData)
      }
      setTimeout(() => {
        toggleLoader(false)
      }, 2000)
    } catch (error) {
      console.log(error)
    }
  }

  /// /////////////

  const downloadSiteFeedback = () => {
    const promises = []
    const data = listItems
    const filename = 'FeedBackList'
    const folderName = 'Excel Attachments'
    const excelobjectdata = fmExporttoexcel(filename, data)
    const exceldata = createfbdata(excelobjectdata, filename)
    const savedExcel = SaveExcelContents(exceldata, filename)
    const excelobj : any = {}
    excelobj['0'] = filename + '.xls'
    excelobj['1'] = savedExcel
    excelobj['2'] = folderName
    promises.push(excelobj)
    $.each(data, function (i, element) {
      const Id = element.Id
      if (element.AttachmentFiles.length > 0) {
        $.each(element.AttachmentFiles, function (j, attachfile) {
          $.each(attachfile, function (j, attachement) {
            const name = attachfile.ServerRelativeUrl
            let filename = name.split('/')
            filename = filename[filename.length - 1]
            promises.push(getBinaryData(name, filename, Id))
          })
        })
      }
    })
    Promise.all(promises).then(function (args : any) {
      console.log(args)
      // const zip = new JSZip()
      const zip = require('jszip')()
      const rootfolder = zip.folder('Attachments')
      for (let i = 0; i < args.length; i++) {
        const attfolders = rootfolder.folder(args[i][2])
        const name = args[i][0]
        const data = args[i][1]
        const Id = args[i][2]
        attfolders.file(name, data, Id)
      }
      zip.generateAsync({
        type: 'blob'
      }).then(function (content : any) {
        toggleLoader(false)
        saveAs(content, getarchivename('SiteFeedback'))
      })
    }, function (err) {
      // error occurred
      console.log(err)
    })
  }

  function fmExporttoexcel (filename : any, data: any) {
    const fbdata: {}[] = []
    const excelFileName = filename
    toggleLoader(true)
    $.each(data, function (i, element) {
      let filename: any = []
      let fileStringName = ''
      $.each(element.AttachmentFiles, function (j, attachement) {
        if (element.AttachmentFiles && element.AttachmentFiles.length > 0) {
          if (attachement.FileName != '' || attachement.FileName != undefined || attachement.FileName != null) {
            filename.push(attachement.FileName)
          } else {
            filename = ''
          }
        }
      })
      if (filename.length > 1) {
        fileStringName = filename.toString()
      } else {
        fileStringName = filename
      }
      const obj : any = {}
      obj.ID = element.Id
      obj.Title = element.Title
      obj.Modified = element.Modified
      obj.ModifiedBy = element.Editor.Title
      obj.Message = element.Message
      obj.filename = fileStringName
      obj.feedbackabout = element.FeedbackAbout
      fbdata.push(obj)
    })
    return fbdata
  }

  function createfbdata (element : any, excelFileName: any) {
    let tabText = '<table border="1px" style="font-size:14px" >'
    let textRange
    let j = 0
    const lines = element.length
    const reqtitle = 'Requirement Title'
    if (lines > 0) {
      tabText = tabText + '<tr ><th> ID </th><th> Subject </th><th>Feedback About</th><th> Description </th><th>Attachments</th><th>Modified</th></tr>'
    }
    for (j = 0; j < lines; j++) {
      let attachments = ''
      if (listItems[j].AttachmentFiles.length > 0) {
        if (listItems[j].AttachmentFiles.length > 0) {
          $.each(listItems[j].AttachmentFiles, function (k, attachement) {
            attachments = attachments + attachement.FileName + ','
          })
        }
      }
      tabText = tabText + '<tr><td>' + listItems[j].ID + '</td><td>' + listItems[j].Title + '</td><td>' + listItems[j].FeedbackAbout + '</td><td>' + listItems[j].Message + '</td><td>' + attachments + '</td><td>' + listItems[j].Editor.Title + ' | ' + convertDate(listItems[j].Modified, 'date') + '</td></tr>'
    }
    tabText = tabText + '</table>'

    return tabText
  }

  function SaveExcelContents (element: any, excelFileName: any) {
    const filename = excelFileName
    if (window.Blob && navigator.msSaveBlob) {
      // Falls to msSaveOrOpenBlob if download attribute is not supported
      const blob = new Blob([element], {
        type: 'data:application/vnd.ms-excel'
      })
      console.log('excel blob', blob)
      navigator.msSaveBlob(blob, filename + '.xls')

      return blob
    } else {
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.href = 'data:application/vnd.ms-excel;charset=utf-8,%EF%BB%BF' + encodeURIComponent(element)
      const blob = new Blob([element], {
        type: 'data:application/vnd.ms-excel'
      })
      return blob
    }
  }

  function getBinaryData (thisurl: any, name: any, folder: any) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', thisurl, true)
      xhr.responseType = 'arraybuffer'
      xhr.addEventListener('load', function () {
        if (xhr.status === 200) {
          resolve([name, (new Blob([xhr.response])), folder])
        } else {
          console.log(xhr)
        }
      })
      xhr.send()
    })
  }

  function getarchivename (name: any) {
    const now = new Date()
    let timestamp = now.getFullYear() + ''
    const month = pad0(now.getMonth() + 1)
    const day = pad0(now.getDate())
    timestamp = timestamp + month + day

    let hours = now.getHours()
    let affix = 'AM'
    if (hours > 12) {
      hours = hours - 12
      affix = 'PM'
    }
    hours = pad0(hours)
    const min = pad0(now.getMinutes())

    timestamp = timestamp + '' + hours + '' + min + '' + affix
    const archivename = name + '-' + timestamp + '.zip'
    return archivename
  }

  function pad0 (value: any) {
    const val = parseInt(value)
    if (val < 10) {
      value = '0' + val
    }
    return val
  }

  return (
    <div id="site-feedback" className="tabcontent siteFeedback page" data-page="site-feedback">
    <div className="divsettingsheader">
    <h2> <span className="icon-SiteFeedback"></span>
      Site
      Feedback </h2>
    <ul className="ulactionitems">
      <li style = {{ display: (listItems?.length > 0) ? '' : 'none' }}>
      <a href="javascript:void(0)"
        title=" Download Sitefeedback" id="exportfeedbackbtn" className="anchorsettingglobalbtn" onClick={() => downloadSiteFeedback()}> <span
        className="icon-Download"></span>
       Download Sitefeedback</a>
      </li>

    </ul>

    </div>
    <div className="divcontentarea divsitefeedbackcontent">

    <div className="divcontentarea divSiteFeedbackcontent">
      <ul id="populateSiteFeedback">
      {listItems?.length && listItems?.length > 0
        ? listItems?.map((item: any) =>
              <li key = {item.ID}>
        <div className="divcard divnormalcard">
          <div className="divitem">
          <p>Subject</p><span id="">{item.Title}</span>
          </div>
          <div className="divitem">
          <p>Feedback About</p><span>{item.FeedbackAbout}</span>
          </div>
          <div className="divitem">
          <p>Description</p><span dangerouslySetInnerHTML={{ __html: item.Message }}></span>
          </div>
          <div className="divitem">
          <p>Attachments</p>
          <div className="divattachedfiles">
            <ul>
          {Object.keys(item.AttachmentFiles).map((file: any) =>
              <li key={item.ID}>
                <a href={item.AttachmentFiles[file].ServerRelativeUrl} title={item.AttachmentFiles[file].FileName}>{item.AttachmentFiles[file].FileName}</a>
              </li>
          )}
            </ul>
          </div>
          </div>

          <div className="divitem">
          <p>Modified</p>
        <span>{item.Editor.Title} | {convertDate(item.Modified, 'date')}</span>
          </div>

        </div>

        </li>)
        : <div className="divnoresults showcomponent"> There are no results to display </div> }

      </ul>
      </div>
    </div>
    {
                        loaderState
                          ? (
                    <div className="submit-bg" id="pageoverlay">
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                    </div>
                </div>)
                          : '' }
        </div>
  )
}
export default SiteFeedback
