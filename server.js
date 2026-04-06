require('dotenv').config()
const express = require('express')
const multer = require('multer')
const TelegramBot = require('node-telegram-bot-api')
const cors = require('cors')
const fs = require('fs')
const sharp = require('sharp')

const app = express()
app.use(cors())

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false })

let orderId = 0
const upload = multer({ dest: 'tmp/' })

// 📉 RASMNI SIQISH
async function compressImage(input, output) {
  await sharp(input)
    .resize({ width: 1600 })
    .jpeg({ quality: 70 })
    .toFile(output)
}

// 🔥 TEST ROUTE (brauzer uchun)
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
    try {

      // ✅ FILE TEKSHIRISH
      if (!req.files || !req.files.passport || !req.files.check) {
        return res.status(400).json({ error: 'Fayllar topilmadi' })
      }

      // ✅ ID
      orderId++
      const id = String(orderId).padStart(3, '0')

      // ✅ DATA
      const { name, telegram, whatsapp } = req.body
      const wa = (whatsapp || '').replace(/\D/g, '')

      // ✅ TELEGRAM TEXT
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

      // ==== PASSPORT ====
      const pIn = req.files.passport[0].path
      const pOut = `tmp/passport_${id}.jpg`
      await compressImage(pIn, pOut)

      await bot.sendPhoto(
        process.env.CHAT_ID,
        fs.createReadStream(pOut),
        { caption: `📘 Pasport | ID ${id}` }
      )

      // ==== CHEK ====
      const cIn = req.files.check[0].path
      const cOut = `tmp/check_${id}.jpg`
      await compressImage(cIn, cOut)

      await bot.sendPhoto(
        process.env.CHAT_ID,
        fs.createReadStream(cOut),
        { caption: `🧾 To‘lov cheki | ID ${id}` }
      )

      // 🧹 TOZALASH
      fs.unlink(pIn, () => {})
      fs.unlink(cIn, () => {})
      fs.unlink(pOut, () => {})
      fs.unlink(cOut, () => {})

      // ✅ SUCCESS
      res.json({ success: true })

    } catch (e) {
      console.error('ERROR:', e)
      res.status(500).json({ error: 'Serverda xatolik' })
    }
  }
)

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Server ishlayapti')
})
