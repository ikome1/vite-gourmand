const express = require('express')
const cors = require('cors')
const menuService = require('./menuService')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur Vite & Gourmand opérationnel' })
})

app.get('/api/menus', async (req, res) => {
  try {
    const menus = await menuService.getAllMenus()
    res.json(menus)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/menus/:id', async (req, res) => {
  try {
    const menu = await menuService.getMenuById(req.params.id)
    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' })
    }
    res.json(menu)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`)
})
