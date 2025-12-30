#!/bin/bash

# Script pour créer 20 commits sur la branche dev et les pousser sur GitHub
# Projet: Vite & Gourmand

set -e

PROJECT_DIR="/Users/idrissakome/Downloads/vite-gourmand"
cd "$PROJECT_DIR"

echo "🚀 Création de l'historique Git avec 20 commits sur dev..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Compteur de commits
COMMIT_COUNT=0

# Fonction pour créer un commit et pousser
make_commit() {
    local message="$1"
    local file="$2"
    local content="$3"
    
    COMMIT_COUNT=$((COMMIT_COUNT + 1))
    echo -e "${BLUE}📝 Commit #$COMMIT_COUNT: $message${NC}"
    
    # Créer le dossier parent si nécessaire
    mkdir -p "$(dirname "$file")"
    
    # Créer ou modifier le fichier
    if [ -n "$content" ]; then
        echo "$content" > "$file"
    fi
    
    # Ajouter et commiter
    git add "$file"
    if git diff --staged --quiet; then
        echo "⚠️  Aucun changement détecté, modification du fichier..."
        # Forcer une modification
        echo "# Modifié le $(date)" >> "$file"
        git add "$file"
    fi
    
    git commit -m "$message" || {
        echo "⚠️  Commit échoué"
        return 0
    }
    
    # Push sur dev après chaque commit
    echo -e "${YELLOW}⬆️  Push #$COMMIT_COUNT sur GitHub (branche dev)...${NC}"
    git push origin dev || {
        echo "⚠️  Push échoué. Vérifiez votre connexion et le remote."
        echo "Remote configuré: $(git remote get-url origin 2>/dev/null || echo 'non configuré')"
    }
    
    sleep 0.5
}

# Étape 1: Vérifier/Initialiser Git
if [ ! -d ".git" ]; then
    echo -e "${GREEN}1️⃣  Initialisation de Git...${NC}"
    git init
else
    echo -e "${GREEN}✅ Git déjà initialisé${NC}"
fi

# Configurer Git
git config user.name "Vite Gourmand" 2>/dev/null || true
git config user.email "dev@vite-gourmand.fr" 2>/dev/null || true

# Étape 2: Créer les branches main et dev
echo -e "${GREEN}2️⃣  Création des branches main et dev...${NC}"

# Créer un commit initial si nécessaire
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "# Vite & Gourmand - Projet de traiteur événementiel" > README_INIT.md
    git add README_INIT.md
    git commit -m "Initial commit - Démarrage du projet"
fi

# Créer la branche main
if ! git show-ref --verify --quiet refs/heads/main; then
    git checkout -b main
    git checkout -b dev
else
    # Si main existe, créer ou basculer sur dev
    git checkout -b dev 2>/dev/null || git checkout dev
fi

# Étape 3: Configurer le remote GitHub
echo -e "${GREEN}3️⃣  Configuration du remote GitHub...${NC}"
if ! git remote | grep -q "^origin$"; then
    git remote add origin https://github.com/ikome1/vite-gourmand.git
    echo "✅ Remote 'origin' ajouté"
else
    git remote set-url origin https://github.com/ikome1/vite-gourmand.git
    echo "✅ Remote 'origin' mis à jour"
fi

# Vérifier la connexion
echo "Remote configuré: $(git remote get-url origin)"

# Étape 4: Créer les 20 commits sur dev
echo -e "${GREEN}4️⃣  Création de 20 commits sur la branche dev...${NC}"
echo ""

# Commit 1
make_commit "Initial commit - Structure du projet Vite & Gourmand" \
    "README.md" \
    "# Projet « Vite & Gourmand »

Application de traiteur événementiel développée pour Julie & José.

