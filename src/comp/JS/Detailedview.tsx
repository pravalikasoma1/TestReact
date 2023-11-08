import React, { useState, useEffect } from 'react'
import '../CSS/Detailedview.css'
import $ from 'jquery'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import { ListNames } from '../../pages/Config'
import { GetUserGroups, LoginUserDetails } from '../../pages/Master'
import DetailedviewActionbtns from './DetailedviewActionbtns'
import DetailedviewStatus from './DetailedviewStatus'
import DetailedviewDetails from './DetailedviewDetails'
import DetailedviewFilessec from './DetailedviewFilessec'
import loader from '../Images/Loader.gif'

const Detailedview = () => {
  const url = window.location.href
  const length = url.split('/').length
  const ItemGUID = url.split('/')[length - 1]
  const listName = ListNames().QuestionsList
  const [loginuserroles, setloginuserdetails] = useState([])
  const [listItems, setListItems] = useState<any>([])
  const [FileslistItems, setFilesListItems] = useState<any>([])
  const [loaderState, setloaderState] = useState(false)

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    toggleLoader(true)
    GetUserGroups().then(function () {
      $('.questionsnavigation a').addClass('active')
      initEffect()
    })
  }, [])

  const initEffect = () => {
    const loginuser = LoginUserDetails()
    setloginuserdetails(loginuser[0])
    const list = sp.web.lists.getByTitle(listName)
    const endpoint = ['ID', 'QuestionID', 'QuestionTitle', 'QuestionDescription', 'DutyEmail', 'DutyPhone', 'Category', 'SubCategory', 'Status/ID', 'Status/Title',
      'PreviousStatus/ID', 'PreviousStatus/Title', 'disName', 'StatusModifiedDate', 'ItemCreatedBy/Id', 'ItemCreatedBy/Title', 'ItemModifiedBy/Id', 'ItemModifiedBy/Title',
      'ItemModified', 'ItemCreated', 'ItemGUID', 'Action', 'AssignedTo/ID', 'AssignedTo/Title', 'AssignedUsers/Id', 'AssignedUsers/Title', 'PromotedToKnowledgeGraph', 'FY',
      'CustomerID', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'Modified', 'Created']
    const expand = ['Status', 'PreviousStatus', 'AssignedTo', 'AssignedUsers', 'ItemCreatedBy', 'ItemModifiedBy', 'Author', 'Editor']
    list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).filter("ItemGUID eq '" + ItemGUID + "'").top(5000).get().then(function (items) {
      setListItems(items)
      setTimeout(() => {
        toggleLoader(false)
      }, 1000)
    })
  }

  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const setFilesList = (items: any) => {
    setFilesListItems(items)
  }

  const handleAction = (e: any) => {
    console.log('Action called')
    initEffect()
  }

  return (
        <section className='divpagewrapper'>
            <div className='detailedviewheader'>
                <div className='divcontainer'>
                    <div className='divheaderdetails'>
                        <p className='Itemname'>
                            <span>{listItems.length ? listItems[0].QuestionTitle : ''}</span>
                        </p>
                        <div className='divactionbtns'>
                            <DetailedviewActionbtns data={listItems} ItemGUID={ItemGUID} actionPerformed={handleAction} loginuserroles={loginuserroles} customerID={listItems.length ? listItems[0].CustomerID : ''}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className='divcontainer'>
                <div className='row'>
                    <div className='col-xl-2 col-md-3 col-sm-12'>
                      {listItems.length
                        ? <DetailedviewStatus data={listItems} ItemGUID={ItemGUID} loginuserroles={loginuserroles} customerID={listItems.length ? listItems[0].CustomerID : ''} displayName = {(listItems.length && listItems[0].ItemCreatedBy) ? listItems[0].ItemCreatedBy.Title : ''}/>
                        : null
                       }
                    </div>
                    <div className='col-xl-7 col-md-9 col-sm-12'>
                    {listItems.length
                      ? <DetailedviewDetails data={listItems} ItemGUID={ItemGUID} Fileslist={FileslistItems} loginuserroles={loginuserroles} customerID={listItems.length ? listItems[0].CustomerID : ''} Assignedto = {listItems.length && listItems[0].AssignedTo && listItems[0].AssignedTo !== undefined && listItems[0].AssignedTo !== null && listItems[0].AssignedTo !== '' ? listItems[0].AssignedTo.ID : ''}/>
                      : null
                       }
                    </div>
                    <div className='col-xl-3 col-md-12 col-sm-12'>
                        <DetailedviewFilessec data={listItems} ItemGUID={ItemGUID} loginuserroles={loginuserroles} InqID={listItems.length ? listItems[0].QuestionID : []} FileslList={(items: any) => setFilesList(items)}/>
                    </div>
                </div>
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

export default Detailedview
