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

app.post(
  '/send',
  upload.fields([
    { name: 'passport', maxCount: 1 },
    { name: 'check', maxCount: 1 }
  ]),
  async (req, res) => {
    res.json({ success: true })

    try {
      orderId++
      const id = orderId
      const { name, telegram, whatsapp } = req.body
      const wa = whatsapp.replace(/\D/g, '')

      await bot.sendMessage(
        process.env.CHAT_ID,
        `🆕 <b>Yangi tekshiruv</b>
🆔 <b>Buyurtma ID:</b> ${id}

👤 <b>Ism:</b> ${name}
📱 <b>Aloqa:</b> ${telegram}
💬 <b>WhatsApp:</b>
<a href="https://api.whatsapp.com/send/?phone=${wa}&text&type=phone_number&app_absent=0">${whatsapp}</a>

💸 <b>Narx:</b> 150.000 so‘m`,
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

    } catch (e) {
      console.error(e.message)
    }
  }
)

app.listen(process.env.PORT || 3000, () =>
  console.log('✅ Server ishlayapti')
)