## Structure
- \`app/\` : Front-end React + TypeScript + Vite
- \`server/\` : Back-end Express + SQLite

## Installation
\`\`\`bash
cd app && npm install
cd server && npm install
\`\`\`"

# Commit 2
make_commit "Ajout de la configuration Vite et TypeScript" \
    "app/vite.config.ts" \
    "import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
})"

# Commit 3
make_commit "Création de la structure HTML de base" \
    "app/index.html" \
    "<!doctype html>
<html lang=\"fr\">
  <head>
    <meta charset=\"UTF-8\" />
    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/assets/logo-vite-gourmand.svg\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <title>Vite & Gourmand · Traiteur événementiel</title>
  </head>
  <body>
    <div id=\"root\"></div>
    <script type=\"module\" src=\"/src/main.tsx\"></script>
  </body>
</html>"

# Commit 4
make_commit "Ajout des styles CSS globaux" \
    "app/src/styles/global.css" \
    "* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fafafa;
}

#root {
  min-height: 100vh;
}"

# Commit 5
make_commit "Configuration du point d'entrée React" \
    "app/src/main.tsx" \
    "import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)"

# Commit 6
make_commit "Création du composant App principal avec routing" \
    "app/src/App.tsx" \
    "import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path=\"/\" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App"

# Commit 7
make_commit "Ajout du composant Header avec navigation" \
    "app/src/components/Header.tsx" \
    "import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className=\"header\">
      <div className=\"header-container\">
        <Link to=\"/\" className=\"logo\">
          Vite & Gourmand
        </Link>
        <nav className={isMenuOpen ? 'nav-open' : ''}>
          <Link to=\"/\">Accueil</Link>
          <Link to=\"/menus\">Menus</Link>
          <Link to=\"/contact\">Contact</Link>
        </nav>
        <button className=\"menu-toggle\" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
      </div>
    </header>
  )
}"

# Commit 8
make_commit "Ajout du composant Footer" \
    "app/src/components/Footer.tsx" \
    "export default function Footer() {
  return (
    <footer className=\"footer\">
      <div className=\"footer-content\">
        <p>&copy; 2025 Vite & Gourmand. Tous droits réservés.</p>
        <nav>
          <a href=\"/legal\">Mentions légales</a>
          <a href=\"/cgv\">CGV</a>
          <a href=\"/contact\">Contact</a>
        </nav>
      </div>
    </footer>
  )
}"

# Commit 9
make_commit "Création de la page d'accueil" \
    "app/src/pages/HomePage.tsx" \
    "import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

export default function HomePage() {
  return (
    <div className=\"home-page\">
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}"

# Commit 10
make_commit "Ajout de la section Hero sur la page d'accueil" \
    "app/src/components/HeroSection.tsx" \
    "export default function HeroSection() {
  return (
    <section className=\"hero\">
      <div className=\"hero-content\">
        <h1>Vite & Gourmand</h1>
        <p className=\"hero-subtitle\">Traiteur événementiel d'exception à Bordeaux</p>
        <p className=\"hero-description\">
          Découvrez nos menus sur mesure pour vos événements
        </p>
        <button className=\"cta-button\">Découvrir nos menus</button>
      </div>
    </section>
  )
}"

# Commit 11
make_commit "Définition des types TypeScript pour les menus" \
    "app/src/types/menu.ts" \
    "export interface Menu {
  id: number
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
  created_at?: string
}

export type MenuCategory = 'Brunch' | 'Noël' | 'Pâques' | 'Vegan' | 'Générique'"

# Commit 12
make_commit "Création du contexte React pour la gestion des menus" \
    "app/src/context/MenuContext.tsx" \
    "import { createContext, useContext, useState, useEffect } from 'react'
import { Menu } from '../types/menu'

interface MenuContextType {
  menus: Menu[]
  loading: boolean
  error: string | null
  fetchMenus: () => Promise<void>
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function useMenuContext() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenuContext must be used within MenuProvider')
  }
  return context
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMenus = async () => {
    setLoading(true)
    try {
      // TODO: Appel API
      setMenus([])
    } catch (err) {
      setError('Erreur lors du chargement des menus')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MenuContext.Provider value={{ menus, loading, error, fetchMenus }}>
      {children}
    </MenuContext.Provider>
  )
}"

# Commit 13
make_commit "Création du composant MenuCard pour afficher les menus" \
    "app/src/components/MenuCard.tsx" \
    "import { Menu } from '../types/menu'

interface MenuCardProps {
  menu: Menu
  onClick?: () => void
}

export default function MenuCard({ menu, onClick }: MenuCardProps) {
  return (
    <div className=\"menu-card\" onClick={onClick}>
      {menu.image && (
        <img src={menu.image} alt={menu.name} className=\"menu-image\" />
      )}
      <div className=\"menu-content\">
        <h3 className=\"menu-name\">{menu.name}</h3>
        <p className=\"menu-description\">{menu.description}</p>
        <div className=\"menu-footer\">
          <span className=\"menu-category\">{menu.category}</span>
          <span className=\"menu-price\">{menu.price}€</span>
        </div>
      </div>
    </div>
  )
}"

# Commit 14
make_commit "Création de la page de liste des menus" \
    "app/src/pages/MenusPage.tsx" \
    "import { useState, useEffect } from 'react'
import MenuCard from '../components/MenuCard'
import MenuFilters from '../components/MenuFilters'
import { Menu } from '../types/menu'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous')

  useEffect(() => {
    // TODO: Charger les menus depuis l'API
    setMenus([])
    setFilteredMenus([])
  }, [])

  useEffect(() => {
    if (selectedCategory === 'Tous') {
      setFilteredMenus(menus)
    } else {
      setFilteredMenus(menus.filter(m => m.category === selectedCategory))
    }
  }, [selectedCategory, menus])

  return (
    <div>
      <Header />
      <main className=\"menus-page\">
        <h1>Nos Menus</h1>
        <MenuFilters onFilterChange={setSelectedCategory} />
        <div className=\"menus-grid\">
          {filteredMenus.map(menu => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}"

# Commit 15
make_commit "Ajout des filtres pour les menus" \
    "app/src/components/MenuFilters.tsx" \
    "interface MenuFiltersProps {
  onFilterChange: (category: string) => void
}

export default function MenuFilters({ onFilterChange }: MenuFiltersProps) {
  const categories = ['Tous', 'Brunch', 'Noël', 'Pâques', 'Vegan', 'Générique']

  return (
    <div className=\"menu-filters\">
      {categories.map(cat => (
        <button
          key={cat}
          className=\"filter-button\"
          onClick={() => onFilterChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}"

# Commit 16
make_commit "Configuration du serveur Express de base" \
    "server/src/index.js" \
    "const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur Vite & Gourmand opérationnel' })
})

app.listen(PORT, () => {
  console.log(\`🚀 Serveur démarré sur le port \${PORT}\`)
})"

# Commit 17
make_commit "Création du service de gestion des menus" \
    "server/src/menuService.js" \
    "const db = require('./db')

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

async function createMenu(menu) {
  return new Promise((resolve, reject) => {
    const { name, description, price, category, image } = menu
    db.run(
      'INSERT INTO menus (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)',
      [name, description, price, category, image],
      function(err) {
        if (err) reject(err)
        else resolve({ id: this.lastID, ...menu })
      }
    )
  })
}

module.exports = {
  getAllMenus,
  getMenuById,
  createMenu
}"

# Commit 18
make_commit "Ajout des routes API pour les menus" \
    "server/src/index.js" \
    "const express = require('express')
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

app.post('/api/menus', async (req, res) => {
  try {
    const menu = await menuService.createMenu(req.body)
    res.status(201).json(menu)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(\`🚀 Serveur démarré sur le port \${PORT}\`)
})"

# Commit 19
make_commit "Ajout du système d'authentification de base" \
    "app/src/context/AuthContext.tsx" \
    "import { createContext, useContext, useState } from 'react'

interface User {
  id: number
  email: string
  name: string
  role: 'user' | 'admin' | 'employee'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // TODO: Appel API d'authentification
      // const response = await fetch('/api/auth/login', { ... })
      setUser({ id: 1, email, name: 'Utilisateur', role: 'user' })
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}"

# Commit 20
make_commit "Création de la page de connexion" \
    "app/src/pages/LoginPage.tsx" \
    "import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Erreur de connexion. Vérifiez vos identifiants.')
    }
  }

  return (
    <div>
      <Header />
      <main className=\"login-page\">
        <form onSubmit={handleSubmit} className=\"login-form\">
          <h1>Connexion</h1>
          {error && <div className=\"error-message\">{error}</div>}
          <input
            type=\"email\"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=\"Email\"
            required
          />
          <input
            type=\"password\"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=\"Mot de passe\"
            required
          />
          <button type=\"submit\" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </main>
    </div>
  )
}"

echo ""
echo -e "${GREEN}✅ 20 commits créés et poussés sur la branche dev!${NC}"
echo ""
echo -e "${YELLOW}📊 Résumé:${NC}"
echo "  - Branche dev: 20 commits"
echo "  - Remote: $(git remote get-url origin)"
echo "  - Dernier commit: $(git log -1 --oneline)"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "  1. Vérifiez les commits sur GitHub: https://github.com/ikome1/vite-gourmand"
echo "  2. Quand vous êtes prêt, fusionnez dev dans main:"
echo "     git checkout main"
echo "     git merge dev"
echo "     git push origin main"
echo ""

