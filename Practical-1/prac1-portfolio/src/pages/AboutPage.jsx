import React from 'react';

function AboutPage() {
  return (
    <main className="page page-about">
      <section className="page-header">
        <h1>About Me</h1>
        <p>
          I am a student learning React and building portfolio sites.
          This page explains my interests, learning goals, and project approach.
        </p>
      </section>

      <section className="content card">
        <h2>My Journey</h2>
        <p>
          I enjoy crafting user interfaces with clean layout, accessible navigation,
          and thoughtful typography. I build projects that are easy to maintain and attractive.
        </p>

        <h2>Goals</h2>
        <ul>
          <li>Learn React and modern frontend tooling.</li>
          <li>Build reusable components and pages.</li>
          <li>Create polished portfolio presentations.</li>
        </ul>
      </section>
    </main>
  );
}

export default AboutPage;
