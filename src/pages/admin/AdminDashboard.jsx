import { useAuth } from '../../context/AuthContext'
import Card from '../../components/Card'
import { Building2, Users, TrendingUp, Activity } from 'lucide-react'

const AdminDashboard = () => {
  const { companies, users } = useAuth()

  const activeCompanies = companies.filter(c => c.active).length
  const activeUsers = users.filter(u => u.active).length
  const adminUsers = users.filter(u => u.role === 'admin').length
  const ownerUsers = users.filter(u => u.role === 'owner').length

  const recentCompanies = [...companies]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Empresas Ativas</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {activeCompanies}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                de {companies.length} total
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {activeUsers}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                de {users.length} total
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Administradores</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {adminUsers}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {ownerUsers} donos de empresa
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Taxa de Crescimento</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                +12%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                últimos 30 dias
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <Card title="Empresas Recentes">
          <div className="space-y-3">
            {recentCompanies.map((company) => (
              <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-xs text-gray-500">{company.cnpj}</div>
                  </div>
                </div>
                <span className={`badge ${company.active ? 'badge-success' : 'badge-danger'}`}>
                  {company.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Users */}
        <Card title="Usuários Recentes">
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-danger' :
                    user.role === 'owner' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {user.role === 'admin' ? 'Admin' :
                     user.role === 'owner' ? 'Dono' : 'Usuário'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Plans Distribution */}
      <Card title="Distribuição de Planos">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Plano Básico</div>
            <div className="text-2xl font-bold text-blue-700 mt-2">
              {companies.filter(c => c.plan === 'basic').length}
            </div>
            <div className="text-xs text-blue-600 mt-1">empresas</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-sm font-medium text-purple-900">Plano Premium</div>
            <div className="text-2xl font-bold text-purple-700 mt-2">
              {companies.filter(c => c.plan === 'premium').length}
            </div>
            <div className="text-xs text-purple-600 mt-1">empresas</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="text-sm font-medium text-orange-900">Plano Enterprise</div>
            <div className="text-2xl font-bold text-orange-700 mt-2">
              {companies.filter(c => c.plan === 'enterprise').length}
            </div>
            <div className="text-xs text-orange-600 mt-1">empresas</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard
