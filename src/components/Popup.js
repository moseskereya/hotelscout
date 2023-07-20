import React from 'react';
import './Popup.css'

const Popup = ({ selectedPlace, onClose }) => {
    const renderRatingStars = () => {
        const rating = parseFloat(selectedPlace.rating); 
        const fullStars = Math.floor(rating); 
        const hasHalfStar = rating - fullStars >= 0.5;
        const fullStarsComponent = '⭐️'.repeat(fullStars);
        const halfStarComponent = hasHalfStar ? '⭐️' : '';
        return `${fullStarsComponent}${halfStarComponent}`;
 };

    const handlePhoneClick = () => {
        if (selectedPlace.phoneNumber) {
          window.location.href = `tel:${selectedPlace.phoneNumber}`;
        }
     
    };
    
  return (
    <div className='popup-container'>
    <div className="popup-content">
      <h3>{selectedPlace.name}</h3>
      {selectedPlace.image && (
        <img src={selectedPlace.image} alt={selectedPlace.name}/>
      )}
      {selectedPlace.rating && (
        <p>Rating: {selectedPlace.rating} {renderRatingStars()}</p>
      )}
      {selectedPlace.address && (
        <p>Address: {selectedPlace.address}</p>
      )}
      {selectedPlace.website && (
        <p>
          Website: <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer">{selectedPlace.website}</a>
        </p>
      )}
        {selectedPlace.phoneNumber && (
          <p>
            Phone:{' '}
            <a href={`tel:${selectedPlace.phoneNumber}`} onClick={handlePhoneClick}>
              {selectedPlace.phoneNumber}
            </a>
          </p>
        )}
      <button onClick={onClose}>Close</button>
    </div>
    </div>
  
  );
};

export default Popup;
