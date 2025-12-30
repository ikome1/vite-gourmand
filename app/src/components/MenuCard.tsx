import { Menu } from '../types/menu'

interface MenuCardProps {
  menu: Menu
  onClick?: () => void
}

export default function MenuCard({ menu, onClick }: MenuCardProps) {
  return (
    <div className="menu-card" onClick={onClick}>
      {menu.image && (
        <img src={menu.image} alt={menu.name} className="menu-image" />
      )}
      <div className="menu-content">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-footer">
          <span className="menu-category">{menu.category}</span>
          <span className="menu-price">{menu.price}€</span>
        </div>
      </div>
    </div>
  )
}
