import React from 'react';

function Skills({ skillList }) {
  return (
    <section id="skills" style={{ padding: '20px' }}>
      <h2>Skills</h2>
      <ul>
        {skillList.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
