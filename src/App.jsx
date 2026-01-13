import { useState } from 'react'

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">ISH Frontend</h1>
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <button
                        onClick={() => setCount((count) => count + 1)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        count is {count}
                    </button>
                    <p className="mt-4 text-gray-600">
                        Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.jsx</code> and save to test HMR
                    </p>
                </div>
                <p className="mt-4 text-gray-500">
                    Tailwind CSS is working! 🎉
                </p>
            </div>
        </div>
    )
}

export default App
