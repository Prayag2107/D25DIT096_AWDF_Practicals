import { useState } from 'react';

function Contact() {
  const [message, setMessage] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <section>
      <h1>Contact</h1>
      <button type="button" onClick={() => setShowHelp(prev => !prev)}>
        {showHelp ? 'Hide Help' : 'Show Help'}
      </button>
      {showHelp && (
        <p className="help-text">Type your message below and see it update live.</p>
      )}

      <label htmlFor="contact-message">Message</label>
      <input
        id="contact-message"
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Write a short message..."
      />
      <p>Live preview: {message || 'No message yet.'}</p>
      <p>Character count: {message.length}</p>
    </section>
  );
}

export default Contact;
