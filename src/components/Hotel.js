import React from 'react'
import { FcRating } from "react-icons/fc"
const Hotel = ({ hotel }) => {
    return (
    <div className="container">
       <div key={hotel.id} className="hotels-container">     
         <img src={hotel.image} alt={ hotel.name} />
                    <div className="hotel_content">
                        <div  className='rating'>
                        <FcRating fontSize={10} color='red' />
                        <FcRating fontSize={10} color='red' />
                        <FcRating fontSize={10} color='red' />
                            <span>
                               {Number(hotel.rating)}
                            </span>
                        </div>
                    <div className='hotel_title'>
                           <h4>{hotel.name}</h4>
                     </div>
                </div>
         </div>
     </div>
  )
}

export default Hotel
