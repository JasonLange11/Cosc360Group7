import './CardDisplay.css'
import React from 'react';

function CardDisplay(props) {
    let items;
    if (props.details != false) {
        items = props.details.map(e => <li style={{backgroundImage: `url(${e[0]})`, backgroundRepeat:'no-repeat', backgroundPosition:"left center"}}>{e[1]}</li>)
    }

    return (
        <div className='card'>
            <img src={props.img.src} alt={props.img.alt} className='card img'/>
            <h3>{props.heading}</h3>
            <ul>
                {items ? items:"Error"}
            </ul>
            <hr />
            <p>
                {props.description}
            </p>
        </div>
    ) 
}

export default CardDisplay