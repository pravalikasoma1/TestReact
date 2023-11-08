/* eslint-disable react/prop-types */
/* eslint-disable space-before-function-paren */
import React, { useEffect, useState } from 'react'
import '../CSS/Home.css'
import { convertDate } from '../../pages/Master'
import { NavLink as Link } from 'react-router-dom'
import styled from 'styled-components'
import { data } from 'jquery'
import Highlighter from 'react-highlight-words'

export const Navlink = styled(Link)`  
    
}`

export interface Props {
  data?: any
  search?: any
}

const RecentKBArticles = (props: Props) => {
  const [inputValue, setInputValue] = useState('')
  const [listItems, setListItems] = useState<any>([])
  const noResultsClass = 'divnoresults '
  const hideStyleClass = 'hidecomponent '
  const showStyleClass = 'showcomponent '
  const { data = [] } = props
  const search = props.search
  const recentdata: any[] = []
  if (data.length && data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      if (i > 3) {
        break
      } else {
        recentdata.push(data[i])
      }
    }
  }
  useEffect(() => {
    if (inputValue === '') {
      const recData = data.slice(0, 4)
      setListItems(recData)
    }
  }, [data])

  function descriptionTrim(data: any, trimLine: number) {
    const tmp = document.createElement('div')
    tmp.innerHTML = data
    let str = tmp.textContent || tmp.innerText || ''
    // str = $(str).children().text()
    if (str.length >= trimLine) {
      str = str.slice(0, trimLine) + '..'
    } else {
      str = str
    }
    return str
  }
  function removehtmltags(data: any) {
    data = data.replace(/<[^>]+>/g, '')
    data = descriptionTrim(data, 250)
    return data
  }
  const searchKB = (e: any) => {
    const searchword = e.target.value
    setInputValue(searchword)
    searchData(searchword)
  }

  const searchKBG = () => {
    const searchword = inputValue
    searchData(searchword)
  }

  function searchData(searchword: any) {
    if (searchword !== '') {
      const filtereddata = data?.filter(
        (data: any) => {
          const des = removehtmltags(data.Description)
          return (
            data.Title.toLowerCase().includes(searchword.toLowerCase()) ||
            des.toLowerCase().includes(searchword.toLowerCase()) ||
            data.Category.toLowerCase().includes(searchword.toLowerCase()) ||
            data.Subcategory.toLowerCase().includes(searchword.toLowerCase())
          )
        }
      )
      const recData = filtereddata.slice(0, 4)
      setListItems(recData)
    } else {
      setListItems(recentdata)
    }
  }

  return (
    <div>
      <div className='divheader'>
        <h2><span className='icon-Recently'></span>Recently added Knowledge Graph</h2>
        <div className='divrightside'>
          <div className='divitem'>
            <div className='divsearchinput'>
              <input type='text' placeholder='Search our knowledge Graph' name='Search knowledge Graph' aria-label='Search knowledge Graph' onChange={searchKB} value={inputValue}></input>
              <a href='javascript:void(0)' className='anchorsearchicon' title='Search' onClick={searchKBG}><span className='icon-searchleft'></span></a>

            </div>
          </div>
          <div className='divitem'>
            <Navlink to='/KBInnerview' title='View All' className='anchorviewall' style={{ display: (listItems?.length > 0) ? '' : 'none' }}>View All</Navlink>
          </div>
        </div>

      </div>
      <div className='divaddedcontainer'>
        {listItems.length && listItems.length > 0
          ? listItems?.map((item :any) =>
            <div key={item.ID} className='divaddedcard'>
              <div className='divplaceholder'>
                <div className='divtop'>
                  <span className='spanheading'><h2><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Title} /></h2></span>
                  <span className='spanactions'>
                    <ul>
                      <li><span className='icon-Calendar'></span> <span>{convertDate(item.Created, 'newdate')}</span></li>
                      <li><span className='spanNaffa'><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={item.Category} /></span></li>
                    </ul>
                  </span>
                </div>
                <div className='divbottom'>
                  {/* <p dangerouslySetInnerHTML={{ __html: descriptionTrim(item.Description, 250) }}></p> */}
                  <p><Highlighter highlightClassName="YourHighlightClass" searchWords={[inputValue]} textToHighlight={removehtmltags(item.Description)} /></p>
                </div>
              </div>
            </div>
          )
          : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}
      </div>
    </div>
  )
}

export default RecentKBArticles
