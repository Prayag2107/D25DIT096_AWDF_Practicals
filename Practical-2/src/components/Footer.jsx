function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-left">© {new Date().getFullYear()} Portfolio</div>
        <div className="footer-right">
          <a href="/privacy">Privacy</a>
          <span className="sep">•</span>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
