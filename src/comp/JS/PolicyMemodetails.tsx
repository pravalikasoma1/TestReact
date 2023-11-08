import React, { useEffect, useState } from 'react'
import { sp } from '@pnp/sp'
import '@pnp/sp/files'
import '@pnp/sp/folders'
import { ListNames } from '../../pages/Config'
import { GetBuildModifiedList, compareDates, GlobalConstraints } from '../../pages/Master'
import loader from '../Images/Loader.gif'

const PolicyMemodetails = () => {
  const listName = ListNames().PolicyMemoandGuidelines
  const noResultsClass = 'divnoresults '
  const hideStyleClass = 'hidecomponent '
  const showStyleClass = 'showcomponent '
  const [PolciyMemoData, setPolciyMemoData] = useState<any>([])
  const [loaderState, setloaderState] = useState(false)
  $('.policymemonavigation a').addClass('active')
  const initEffect = () => {
    const siteName = GlobalConstraints().siteName
    const listModifiedDate = localStorage.getItem('PolicyMemoandGuidelinesBuildModifiedListDate' + siteName) || ''
    const PolicyMemoModifiedDate = localStorage.getItem('PolicyMemo_LMDate' + siteName)
    const needToUpdate = compareDates(listModifiedDate, PolicyMemoModifiedDate)
    if (needToUpdate) {
      const list = sp.web.getFolderByServerRelativeUrl(listName)
      const expand = ['Files', 'Files/ListItemAllFields']
      list.files.expand('' + expand + '').orderBy('TimeLastModified', false).get().then(function (items) {
        // items.sort((a,b) => b.TimeLastModified.localeCompare(a.TimeLastModified))
        localStorage.setItem('PolicyMemoData' + siteName, JSON.stringify(items))
        localStorage.setItem('PolicyMemo_LMDate' + siteName, listModifiedDate)
        setPolciyMemoData(items)
      }).catch((err) => {
        console.log('ERROR => ', err)
      })
    } else {
      const PolicyMemoData: any = (localStorage.getItem('PolicyMemoData' + siteName) !== undefined && localStorage.getItem('PolicyMemoData' + siteName) !== '' && localStorage.getItem('PolicyMemoData' + siteName) !== null ? JSON.parse(localStorage.getItem('PolicyMemoData' + siteName) || '{}') : [])
      setPolciyMemoData(PolicyMemoData)
    }
    setTimeout(() => {
      toggleLoader(false)
    }, 2000)
  }

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      $('.policymemonavigation a').addClass('active')
      initEffect()
    })
  }, [])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }

  return (
    <div>
    <div className="divpolicymemocontent">
      <ul>
        {PolciyMemoData?.length && PolciyMemoData?.length > 0
          ? PolciyMemoData?.map((item: any) =>
            <li key={item.Name}>
              <a target='_blank' href={item.ServerRelativeUrl} title={item.Name} rel="noreferrer">{item.Name}</a>
            </li>
          )
          : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}
      </ul>
    </div>
    <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                    </div>
                </div>
              </div>

  )
}

export default PolicyMemodetails
