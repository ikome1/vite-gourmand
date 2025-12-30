import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ContactPage } from './pages/ContactPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';
import { LoginPage } from './pages/LoginPage';
import { MenuDetailPage } from './pages/MenuDetailPage';
import { MenusPage } from './pages/MenusPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrderPage } from './pages/OrderPage';
import { ProSpacePage } from './pages/ProSpacePage';
import { RegisterPage } from './pages/RegisterPage';
import { TermsPage } from './pages/TermsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menus" element={<MenusPage />} />
        <Route path="/menus/:menuId" element={<MenuDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/commande/:menuId" element={<OrderPage />} />
        <Route path="/espace-pro" element={<ProSpacePage />} />
        <Route path="/mentions-legales" element={<LegalPage />} />
        <Route path="/conditions-generales" element={<TermsPage />} />
      </Route>
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
