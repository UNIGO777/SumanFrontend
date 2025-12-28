import { useState } from 'react'
import { motion } from 'framer-motion'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold"
      >
        Suman Frontend
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-sm"
      >
        Vite + Tailwind CSS + Framer Motion
      </motion.p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setCount((c) => c + 1)}
        className="mt-8 rounded-lg bg-indigo-600 px-4 py-2 font-medium shadow hover:bg-indigo-500"
      >
        Count: {count}
      </motion.button>
    </div>
  )
}

export default App
