# 🌟 ArabStarsSMM

**تطبيق Telegram Mini App متكامل لخدمات SMM مع تكامل API SMMCPAN**

## ✨ المميزات

- 🚀 Telegram Mini App متقدم
- 💰 إدارة الرصيد والطلبات
- 📋 عرض الخدمات المتاحة
- 📊 تتبع الطلبات
- 🔐 تكامل آمن مع SMMCPAN API
- 📱 واجهة سهلة الاستخدام بالعربية

## 🛠️ المتطلبات

- Node.js 16+
- npm أو yarn
- Telegram Bot Token
- SMMCPAN API Key

## 📦 التثبيت المحلي

```bash
# استنساخ المستودع
git clone https://github.com/a780767/ArabStarsSMM.git
cd ArabStarsSMM

# تثبيت المتعلقات
npm install

# إنشاء ملف .env
cp .env.example .env

# تحرير .env وإضافة مفاتيحك
# TELEGRAM_BOT_TOKEN=your_token
# SMM_API_KEY=your_api_key
# TELEGRAM_MINI_APP_URL=https://your-domain.com

# تشغيل التطبيق
npm start
```

## 🚀 النشر على Railway

### الخطوة 1: إعداد Railway
1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخولك أو إنشاء حساب جديد
3. انقر على **"New Project"**

### الخطوة 2: ربط GitHub
1. اختر **"Deploy from GitHub"**
2. اختر المستودع **ArabStarsSMM**
3. انقر على **"Deploy"**

### الخطوة 3: إضافة المتغيرات

في لوحة تحكم Railway:

1. انتقل إلى **"Variables"**
2. أضف المتغيرات التالية:

```
TELEGRAM_BOT_TOKEN=your_token_here
SMM_API_KEY=your_api_key_here
SMM_API_BASE_URL=https://smmcpan.com/api/v2
TELEGRAM_MINI_APP_URL=https://your-railway-domain.railway.app
NODE_ENV=production
PORT=3000
```

### الخطوة 4: الانتظار للنشر
- سيقوم Railway تلقائياً بـ Build و Deploy
- ستحصل على رابط النطاق الخاص بك

### الخطوة 5: تحديث Telegram Bot

```bash
# في Terminal
curl -F "url=https://your-railway-domain.railway.app" \
  https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook
```

## 🔐 متغيرات البيئة

```env
# Telegram
TELEGRAM_BOT_TOKEN=          # من BotFather

# SMMCPAN API
SMM_API_KEY=                 # من لوحة SMMCPAN
SMM_API_BASE_URL=https://smmcpan.com/api/v2

# التطبيق
PORT=3000
NODE_ENV=production
TELEGRAM_MINI_APP_URL=       # رابط Railway
```

## 📚 API Endpoints

### الحصول على الرصيد
```http
GET /api/balance
```

### الحصول على الخدمات
```http
GET /api/services
```

### إنشاء طلب
```http
POST /api/order
Content-Type: application/json

{
  "service_id": "123",
  "link": "https://instagram.com/profile",
  "quantity": 100
}
```

### التحقق من حالة الطلب
```http
GET /api/order/:orderId
```

## 🤖 أوامر البوت

- `/start` - بدء التطبيق
- `/help` - عرض الأوامر
- `/services` - عرض الخدمات
- `/balance` - عرض الرصيد

## 🛡️ الأمان

- ✅ جميع المفاتيح محفوظة في متغيرات البيئة
- ✅ CORS مفعل
- ✅ معالجة آمنة للأخطاء
- ✅ التحقق من البيانات المدخلة

## 📄 الترخيص

MIT License - انظر LICENSE للتفاصيل

## 👨‍💻 المساهمة

المساهمات مرحب بها! يرجى:
1. Fork المستودع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. فتح Pull Request

## 📞 الدعم

للمساعدة والدعم: [راسلنا على Telegram](https://t.me/ArabStarsSMM)

---

**صُنع بـ ❤️ بواسطة ArabStars**
