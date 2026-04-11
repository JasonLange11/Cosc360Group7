
import { useEffect, useState } from 'react';
import { getEvents } from '../../lib/eventsApi';
import { getUsers } from '../../lib/usersApi';
import { getFlags } from '../../lib/flagsApi.js';
import './css/QuickOverview.css';

export default function QuickOverview(){

    const [users, setUsers] = useState(0);
    const [events, setEvents] = useState(0);
    const [flagged, setFlagged] = useState(0);

    useEffect(() => {
    const fetchData = async () => {
        try {
            const [eventsData, usersData, flagsData] = await Promise.all([
                getEvents(),
                getUsers(),
                getFlags(),
            ]);

            setUsers(usersData.length);
            setEvents(eventsData.length);
            setFlagged(Array.isArray(flagsData) ? flagsData.filter((flag) => flag.status === 'open').length : 0);
        } catch(err){
            console.log("Failed to fetch events", err);
        }
    };

    fetchData();
    }, []);

    useEffect(() => {
        function handleUserRemoved() {
            setUsers((currentUsers) => Math.max(0, currentUsers - 1));
        }

        function handleFlagCountDelta(event) {
            const delta = Number(event?.detail?.delta || 0);

            if (!Number.isFinite(delta) || delta === 0) {
                return;
            }

            setFlagged((currentFlags) => Math.max(0, currentFlags + delta));
        }

        window.addEventListener('admin:user-removed', handleUserRemoved);
        window.addEventListener('admin:open-flag-count-delta', handleFlagCountDelta);

        return () => {
            window.removeEventListener('admin:user-removed', handleUserRemoved);
            window.removeEventListener('admin:open-flag-count-delta', handleFlagCountDelta);
        };
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
