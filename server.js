require('dotenv').config()
const express = require('express')
const multer = require('multer')
const TelegramBot = require('node-telegram-bot-api')
const cors = require('cors')
const fs = require('fs')

const app = express()
app.use(cors())

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false })

let orderId = 0
const upload = multer({ dest: 'tmp/' })

// TEST
app.get('/', (req, res) => {
  res.send('Server ishlayapti 🚀')
})

app.post(
  '/send',
  upload.fields([
    { name: 'passport', maxCount: 1 },
    { name: 'check', maxCount: 1 }
  ]),
  async (req, res) => {

    res.json({ success: true })

    try {

      // ID
     const id = Math.floor(100 + Math.random() * 900) // 100-999

      const { name, telegram, whatsapp } = req.body
      const wa = whatsapp.replace(/\D/g, '')

      await bot.sendMessage(
        process.env.CHAT_ID,
`🆕 <b>Yangi tekshiruv</b>
🆔 <b>Buyurtma ID:</b> ${id}

👤 <b>Ism:</b> ${name}
📱 <b>Aloqa:</b> ${telegram}
💬 <b>WhatsApp:</b>
<a href="https://api.whatsapp.com/send/?phone=${wa}">${whatsapp}</a>

💸 <b>Narx:</b> 180.000 so‘m`,
        { parse_mode: 'HTML' }
      )

      // PASSPORT
   await bot.sendPhoto(
  process.env.CHAT_ID,
  req.files.passport[0].path,
  { caption: `📘 Pasport | ID ${id}` }
)

await bot.sendPhoto(
  process.env.CHAT_ID,
  req.files.check[0].path,
  { caption: `🧾 To‘lov cheki | ID ${id}` }
)

      // TOZALASH
      fs.unlink(req.files.passport[0].path, () => {})
      fs.unlink(req.files.check[0].path, () => {})

    } catch (e) {
      console.error(e.message)
    }
  }
)

app.listen(process.env.PORT || 3000, () =>
  console.log('✅ Server ishlayapti')
)
