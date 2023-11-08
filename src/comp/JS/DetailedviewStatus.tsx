import React, { useState, useEffect } from 'react'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import { ListNames } from '../../pages/Config'
import { convertDate, LoginUserName } from '../../pages/Master'

export interface Props {
    data?: any,
    ItemGUID?: any,
    loginuserroles?: any,
    customerID?: any,
    displayName?: any
  }

const DetailedviewStatus = (props: Props) => {
  const { data = [], ItemGUID = [], loginuserroles = [], customerID = '', displayName = '' } = props
  const listName = ListNames().QuestionsHistoryList
  const [listItems, setListItems] = useState<any>([])

  const noResultsClass = 'divnoresults '
  const hideStyleClass = 'hidecomponent '
  const showStyleClass = 'showcomponent '

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    const list = sp.web.lists.getByTitle(listName)
    const endpoint = ['ID', 'QuestionsItemID', 'ItemGUID', 'Description', 'Action', 'Role', 'AssignedTo/ID', 'AssignedTo/Title', 'Status/ID', 'Status/Title',
      'PreviousStatus/ID', 'PreviousStatus/Title', 'ItemCreatedBy/Id', 'ItemCreatedBy/Title', 'ItemModifiedBy/Id', 'ItemModifiedBy/Title', 'ItemModified', 'ItemCreated',
      'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'Modified', 'Created']
    const expand = ['Status', 'PreviousStatus', 'AssignedTo', 'ItemCreatedBy', 'ItemModifiedBy', 'Author', 'Editor']
    list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).filter("ItemGUID eq '" + ItemGUID + "'").top(5000).get().then(function (items) {
      setListItems(items)
    })
  }, [data])

  function displayWaitingStatus () {
    const item = listItems[0]
    if (item && (item.Action.toLowerCase() !== 'updated' && item.Action.toLowerCase() !== 'canceled' &&
    item.Action.toLowerCase() !== 'completed' && item.Action.toLowerCase() !== 'promoted to knowledge graph')) {
      return (
            <li key={item.ID} status-color="1">
            <div className="timeline-badge"></div>
            <div className="timeline-panel">
                <div className="timeline-heading">
                    <h1>
                    {item.Action === 'Responded'
                      ? (loginuserroles.loginuserrole === 'AFIMSC' || loginuserroles.loginuserrole === 'NAFFA Owners' || loginuserroles.isAFIMSCOwner)
                          ? <span>Response Received</span>
                          : <span>Responded</span>
                      : item.Action === 'Customer Action Required' ? <span>Customer</span> : <span>{item.Status.Title}</span>}

                    </h1>
                </div>
                <div className="timeline-body">
                    {displayusername(item, 'waiting')}
                    <p><span>{convertDate(item.ItemCreated, 'date')}</span></p>
                    <p><span className="status">Waiting</span></p>
                </div>
            </div>
        </li>
      )
    } else {
      return ('')
    }
  }

  function displayusername (val: any, status: any) {
    let isSubmitter = false
    if (customerID === _spPageContextInfo.userId) {
      isSubmitter = true
    }
    if (isSubmitter) {
      if ((val.Action === 'Submitted' && status !== 'waiting') || (val && (val.Action === 'Return To AFIMSC'))) {
        return (<p>{val.ItemCreatedBy.Title}</p>)
      } else if (val && (val.Action === 'Customer Action Required') && status === 'waiting') {
        return (<p>{displayName}</p>)
      } else {
        return ('')
      }
    } else if (val && (val.Action === 'Assigned' || val.Action === 'Responded' || val.Action === 'Elevated' || val.Action === 'Send To SME' || val.Action === 'Send To AFSVC' || val.Action === 'Return To AFIMSC') && status === 'waiting') {
      return (<p>{val.AssignedTo && val.AssignedTo !== undefined && val.AssignedTo !== null ? val.AssignedTo.Title : ''}</p>)
    } else if (val && (val.Action === 'Submitted')) {
      if (status !== 'waiting') {
        return (<p>{val.ItemCreatedBy.Title}</p>)
      }
      return ('')
    } else if (val && (val.Action === 'Customer Action Required') && status === 'waiting') {
      return (<p>{displayName}</p>)
    } else {
      return (<p>{val.ItemCreatedBy.Title}</p>)
    }
  }

  return (
      <div className="divplaceholder">
          <header><h3>Status</h3></header>
          <div className="divplaceholderbody">
              <div className="timeline-content">
                  <div className="timeline-body">
                  <ul className="timeline">
                  {displayWaitingStatus()}
                    {listItems && listItems.length > 0
                      ? listItems.map((item: any) =>
                        <li key={item.ID} status-color="2" className='active'>
                          <div className="timeline-badge"></div>
                          <div className="timeline-panel">
                            <div className="timeline-heading">
                                <h1><span>{item.Role === 'Customer Action Required' ? 'Customer' : item.Role === 'Responded' ? 'AFIMSC' : item.Role}</span> </h1>
                            </div>
                            <div className="timeline-body">
                              {displayusername(item, '')}
                              <p><span>{convertDate(item.ItemCreated, 'date')}</span></p>
                              <p><span className="status">{item.Action}</span></p>
                            </div>
                          </div>
                        </li>
                      )
                      : <div className={noResultsClass + showStyleClass}> There are no results to display </div>
                    }
                  </ul>
                  </div>
              </div>
          </div>
      </div>
  )
}

export default DetailedviewStatus
