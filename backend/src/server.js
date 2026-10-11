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

sequelize.sync({ alter: false }).then(() => {
  console.log('✅ Kết nối database thành công');
  app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ Lỗi kết nối database:', err.message);
});
