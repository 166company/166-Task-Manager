import LoginForm from '../components/auth/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="card p-8 w-full max-w-sm shadow-xl">
        <LoginForm />
      </div>
    </div>
  )
}
