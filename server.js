require('dotenv').config()
const express = require('express')
const multer = require('multer')
const TelegramBot = require('node-telegram-bot-api')
const cors = require('cors')
const fs = require('fs')

const app = express()
app.use(cors())

// =======================
// 🤖 TELEGRAM BOT
// =======================
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false })

// =======================
// 🧮 BUYURTMA ID (1,2,3…)
// =======================
let orderId = 0

// =======================
// 📂 MULTER (TEMP papka)
// =======================
const upload = multer({ dest: 'tmp/' })

// =======================
// 🚀 API
// =======================
app.post(
  '/send',
  upload.fields([
    { name: 'passport', maxCount: 1 },
    { name: 'check', maxCount: 1 }
  ]),
  async (req, res) => {

    // 1️⃣ Frontendga darhol javob
    res.json({ success: true })

    try {
      orderId++
      const id = orderId

      const { name, telegram, whatsapp } = req.body

      // 📞 WhatsApp raqamni tozalaymiz (faqat raqam)
      const cleanWa = whatsapp.replace(/\D/g, '')

      // 📝 XABAR (WhatsApp bosiladigan)
      await bot.sendMessage(
        process.env.CHAT_ID,
        `🆕 <b>Yangi tekshiruv</b>
🆔 <b>Buyurtma ID:</b> ${id}

👤 <b>Ism:</b> ${name}
📱 <b>Aloqa:</b> ${telegram}
💬 <b>WhatsApp:</b>
<a href="https://api.whatsapp.com/send/?phone=${cleanWa}&text&type=phone_number&app_absent=0">
https://api.whatsapp.com/send/?phone=${cleanWa}
</a>

💸 <b>Narx:</b> 150.000 so‘m`,
        { parse_mode: 'HTML', disable_web_page_preview: true }
      )

      // 📎 PASPORT (FILE)
      await bot.sendDocument(
        process.env.CHAT_ID,
        req.files.passport[0].path,
        { caption: `📎 Pasport | Buyurtma ID ${id}` }
      )

      // 📎 CHEK (FILE)
      await bot.sendDocument(
        process.env.CHAT_ID,
        req.files.check[0].path,
        { caption: `📎 To‘lov cheki | Buyurtma ID ${id}` }
      )

      // 🧹 TEMP fayllarni o‘chiramiz
      fs.unlink(req.files.passport[0].path, () => {})
      fs.unlink(req.files.check[0].path, () => {})

    } catch (err) {
      console.error('Telegram error:', err.message)
    }
  }
)

// =======================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Server ishga tushdi')
})
