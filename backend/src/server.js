require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server nội bộ' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(async () => {
  console.log('✅ Kết nối database thành công');
  const { User } = require('./models');
  const count = await User.count().catch(() => 0);
  if (count === 0) {
    console.log('⚙️  Database trống, chạy seed...');
    try { require('./utils/seed'); } catch (e) { console.error('Seed lỗi:', e.message); }
  }
  app.listen(PORT, () => console.log(`🚀 Server đang chạy tại port ${PORT}`));
}).catch(err => {
  console.error('❌ Lỗi kết nối database:', err.message);
  process.exit(1);
});
