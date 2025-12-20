import AuthForm from '@/app/components/AuthForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <AuthForm mode="login" showResetLink={true} />
    </div>
  )
}
