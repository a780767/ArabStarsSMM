import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// User sessions storage (in-memory)
const userSessions = {};

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

// ============================================
// TELEGRAM BOT COMMANDS
// ============================================

bot.start((ctx) => {
  const keyboard = Markup.keyboard([
    ['💰 رصيدي', '📋 الخدمات'],
    ['➕ طلب جديد', '📊 طلباتي'],
    ['❓ مساعدة', '📞 تواصل معنا']
  ]).resize();

  ctx.reply(
    '🌟 *مرحباً بك في ArabStarsSMM* 🌟\n\n' +
    '📱 تطبيق SMM متكامل لزيادة متابعينك ولايكاتك وتفاعلك!\n\n' +
    '🎯 اختر من القائمة أدناه:',
    { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    }
  );
});

// عرض الرصيد
bot.hears('💰 رصيدي', async (ctx) => {
  try {
    await ctx.reply('⏳ جاري تحميل رصيدك...');
    const balance = await smmAPI.getBalance();
    
    await ctx.reply(
      `💰 *رصيدك الحالي*\n\n` +
      `💵 الرصيد: ${balance.balance || balance.data?.balance || '0'} ريال\n\n` +
      `🔄 آخر تحديث: الآن`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الرصيد. حاول مرة أخرى لاحقاً.');
    console.error(error);
  }
});

// عرض الخدمات
bot.hears('📋 الخدمات', async (ctx) => {
  try {
    await ctx.reply('⏳ جاري تحميل الخدمات...');
    const services = await smmAPI.getServices();
    
    let servicesList = '📋 *الخدمات المتاحة:*\n\n';
    
    if (Array.isArray(services)) {
      services.slice(0, 10).forEach((service, index) => {
        servicesList += `${index + 1}. ${service.name || service.service}\n`;
        servicesList += `   💵 السعر: ${service.rate || service.price} لكل ${service.quantity || '1'}\n`;
        servicesList += `   📊 الحد الأدنى: ${service.min || '1'}\n\n`;
      });
    } else {
      servicesList = '📋 عدد الخدمات المتاحة: ' + (services.length || 0);
    }
    
    await ctx.reply(servicesList, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الخدمات. حاول مرة أخرى لاحقاً.');
    console.error(error);
  }
});

// طلب جديد
bot.hears('➕ طلب جديد', (ctx) => {
  const userId = ctx.from.id;
  userSessions[userId] = { step: 'waiting_service_id' };
  
  const keyboard = Markup.keyboard([
    ['❌ إلغاء']
  ]).resize();
  
  ctx.reply(
    '📝 *إنشاء طلب جديد*\n\n' +
    '1️⃣ اكتب رقم الخدمة (مثال: 1):\n\n' +
    '_اكتب "الخدمات" أولاً لرؤية جميع الخيارات_',
    { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    }
  );
});

// طلباتي
bot.hears('📊 طلباتي', async (ctx) => {
  try {
    await ctx.reply('⏳ جاري تحميل طلباتك...');
    
    ctx.reply(
      '📊 *آخر طلباتك:*\n\n' +
      '_(هذه ميزة قريباً)_\n\n' +
      '💡 استخدم `/order [رقم الطلب]` لمتابعة طلب معين',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الطلبات.');
  }
});

// المساعدة
bot.hears('❓ مساعدة', (ctx) => {
  ctx.reply(
    '📚 *الأوامر المتاحة:*\n\n' +
    '💰 *رصيدي* - عرض رصيدك الحالي\n' +
    '📋 *الخدمات* - عرض جميع الخدمات المتاحة\n' +
    '➕ *طلب جديد* - إنشاء طلب جديد\n' +
    '📊 *طلباتي* - عرض طلباتك السابقة\n' +
    '❓ *مساعدة* - عرض هذه الرسالة\n\n' +
    '━━━━━━━━━━━\n' +
    '📞 للتواصل معنا: @ArabStarsSMM_support\n' +
    '🌐 موقعنا: www.arabstarsmm.com',
    { parse_mode: 'Markdown' }
  );
});

// تواصل معنا
bot.hears('📞 تواصل معنا', (ctx) => {
  ctx.reply(
    '📞 *تواصل معنا:*\n\n' +
    '💬 Telegram: @ArabStarsSMM_support\n' +
    '📧 البريد: support@arabstarsmm.com\n' +
    '⏰ ساعات العمل: 24/7',
    { parse_mode: 'Markdown' }
  );
});

// إلغاء
bot.hears('❌ إلغاء', (ctx) => {
  const userId = ctx.from.id;
  delete userSessions[userId];
  
  const keyboard = Markup.keyboard([
    ['💰 رصيدي', '📋 الخدمات'],
    ['➕ طلب جديد', '📊 طلباتي'],
    ['❓ مساعدة', '📞 تواصل معنا']
  ]).resize();
  
  ctx.reply('❌ تم الإلغاء. اختر من القائمة:', { reply_markup: keyboard });
});

// معالجة الرسائل النصية
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const session = userSessions[userId];
  
  if (!session) {
    ctx.reply('❌ أرجو اختيار عملية من القائمة أدناه.');
    return;
  }
  
  // الخطوة الأولى: انتظار رقم الخدمة
  if (session.step === 'waiting_service_id') {
    session.service_id = ctx.message.text;
    session.step = 'waiting_link';
    
    const keyboard = Markup.keyboard([
      ['❌ إلغاء']
    ]).resize();
    
    ctx.reply(
      '🔗 *اكتب رابط الحساب:*\n\n' +
      'مثال: https://www.instagram.com/username',
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  }
  // الخطوة الثانية: انتظار الرابط
  else if (session.step === 'waiting_link') {
    session.link = ctx.message.text;
    session.step = 'waiting_quantity';
    
    const keyboard = Markup.keyboard([
      ['❌ إلغاء']
    ]).resize();
    
    ctx.reply(
      '📊 *اكتب الكمية:*\n\n' +
      'مثال: 100',
      { 
        parse_mode: 'Markdown',
        reply_markup: keyboard 
      }
    );
  }
  // الخطوة الثالثة: انتظار الكمية وإرسال الطلب
  else if (session.step === 'waiting_quantity') {
    const quantity = ctx.message.text;
    
    try {
      await ctx.reply('⏳ جاري معالجة طلبك...');
      
      const order = await smmAPI.placeOrder(session.service_id, session.link, quantity);
      
      const keyboard = Markup.keyboard([
        ['💰 رصيدي', '📋 الخدمات'],
        ['➕ طلب جديد', '📊 طلباتي'],
        ['❓ مساعدة', '📞 تواصل معنا']
      ]).resize();
      
      await ctx.reply(
        '✅ *تم إنشاء الطلب بنجاح!*\n\n' +
        `📋 رقم الطلب: ${order.order_id || order.id || 'N/A'}\n` +
        `💵 السعر: ${order.charge || order.price || 'N/A'} ريال\n` +
        `⏳ الحالة: قيد المعالجة\n\n` +
        '💡 سيتم تنفيذ طلبك في الساعات القادمة',
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard 
        }
      );
      
      delete userSessions[userId];
    } catch (error) {
      ctx.reply('❌ حدث خطأ في إرسال الطلب. حاول مرة أخرى.');
      console.error(error);
      
      const keyboard = Markup.keyboard([
        ['💰 رصيدي', '📋 الخدمات'],
        ['➕ طلب جديد', '📊 طلباتي'],
        ['❓ مساعدة', '📞 تواصل معنا']
      ]).resize();
      
      await ctx.reply('اختر من القائمة:', { reply_markup: keyboard });
      delete userSessions[userId];
    }
  }
});

// أوامر إضافية
bot.command('help', (ctx) => {
  ctx.reply(
    '📚 *الأوامر المتاحة:*\n\n' +
    '/start - بدء البوت\n' +
    '/balance - عرض الرصيد\n' +
    '/services - عرض الخدمات\n' +
    '/help - المساعدة',
    { parse_mode: 'Markdown' }
  );
});

bot.command('balance', async (ctx) => {
  try {
    const balance = await smmAPI.getBalance();
    ctx.reply(`💰 رصيدك الحالي: ${balance.balance || balance.data?.balance || '0'} ريال`);
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الرصيد');
  }
});

bot.command('services', async (ctx) => {
  try {
    const services = await smmAPI.getServices();
    ctx.reply(`📋 عدد الخدمات المتاحة: ${Array.isArray(services) ? services.length : services.data?.length || 0}`);
  } catch (error) {
    ctx.reply('❌ خطأ في جلب الخدمات');
  }
});

// معالج الأخطاء
bot.catch((err, ctx) => {
  console.error('Bot Error:', err);
  ctx.reply('❌ حدث خطأ. حاول مرة أخرى.');
});

// بدء البوت
bot.launch();

// Express Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ArabStarsSMM Bot is running!' });
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`🚀 ArabStarsSMM Bot Server running on port ${PORT}`);
  console.log(`✅ Bot is active and ready!`);
});
