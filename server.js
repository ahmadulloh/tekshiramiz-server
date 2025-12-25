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
// 📂 MULTER
// =======================
const upload = multer({
  dest: path.join(__dirname, 'uploads')
})

// =======================
// 🚀 SEND
// =======================
app.post(
  '/send',
  upload.fields([
    { name: 'passport', maxCount: 1 },
    { name: 'check', maxCount: 1 }
  ]),
  async (req, res) => {

    // foydalanuvchiga darhol javob
    res.json({ success: true })

    try {
      const { name, telegram, whatsapp } = req.body

      // 🆔 Telegram o‘zi bergan ID
      const uniqId = Date.now().toString().slice(-6)

      // 📩 MATN
      const msg = await bot.sendMessage(
        process.env.CHAT_ID,
`🆕 Yangi tekshiruv
🆔 Buyurtma ID: ${uniqId}

👤 Ism: ${name}
📱 Telegram/Telefon: ${telegram}
💬 WhatsApp: ${whatsapp}
💸 Narx: 150.000 so‘m`
      )

      // 📎 PASSPORT (file)
      await bot.sendDocument(
        process.env.CHAT_ID,
        fs.createReadStream(req.files.passport[0].path),
        { caption: `📎 Pasport | ID: ${uniqId}` }
      )

      // 📎 CHEK (file)
      await bot.sendDocument(
        process.env.CHAT_ID,
        fs.createReadStream(req.files.check[0].path),
        { caption: `📎 To‘lov cheki | ID: ${uniqId}` }
      )

      // 🧹 fayllarni o‘chiramiz
      fs.unlink(req.files.passport[0].path, () => {})
      fs.unlink(req.files.check[0].path, () => {})

    } catch (e) {
      console.error(e)
    }
  }
)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Server ishga tushdi')
})
