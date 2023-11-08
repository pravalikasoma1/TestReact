import React, { useState, useEffect } from 'react'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import { ListNames } from '../../pages/Config'
import DetailedviewResponse from './DetailedviewResponse'
import Detailedviewdiscussions from './Detailedviewdiscussions'
import { convertDate, LoginUserName } from '../../pages/Master'
import { Link } from 'react-router-dom'

export interface Props {
    data?: any,
    ItemGUID?: any,
    Fileslist?: any,
    customerID?: any,
    loginuserroles?: any,
    Assignedto?: any
  }

const DetailedviewDetails = (props: Props) => {
  const { data = [], Fileslist = [], loginuserroles = [], customerID = '', Assignedto = '' } = props
  const itemGUID = props.ItemGUID
  const listName = ListNames().QuestionsResponseList
  const [listItems, setListItems] = useState<any>([])
  const ItemId = (data[0] && data[0].ItemGUID !== undefined && data[0].ItemGUID !== null && data[0].ItemGUID !== '' ? data[0].ItemGUID : '')
  const statusID = (data[0] && data[0].Status !== undefined && data[0].Status !== null && data[0].Status !== '' ? data[0].Status.ID : '')
  const ItemCategory = (data[0] && data[0].Category !== undefined && data[0].Category !== null && data[0].Category !== '' ? data[0].Category : '')
  const ItemSubCategory = (data[0] && data[0].SubCategory !== undefined && data[0].SubCategory !== null && data[0].SubCategory !== '' ? data[0].SubCategory : '')
  const ItemCreatedBy = (data[0] && data[0].ItemCreatedBy !== undefined && data[0].ItemCreatedBy !== null && data[0].ItemCreatedBy !== '' ? data[0].ItemCreatedBy.Title : '')
  const ItemCreated = (data[0] && data[0].Created !== undefined && data[0].Created !== null && data[0].Created !== '' ? data[0].Created : '')
  const ItemDescription = (data[0] && data[0].QuestionDescription !== undefined && data[0].QuestionDescription !== null && data[0].QuestionDescription !== '' ? data[0].QuestionDescription : '')

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    const list = sp.web.lists.getByTitle(listName)
    const endpoint = ['ID', 'Title', 'QuestionsItemID', 'ItemGUID', 'Response', 'Role', 'ItemCreatedBy/Id', 'ItemCreatedBy/Title', 'ItemModifiedBy/Id', 'ItemModifiedBy/Title',
      'ItemModified', 'ItemCreated', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'Modified', 'Created']
    const expand = ['ItemCreatedBy', 'ItemModifiedBy', 'Author', 'Editor']
    list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).filter("ItemGUID eq '" + itemGUID + "'").top(5000).get().then(function (items) {
      setListItems(items)
    })
  }, [data])

  const showhideEdit = () => {
    let isSubmitter = false
    if (customerID === LoginUserName().UserId) {
      isSubmitter = true
    }
    if (isSubmitter) {
      if (statusID === 3) {
        return (<Link to={{ pathname: `/QuestionForm/${ItemId}` }} title='Edit'><span className="icon-Edit"></span> Edit</Link>)
      } else {
        return ('')
      }
    } else if ((loginuserroles.isNAFFAOwner || loginuserroles.isAFIMSC) && (statusID === 3 || statusID === 7) && (Assignedto === '' || Assignedto === LoginUserName().UserId)) {
      return (<Link to={{ pathname: `/QuestionForm/${ItemId}` }} title='Edit'><span className="icon-Edit"></span> Edit</Link>)
    } else if ((loginuserroles.isNAFFAOwner || loginuserroles.isSME) && statusID === 4 && (Assignedto === '' || Assignedto === LoginUserName().UserId)) {
      return (<Link to={{ pathname: `/QuestionForm/${ItemId}` }} title='Edit'><span className="icon-Edit"></span> Edit</Link>)
    } else {
      return ('')
    }
  }

  return (
      <>
        <div className="divplaceholder">
            <header>
                <h3>Details</h3>
                <ul className="ulactionbtns" >
                    <li>
                      {showhideEdit()}
                    </li>
                </ul>
            </header>
            <div className="divplaceholderbody">
                <div className="divcontent">
                    <div className="divItemdetails">
                        <div className="divitem">
                            <label htmlFor="Item1">Category</label><p>{ItemCategory}</p>
                        </div>
                        <div className="divitem">
                            <label htmlFor="Item2">Sub Category</label><p>{ItemSubCategory}</p>
                        </div>
                        <div className="divitem">
                            <label htmlFor="Item3">Submitted by</label><p>{ItemCreatedBy}</p>
                        </div>
                        <div className="divitem">
                            <label htmlFor="Item4">Submitted Date</label><p>{convertDate(ItemCreated, '')}</p>
                        </div>
                    </div>
                    <div className="divDescription">
                        <label htmlFor="Item5">Description</label>
                        <p dangerouslySetInnerHTML={{ __html: ItemDescription }}></p>
                    </div>
                </div>
            </div>
        </div>
        {listItems && listItems.length > 0
          ? <DetailedviewResponse data={listItems} />
          : null}
        <Detailedviewdiscussions data={data} ItemGUID={itemGUID} customerID={customerID} loginuserroles={loginuserroles} Fileslist={Fileslist}/>
      </>
  )
}

export default DetailedviewDetails
