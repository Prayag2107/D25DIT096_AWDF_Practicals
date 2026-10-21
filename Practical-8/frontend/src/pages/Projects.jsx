import React, { useState, useEffect } from 'react';
import { FolderGit2, Star, GitFork, ExternalLink, Search, RefreshCw, AlertCircle } from 'lucide-react';

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [username, setUsername] = useState('');
  const [fetchUsername, setFetchUsername] = useState('octocat');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRepositories = async (targetUser) => {
    if (!targetUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.github.com/users/${targetUser}/repos?sort=updated&per_page=12`);
      if (!res.ok) {
        if (res.status === 404) throw new Error(`GitHub user "${targetUser}" not found.`);
        throw new Error(`GitHub API error (Status ${res.status})`);
      }
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch repositories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories(fetchUsername);
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

  return (
    <div className="projects-page">
      <div className="page-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="title" style={{ marginBottom: '0.5rem' }}>Projects & Repositories</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Explore open-source projects via GitHub REST API. Viewing repositories for{' '}
          <strong style={{ color: 'var(--primary)', fontWeight: 600 }}>@{fetchUsername}</strong>
        </p>
      </div>

      {/* GitHub Username Search */}
      <form onSubmit={handleSearchUser} className="card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="github-username-input"
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Enter GitHub username (e.g. facebook, vercel, octocat)..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-label="GitHub username"
          />
        </div>
        <button id="search-user-btn" type="submit" className="btn btn-primary">
          <Search size={16} /> Fetch User
        </button>
      </form>

      {/* Filter and Count Bar */}
      {!loading && !error && repos.length > 0 && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '400px' }}>
            <label htmlFor="repo-filter" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Filter:</label>
            <input
              id="repo-filter"
              type="text"
              className="form-control"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.875rem' }}
              placeholder="Search repositories by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter repositories by name"
            />
          </div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredRepos.length}</strong> of <strong>{repos.length}</strong> repositories
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem', width: '36px', height: '36px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Fetching repositories for @{fetchUsername}...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', borderColor: 'var(--danger)' }}>
          <AlertCircle size={40} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Unable to load repositories</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{error}</p>
          <button
            className="btn btn-outline"
            onClick={() => fetchRepositories(fetchUsername)}
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      )}

      {/* Repository Grid */}
      {!loading && !error && (
        filteredRepos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <FolderGit2 size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3>No repositories found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or username.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {filteredRepos.map((repo) => (
              <div key={repo.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: 0 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FolderGit2 size={18} style={{ color: 'var(--primary)' }} />
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem' }}
                        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                      >
                        {repo.name}
                      </a>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {repo.visibility || 'public'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', minHeight: '2.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {repo.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={14} style={{ color: 'var(--warning)' }} />
                      {repo.stargazers_count}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <GitFork size={14} />
                      {repo.forks_count}
                    </span>
                    {repo.language && (
                      <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                        {repo.language}
                      </span>
                    )}
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    <ExternalLink size={12} /> View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default Projects;
