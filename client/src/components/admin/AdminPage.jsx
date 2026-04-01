
import { useState } from 'react';
import Header from '../ui/Header';
import AdminNavbar from './AdminNavbar';
import QuickOverview from './QuickOverview';
import ModerateUsers from './ModerateUsers';
import ModerateEvents from './ModerateEvents';
import PendingReviews from './PendingReviews';
import Footer from '../ui/Footer';
import './css/AdminPage.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-page">
      <Header />
      <main className="a-layout">
        <aside className="a-side">
          <AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <section className="a-content">
          {activeTab === 'dashboard' ? (
            <>
              <h2 className="a-title">Admin Dashboard</h2>
              <QuickOverview />
              <section className="a-dash a-top">
                <ModerateUsers compact onMore={() => setActiveTab('users')} />
                <PendingReviews compact onMore={() => setActiveTab('reviews')} />
              </section>
              <section className="a-dash a-bottom">
                <ModerateEvents compact onMore={() => setActiveTab('events')} />
              </section>
            </>
          ) : null}

          {activeTab === 'users' ? <ModerateUsers /> : null}
          {activeTab === 'events' ? <ModerateEvents /> : null}
          {activeTab === 'reviews' ? <PendingReviews /> : null}
        </section>
      </main>
      <Footer />
      </div>
  );
}