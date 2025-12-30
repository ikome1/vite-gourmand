const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur Vite & Gourmand opérationnel' })
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`)
})
