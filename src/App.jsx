import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FinanceProvider } from './context/FinanceContext'
import { RegistersProvider } from './context/RegistersContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import BankReconciliation from './pages/BankReconciliation'
import Budgets from './pages/Budgets'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import AIAssistant from './pages/AIAssistant'
import BankAccounts from './pages/BankAccounts'
import CreditCards from './pages/CreditCards'
import Suppliers from './pages/Suppliers'
import FinancialAnalysis from './pages/FinancialAnalysis'
import InvoiceManagement from './pages/InvoiceManagement'
import AdminDashboard from './pages/admin/AdminDashboard'
import CompanyManagement from './pages/admin/CompanyManagement'
import UserManagement from './pages/admin/UserManagement'

// Componente para proteger rotas
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin } = useAuth()
  
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function AppRoutes() {
  const { currentUser } = useAuth()
  
  return (
    <Routes>
      <Route path="/login" element={
        currentUser ? <Navigate to="/" replace /> : <Login />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/transactions" element={
        <ProtectedRoute>
          <Layout>
            <Transactions />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reconciliation" element={
        <ProtectedRoute>
          <Layout>
            <BankReconciliation />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/budgets" element={
        <ProtectedRoute>
          <Layout>
            <Budgets />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/categories" element={
        <ProtectedRoute>
          <Layout>
            <Categories />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-assistant" element={
        <ProtectedRoute>
          <Layout>
            <AIAssistant />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/bank-accounts" element={
        <ProtectedRoute>
          <Layout>
            <BankAccounts />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/credit-cards" element={
        <ProtectedRoute>
          <Layout>
            <CreditCards />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/suppliers" element={
        <ProtectedRoute>
          <Layout>
            <Suppliers />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/financial-analysis" element={
        <ProtectedRoute>
          <Layout>
            <FinancialAnalysis />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices" element={
        <ProtectedRoute>
          <Layout>
            <InvoiceManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/companies" element={
        <ProtectedRoute adminOnly>
          <Layout>
            <CompanyManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/users" element={
        <ProtectedRoute adminOnly>
          <Layout>
            <UserManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <RegistersProvider>
        <FinanceProvider>
          <Router>
            <AppRoutes />
          </Router>
        </FinanceProvider>
      </RegistersProvider>
    </AuthProvider>
  )
}

export default App
