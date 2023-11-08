/* eslint-disable space-before-function-paren */
import React, { useEffect, useState } from 'react'
import '../CSS/Home.css'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import { useIndexedDB } from 'react-indexed-db'
import { NavLink as Link } from 'react-router-dom'
import styled from 'styled-components'
import { ListNames } from '../../pages/Config'
import { LoginUserName, GlobalConstraints } from '../../pages/Master'

export const Navlink = styled(Link)`  
    
}`

export interface Props {
  loginuserroles?: any
}

const HomeBasesec = (props: Props) => {
  const { loginuserroles = [] } = props
  const siteName = GlobalConstraints().siteName
  const listName = ListNames().QuestionsList
  const { add } = useIndexedDB('Questions' + siteName + '')
  const { getByID } = useIndexedDB('Questions' + siteName + '')
  const { update } = useIndexedDB('Questions' + siteName + '')
  const [AllQuestionsState, setAllQuestions] = useState([])
  const [MyQuestionsState, setMyQuestions] = useState([])
  const [SelectFilterVal, setSelectFilterVal] = useState({
    savedQues: [],
    submittedQues: [],
    AFIMSCNAFFAQues: [],
    SMEQues: [],
    AFSVCQues: [],
    SAFFMQues: [],
    respondedQues: [],
    completedQues: [],
    canceledQues: [],
    PromotedtoKBQues: [],
    actionReq: []
  })
  const savedQues: any = []
  const submittedQues: any = []
  const AFIMSCNAFFAQues: any = []
  const SMEQues: any = []
  const AFSVCQues: any = []
  const SAFFMQues: any = []
  const respondedQues: any = []
  const completedQues: any = []
  const canceledQues: any = []
  const PromotedtoKBQues: any = []
  const custActionReq : any = []

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    initEffect()
  }, [])

  const initEffect = () => {
    getByID(1).then((DBData: any) => {
      if (DBData && DBData.items) {
        const modifieddate = DBData.items[0].Modified
        GetQuestions(modifieddate)
      } else {
        GetQuestions('')
      }
    })
  }

  function GetQuestions(modifieddate: any) {
    const list = sp.web.lists.getByTitle(listName)
    const endpoint = ['ID', 'QuestionID', 'QuestionTitle', 'QuestionDescription', 'DutyEmail', 'DutyPhone', 'Category', 'SubCategory', 'Status/ID', 'Status/Title',
      'PreviousStatus/ID', 'PreviousStatus/Title', 'disName', 'StatusModifiedDate', 'ItemCreatedBy/Id', 'ItemCreatedBy/Title', 'ItemModifiedBy/Id', 'ItemModifiedBy/Title',
      'ItemModified', 'ItemCreated', 'ItemGUID', 'Action', 'AssignedTo/ID', 'AssignedTo/Title', 'AssignedUsers/ID', 'AssignedUsers/Title', 'PromotedToKnowledgeGraph', 'FY',
      'CustomerID', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'Modified', 'Created']
    const expand = ['Status', 'PreviousStatus', 'AssignedTo', 'AssignedUsers', 'ItemCreatedBy', 'ItemModifiedBy', 'Author', 'Editor']
    let filter = ''
    if (modifieddate !== '') {
      filter = 'Modified gt ' + modifieddate + ''
    }
    // eslint-disable-next-line quotes
    list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
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
        Datafilter(QuestionsDBData)
      })
    })
  }

  function Datafilter(QuestionsDBData: any) {
    let allquestions: any = []
    const myquestions: any = []
    QuestionsDBData.map((d: any, i: any) => d.CustomerID === LoginUserName().UserId ? myquestions.push(d) : allquestions.push(d))
    allquestions = allquestions.filter((d: any) => { return d.Status.ID !== 1 })
    if (allquestions.length > 0) {
      for (let i = 0; i < allquestions.length; i++) {
        if (allquestions[i].Status.ID === 1) {
          savedQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 2 || allquestions[i].Status.ID === 3) {
          AFIMSCNAFFAQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 4) {
          SMEQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 5) {
          AFSVCQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 6) {
          SAFFMQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 7) {
          respondedQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 8) {
          completedQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 9) {
          canceledQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 10) {
          PromotedtoKBQues.push(allquestions[i])
        } else if (allquestions[i].Status.ID === 11) {
          custActionReq.push(allquestions[i])
        }
      }
    }
    setSelectFilterVal({
      ...SelectFilterVal,
      savedQues: savedQues,
      submittedQues: submittedQues,
      AFIMSCNAFFAQues: AFIMSCNAFFAQues,
      SMEQues: SMEQues,
      AFSVCQues: AFSVCQues,
      SAFFMQues: SAFFMQues,
      respondedQues: respondedQues,
      completedQues: completedQues,
      canceledQues: canceledQues,
      PromotedtoKBQues: PromotedtoKBQues,
      actionReq: custActionReq
    })
    setAllQuestions(allquestions)
    setMyQuestions(myquestions)
  }

  return (
    <>
      <div className="divSubmittercard">
        <div className='divplaceholder'>
          <div className='divheader'>
            <h2>All Questions</h2>
            <Navlink to='/Questions' className='anchorviewall' title='View All'>View All</Navlink>
          </div>
          <div className='divSMEKpis'>
            <ul>
              <li>
                <Navlink to='/Questions' title='Total Questions' kpi-color='0'>
                  <p>Total Questions</p><h2>{AllQuestionsState.length}</h2>
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=3' title='AFIMSC' kpi-color='3'>
                  <p>AFIMSC</p><h2>{SelectFilterVal.AFIMSCNAFFAQues.length}</h2>
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=4' title='SME Review' kpi-color='4'>
                  <p>SME REVIEW</p><h2>{SelectFilterVal.SMEQues.length}</h2>
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=5' title='AFSVC' kpi-color='5'>
                  <p>AFSVC</p><h2>{SelectFilterVal.AFSVCQues.length}</h2>
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=6' title='SAF FMCEB' kpi-color='6'>
                  <p>SAF FMCEB</p><h2>{SelectFilterVal.SAFFMQues.length}</h2>
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=8' title='Completed' kpi-color='8'>
                  <p>COMPLETED</p><h2>{SelectFilterVal.completedQues.length}</h2>
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=7' title='Response Received' kpi-color='7'>
                  {
                      loginuserroles.loginuserrole === 'AFIMSC' || loginuserroles.loginuserrole === 'NAFFA Owners' || loginuserroles.isAFIMSCOwner
                        ? (<><p>RESPONSE RECEIVED</p><h2>{SelectFilterVal.respondedQues.length}</h2> </>)
                        : (<><p>RESPONDED</p><h2>{SelectFilterVal.respondedQues.length}</h2></>)}
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=10' title='Promoted to Knowledge Graph' kpi-color='10'>
                  <p>PROMOTED TO KNOWLEDGE GRAPH</p><h2>{SelectFilterVal.PromotedtoKBQues.length}</h2>
                </Navlink>
              </li>
              <li>
                <Navlink to='/Questions&card=9' title='Canceled' kpi-color='9'>
                  <p>CANCELED</p><h2>{SelectFilterVal.canceledQues.length}</h2>
                </Navlink>
              </li>

              <li>
                <Navlink to='/Questions&card=11' title='Customer Action Required' kpi-color='11'>
                  <p>Customer Action Required</p><h2>{SelectFilterVal.actionReq.length}</h2>
                </Navlink>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='divSubmittercard'>
        <div className='divplaceholder'>
          <div className='divicon'><span className='icon-KnowledgeGraph'></span></div>
          <div className='divcarddetails'>
            <h2>Knowledge Graph</h2>
            <p>Find Knowledge Articles to know the response submitted for previously asked questions</p>
            <Navlink to='/KBInnerview' className='anchorbtn' title='View Articles' kpi-color='2'>View Articles</Navlink>
          </div>
        </div>
      </div>
      <div className="divSubmittercard">
        <div className='divplaceholder'>
          <div className='divicon'><span className='icon-PoliciesDocuments'></span></div>
          <div className='divcarddetails'>
            <h2>Policies & Documents</h2>
            <p>To store and view useful policies and documents in one place for download</p>
            <Navlink to='/PolicyMemo' className='anchorbtn' title='View Policies' kpi-color='3'>View Policies</Navlink>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeBasesec
