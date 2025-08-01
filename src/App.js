// src/App.js
import React from "react";
import ViraLanding from "./components/ViraLanding";
import { Routes, Route } from 'react-router-dom'


// Copy the entire code from the artifact above
// Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY with your actual credentials



// Supabase configuration - Replace with your actual Supabase credentials
const supabaseUrl = ' https://ffxhwhpcymfbpntaftls.supabase.co'; // Your actual Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmeGh3aHBjeW1mYnBudGFmdGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTQyMTMsImV4cCI6MjA2OTI3MDIxM30.S79kB2yoYMqWoDwJnKlMgLTOs9-bidtRGCzb1deLpVs'; // Your actual anon public key
// ... rest of your code from the artifact ...

function App() {
  return (
    <Routes>
      <Route path="/" element={<ViraLanding />} />
       </Routes>
  );
}

export default App; // 🧠 THIS is required
