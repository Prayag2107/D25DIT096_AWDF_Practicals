/*
 * Projects.jsx
 * Practical 3 – API Integration and Data Rendering in React
 *
 * Architecture (as per practical diagram):
 *   Projects.jsx
 *   ├── useEffect() → triggers fetch on component mount        [Step 2]
 *   ├── useState: repos, loading, error                        [Step 1]
 *   ├── [loading] → <Spinner />                               [Step 3]
 *   ├── [error]   → <ErrorMessage />                          [Step 3]
 *   └── [success] → <RepoList repos={filteredRepos} />        [Step 4]
 *
 * Supplementary features implemented:
 *   • Retry button — re-triggers fetch on error
 *   • Search input — filters repo list by name
 *   • Star count   — displayed on each repo card
 */

import { useState, useEffect } from 'react';   
import Spinner      from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import RepoList     from '../components/RepoList';

function Projects() {
  const [repos,   setRepos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [username,      setUsername]      = useState('');       
  const [fetchUsername, setFetchUsername] = useState('octocat'); 
  const [searchQuery,   setSearchQuery]   = useState('');       

  useEffect(() => {
    if (!fetchUsername) return;

    setLoading(true);
    setError(null);
    setRepos([]);

    fetch(`https://api.github.com/users/${fetchUsername}/repos`)
      .then((res) => {
        if (!res.ok) {
          // Handle HTTP errors (e.g. 404 user not found)
          if (res.status === 404) throw new Error('GitHub user not found.');
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message || 'Failed to fetch repositories.'))
      .finally(() => setLoading(false));

  }, [fetchUsername]); 

  const handleSearchUser = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed) {
      setFetchUsername(trimmed);
      setSearchQuery('');
    }
  };

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <section>
      <h1>Projects</h1>
      <Spinner />
    </section>
  );

  if (error) return (
    <section>
      <h1>Projects</h1>
      {/* Supplementary: retry button re-triggers the fetch */}
      <ErrorMessage
        message={error}
        onRetry={() => {
          setFetchUsername(''); // reset then re-set to re-trigger useEffect
          setTimeout(() => setFetchUsername(fetchUsername), 0);
        }}
      />
    </section>
  );

  return (
    <section>
      <h1>Projects</h1>
      <p className="page-subtitle">
        Viewing public repositories for <strong style={{ color: 'var(--accent-hover)' }}>@{fetchUsername}</strong>
      </p>

      {/* GitHub username search form */}
      <form onSubmit={handleSearchUser} className="github-search-form">
        <input
          id="github-username-input"
          type="text"
          className="user-input"
          placeholder="Enter GitHub username…"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="GitHub username"
        />
        <button id="search-user-btn" type="submit">
          🔍 Search User
        </button>
      </form>

      {/* Supplementary: filter input — only shown when repos are loaded */}
      {repos.length > 0 && (
        <div className="filter-bar">
          <label htmlFor="repo-filter">Filter:</label>
          <input
            id="repo-filter"
            type="text"
            className="filter-input"
            placeholder="Search repositories by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter repositories by name"
          />
          <span className="filter-count">
            {filteredRepos.length} / {repos.length}
          </span>
        </div>
      )}

      <RepoList repos={filteredRepos} />
    </section>
  );
}

export default Projects;
