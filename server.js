require('dotenv').config()
const express = require('express')
const multer = require('multer')
const TelegramBot = require('node-telegram-bot-api')
const cors = require('cors')
const fs = require('fs')

const app = express()
app.use(cors())

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false })

// =======================
// 🧮 BUYURTMA ID (RAM)
// =======================
let orderId = 0

// =======================
// 📂 MULTER (TEMP)
// =======================
const upload = multer({ dest: 'tmp/' })

app.post(
  '/send',
  upload.fields([
    { name: 'passport', maxCount: 1 },
    { name: 'check', maxCount: 1 }
  ]),
  async (req, res) => {

    // FOYDALANUVCHIGA DARHOL JAVOB
    res.json({ success: true })

    try {
      orderId += 1
      const id = orderId

      const { name, telegram, whatsapp } = req.body
      const waNumber = whatsapp.replace(/\D/g, '')

      // 📝 MATN + WHATSAPP LINK
      await bot.sendMessage(
        process.env.CHAT_ID,
        `🆕 <b>Yangi tekshiruv</b>
🆔 <b>Buyurtma ID:</b> ${id}

👤 <b>Ism:</b> ${name}
📱 <b>Aloqa:</b> ${telegram}
💬 <b>WhatsApp:</b>
<a href="https://api.whatsapp.com/send/?phone=${waNumber}&text&type=phone_number&app_absent=0">
${whatsapp}
</a>

💸 <b>Narx:</b> 150.000 so‘m`,
        { parse_mode: 'HTML' }
      )

      // 📸 PASSPORT — PHOTO (MUHIM!)
      await bot.sendPhoto(
        process.env.CHAT_ID,
        fs.createReadStream(req.files.passport[0].path),
        { caption: `📘 Pasport | ID ${id}` }
      )

      // 📸 CHEK — PHOTO
      await bot.sendPhoto(
        process.env.CHAT_ID,
        fs.createReadStream(req.files.check[0].path),
        { caption: `🧾 To‘lov cheki | ID ${id}` }
      )

      // 🧹 TEMP FAYLLARNI O‘CHIRAMIZ
      fs.unlink(req.files.passport[0].path, () => {})
      fs.unlink(req.files.check[0].path, () => {})

    } catch (err) {
      console.error('Telegram error:', err.message)
    }
  }
)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Server ishga tushdi')
})
