import React, { useState, useEffect } from 'react'
import { useIndexedDB } from 'react-indexed-db'
import { sp } from '@pnp/sp'
import '@pnp/sp/webs'
import '@pnp/sp/lists'
import '@pnp/sp/items'
import '../CSS/KBInnerview.css'
import { ListNames } from '../../pages/Config'
import { GetBuildModifiedList, compareDates, convertDate, GlobalConstraints, GetUserProfile } from '../../pages/Master'
import loader from '../Images/Loader.gif'
import Highlighter from 'react-highlight-words'

const KBInnerview = () => {
  const listName = ListNames().KnowledgeBaseArticles
  const siteName = GlobalConstraints().siteName
  const { add } = useIndexedDB('KBArticles' + siteName + '')
  const { getByID } = useIndexedDB('KBArticles' + siteName + '')
  const { update } = useIndexedDB('KBArticles' + siteName + '')
  const defaultOptionValue = 'ALL'
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const [loaderState, setloaderState] = useState(false)

  const [listItems, setListItems] = useState<any>([])
  const [currentFilter, setCurrentfilter] = useState(undefined as unknown as string)
  const [KBFilteredItems, setFilterItems] = useState<any>([])
  const [inputValue, setInputValue] = useState('')
  const [isProfileExist, setisProfileExist] = useState(true)
  GetUserProfile().then(function () {
    const loginUserProfile = JSON.parse(localStorage.getItem('userProfileData' + siteName) || '{}')
    if (loginUserProfile && loginUserProfile.length === 0) {
      setisProfileExist(false)
    }
  })
  const initEffect = () => {
    GetKBArticles()
    setTimeout(() => {
      toggleLoader(false)
    }, 2000)
  }
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  function GetKBArticles () {
    const siteName = GlobalConstraints().siteName
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
  }

  useEffect(() => {
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])

  const onFilterChanged = (e: any) => {
    let f = e.target.item(e.target.selectedIndex)?.value
    if (f === defaultOptionValue) { f = undefined }
    setCurrentfilter(f)
    setInputValue('')
    const filtered = listItems?.filter((item: any) => { return (f === undefined || item.Subcategory === f) })
    setFilterItems(filtered)
  }

  function renderDropdown () {
    if (listItems.length > 0) {
      let subcat: any = []
      listItems.forEach((item: any) => subcat.push(item.Subcategory))
      subcat = [...new Set(subcat)]
      if (subcat.length > 0) {
        return (
          <select name='Sub Category' id='ddlSubcategory' onChange={onFilterChanged} value={currentFilter}>
            <option value={defaultOptionValue}>{defaultOptionValue}</option>
            {subcat.map((subcategory: any) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
          </select>
        )
      }
    }
  }
  const highlight = (pat: any) => {
    removeHighlight()
    function innerHighlight (node: any, pat: any) {
      let skip = 0
      if (node.nodeType == 3) {
        const pos = node.data.toUpperCase().indexOf(pat)
        if (pos >= 0) {
          const spannode = document.createElement('span')
          spannode.className = 'highlight'
          const middlebit = node.splitText(pos)
          const endbit = middlebit.splitText(pat.length)
          const middleclone = middlebit.cloneNode(true)
          spannode.appendChild(middleclone)
          middlebit.parentNode.replaceChild(spannode, middlebit)
          skip = 1
        }
      } else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
        for (let i = 0; i < node.childNodes.length; ++i) {
          i += innerHighlight(node.childNodes[i], pat)
        }
      }
      return skip
    }
    return $('.li p.description').each(function () {
      innerHighlight(this, pat.toUpperCase())
    })
  }
  const removeHighlight = () => {
    function newNormalize (node: any) {
      for (let i = 0, children = node.childNodes, nodeCount = children.length; i < nodeCount; i++) {
        const child = children[i]
        if (child.nodeType == 1) {
          newNormalize(child)
          continue
        }
        if (child.nodeType != 3) { continue }
        const next = child.nextSibling
        if (next == null || next.nodeType != 3) { continue }
        const combinedtext = child.nodeValue + next.nodeValue
        const newnode = node.ownerDocument.createTextNode(combinedtext)
        node.insertBefore(newnode, child)
        node.removeChild(child)
        node.removeChild(next)
        i--
        nodeCount--
      }
    }
    return $('.li p.description').find('span.highlight').each(function () {
      const thisParent : any = this.parentNode
      thisParent.replaceChild(this.firstChild, this)
      newNormalize(thisParent)
    }).end()
  }
  const searchKB = (e: any) => {
    const searchword = e.target.value
    setInputValue(searchword)
    if (searchword !== '') {
      highlight(searchword)
      const searchdata = (currentFilter !== undefined && currentFilter !== null && currentFilter !== '' ? KBFilteredItems : listItems)
      const filtereddata = searchdata?.filter(
        (data: any) => {
          const description = removehtmltags(data.Description)
          return (
            data.Title.toLowerCase().includes(searchword.toLowerCase()) ||
            description.toLowerCase().includes(searchword.toLowerCase()) ||
            data.Category.toLowerCase().includes(searchword.toLowerCase()) ||
            data.Subcategory.toLowerCase().includes(searchword.toLowerCase())
          )
        }
      )
      setFilterItems(filtereddata)
    } else {
      removeHighlight()
      if (currentFilter !== undefined && currentFilter !== null && currentFilter !== '' && currentFilter !== 'ALL') {
        const filterdata = listItems?.filter((data: any) => { return (data.Subcategory === currentFilter) })
        setFilterItems(filterdata)
      } else {
        setFilterItems(listItems)
      }
    }
  }

  function removehtmltags (data: any) {
    return data.replace(/<[^>]+>/g, '')
  }

  const clearAll = () => {
    const alldata = listItems
    setInputValue('')
    setFilterItems(alldata)
    setCurrentfilter('ALL')
    removeHighlight()
  }
  const ProfileExist = () => {
    document.location = `${window.location.origin + window.location.pathname}#/UserProfile`
    return (
    <></>
    )
  }
  const DocumentIconNames = (file: any) => {
    const fileExtension = file.split('.').pop() ? file.split('.').pop().toLowerCase() : ''
    const iconName = (fileExtension === 'ppt' || fileExtension === 'pptx')
      ? 'icon-pptdoc'
      : (fileExtension === 'pdf')
          ? 'icon-pdf'
          : (fileExtension === 'doc' || fileExtension === 'docx')
              ? 'icon-worddoc'
              : (fileExtension === 'xlsx' || fileExtension === 'xls')
                  ? 'icon-excel'
                  : (fileExtension === 'txt')
                      ? 'icon-file'
                      : (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg')
                          ? 'icon-file'
                          : (fileExtension === 'msg') ? 'icon-email' : 'icon-file'
    return (
      <span className= {iconName}></span>
    )
  }
  return (
    <>
    {
      isProfileExist
        ? (
    <section className='divcontainer boxsizing'>
      <div className='divinnerheader'>
        <h1> <span className="icon-KnowledgeGraph"></span> Knowledge Graph <span className="spanPoccount">{KBFilteredItems?.length}</span> </h1>
        <div className="divheaderelements">
          <div className="divforminline" style = {{ display: (listItems?.length > 0) ? '' : 'none' }}>
            <label htmlFor="SelectdropdownSubCategory">Sub Category</label>
            {renderDropdown()}
          </div>
          <div className="divsearchcontrol" style = {{ display: (listItems?.length > 0) ? '' : 'none' }}>
            <input type="text" name="Search" placeholder="Search" onChange={searchKB} value={inputValue} />
            <a href="javascript:void(0)" title="Search"><span className="icon-searchright"></span></a>
          </div>
          <a href="javascript:void(0)" title="Clear All" className="anchorclearall" onClick={clearAll} style = {{ display: (listItems?.length > 0) ? '' : 'none' }}> Clear All</a>
          <a href='#' className='anchorbackbtn' title='Back'><span className="icon-left-arrow"></span> Back</a>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12 col-md-12 col-sm-12">
          <div className="divinnerrightcontainer">
            <ul>
              <article>
                {KBFilteredItems.length && KBFilteredItems.length > 0
                  ? KBFilteredItems.map((item: any) =>
                    <li key={item.Id} className= 'li'>
                      <header><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Title}/></header>
                       <p className= 'description' dangerouslySetInnerHTML={{ __html: item.Description }}></p>
                       {/* <p ><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Description}/></p> */}
                      {item.AttachmentFiles.length && item.AttachmentFiles.length > 0
                        ? <div className='divinnerattachments'>
                          {item.AttachmentFiles.map((file: any) =>
                            <span key={file.Id}>
                              {DocumentIconNames(file.FileName)}
                              <a href={file.ServerRelativeUrl} title={file.FileName} target='_blank' rel="noreferrer"><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={file.FileName}/></a>
                            </span>
                          )} </div>
                        : ''}
                      <p className='postedinfo'>
                        <span>Posted Date: <label>{convertDate(item.Created, 'date')}</label></span>
                        <span>Category: <label><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Category}/></label></span>
                        <span>Sub Category: <label><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Subcategory}/></label></span>
                      </p>
                    </li>
                  )
                  : <div className={noResultsClass + showStyleClass}> There are no results to display </div>
                }
              </article>
            </ul>
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
        : (
            ProfileExist()
          )
}

</>

  )
}

export default KBInnerview
