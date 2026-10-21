import React from 'react';

function Header({ name, themeColor }) {
  return (
    <header style={{ backgroundColor: themeColor, padding: '20px', color: 'white' }} id="home">
      <h1>Student Portfolio</h1>
      <h2>{name}</h2>
    </header>
  );
}

export default Header;
