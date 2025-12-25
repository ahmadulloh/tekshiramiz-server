require('dotenv').config()
const express = require('express')
const multer = require('multer')
const TelegramBot = require('node-telegram-bot-api')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false })

// =======================
// 🧮 MIJOZ ID (RAM)
// =======================
let clientCounter = 0

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
      clientCounter += 1
      const clientId = clientCounter

      const { name, telegram, whatsapp } = req.body

      // 📝 MATN + ID
      await bot.sendMessage(
        process.env.CHAT_ID,
`🆕 Yangi tekshiruv
🆔 Buyurtma ID: ${clientId}

👤 Ism: ${name}
📱 Aloqa: ${telegram}
💬 WhatsApp: ${whatsapp}
💸 Narx: 150.000 so‘m`
      )

      // 📎 PASSPORT (FILE)
      await bot.sendDocument(
        process.env.CHAT_ID,
        req.files.passport[0].path,
        { caption: `📎 Pasport | ID ${clientId}` }
      )

      // 📎 CHEK (FILE)
      await bot.sendDocument(
        process.env.CHAT_ID,
        req.files.check[0].path,
        { caption: `📎 To‘lov cheki | ID ${clientId}` }
      )

      // 🧹 TOZALASH
      fs.unlink(req.files.passport[0].path, () => {})
      fs.unlink(req.files.check[0].path, () => {})

    } catch (e) {
      console.error('Telegram error:', e.message)
    }
  }
)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Server ishga tushdi')
})
