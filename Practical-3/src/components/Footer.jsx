function Footer() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} Dev Portfolio &nbsp;|&nbsp;
        Built with <span>React 18</span> + <span>Vite</span> &nbsp;|&nbsp;
        Powered by <span>GitHub API</span>
      </p>
    </footer>
  );
}

export default Footer;
