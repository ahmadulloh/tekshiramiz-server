require('dotenv').config()
const express = require('express')
const multer = require('multer')
const TelegramBot = require('node-telegram-bot-api')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

// =======================
// 🤖 TELEGRAM BOT
// =======================
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false })

// =======================
// 📁 uploads papka
// =======================
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

// =======================
// 🧮 MIJOZ ID SANAGICH
// =======================
const COUNTER_FILE = path.join(__dirname, 'counter.txt')

function getNextClientId() {
  let id = 0
  if (fs.existsSync(COUNTER_FILE)) {
    id = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8')) || 0
  }
  id += 1
  fs.writeFileSync(COUNTER_FILE, String(id))
  return id
}

// =======================
// 📂 MULTER
// =======================
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname)
  }
})
const upload = multer({ storage })

// =======================
// 🧹 FAYL O‘CHIRISH
// =======================
function deleteFile(filePath) {
  fs.unlink(filePath, () => {})
}

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

    // ⚡ foydalanuvchiga darhol javob
    res.json({ success: true })

    try {
      const { name, telegram, whatsapp } = req.body
      const clientId = getNextClientId()

      // 📝 TEXT
      await bot.sendMessage(
        process.env.CHAT_ID,
`🆕 YANGI BUYURTMA
🆔 Buyurtma №${clientId}

👤 Ism: ${name}
📱 Aloqa: ${telegram}
💬 WhatsApp: ${whatsapp}
💰 Narx: 150.000 so‘m`
      )

      // 📎 PASSPORT
      const passportPath = req.files.passport[0].path
      await bot.sendDocument(
        process.env.CHAT_ID,
        fs.createReadStream(passportPath),
        { caption: `📎 Pasport | Buyurtma №${clientId}` }
      )
      deleteFile(passportPath)

      // 📎 CHEK
      const checkPath = req.files.check[0].path
      await bot.sendDocument(
        process.env.CHAT_ID,
        fs.createReadStream(checkPath),
        { caption: `📎 To‘lov cheki | Buyurtma №${clientId}` }
      )
      deleteFile(checkPath)

    } catch (err) {
      console.error('Telegram error:', err.message)
    }
  }
)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Server ishga tushdi')
})
