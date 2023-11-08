import React from 'react'
import '../CSS/Home.css'
import { NavLink as Link } from 'react-router-dom'
import styled from 'styled-components'

export const Navlink = styled(Link)`  
    
}`

const HomeSubmittersec = () => {
  return (
        <>
            <div className="divSubmittercard">
                <div className='divplaceholder'>
                    <div className='divicon'><span className='icon-SubmitQuestion'></span></div>
                    <div className='divcarddetails'>
                        <h2>Submit A Question</h2>
                        <p>Our team will answer all your queries in a short time to make your work smoother</p>
                        <Navlink to='/QuestionForm' title='View Form' kpi-color='1' className='anchorbtn'>View Form</Navlink>
                    </div>
                </div>
            </div>
            <div className="divSubmittercard">
                <div className='divplaceholder'>
                    <div className='divicon'><span className='icon-KnowledgeGraph'></span></div>
                    <div className='divcarddetails'>
                        <h2>Knowledge Graph</h2>
                        <p>Find Knowledge Articles to know the response submitted for previously asked questions</p>
                        <Navlink to='/KBInnerview' className='anchorbtn' title='View Articles' kpi-color='2' >View Articles</Navlink>
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
            <div className="divSubmittercard">
                <div className='divplaceholder'>
                    <div className='divicon'><span className='icon-MyQuestions'></span></div>
                    <div className='divcarddetails'>
                        <h2>My Questions</h2>
                        <p>Know the status and responses of your questions in a collaborative way</p>
                        <Navlink to='/Questions' className='anchorbtn' title='View All' kpi-color='4'>View All</Navlink>
                    </div>
                </div>
            </div>
        </>
  )
}

export default HomeSubmittersec
