import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import ListingDetail from './pages/ListingDetail'
import SellerProfile from './pages/SellerProfile'
import CreateListing from './pages/CreateListing'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Alerts from './pages/Alerts'
import AdminLayout from './pages/Admin/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import AdminListings from './pages/Admin/AdminListings'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminCategories from './pages/Admin/AdminCategories'
import AdminReports from './pages/Admin/AdminReports'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buscar" element={<Search />} />
        <Route path="/producto/:slug" element={<ListingDetail />} />
        <Route path="/vendedor/:id" element={<SellerProfile />} />
        <Route path="/publicar" element={<CreateListing />} />
        <Route path="/ingresar" element={<Auth mode="login" />} />
        <Route path="/registro" element={<Auth mode="register" />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/perfil/editar" element={<EditProfile />} />
        <Route path="/perfil/favoritos" element={<Favorites />} />
        <Route path="/perfil/historial" element={<History />} />
        <Route path="/perfil/alertas" element={<Alerts />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="publicaciones" element={<AdminListings />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="reportes" element={<AdminReports />} />
        </Route>
      </Routes>
      <Footer />
      <BottomNav />
    </>
  )
}
