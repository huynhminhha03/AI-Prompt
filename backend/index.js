require('dotenv').config();
const express = require('express');
const morgan = require('morgan')
const UserRoute = require('./src/routes/UserRoute');
const VnPayRoute = require('./src/routes/VnPayRoute');
const openAIRoute = require('./src/routes/OpenAIRoute');
const CozeRoute = require('./src/routes/CozeRoute');
const sequelize = require('./src/config/database');
const UsageRoute = require('./src/routes/UsageRoute');
const GiftCodeRoute = require('./src/routes/GiftCodeRoute');
const AdminRoute = require('./src/routes/AdminRoute');
async function createDatabase() {
  try {
      // Sync all models defined in sequelize
      sequelize.authenticate();
      await sequelize.sync({ force: false }); // Use `force: true` to drop and recreate the tables (use with caution in production)
  } catch (error) {
      console.error('Error creating the database:', error);
  }
}

const app = express();
const cors = require('cors');

app.use(morgan('combined'))

// app.use(cors(corsOptions));
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:3002',
  'http://localhost:3002',
  'http://localhost:3000',
  'http://0.0.0.0:3000',
  'http://192.168.10.228:3000',
  'https://kldr50z4-3000.asse.devtunnels.ms',
  'https://ss0x2xqz-3000.asse.devtunnels.ms',
  
]
app.use(
  cors({
      origin: (origin, callback) => {
          if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
              callback(null, true)
          } else {
              callback(new Error('Not allowed by CORS'))
          }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
  })
)


app.use(express.json());
app.use('/api/v1/usage', UsageRoute);
app.use('/api/v1/giftcode', GiftCodeRoute);
app.use('/api/v1/openai', CozeRoute);
app.use('/api/v1/user', UserRoute);
app.use('/api/v1/vnpay', VnPayRoute);
app.use('/api/v1/admin', AdminRoute);
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  createDatabase();
  console.log(`Server is running on port ${PORT}`);
});