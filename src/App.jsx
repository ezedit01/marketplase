import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import Footer from './components/layout/Footer'
import PageLoader from './components/layout/PageLoader'
import Home from './pages/Home'
import Search from './pages/Search'

// El resto de las páginas se cargan solo cuando hacen falta, así el bundle
// inicial (lo que se descarga al entrar por primera vez) queda liviano.
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const SellerProfile = lazy(() => import('./pages/SellerProfile'))
const CreateListing = lazy(() => import('./pages/CreateListing'))
const CreatePicker = lazy(() => import('./pages/CreatePicker'))
const Explore = lazy(() => import('./pages/Explore'))
const Auth = lazy(() => import('./pages/Auth'))
const Profile = lazy(() => import('./pages/Profile'))
const EditProfile = lazy(() => import('./pages/EditProfile'))
const Favorites = lazy(() => import('./pages/Favorites'))
const History = lazy(() => import('./pages/History'))
const Alerts = lazy(() => import('./pages/Alerts'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Businesses = lazy(() => import('./pages/Businesses'))
const BusinessDetail = lazy(() => import('./pages/BusinessDetail'))
const CreateBusiness = lazy(() => import('./pages/CreateBusiness'))
const EditBusiness = lazy(() => import('./pages/EditBusiness'))
const Services = lazy(() => import('./pages/Services'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const CreateService = lazy(() => import('./pages/CreateService'))
const EditService = lazy(() => import('./pages/EditService'))
const Jobs = lazy(() => import('./pages/Jobs'))
const JobDetail = lazy(() => import('./pages/JobDetail'))
const CreateJob = lazy(() => import('./pages/CreateJob'))
const EditJob = lazy(() => import('./pages/EditJob'))
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AdminListings = lazy(() => import('./pages/Admin/AdminListings'))
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'))
const AdminCategories = lazy(() => import('./pages/Admin/AdminCategories'))
const AdminReports = lazy(() => import('./pages/Admin/AdminReports'))
const AdminBusinesses = lazy(() => import('./pages/Admin/AdminBusinesses'))
const AdminBusinessCategories = lazy(() => import('./pages/Admin/AdminBusinessCategories'))
const AdminServices = lazy(() => import('./pages/Admin/AdminServices'))
const AdminServiceCategories = lazy(() => import('./pages/Admin/AdminServiceCategories'))
const AdminJobs = lazy(() => import('./pages/Admin/AdminJobs'))
const AdminJobCategories = lazy(() => import('./pages/Admin/AdminJobCategories'))

export default function App() {
  return (
    <>
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/producto/:slug" element={<ListingDetail />} />
          <Route path="/vendedor/:id" element={<SellerProfile />} />
          <Route path="/publicar" element={<CreatePicker />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/publicar/producto" element={<CreateListing />} />
          <Route path="/negocios" element={<Businesses />} />
          <Route path="/negocios/publicar" element={<CreateBusiness />} />
          <Route path="/negocios/:slug/editar" element={<EditBusiness />} />
          <Route path="/negocio/:slug" element={<BusinessDetail />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/servicios/publicar" element={<CreateService />} />
          <Route path="/servicios/:slug/editar" element={<EditService />} />
          <Route path="/servicio/:slug" element={<ServiceDetail />} />
          <Route path="/empleos" element={<Jobs />} />
          <Route path="/empleos/publicar" element={<CreateJob />} />
          <Route path="/empleos/:slug/editar" element={<EditJob />} />
          <Route path="/empleo/:slug" element={<JobDetail />} />
          <Route path="/ingresar" element={<Auth mode="login" />} />
          <Route path="/registro" element={<Auth mode="register" />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/perfil/editar" element={<EditProfile />} />
          <Route path="/perfil/favoritos" element={<Favorites />} />
          <Route path="/perfil/historial" element={<History />} />
          <Route path="/perfil/alertas" element={<Alerts />} />
          <Route path="/notificaciones" element={<Notifications />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="publicaciones" element={<AdminListings />} />
            <Route path="negocios" element={<AdminBusinesses />} />
            <Route path="categorias-negocios" element={<AdminBusinessCategories />} />
            <Route path="servicios" element={<AdminServices />} />
            <Route path="categorias-servicios" element={<AdminServiceCategories />} />
            <Route path="empleos" element={<AdminJobs />} />
            <Route path="categorias-empleos" element={<AdminJobCategories />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="reportes" element={<AdminReports />} />
          </Route>
        </Routes>
      </Suspense>
      <Footer />
      <BottomNav />
    </>
  )
}
