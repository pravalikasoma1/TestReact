/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import loader from '../../Images/Loader.gif'
import { compareDates, convertDate, GetBuildModifiedList, GlobalConstraints } from '../../../pages/Master'
import { ListNames } from '../../../pages/Config'
import { sp } from '@pnp/sp'

const SubCategorySettings = () => {
  const [showAddPopup, setshowAddPopup] = useState(false)
  const noResultsClass = 'divnoresults '
  const showStyleClass = 'showcomponent '
  const listName = ListNames().SubCategoriesMetadata
  const [listItems, setListItems] = useState<any>([])
  const [loaderState, setloaderState] = useState(false)
  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null
  })
  const [addSCName, setaddSCName] = useState('')
  const [editSCName, seteditSCName] = useState('')
  const [editSCArch, seteditSCArch] = useState('')
  const [SCValidations, setSCValidations] = useState({
    valid: true,
    SCName: true
  })
  const toggleLoader = (val: any) => {
    setloaderState(val)
  }
  const onEdit = (id: any, name: any, isArch: any) => {
    setInEditMode({
      status: true,
      rowKey: id
    })
    const isArchive = isArch ? 'Yes' : 'No'
    setshowAddPopup(false)
    seteditSCName(name)
    seteditSCArch(isArchive)
    setSCValidations({
      ...SCValidations,
      valid: true,
      SCName: true
    })
  }
  useEffect(() => {
    GetBuildModifiedList().then(function () {
      initEffect()
    })
  }, [])

  const initEffect = () => {
    toggleLoader(true)

    try {
      const siteName = GlobalConstraints().siteName
      const listModifiedDate = localStorage.getItem('SubCategoriesMetadataBuildModifiedListDate' + siteName) || ''
      const QLModifiedDate = localStorage.getItem('SC_LMDate' + siteName)
      const needToUpdate = compareDates(listModifiedDate, QLModifiedDate)
      if (needToUpdate) {
        const list = sp.web.lists.getByTitle(listName)
        const endpoint = ['ID', 'Modified', 'Category', 'SubCategory', 'IsArchived', 'Editor/Id', 'Editor/Title']
        const expand = ['Editor']
        list.items.select('' + endpoint + '').expand('' + expand + '').orderBy('Modified', false).top(5000).get().then(function (items) {
          localStorage.setItem('SubCatData' + siteName, JSON.stringify(items))
          localStorage.setItem('SC_LMDate' + siteName, listModifiedDate)
          setListItems(items)
          console.log(items)
          setTimeout(() => {
            toggleLoader(false)
          }, 2000)
        })
      } else {
        const SubCatData: any = (localStorage.getItem('SubCatData' + siteName) !== undefined && localStorage.getItem('SubCatData' + siteName) !== '' && localStorage.getItem('SubCatData' + siteName) !== null ? JSON.parse(localStorage.getItem('SubCatData' + siteName) || '{}') : [])
        setListItems(SubCatData)
        setTimeout(() => {
          toggleLoader(false)
        }, 1000)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const validateSubCat = (id: any, name: any) => {
    toggleLoader(true)
    let valid = true
    let Name = true
    if (name == '' || name == undefined || name == null) {
      valid = false
      Name = false
    }
    setSCValidations({
      ...SCValidations,
      valid: valid,
      SCName: Name
    })
    if (valid) {
      saveOrUpdateSubcat(id)
    } else {
      toggleLoader(false)
    }
  }
  const saveOrUpdateSubcat = (id: any) => {
    console.log(id)
    setshowAddPopup(false)
    setInEditMode({
      status: false,
      rowKey: null
    })
    const isArchived = editSCArch === 'Yes'
    const addObj = {
      Category: 'NAFFA',
      SubCategory: addSCName
    }
    const updateObj = {
      Category: 'NAFFA',
      SubCategory: editSCName,
      IsArchived: isArchived
    }
    if (id !== '' && id !== null && id !== undefined) {
      sp.web.lists.getByTitle(ListNames().SubCategoriesMetadata).items.getById(id).update(updateObj).then(function () {
        BuildmodifiedListUpdate()
      })
    } else {
      sp.web.lists.getByTitle(ListNames().SubCategoriesMetadata).items.add(addObj).then(function () {
        BuildmodifiedListUpdate()
      })
    }
  }
  const BuildmodifiedListUpdate = () => {
    let GetMCount, Id
    const siteName = GlobalConstraints().siteName
    const buildmodifiedlist = JSON.parse(localStorage.getItem('BuildModifiedListData' + siteName) || '{}')
    for (let i = 0; i < buildmodifiedlist.length; i++) {
      if (buildmodifiedlist[i].Name === 'SubCategoriesMetadata') {
        GetMCount = parseInt(buildmodifiedlist[i].Mcount)
        Id = buildmodifiedlist[i].Id
        GetMCount = JSON.stringify(GetMCount + 1)
      }
    }
    const addObj = {
      Mcount: GetMCount
    }
    sp.web.lists.getByTitle(ListNames().BuildModifiedList).items.getById(Id).update(addObj).then(function () {
      GetBuildModifiedList().then(function () {
        initEffect()
        toggleLoader(false)
      })
    })
  }
  const Delete = (id: any) => {
    toggleLoader(true)
    sp.web.lists.getByTitle(ListNames().SubCategoriesMetadata).items.getById(id).delete().then(function () {
      BuildmodifiedListUpdate()
    })
  }
  const displayalertDelete = (id: any) => {
    const proceed = window.confirm('Are you sure, you want to delete the selected item?')
    if (proceed) {
      Delete(id)
    }
  }
  const onClickAdd = () => {
    setshowAddPopup(!showAddPopup)
    setInEditMode({
      status: false,
      rowKey: null
    })
    setSCValidations({
      ...SCValidations,
      valid: true,
      SCName: true
    })
    setaddSCName('')
  }
  return (
    <div id="SubCategory" className="tabcontent SettingsSubCategory page" data-page="Sub-Category">
      <div className="divsettingsheader ">
        <h2><span className="icon-metadata"></span>
          Sub Category</h2>
        <ul className="ulactionitems ulUsergroupsactionitems">

          <li><a href="javascript:void(0)" title="Add" className="anchorsettingglobalbtn" id="addSubCategory" onClick={() => onClickAdd()}>
            <span className="icon-Add"></span>
            Add</a></li>
        </ul>
      </div>
      { showAddPopup
        ? (<div className="divaddpopup divsettingglobalpopup" id="addSubCategoryPopup" >
        <h3>ADD SUB CATEGORY</h3>
        <div className="divcardbody">
          <div className="row">
            <div className="col-xl-12 col-sm-12">
              <div className="divformgroup">
                <label htmlFor="SubCategoryName">
                  Sub Category  </label><span className="mandatory">
                  *</span>
                <input type="text" name="SubCategoryName" id="SubCategoryName" aria-label="Sub Category" aria-required="true" placeholder="Enter Sub Category " autoFocus={true} maxLength={255} value={addSCName} onChange={(event) => setaddSCName(event.target.value)} />
                {!SCValidations.SCName
                  ? (
                    <span className="errormsg" id="SubCategoryTitleErr">
                      Please enter name </span>
                    // eslint-disable-next-line indent
                  )
                  : ''}
              </div>
            </div>

          </div>

          <div className="divpopupfooter">
            <ul>
              <li><a href="javascript:void(0)" title="Save" className="anchorsavebtn" onClick={() => validateSubCat('', addSCName)}>
                <span className="icon-Save"></span>
                Save</a></li>
              <li><a href="javascript:void(0)" title="Cancel" className="anchorcancelbtn anchorglobalcancelbtn"
                id="quicklinkcancelbtn" onClick={() => { setshowAddPopup(false) }}>
                <span className="icon-Close"></span>
                Cancel</a></li>
            </ul>
          </div>
        </div>
      </div>)
        : ''}
      <div className="divcontentarea divSubCategoriescontent">
        <ul id="populateCategory">
          {listItems?.length && listItems?.length > 0
            ? listItems?.map((item: any) =>
              <li id="Categoryid-1" key={item.ID}>
                <div className="divcard divnormalcard">
                  <div className="divitem">
                    <p>Sub Category</p><span id="CategoryNametext-1">{item.SubCategory}</span>
                  </div>

                  <div className="divitem">
                    <p>Modified</p><span id="">{item.Editor.Title} | {convertDate(item.Modified, 'date')}</span>
                  </div>
                  <div className="divitem">
                    <p>Is Archived</p><span id="qlArchtext-1">{item.IsArchived ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="divitem">
                    <p>Actions</p>
                    <ul>
                      <li><a href="javascript:void(0)" title="Edit" className="anchorglobalcardedit"
                        id="qlEdit-1" onClick={() => onEdit(item.Id, item.SubCategory, item.IsArchived)}> <span className="icon-Edit"></span> Edit</a></li>
                      <li><a href="javascript:void(0)" title="Delete" id="qlDelete-1" onClick={() => displayalertDelete(item.Id)}> <span
                        className="icon-trash"></span> Delete </a></li>
                    </ul>
                  </div>

                </div>
                {inEditMode.status && inEditMode.rowKey === item.Id
                  ? (
                    <div id="content-qlEdit1" className="divcardedit divcardeditpopup">
                      <div className="row">
                        <div className="col-xl-12 col-sm-12">
                          <div className="divformgroup">
                            <label htmlFor="SubCategoryName">
                              Sub Category  </label><span className="mandatory">
                              *</span>
                            <input type="text" name="Sub CategoryName" id="SubCategoryName" aria-label="Sub Category"
                              aria-required="true" placeholder="Enter Sub Category " maxLength={255} value={editSCName} onChange={(event) => seteditSCName(event.target.value)} />
                            {!SCValidations.SCName
                              ? (
                                <span className="errormsg" id="SubCategoryTitleErr">
                                  Please enter name </span>
                                // eslint-disable-next-line indent
                              )
                              : ''}
                          </div>
                        </div>

                        <div className="col-xl-4 col-md-4">
                          <div className="divformgroup"><label htmlFor="SelectDropdownIsArchived">Is Archived
                          </label><select name="QuicklinkIsArchived" id="QuicklinkIsArchived-qlEdit1" value={editSCArch} onChange={(event) => seteditSCArch(event.target.value)}>
                              <option value="Yes">Yes</option>
                              <option value="No" selected>No</option>
                            </select></div>
                        </div>

                      </div>

                      <div className="divpopupfooter">
                        <ul>
                          <li><a href="javascript:void(0)" title="Update" aria-label="Update"
                            className="anchorsavebtn" id="qlUpdate-1" onClick={() => validateSubCat(item.Id, editSCName)}> <span className="icon-Update"></span> Update</a>
                          </li>
                          <li><a href="javascript:void(0)" title="Cancel" aria-label="Cancel"
                            className="anchorcancelbtn anchoreditcanel" id="qlCancel-1" onClick={() => { setInEditMode({ ...inEditMode, status: false }) }}> <span
                              className="icon-Close"></span> Cancel</a></li>
                        </ul>
                      </div>
                    </div>)
                  : ''}
              </li>)
            : <div className={noResultsClass + showStyleClass}> There are no results to display </div>}

        </ul>
      </div>
      {
        loaderState
          ? (
            <div className="submit-bg" id="pageoverlay" >
              <div className="copying">
                <p id="displaytext">Working on it</p>
                <img src={loader} alt="loader" aria-label="loader" className="waiting-dot"></img>
              </div>
            </div>
            // eslint-disable-next-line indent
          )
          : ''
      }

    </div>
  )
}
export default SubCategorySettings
