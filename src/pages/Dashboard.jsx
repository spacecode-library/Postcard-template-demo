import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.firstName} {user?.lastName}!</p>
      <p>Email: {user?.email}</p>
      <button onClick={logout} style={{ marginTop: '20px' }}>
        Logout
      </button>
    </div>
  )
}

export default Dashboard