import { createServer } from 'vite';

const originalExit = process.exit;
process.exit = function(code) {
  console.trace(`process.exit called with code: ${code}`);
  originalExit.call(process, code);
};

process.on('SIGINT', () => console.log('Received SIGINT'));
process.on('SIGTERM', () => console.log('Received SIGTERM'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

async function start() {
  try {
    const server = await createServer();
    server.httpServer?.on('close', () => console.log('HTTP Server closed!'));
    server.httpServer?.on('error', (e) => console.log('HTTP Server error:', e));
    
    await server.listen();
    server.printUrls();

    // Keep the Node event loop alive
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
