import React from 'react';
import Header from '../components/Header';

function HomePage() {
  return (
    <main className="page page-home">
      <Header name="Student Name" themeColor="#0458a0" />

      <section className="home-intro card">
        <h2>Welcome to My Portfolio</h2>
        <p>
          This portfolio uses React and Vite to show a clean, modern layout with separate pages for Home,
          About, and Skills.
        </p>
        <div className="feature-grid">
          <article>
            <h3>Modern design</h3>
            <p>Responsive sections, subtle shadows, and a polished color palette.</p>
          </article>
          <article>
            <h3>Fast navigation</h3>
            <p>Route-based pages let visitors move quickly between sections.</p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
