
import { useState } from 'react';
import Header from '../ui/Header';
import Filter from '../ui/Filter';
import AdminNavbar from './AdminNavbar';
import QuickOverview from './QuickOverview';
import ModerateUsers from './ModerateUsers';
import ModerateEvents from './ModerateEvents';
import FlaggedContent from './FlaggedContent';
import Reports from './Reports';
import Footer from '../ui/Footer';
import './css/AdminPage.css';
import ModerateGroups from './ModerateGroups';

const adminFiltersByTab = {
  events: [
    { value: 'all', label: 'All Events', icon: 'fa-solid fa-layer-group' },
    { value: 'active', label: 'Active Events', icon: 'fa-solid fa-calendar-check' },
    { value: 'expired', label: 'Expired Events', icon: 'fa-regular fa-calendar-xmark' },
  ],
  users: [
    { value: 'users', label: 'Users', icon: 'fa-regular fa-user' },
    { value: 'admins', label: 'Admins', icon: 'fa-solid fa-crown' },
    { value: 'all', label: 'All', icon: 'fa-solid fa-user-group' }
  ],
  groups: [],
  reports: [
    { value: 'attendance', label: 'Total Attendance', icon: 'fa-solid fa-user-check' },
    { value: 'unique-attendees', label: 'Unique Attendees', icon: 'fa-solid fa-users-viewfinder' },
    { value: 'events-created', label: 'Events Created', icon: 'fa-solid fa-calendar-plus' },
    { value: 'users-created', label: 'Users Created', icon: 'fa-solid fa-user-plus' },
  ],
  dashboard: [],
};

const defaultFilterByTab = {
  events: 'all',
  users: 'users',
  groups: '',
  reports: 'attendance',
  dashboard: '',
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFilters, setSelectedFilters] = useState(defaultFilterByTab);

  const activeFilters = adminFiltersByTab[activeTab] || [];

  function handleFilterChange(value) {
    setSelectedFilters((currentFilters) => ({
      ...currentFilters,
      [activeTab]: value,
    }));
  }

  return (
    <div className="admin-page">
      <Header />
      <main className="a-layout">
        <aside className="a-side">
          <AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />

          {activeFilters.length > 0 ? (
            <section className="a-side-filters">
              <h3 className="a-side-filters-title">Filters</h3>
              <Filter
                options={activeFilters}
                selectedValue={selectedFilters[activeTab]}
                onChange={handleFilterChange}
                ariaLabel={`${activeTab} filters`}
                fullWidth
              />
            </section>
          ) : null}
        </aside>

        <section className="a-content">
          {activeTab === 'dashboard' ? (
            <>
              <h2 className="a-title">Admin Dashboard</h2>
              <QuickOverview />
              <section className="a-dash a-top">
                <ModerateUsers compact onMore={() => setActiveTab('users')} />
                <FlaggedContent compact onMore={() => setActiveTab('flagged')} selectedFilter="open" />
              </section>
              <section className="a-dash a-bottom">
                <ModerateEvents compact onMore={() => setActiveTab('events')} />
              </section>
              <section className="a-dash a-bottom">
                <ModerateGroups compact onMore={() => setActiveTab('groups')} />
              </section>
            </>
          ) : null}

          {activeTab === 'users' ? <ModerateUsers selectedFilter={selectedFilters.users} /> : null}
          {activeTab === 'events' ? <ModerateEvents selectedFilter={selectedFilters.events} /> : null}
          {activeTab === 'flagged' ? <FlaggedContent selectedFilter="open" /> : null}
          {activeTab === 'reports' ? <Reports selectedFilter={selectedFilters.reports} /> : null}
          {activeTab === 'groups' ? <ModerateGroups selectedFilter={selectedFilters.groups} /> : null}
          
        </section>
      </main>
      <Footer />
      </div>
  );
}