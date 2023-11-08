/* eslint-disable space-before-function-paren */
import React, { useEffect, useState } from 'react'
import { useIndexedDB } from 'react-indexed-db'
import '../CSS/Home.css'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import { ListNames } from '../../pages/Config'
import RecentKBArticles from './RecentKBArticles'
import HomeSubmittersec from './HomeSubmittersec'
import HomeBasesec from './HomeBasesec'
import loader from '../Images/Loader.gif'
import { GetBuildModifiedList, compareDates, GlobalConstraints } from '../../pages/Master'

export interface KBItem {
  ekey?: string,
  etag?: string,
  ID: number,
  Title: string,
  Description: string,
  Category: string,
  Subcategory: string,
  IsArchived: boolean,
  viewedcount: number,
  Created: Date,
  AttachmentFiles: any
}

export interface Props {
  label?: string
  items?: Array<KBItem>
  listName?: string
  loginuserroles?: any
}

const KBArticles = (props: Props) => {
  const { loginuserroles = [] } = props
  const siteName = GlobalConstraints().siteName
  const listName = ListNames().KnowledgeBaseArticles
  const { add } = useIndexedDB('KBArticles' + siteName + '')
  const { getByID } = useIndexedDB('KBArticles' + siteName + '')
  const { update } = useIndexedDB('KBArticles' + siteName + '')
  const [listItems, setListItems] = useState<Array<KBItem> | undefined>(undefined)
  const [KBFilteredItems, setFilterItems] = useState<any>([])

  const [loaderState, setloaderState] = useState(false)

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      $('.homenavigation a').addClass('active')
      initEffect()
    })
  }, [])
  useEffect(() => {
    setTimeout(() => {
      toggleLoader(false)
    }, 2000)
  }, [KBFilteredItems])
  const initEffect = () => {
    GetKBArticles()
  }
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  function GetKBArticles() {
    try {
      const listModifiedDate = localStorage.getItem('KnowledgeBaseArticlesBuildModifiedListDate' + siteName) || ''
      const KBModifiedDate = localStorage.getItem('KB_LMDate' + siteName) || ''
      const needToUpdate = compareDates(listModifiedDate, KBModifiedDate)
      const list = sp.web.lists.getByTitle(listName)
      const endpoint = ['ID', 'Title', 'Description', 'Category', 'Subcategory', 'IsArchived', 'Created', 'viewedcount', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'AttachmentFiles']
      const expand = ['Author', 'Editor', 'AttachmentFiles']
      if (needToUpdate) {
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          const KBItems = items?.filter((item: any) => { return item.IsArchived === false })
          setListItems(KBItems)
          setFilterItems(KBItems)
          getByID(1).then((DBData: any) => {
            if (DBData && DBData.items) {
              update({ id: 1, items: items }).then(
                (result: any) => { console.log('KB Data Stored in DB') }
              )
            } else {
              add({ items: items }).then((DBData: any) => {
              })
            }
          })
          localStorage.setItem('KB_LMDate' + siteName, listModifiedDate)
        })
      } else {
        getByID(1).then((DBData: any) => {
          const KBItems = DBData.items?.filter((item: any) => { return item.IsArchived === false })
          setListItems(KBItems)
          setFilterItems(KBItems)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  function ShowhideKPISec() {
    // const loginusername = LoginUserName().UserName
    if (!loginuserroles.isNAFFAOwner && (loginuserroles.isSubmitter || loginuserroles.isSiteAdmin)) {
      return (
        <section className='divcontainer boxsizing divsubmitercontent'>
          <div className='divSubmittersection'>
            <HomeSubmittersec />
          </div>
        </section>
      )
    } else {
      return (
        <section className='divcontainer boxsizing divsubmitercontent'>
          <div className='divSubmittersection divSMEReviewContent'>
            <HomeBasesec loginuserroles={loginuserroles} />
          </div>
        </section>
      )
    }
  }
  return (
    <div>

      {ShowhideKPISec()}
      <section className='divcontainer boxsizing'>
        <div className='divadded'>
          <RecentKBArticles data={listItems} />
        </div>
      </section>
      <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
        <div className="copying">
          <p id="displaytext">Working on it</p>
          <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
        </div>
      </div>
    </div>
  )
}

export default KBArticles
