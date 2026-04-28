"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email!");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="p-6 bg-gray-900 rounded">
        <h1 className="mb-4 text-xl">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="p-2 w-full mb-3 bg-gray-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleLogin} className="bg-blue-500 p-2 w-full">
          Send Magic Link
        </button>
      </div>
    </div>
  );
}