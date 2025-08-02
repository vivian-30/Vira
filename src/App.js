// src/App.js
import React from "react";
import ViraLanding from "./components/ViraLanding";
import { Routes, Route } from 'react-router-dom'


// Copy the entire code from the artifact above
// Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with your actual credentials



// Supabase configuration - Replace with your actual Supabase credentials
const supabaseUrl = '#'; // Your actual Project URL
const supabaseAnonKey = '#'
// ... rest of your code from the artifact ...

function App() {
  return (
    <Routes>
      <Route path="/" element={<ViraLanding />} />
       </Routes>
  );
}

export default App; // 🧠 THIS is required
