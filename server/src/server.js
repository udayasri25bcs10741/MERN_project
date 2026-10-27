require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5001;

const { markExpiredListings } = require('./services/listing.service');

const server = app.listen(PORT, () => {
  console.log(`FoodBridge server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

// Background cron to automatically mark past-deadline listings as expired
const sweeperInterval = setInterval(async () => {
  try {
    const count = await markExpiredListings();
    if (count > 0) {
      console.log(`[Expiry Sweeper] Marked ${count} expired listing(s).`);
    }
  } catch (err) {
    console.error('[Expiry Sweeper] Error:', err.message);
  }
}, 10 * 60 * 1000);

const shutdown = (signal) => {
  clearInterval(sweeperInterval);
  server.close(() => {
    console.log(`[Server] Closed connection cleanly on ${signal}`);
    if (signal === 'SIGUSR2') {
      process.kill(process.pid, 'SIGUSR2');
    } else {
      process.exit(0);
    }
  });
};

// Handle nodemon restarts
process.once('SIGUSR2', () => shutdown('SIGUSR2'));

// Handle standard termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  clearInterval(sweeperInterval);
  server.close(() => process.exit(1));
});

module.exports = server;
