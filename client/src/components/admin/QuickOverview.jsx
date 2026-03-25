
import { useEffect, useState } from 'react';
import { getEvents } from '../../lib/eventsApi';
import { getUsers } from '../../lib/usersApi';

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
    };

    fetchData();
    }, []);
    return(
        <div>
            <h2>Admin Dashboard</h2>
            <section className="total-users">
                <p>Total Users</p>
                <span>{users}</span>
            </section>
            <section className="active-events">
                <p>Active Events</p>
                <span>{events}</span>
            </section>
            <section className="flagged-content">
                <p>Flagged Context</p>
                <span>{flagged}</span>
            </section>
        </div>
    )
}
