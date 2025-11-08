// import React, { useState } from 'react'

// const LeetcodeFetch = () => {
//   const [username, setUsername] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [showMenu, setShowMenu] = useState(false)
//   const [showPopup, setShowPopup] = useState(false)

//   const getQuestionFromAI = async (profileData) => {
//     try {
//       const response = await fetch('/api/azure-openai/question', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(profileData)
//       });
      
//       if (!response.ok) throw new Error('Failed to get question from AI');
      
//       return await response.json();
//     } catch (err) {
//       console.error('AI Error:', err);
//       throw err;
//     }
//   };

//   const fetchProfile = async () => {
//     if (!username.trim()) {
//       setError('Please enter a username')
//       return
//     }

//     setLoading(true)
//     setError('')

//     try {
//       const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`)
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch: ${response.status}`)
//       }

//       const result = await response.json()
//       const profileData = {
//         username,
//         easySolved: result.easySolved || 0  ,
//         mediumSolved: result.mediumSolved || 0,
//         hardSolved: result.hardSolved || 0,
//         totalSolved: result.solvedProblem || 0
//       };

//       // Get question recommendation from Azure OpenAI
//       const question = await getQuestionFromAI(profileData);
      
//       // Store the question in localStorage for CodeEditor to access
//       localStorage.setItem('currentQuestion', JSON.stringify(question));
      
//       setShowPopup(false)
//       setUsername('')
//       window.location.href = '/interview'; // Redirect to the interview page with code editor
//     } catch (err) {
//       setError(err.message || 'Failed to fetch profile')
//       console.error('Error:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <>
//       {/* Plus Button */}
//       <div className="fixed bottom-6 right-6 z-50">
//         <div className="relative">
//           {/* Menu */}
//           {showMenu && (
//             <div className="absolute bottom-full right-0 mb-2 bg-white shadow-lg rounded-lg p-2 min-w-[120px]">
//               <button
//                 onClick={() => {
//                   setShowPopup(true)
//                   setShowMenu(false)
//                 }}
//                 className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition"
//               >
//                 LeetCode
//               </button>
//             </div>
//           )}
          
//           {/* Plus Button */}
//           <button
//             onClick={() => setShowMenu(!showMenu)}
//             className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center text-3xl font-light"
//           >
//             +
//           </button>
//         </div>
//       </div>

//       {/* Popup Modal */}
//       {showPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold">LeetCode Profile</h2>
//               <button
//                 onClick={() => {
//                   setShowPopup(false)
//                   setError('')
//                   setUsername('')
//                 }}
//                 className="text-gray-500 hover:text-gray-700 text-2xl"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="space-y-4">
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && fetchProfile()}
//                 placeholder="Enter LeetCode username"
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />

//               {error && (
//                 <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
//                   {error}
//                 </div>
//               )}

//               <button
//                 onClick={fetchProfile}
//                 disabled={loading}
//                 className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
//               >
//                 {loading ? 'Fetching...' : 'Fetch Profile'}
//               </button>

//               <p className="text-xs text-gray-500 text-center">
//                 Data will be logged to browser console
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// export default LeetcodeFetch