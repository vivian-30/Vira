// src/pages/SignUp.jsx
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else {
      alert("Check your email to confirm your account")
      navigate('/login')
    }
  }

  return (
    <form onSubmit={handleSignUp} className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Join the Alpha Tribe</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 mb-2" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 mb-2" />
      <button className="bg-black text-white px-4 py-2 rounded">Sign Up</button>
    </form>
  )
}
