
import { useState } from 'react';
import Header from '../ui/Header';
import Filter from '../ui/Filter';
import AdminNavbar from './AdminNavbar';
import QuickOverview from './QuickOverview';
import ModerateUsers from './ModerateUsers';
import ModerateEvents from './ModerateEvents';
import FlaggedContent from './FlaggedContent';
import Footer from '../ui/Footer';
import './css/AdminPage.css';
import ModerateGroups from './ModerateGroups';

const adminFiltersByTab = {
  events: [
    { value: 'all', label: 'All Events', icon: 'fa-solid fa-layer-group' },
    { value: 'active', label: 'Active Events', icon: 'fa-solid fa-calendar-check' },
    { value: 'expired', label: 'Expired Events', icon: 'fa-regular fa-calendar-xmark' },
  ],
  users: [],
  groups: [],
  reviews: [],
  dashboard: [],
};

const defaultFilterByTab = {
  events: 'all',
  users: '',
  groups: '',
  reviews: '',
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
                <FlaggedContent compact onMore={() => setActiveTab('reviews')} />
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
          {activeTab === 'reviews' ? <FlaggedContent selectedFilter={selectedFilters.reviews} /> : null}
          {activeTab === 'groups' ? <ModerateGroups selectedFilter={selectedFilters.groups} /> : null}
          
        </section>
      </main>
      <Footer />
      </div>
  );
}