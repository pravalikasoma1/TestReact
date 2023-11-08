import React from 'react'
import { convertDate } from '../../pages/Master'

export interface Props {
    data?: any
  }

const DetailedviewResponse = (props: Props) => {
  const { data = [] } = props

  return (
    <div className="divplaceholder">
        <header>
            <h3>Response</h3>
        </header>
        <div className="divplaceholderbody">
            {data.map((item: any) =>
                <div className="divcontent divresponse" key={item.ID}>
                    <div className="divDescription">
                        <p dangerouslySetInnerHTML={{ __html: item.Response }}></p>
                    </div>
                    <div className="col-md-8 col-xs-12 responseinfo">
                        <p>By: <span>{item.ItemCreatedBy.Title}</span> </p>
                        <p>{convertDate(item.ItemCreated, 'date')}</p>
                    </div>
                </div>
            )}
        </div>
    </div>
  )
}

export default DetailedviewResponse
