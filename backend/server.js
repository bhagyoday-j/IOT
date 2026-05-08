/**
 * Server Entry Point
 * Starts the Express server with MongoDB connection
 */

require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// SERVER STARTUP
// ============================================
const startServer = async () => {
  try {
    // Connect to MongoDB (returns null on connection failure)
    const dbConnection = await connectDB();

    // Start listening
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║   🌾 Smart Agriculture API Server Started 🌾           ║
╠════════════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(40)} ║
║ Port: ${String(PORT).padEnd(46)} ║
║ Server: http://localhost:${String(PORT).padEnd(37)} ║
║ Health: http://localhost:${String(PORT).padEnd(35)}/health ║
║ Docs: http://localhost:${String(PORT).padEnd(40)}/api ║
${!dbConnection ? '║ Status: ⚠️  Running in OFFLINE MODE (no database) ║' : '║ Status: ✅ Ready for requests                      ║'}
╚════════════════════════════════════════════════════════╝
      `);
    });

    // ============================================
    // GRACEFUL SHUTDOWN
    // ============================================
    const gracefulShutdown = async (signal) => {
      console.log(`\n📛 Received ${signal}, shutting down gracefully...`);

      server.close(async () => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ============================================
    // UNHANDLED REJECTIONS
    // ============================================
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
