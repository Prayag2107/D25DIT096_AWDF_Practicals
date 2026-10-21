// RepoList.jsx – Renders the fetched GitHub repository list
// Displays: repo name, html_url (Step 4) + star count (Supplementary)
function RepoList({ repos }) {
  if (repos.length === 0) {
    return (
      <p className="no-repos">
        <span className="emoji">🔍</span>
        No repositories match your filter.
      </p>
    );
  }

  return (
    <>
      {/* Count badge */}
      <div className="repo-count-bar">
        <h3>Repositories</h3>
        <span className="repo-count-badge">{repos.length} repos</span>
      </div>

      <ul className="repo-list">
        {repos.map((repo) => (
          <li key={repo.id} className="repo-card">
            {/* Header: name + star count (supplementary) */}
            <div className="repo-header">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-name"
              >
                {repo.name}
              </a>
              <span className="repo-stars" title={`${repo.stargazers_count} stars`}>
                ⭐ {repo.stargazers_count}
              </span>
            </div>

            {/* Repository URL — Step 4 requirement */}
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-url-link"
            >
              {repo.html_url}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export default RepoList;
