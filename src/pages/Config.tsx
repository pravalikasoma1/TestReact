import React from 'react'

export function ListNames () {
  const names = {
    UserProfile: 'UserProfile',
    QuickLinksList: 'QuickLinksList',
    QandA: 'QandA',
    PolicyMemoandGuidelines: 'PolicyMemoandGuidelines',
    PointsofContact: 'PointsofContact',
    KnowledgeBaseArticles: 'KnowledgeBaseArticles',
    PASCodeMetadataList: 'PASCodeMetadataList',
    BuildModifiedList: 'BuildModifiedList',
    ProcessFlowMetadata: 'ProcessFlowMetadata',
    QuestionsList: 'QuestionsList',
    QuestionsHistoryList: 'QuestionsHistoryList',
    QuestionsDiscussionsList: 'QuestionsDiscussionsList',
    QuestionsDocumentLibrary: 'QuestionsDocumentLibrary',
    QuestionsResponseList: 'QuestionsResponseList',
    ServiceBaseMetadata: 'ServiceBaseMetadata',
    CategoriesMetadata: 'CategoriesMetadata',
    SubCategoriesMetadata: 'SubCategoriesMetadata',
    HelpDesk: 'HelpDesk',
    ToolTipList: 'ToolTipList',
    NotificationsMetadataList: 'NotificationsMetadataList',
    NotificationsList: 'NotificationsList',
    QuestionNumGenerationList: 'QuestionNumGenerationList',
    SavedQuestionsList: 'SavedQuestionsList',
    SiteFeedBackList: 'SiteFeedBackList'
  }
  return names
}

export function HardCodedNames () {
  const values = {
    HOME: 'HOME',
    QUESTIONS: 'QUESTIONS',
    POINTSOFCONTACT: 'POINTS OF CONTACT',
    POLICYMEMO: 'POLICY MEMOS & GUIDELINES',
    QUICKLINKS: 'QUICK LINKS',
    QANDA: 'Q&A',
    SETTINGS: 'SETTINGS',
    PROFILE: 'PROFILE',
    DDLASSIGNEDCOMPONENT: '<option value="AFIMSC" data-id ="AFIMSC">AFIMSC</option>'
  }
  return values
}

export function EmailTexts () {
  const values = {
    FROM: 'no-reply@sharepointonline.com',
    EndingEmailMessage: 'PLEASE DO NOT REPLY. This mailbox is unmonitored, if you have any questions, please contact: NAFFA Team.'
  }
  return values
}

export function StatusIDs () {
  const ids = {
    Saved: 1,
    Submitted: 2,
    AFIMSCNAFFA: 3,
    SME: 4,
    AFSVC: 5,
    SAFFMCEB: 6,
    Responded: 7,
    Completed: 8,
    Canceled: 9,
    PromotedtoKB: 10,
    Customer: 11
  }
  return ids
}
export function alertMessages () {
  const displayMessages = {
    SendTo: 'Please Select Question with status AFIMSC / Response Received to perform SendTo Action',
    ElevateTo: 'Please Select Question with status AFIMSC / Response Received to perform SendTo Action',
    AssignToNaffaOwner: 'Please select question(s) with same status ( SME / AFSVC / SAF FMCEB ) to perform Assign To Action',
    AssigntoSME: 'Please select question(s) with status SME to perform Assign To action',
    AssigntoAFSVC: 'Please select question(s) with status AFSVC to perform Assign To action',
    AssigntoSAFFMCEB: 'Please select question(s) with status SAF FMCEB to perform Assign To action',
    SelectMsg: 'Please select atleast one question'

  }
  return displayMessages
}
