const db = require('./db')

async function getAllMenus() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM menus ORDER BY created_at DESC', [], (err, rows) => {
      if (err) reject(err)
      else resolve(rows || [])
    })
  })
}

async function getMenuById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM menus WHERE id = ?', [id], (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

module.exports = { getAllMenus, getMenuById }
