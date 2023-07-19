import React from 'react';
import {FcPhone, FcGlobe } from 'react-icons/fc';
const Hotel = ({ hotel, onClick }) => {
  const renderRatingStars = () => {
    const rating = parseFloat(hotel.rating); 
    const fullStars = Math.floor(rating); 
    const hasHalfStar = rating - fullStars >= 0.5;
    const fullStarsComponent = '⭐️'.repeat(fullStars);
    const halfStarComponent = hasHalfStar ? '⭐️' : '';
    return `${fullStarsComponent}${halfStarComponent}`;
  };

  return (
    <div className="container">
      <div key={hotel.id} className="hotels-container">
        <img src={hotel.image} alt={hotel.name} onClick={onClick} />
        <div className="hotel_content">
          <div className="hotel_title">
            <h4>{hotel.name}</h4>
          </div>
          <div className="hotel_details">
            {hotel.phoneNumber && (
              <div className="phone">
                <FcPhone fontSize={20}/> 
                <span>{hotel.phoneNumber}</span>
              </div>
            )}
            {hotel.website && (
              <div className="website">
                <a href={hotel.website} target='_blank'  rel="noopener noreferrer">
                <FcGlobe fontSize={20} />
                </a>
              </div>
            )}
            <div className="rating">
            <span role="img" aria-label="Rating">
              {renderRatingStars()}
            </span>
            <span>{Number(hotel.rating)}</span>
          </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Hotel;
