import React, { useEffect, useState } from 'react'
import { HardCodedNames, ListNames } from '../../pages/Config'
import '../CSS/PointsofContact.css'
import { sp } from '@pnp/sp'
import { GetBuildModifiedList, compareDates, GlobalConstraints } from '../../pages/Master'
import loader from '../Images/Loader.gif'

export interface POCItem {
  ekey?: string,
  etag?: string,
  ID: number,
  PointsofContact?: any,
  PhoneNo: string,
  IsArchived: boolean
}

export interface Props {
  label?: string
  items?: Array<POCItem>
  listName?: string
}
// This function is the react element. Anytime you see the element used in HTML,
// this method is called and returns the actual HTML that will be inserted into
// the virtual DOM.
const PointsofContactTitle = (props: Props) => {
  // After state operations are done, we can start defining variables with local sope
  const label = HardCodedNames().POINTSOFCONTACT
  const listName = ListNames().PointsofContact
  const noResultsClass = 'divnoresults '
  const hideStyleClass = 'hidecomponent '
  const showStyleClass = 'showcomponent '
  const [loaderState, setloaderState] = useState(false)
  // Our design uses react hooks for state management
  // All interactions with hooks have to be done at the start of the function
  // and in the same order on each call.
  const [listItems, setListItems] = useState<Array<POCItem> | undefined>(undefined)
  $('.pointsofcontactnavigation a').addClass('active')
  // async init effect
  const initEffect = () => {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('PointsofContactBuildModifiedListDate' + siteName) || ''
      const POCModifiedDate = localStorage.getItem('POC_LMDate' + siteName) || ''
      const needToUpdate = compareDates(listModifiedDate, POCModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        // const items = await list.items.top(5000).get()
        const endpoint = ['ID', 'PhoneNo', 'PointsofContact/Title', 'PointsofContact/Name', 'PointsofContact/JobTitle', 'PointsofContact/FirstName', 'PointsofContact/LastName', 'PointsofContact/EMail', 'IsArchived', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'AttachmentFiles']
        const expand = ['PointsofContact', 'Author', 'Editor', 'AttachmentFiles']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          const siteName = GlobalConstraints().siteName
          localStorage.setItem('POCData' + siteName, JSON.stringify(items))
          localStorage.setItem('POC_LMDate' + siteName, listModifiedDate)
          const POCItems = items?.filter((item: any) => { return item.IsArchived === false })
          setListItems(POCItems)
        })
      } else {
        const POCData: any = (localStorage.getItem('POCData' + siteName) !== undefined && localStorage.getItem('POCData' + siteName) !== '' && localStorage.getItem('POCData' + siteName) !== null ? JSON.parse(localStorage.getItem('POCData' + siteName) || '{}') : [])
        const POCItems = POCData?.filter((item: any) => { return item.IsArchived === false })
        setListItems(POCItems)
      }
      setTimeout(() => {
        toggleLoader(false)
      }, 2000)
    } catch (error) {
      console.log(error)
    }
  }

  // React is split into a readonly render phase, then a read/write mutation stage normally called effects.
  // Any code that is not in an effect, can be considered part of the render phase.
  // This example effect functions like a constructor and interact with rhybus to populate list data
  // used by the render phase.
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      $('.pointsofcontactnavigation a').addClass('active')
      initEffect()
    })
  }, [])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  function fnPhonechange (phonenumber: any) {
    if (phonenumber != '' && phonenumber != undefined && phonenumber != null) {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      phonenumber = phonenumber.replace(phoneRegex, '$1-$2-$3')
    }
    return phonenumber
  }
  // The main readonly rendering section
  // Everything in here should be fast and non blocking
  return (
    <section className='divcontainer boxsizing'>
      <div className='divpageheader'>
        <h1><span className='icon-POC'></span> {label} <span className='spanPoccount'>{listItems?.length}</span></h1>
      </div>
      <div className='divpoccontent'>
        <ul>
          {listItems?.length && listItems?.length > 0
            ? listItems?.map(item =>
              <li key={item.ID}>
                <div className='panelitem'>
                  <div className='divavator'><span>{((item.PointsofContact.FirstName != null) ? item.PointsofContact.FirstName.charAt(0) : '') + ((item.PointsofContact.LastName != null) ? item.PointsofContact.LastName.charAt(0) : '')}</span></div>
                  <div className='divuserinfo'>
                    <h3>{item.PointsofContact.Title}</h3><p>{item.PointsofContact.JobTitle}</p>
                    <a href={'mailto:' + item.PointsofContact.EMail} title={item.PointsofContact.EMail} className='anchormailto'>{item.PointsofContact.EMail}</a>
                    <a href={'tel:' + fnPhonechange(item.PhoneNo)} title={item.PhoneNo} className='anchorcallto'>{fnPhonechange(item.PhoneNo)}</a>
                  </div>
                </div>
              </li>
            )
            : <div className={noResultsClass + showStyleClass}> There are no results to display </div>
          }
        </ul>
      </div>
      <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                    </div>
                </div>
    </section>
  )
}

export default PointsofContactTitle
