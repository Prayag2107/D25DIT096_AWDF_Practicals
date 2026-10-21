function Home() {
  return (
    <section>
      <h1>Welcome to My Portfolio</h1>
      <p>This portfolio app uses React Router for multi-page navigation.</p>
      <p>Navigate to Projects and Contact without a full page reload.</p>
      <p style={{ marginTop: '12px' }}>
        <strong style={{ color: 'var(--accent-hover)' }}>New in Practical 4:</strong>{' '}
        Visit the <strong>Tasks</strong> page to interact with the Express REST API backend — full CRUD with middleware pipeline.
      </p>
    </section>
  );
}

export default Home;
