import '@fortawesome/fontawesome-free/css/all.min.css'
import './CardDisplay.css'
import React from 'react';

function CardDisplay(props) {
    let items;
    if (props.details != false) {
        items = props.details.map((detail, idx) => (
            <li key={idx} className='detail-item'>
                <i className={`fas ${detail[0]}`}></i>
                <span>{detail[1]}</span>
            </li>
        ))
    }

    const handleCardClick = () => {
        if (props.eventId && typeof props.onOpenEvent === 'function') {
            props.onOpenEvent(props.eventId)
        }
    }

    return (
        <button type='button' className='card card-button' onClick={handleCardClick}>
            <div className='card-image'>
                <img src={props.img.src} alt={props.img.alt} />
            </div>
            <div className='card-content'>
                <h3 className='card-title'>{props.heading}</h3>
                <ul className='card-details'>
                    {items ? items:"Error"}
                </ul>
                <p className='card-description'>
                    {props.description}
                </p>
            </div>
        </button>
    ) 
}

export default CardDisplay