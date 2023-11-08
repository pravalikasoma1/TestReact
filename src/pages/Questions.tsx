import React, { useEffect, useState } from 'react'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import { useIndexedDB } from 'react-indexed-db'
import { ListNames } from '../pages/Config'
import { LoginUserName, GlobalConstraints, GetUserGroups, LoginUserDetails, GetUserProfile } from './Master'
import Questionsdisplay from '../comp/JS/Questionsdisplay'
import loader from '../comp/Images/Loader.gif'

export interface Props {
  label?: string
  items?: Array<QuestionsItem>
  listName?: string
}

export interface QuestionsItem {
  ekey?: string,
  etag?: string,
  QuestionID: string,
  QuestionTitle: string,
  QuestionDescription: string,
  DutyEmail: string,
  DutyPhone: string,
  SubCategory: string,
  Status: any,
  PreviousStatus: any,
  disName: string,
  StatusModifiedDate: Date,
  ItemCreatedBy: any,
  ItemModifiedBy: any,
  ItemModified: Date,
  ItemCreated: Date,
  ItemGUID: number,
  tid:any
}

const Questions = (props: Props) => {
  const [loginuserroles, setloginuserdetails] = useState([])
  const listName = ListNames().QuestionsList
  const siteName = GlobalConstraints().siteName
  const { add } = useIndexedDB('Questions' + siteName + '')
  const { getByID } = useIndexedDB('Questions' + siteName + '')
  const { update } = useIndexedDB('Questions' + siteName + '')
  const [listItems, setListItems] = useState<any>([])
  const [loaderState, setloaderState] = useState(false)
  const [savedItems, setsavedItems] = useState<any>([])
  const [isProfileExist, setisProfileExist] = useState(true)
  GetUserProfile().then(function () {
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    if (loginUserProfile && loginUserProfile.length === 0) {
      setisProfileExist(false)
    }
  })
  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    GetUserGroups().then(function () {
      toggleLoader(true)
      initEffect()
    })
  }, [])

  const initEffect = () => {
    const loginuser = LoginUserDetails()
    setloginuserdetails(loginuser[0])
    getSavedQuestions()
    getByID(1).then((DBData: any) => {
      if (DBData && DBData.items.length > 0) {
        const modifieddate = DBData.items[0].Modified
        GetQuestions(modifieddate)
      } else {
        GetQuestions('')
      }
    })
  }
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }

  function getSavedQuestions () {
    const list = sp.web.lists.getByTitle(ListNames().SavedQuestionsList)
    const endpoint = ['ID', 'QuestionID', 'QuestionTitle', 'QuestionDescription', 'DutyEmail', 'DutyPhone', 'Category', 'SubCategory', 'Status/ID', 'Status/Title',
      'PreviousStatus/ID', 'PreviousStatus/Title', 'disName', 'StatusModifiedDate', 'ItemCreatedBy/Id', 'ItemCreatedBy/Title', 'ItemModifiedBy/Id', 'ItemModifiedBy/Title',
      'ItemModified', 'ItemCreated', 'ItemGUID', 'Action', 'FY', 'CustomerID', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'Modified', 'Created']
    const expand = ['Status', 'PreviousStatus', 'ItemCreatedBy', 'ItemModifiedBy', 'Author', 'Editor']
    list.items.select('' + endpoint + '').expand('' + expand + '').filter('CustomerID eq ' + LoginUserName().UserId + '').orderBy('Modified', false).top(5000).get().then(function (saveditems) {
      setsavedItems(saveditems)
    })
  }

  function GetQuestions (modifieddate: any) {
    const list = sp.web.lists.getByTitle(listName)
    const endpoint = ['ID', 'QuestionID', 'QuestionTitle', 'QuestionDescription', 'DutyEmail', 'DutyPhone', 'Category', 'SubCategory', 'Status/ID', 'Status/Title',
      'PreviousStatus/ID', 'PreviousStatus/Title', 'disName', 'StatusModifiedDate', 'ItemCreatedBy/Id', 'ItemCreatedBy/Title', 'ItemModifiedBy/Id', 'ItemModifiedBy/Title',
      'ItemModified', 'ItemCreated', 'ItemGUID', 'Action', 'AssignedTo/ID', 'AssignedTo/Title', 'AssignedUsers/ID', 'AssignedUsers/Title', 'PromotedToKnowledgeGraph', 'FY',
      'CustomerID', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'Modified', 'Created']
    const expand = ['Status', 'PreviousStatus', 'AssignedTo', 'AssignedUsers', 'ItemCreatedBy', 'ItemModifiedBy', 'Author', 'Editor']
    let filter = ''
    if (modifieddate !== '') {
      // eslint-disable-next-line quotes
      filter = "Modified gt '" + modifieddate + "'"
    }
    list.items.select('' + endpoint + '').expand('' + expand + '').filter('' + filter + '').orderBy('Modified', false).top(5000).get().then(function (items) {
      getByID(1).then((DBData: any) => {
        let QuestionsDBData: any = []
        if (DBData) {
          QuestionsDBData = DBData.items
          if (QuestionsDBData.length > 0 && items.length > 0) {
            $.each(items, function (key: any, value) {
              let itemfound = false
              $.each(QuestionsDBData, function (k, v) {
                if (value.ItemGUID !== '' ? value.ItemGUID === v.ItemGUID : value.ID === v.ID) {
                  QuestionsDBData.splice(k, 1)
                  QuestionsDBData.unshift(value)
                  itemfound = true
                }
              })
              if (!itemfound) {
                QuestionsDBData.unshift(value)
              }
            })
          } else {
            QuestionsDBData = (QuestionsDBData.length > 0 ? QuestionsDBData : items)
          }
          update({ id: 1, items: QuestionsDBData }).then(
            (result: any) => { console.log('Data Stored in DB') }
          )
        } else {
          QuestionsDBData = items
          if (QuestionsDBData.length > 0) {
            add({ items: items }).then((DBData: any) => {
            })
          }
        }
        QuestionsDBData.sort((a: any, b: any) => b.Modified.localeCompare(a.Modified))
        setListItems(QuestionsDBData)
        setTimeout(() => {
          toggleLoader(false)
          sessionStorage.removeItem('selectedKPI' + siteName)
        }, 2000)
      })
    })
  }

  const WorkflowAction = () => {
    initEffect()
  }
  const ProfileExist = () => {
    document.location = `${window.location.origin + window.location.pathname}#/UserProfile`
    return (
    <></>
    )
  }
  return (
    <>{
      isProfileExist
        ? (
    <section className='divcontainer boxsizing divlistviewcontainer'>
      <div className='row'>
        <Questionsdisplay data={listItems} savedItems={savedItems} loginuserroles={loginuserroles} ActionCompleted={WorkflowAction}/>
      </div>
      <div className="submit-bg" id="pageoverlay" style={{ display: loaderState ? '' : 'none' }}>
                  <div className="copying">
                        <p id="displaytext">Working on it</p>
                        <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
                    </div>
                </div>
    </section>)
        : (
            ProfileExist()
          )
} </>
  )
}

export default Questions
