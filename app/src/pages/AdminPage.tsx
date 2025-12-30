import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface MenuStats {
  menuId: string;
  menuTitle: string;
  orderCount: number;
  totalRevenue: number;
  averagePrice: number;
}

interface RevenueStats {
  total: number;
  byMenu: Array<{
    menuId: string;
    menuTitle: string;
    revenue: number;
    orderCount: number;
  }>;
}

export function AdminPage() {
  const { currentUser, token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [menuStats, setMenuStats] = useState<MenuStats[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'statistics'>('employees');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ email: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [token, activeTab]);

  async function fetchData() {
    if (!token) return;

    setLoading(true);
    try {
      if (activeTab === 'employees') {
        const res = await fetch(`${API_BASE}/api/admin/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmployees(data.data || []);
      } else {
        const [statsRes, revenueRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/statistics/orders-by-menu`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/admin/statistics/revenue`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const statsData = await statsRes.json();
        const revenueData = await revenueRes.json();
        setMenuStats(statsData.data || []);
        setRevenueStats(revenueData.data || null);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCreating(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/admin/employees`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création.');
      }

      setNewEmployee({ email: '', password: '' });
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDisableEmployee = async (employeeId: string) => {
    if (!token || !confirm('Êtes-vous sûr de vouloir désactiver ce compte ?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/employees/${employeeId}/disable`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la désactivation.');
      }

      fetchData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (!currentUser || currentUser.role !== 'administrateur') {
    return (
      <div className="admin-page__unauthorized">
        <h1>Accès refusé</h1>
        <p>Cette page est réservée aux administrateurs.</p>
        <NavLink to="/" className="app-button">
          Retour à l'accueil
        </NavLink>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1>Espace Administrateur</h1>
        <NavLink to="/espace-pro" className="app-button app-button--ghost">
          ← Retour à l'espace pro
        </NavLink>
      </header>

      <div className="admin-page__tabs">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'employees' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Gestion des employés
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'statistics' ? 'admin-tab--active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistiques
        </button>
      </div>

      {activeTab === 'employees' && (
        <section className="admin-page__section">
          <div className="admin-page__section-header">
            <h2>Liste des employés</h2>
            <button
              type="button"
              className="app-button"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Annuler' : 'Créer un compte employé'}
            </button>
          </div>

          {showCreateForm && (
            <form className="admin-page__create-form" onSubmit={handleCreateEmployee}>
              <h3>Nouveau compte employé</h3>
              {error && <p className="form-feedback">{error}</p>}
              <div className="form-group">
                <label htmlFor="employee-email">Email (sera l'identifiant)</label>
                <input
                  id="employee-email"
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="employee-password">Mot de passe (10+ caractères, majuscule, minuscule, chiffre, spécial)</label>
                <input
                  id="employee-password"
                  type="password"
                  required
                  minLength={10}
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                />
              </div>
              <button type="submit" className="app-button" disabled={creating}>
                {creating ? 'Création...' : 'Créer le compte'}
              </button>
            </form>
          )}

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="employees-table-wrapper">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nom</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={4}>Aucun employé trouvé.</td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.email}</td>
                        <td>
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td>{new Date(employee.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <button
                            type="button"
                            className="app-button app-button--secondary app-button--small"
                            onClick={() => handleDisableEmployee(employee.id)}
                          >
                            Désactiver
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'statistics' && (
        <section className="admin-page__section">
          <h2>Statistiques</h2>

          {loading ? (
            <p>Chargement des statistiques...</p>
          ) : (
            <>
              {revenueStats && (
                <div className="admin-page__stats-card">
                  <h3>Chiffre d'affaires total</h3>
                  <p className="stats-total">
                    {revenueStats.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
              )}

              <div className="admin-page__stats-card">
                <h3>Commandes par menu</h3>
                {menuStats.length === 0 ? (
                  <p>Aucune statistique disponible.</p>
                ) : (
                  <>
                    <div className="stats-chart-wrapper">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={menuStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="menuTitle" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="orderCount" fill={getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#bf1e2e'} name="Nombre de commandes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="stats-table-wrapper">
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Menu</th>
                            <th>Nombre de commandes</th>
                            <th>Chiffre d'affaires</th>
                            <th>Prix moyen</th>
                          </tr>
                        </thead>
                        <tbody>
                          {menuStats.map((stat) => (
                            <tr key={stat.menuId}>
                              <td>{stat.menuTitle}</td>
                              <td>{stat.orderCount}</td>
                              <td>
                                {stat.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </td>
                              <td>
                                {stat.averagePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {revenueStats && revenueStats.byMenu.length > 0 && (
                <div className="admin-page__stats-card">
                  <h3>Chiffre d'affaires par menu</h3>
                  <div className="stats-chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueStats.byMenu}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="menuTitle" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} €`} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#f79f1f" name="Chiffre d'affaires (€)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="stats-table-wrapper">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>Menu</th>
                          <th>Nombre de commandes</th>
                          <th>Chiffre d'affaires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueStats.byMenu.map((item) => (
                          <tr key={item.menuId}>
                            <td>{item.menuTitle}</td>
                            <td>{item.orderCount}</td>
                            <td>{item.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

