import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// SMMCPAN API Helper
class SMMArabStarsAPI {
  constructor() {
    this.baseURL = process.env.SMM_API_BASE_URL;
    this.apiKey = process.env.SMM_API_KEY;
  }

  async request(endpoint, data = {}) {
    try {
      const response = await axios.post(`${this.baseURL}${endpoint}`, {
        api_key: this.apiKey,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async getBalance() {
    return this.request('/balance');
  }

  async getServices() {
    return this.request('/services');
  }

  async placeOrder(service_id, link, quantity) {
    return this.request('/add', {
      service: service_id,
      link: link,
      quantity: quantity
    });
  }

  async getOrderStatus(order_id) {
    return this.request('/status', {
      order: order_id
    });
  }
}

const smmAPI = new SMMArabStarsAPI();

// API Routes
app.get('/api/balance', async (req, res) => {
  try {
    const balance = await smmAPI.getBalance();
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await smmAPI.getServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { service_id, link, quantity } = req.body;
    if (!service_id || !link || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const order = await smmAPI.placeOrder(service_id, link, quantity);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/order/:orderId', async (req, res) => {
  try {
    const status = await smmAPI.getOrderStatus(req.params.orderId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telegram Bot Commands
bot.start((ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🚀 فتح التطبيق', url: `${process.env.TELEGRAM_MINI_APP_URL}?userId=${ctx.from.id}` }],
      [{ text: '💬 الدعم', url: 'https://t.me/ArabStarsSMM' }]
    ]
  };

  ctx.reply(
    '🌟 مرحباً بك في ArabStarsSMM 🌟\n\n' +
    'تطبيق SMM متكامل لزيادة متابعينك ولايكاتك وتفاعلك!\n\n' +
    'اضغط على الزر أدناه لبدء الاستخدام:',
    { reply_markup: keyboard }
  );
});

bot.help((ctx) => {
  ctx.reply(
    '📚 الأوامر المتاحة:\n' +
    '/start - بدء التطبيق\n' +
    '/services - عرض الخدمات\n' +
    '/balance - عرض الرصيد'
  );
});

bot.command('services', async (ctx) => {
  try {
    const services = await smmAPI.getServices();
    ctx.reply(`📋 عدد الخدمات المتاحة: ${services.length}`);
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الخدمات');
  }
});

bot.command('balance', async (ctx) => {
  try {
    const balance = await smmAPI.getBalance();
    ctx.reply(`💰 رصيدك الحالي: ${balance.balance}`);
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الرصيد');
  }
});

bot.launch();

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ArabStarsSMM is running!' });
});

// Server
app.listen(PORT, () => {
  console.log(`🚀 ArabStarsSMM Server running on port ${PORT}`);
});
