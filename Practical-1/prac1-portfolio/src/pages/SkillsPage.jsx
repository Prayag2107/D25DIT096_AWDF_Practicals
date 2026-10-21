import React from 'react';
import Skills from '../components/Skills';

function SkillsPage() {
  const mySkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'Responsive Design'];

  return (
    <main className="page page-skills">
      <section className="page-header">
        <h1>Skills</h1>
        <p>These are the core tools and technologies I am using while learning frontend development.</p>
      </section>

      <section className="content card">
        <Skills skillList={mySkills} />
      </section>
    </main>
  );
}

export default SkillsPage;
