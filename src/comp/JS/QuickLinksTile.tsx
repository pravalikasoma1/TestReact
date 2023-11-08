import React, { useEffect, useState } from 'react'
import { HardCodedNames, ListNames } from '../../pages/Config'
import '../CSS/QuickLinksTile.css'
import { sp } from '@pnp/sp'
import { GetBuildModifiedList, compareDates, GlobalConstraints } from '../../pages/Master'
import loader from '../Images/Loader.gif'

// This function is the react element. Anytime you see the element used in HTML,
// this method is called and returns the actual HTML that will be inserted into
// the virtual DOM.

export interface QuickLinkItem {
  ekey?: string,
  etag?: string,
  Title0: string,
  Category: string,
  URL?: any,
  IsArchived: boolean
}

export interface Props {
  label?: string
  items?: Array<QuickLinkItem>
  listName?: string
}

const QuickLinksTile = (props: Props) => {
  // After state operations are done, we can start defining variables with local sope
  const label = HardCodedNames().QUICKLINKS
  const listName = ListNames().QuickLinksList
  const noResultsClass = 'divnoresults '
  const hideStyleClass = 'hidecomponent '
  const showStyleClass = 'showcomponent '

  // Our design uses react hooks for state management
  // All interactions with hooks have to be done at the start of the function
  // and in the same order on each call.
  const [listItems, setListItems] = useState<Array<QuickLinkItem> | undefined>(undefined)
  const [loaderState, setloaderState] = useState(false)
  $('.quicklinksnavigation a').addClass('active')

  // async init effect
  const initEffect = () => {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('QuickLinksListBuildModifiedListDate' + siteName) || ''
      const QLModifiedDate = localStorage.getItem('QL_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, QLModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        const endpoint = ['ID', 'Title0', 'Category', 'URL', 'IsArchived']
        list.items.select('' + endpoint + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          localStorage.setItem('QLData' + siteName, JSON.stringify(items))
          localStorage.setItem('QL_LMDate' + siteName, listModifiedDate)
          const QLItems = items?.filter((item: any) => { return item.IsArchived === false })
          setListItems(QLItems)
        })
      } else {
        const QLData: any = (localStorage.getItem('QLData' + siteName) !== undefined && localStorage.getItem('QLData' + siteName) !== '' && localStorage.getItem('QLData' + siteName) !== null ? JSON.parse(localStorage.getItem('QLData' + siteName) || '{}') : [])
        const QLItems = QLData?.filter((item: any) => { return item.IsArchived === false })
        setListItems(QLItems)
      }
    } catch (error) {
      console.log(error)
    }
    setTimeout(() => {
      toggleLoader(false)
    }, 2000)
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
      $('.quicklinksnavigation a').addClass('active')
      initEffect()
    })
  }, [])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  // The main readonly rendering section
  // Everything in here should be fast and non blocking
  return (
    <section className='divcontainer boxsizing'>
      <div className='divpageheader'>
        <h1><span className='icon-quicklinks'></span>{label}<span className='spanPoccount'>{listItems?.length}</span></h1>
      </div>
      <div className='divquicklinkcontainer'>
        <ul className='divquicklinkcontent'>
          {listItems?.length && listItems?.length > 0
            ? listItems?.map(item =>
              <li key={item.URL?.Url}><a target="_blank" href={item.URL?.Url} title={item.Title0} rel="noreferrer" >{item.Title0}</a></li>
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
    </section>
  )
}

export default QuickLinksTile
