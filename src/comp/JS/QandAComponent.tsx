/* eslint-disable prefer-const */
import React, { ChangeEvent, useEffect, useState } from 'react'
import '../CSS/QandA.css'
import { HardCodedNames, ListNames } from '../../pages/Config'
import { sp } from '@pnp/sp'
import { GetBuildModifiedList, compareDates, convertDate, GlobalConstraints } from '../../pages/Master'
import loader from '../Images/Loader.gif'
import Highlighter from 'react-highlight-words'

// This function is the react element. Anytime you see the element used in HTML,
// this method is called and returns the actual HTML that will be inserted into
// the virtual DOM.
export interface QandAItem {
  ekey?: string,
  etag?: string,
  Title: string,
  Description: string,
  Answer: string,
  Category: string,
  Subcategory: string,
  IsArchived: boolean,
  Created: Date,
  AttachmentFiles: any
}

export interface Props {
  label?: string
  items?: Array<QandAItem>
  listName?: string
}

const QandAComponent = (props: Props) => {
  // After state operations are done, we can start defining variables with local sope
  const label = HardCodedNames().QANDA
  const listName = ListNames().QandA
  const defaultOptionValue = 'ALL'
  const noResultsClass = 'divnoresults '
  const hideStyleClass = 'hidecomponent '
  const showStyleClass = 'showcomponent '
  $('.qandanavigation a').addClass('active')

  // Our design uses react hooks for state management
  // All interactions with hooks have to be done at the start of the function
  // and in the same order on each call.
  const [listItems, setListItems] = useState<Array<QandAItem> | undefined>(undefined)
  const [currentFilter, setCurrentfilter] = useState(undefined as unknown as string)
  let [QandAFilteredItems, setFilterItems] = useState<Array<QandAItem> | undefined>(undefined)
  const [inputValue, setInputValue] = useState('')
  const [loaderState, setloaderState] = useState(false)

  const initEffect = () => {
    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('QandABuildModifiedListDate' + siteName) || ''
      const QandAModifiedDate = localStorage.getItem('QandA_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, QandAModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        const endpoint = ['ID', 'Title', 'Description', 'Answer', 'Category', 'Subcategory', 'IsArchived', 'Created', 'Author/Id', 'Author/Title', 'Editor/Id', 'Editor/Title', 'AttachmentFiles']
        const expand = ['Author', 'Editor', 'AttachmentFiles']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          localStorage.setItem('QandAData' + siteName, JSON.stringify(items))
          localStorage.setItem('QandA_LMDate' + siteName, listModifiedDate)
          const QAItems = items?.filter((item: any) => { return item.IsArchived === false })
          setListItems(QAItems)
          setFilterItems(QAItems)
        })
      } else {
        const QandAData: any = (localStorage.getItem('QandAData' + siteName) !== undefined && localStorage.getItem('QandAData' + siteName) !== '' && localStorage.getItem('QandAData' + siteName) !== null ? JSON.parse(localStorage.getItem('QandAData' + siteName) || '{}') : [])
        const QAItems = QandAData?.filter((item: any) => { return item.IsArchived === false })
        setListItems(QAItems)
        setFilterItems(QAItems)
      }
    } catch (error) {
      console.log(error)
    }
    setTimeout(() => {
      toggleLoader(false)
    }, 2000)
  }

  useEffect(() => {
    // we need async methods and useEffect functions themselves need to be sync
    // because of this, we will normally be calling an async function to do the actual effect work
    toggleLoader(true)
    GetBuildModifiedList().then(function () {
      $('.qandanavigation a').addClass('active')
      initEffect()
    })
  }, [])
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  function onFilterChanged (e: any) {
    let f = e.target.item(e.target.selectedIndex)?.value
    if (f === defaultOptionValue) { f = undefined }
    setCurrentfilter(f)
    setInputValue('')
    const filtered = listItems?.filter((item: any) => { return (f === undefined || item.Subcategory === f) })
    setFilterItems(filtered)
  }

  function renderDropdown () {
    const subcategoryset = Array.from(new Set(listItems?.filter(item => item.Subcategory).map(item => item.Subcategory)))
    if (subcategoryset.length > 0) {
      return (
        <>
          <label htmlFor='selectdropdownsubcategory'>Sub Category</label>
          <select name='Sub Category' id='ddlSubcategory' onChange={onFilterChanged} value={currentFilter}>
            <option value={defaultOptionValue}>{defaultOptionValue}</option>
            {subcategoryset.map((subcategory: any) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}
          </select>
        </>
      )
    }
  }

  function searchQandA (e: any) {
    const searchword = e.target.value
    setInputValue(searchword)

    // highlightAnswer(searchword)
    if (searchword !== '') {
      highlight(searchword)
      const searchdata = (currentFilter !== undefined && currentFilter !== null && currentFilter !== '' ? QandAFilteredItems : listItems)
      const filtereddata = searchdata?.filter(
        (data: any) => {
          const description = data.Description
          const answer = data.Answer
          return (
            data.Title.toLowerCase().includes(searchword.toLowerCase()) ||
            description.toLowerCase().includes(searchword.toLowerCase()) ||
            answer.toLowerCase().includes(searchword.toLowerCase()) ||
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

  function clearAll () {
    const alldata = listItems
    setInputValue('')
    setCurrentfilter('ALL')
    setFilterItems(alldata)
    removeHighlight()
    // $('#search').removeClass('YourHighlightClass')
    // const siteName = GlobalConstraints().siteName
    // localStorage.setItem('QandA_LMDate' + siteName, '')
    // initEffect()
    // $('#search').removeClass('YourHighlightClass')
    // $('#search').each(function () {
    //   $(this).removeClass('YourHighlightClass')
    // })
  }

  const highlight = (pat: any) => {
    removeHighlight()
    function innerHighlight (node: any, pat: any) {
      let skip = 0
      if (node.nodeType == 3) {
        let pos = node.data.toUpperCase().indexOf(pat)
        if (pos >= 0) {
          let spannode = document.createElement('span')
          spannode.className = 'highlight'
          let middlebit = node.splitText(pos)
          let endbit = middlebit.splitText(pat.length)
          let middleclone = middlebit.cloneNode(true)
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
    return $('.li p.description,.li p.Answer').each(function () {
      innerHighlight(this, pat.toUpperCase())
    })
  }
  const removeHighlight = () => {
    function newNormalize (node: any) {
      for (let i = 0, children = node.childNodes, nodeCount = children.length; i < nodeCount; i++) {
        let child = children[i]
        if (child.nodeType == 1) {
          newNormalize(child)
          continue
        }
        if (child.nodeType != 3) { continue }
        let next = child.nextSibling
        if (next == null || next.nodeType != 3) { continue }
        let combinedtext = child.nodeValue + next.nodeValue
        const newnode = node.ownerDocument.createTextNode(combinedtext)
        node.insertBefore(newnode, child)
        node.removeChild(child)
        node.removeChild(next)
        i--
        nodeCount--
      }
    }
    return $('.li p.description,.li p.Answer').find('span.highlight').each(function () {
      let thisParent : any = this.parentNode
      thisParent.replaceChild(this.firstChild, this)
      newNormalize(thisParent)
    }).end()
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
                      ? 'icon-document'
                      : (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg')
                          ? 'icon-document'
                          : (fileExtension === 'msg') ? 'icon-email' : 'icon-document'
    return (
      <span className= {iconName}></span>
    )
  }
  // The main readonly rendering section
  // Everything in here should be fast and non blocking
  return (
    <section className='divcontainer boxsizing'>
      <div className='divinnerheader'>
        <h1><span className='icon-addcomment'></span>{label} <span className='spanPoccount'>{QandAFilteredItems?.length}</span></h1>
        <div className='divheaderelements'>
          <div className='divforminline' style = {{ display: ((listItems && listItems?.length > 0)) ? '' : 'none' }}>

            {renderDropdown()}
          </div>
          <div className='divsearchcontrol' style = {{ display: ((listItems && listItems?.length > 0)) ? '' : 'none' }}>
            <input type='text' name='search' placeholder='Search' onChange={searchQandA} value={inputValue}></input>
            <a href='javascript:void(0)' title='search'><span className='icon-searchright'></span></a>
          </div>
          <a href='javascript:void(0)' title='Clear All' className='anchorclearall' onClick={clearAll} style = {{ display: ((listItems && listItems?.length > 0)) ? '' : 'none' }}> Clear All </a>
        </div>
      </div>
      <div className='row'>
        <div className='col-xl-12 col-md-12 col-sm-12'>
          <div className='divinnerrightcontainer'>
            <ul>
              <article>
                {QandAFilteredItems?.length && QandAFilteredItems?.length > 0
                  ? QandAFilteredItems?.map((item: any) =>
                    <li className='li' key={item.Id}>
                      <header><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Title}/></header>
                      <p className='description' dangerouslySetInnerHTML={{ __html: item.Description }}></p>
                      {/* <p><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={removehtmltags(item.Description)}/></p> */}
                      <b>Answer:</b>
                      <p className='Answer' dangerouslySetInnerHTML={{ __html: item.Answer }}></p>
                       {/* <p><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Answer }/></p> */}

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
                        <span><label>{convertDate(item.Created, 'date')}</label></span>
                        <span>Sub Category: <label><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Subcategory}/></label></span>
                        <span>Category: <label><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Category}/></label></span>
                      </p>
                    </li>
                  )
                  : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}
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
}

export default QandAComponent
