
import { useEffect, useState } from 'react';
import { getEvents } from '../../lib/eventsApi';
import { getUsers } from '../../lib/usersApi';
import './css/QuickOverview.css';

export default function QuickOverview(){

    const [users, setUsers] = useState(0);
    const [events, setEvents] = useState(0);
    const [flagged, setFlagged] = useState(0);

    useEffect(() => {
    const fetchData = async () => {
        try {
            const eventsData = await getEvents();
            const usersData = await getUsers();

            setUsers(usersData.length);
            setEvents(eventsData.length);
        } catch(err){
            console.log("Failed to fetch events", err);
        }

        // Placeholder for future moderation data source.
        setFlagged(0);
    };

    fetchData();
    }, []);

    return(
        <div className="quick-overview">
            <section className="total-users">
                <p>
                    <i className="fa-solid fa-user-group"></i>
                    Total Users
                </p>
                <span>{users}</span>
            </section>

            <section className="active-events">
                <p>
                    <i className="fa-solid fa-calendar-check"></i>
                    Active Events
                </p>
                <span>{events}</span>
            </section>

            <section className="flagged-content">
                <p>
                    <i className="fa-solid fa-flag"></i>
                    Flagged Content
                </p>
                <span>{flagged}</span>
            </section>
        </div>
    )
}
