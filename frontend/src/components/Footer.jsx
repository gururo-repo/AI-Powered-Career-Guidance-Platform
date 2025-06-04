// import React, { useState } from 'react';
// import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const Footer = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');

//   const handleSubscribe = () => {
//     // Check if user is authenticated
//     const token = localStorage.getItem('token');

//     if (!token) {
//       // If not authenticated, redirect to login page
//       navigate('/auth');
//     } else {
      
//       console.log('Subscribing with email:', email);
      
//       setEmail('');

//       // Optionally show a success message
//       alert('Successfully subscribed to newsletter!');
//     }
//   };

//   return (
//     <footer className="bg-black text-white py-12 border-t border-gray-800">
//       <div className="container mx-auto px-4">
//         {/* Main Footer Content */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {/* Company Info */}
//           <div>
//             <h3 className="text-lg font-semibold text-cyan-400 mb-3">JobNest</h3>
//             <p className="text-gray-400 mb-4">
//               Empowering careers with AI-driven insights and personalized recommendations.
//             </p>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h3 className="text-lg font-semibold text-cyan-400 mb-3">Quick Links</h3>
//             <ul className="space-y-2">
//               <li><a href="#" className="text-gray-400 hover:text-cyan-400">Home</a></li>
//               <li><a href="#" className="text-gray-400 hover:text-cyan-400">Features</a></li>
//               <li><a href="#" className="text-gray-400 hover:text-cyan-400">Industry Insights</a></li>
//               <li><a href="#" className="text-gray-400 hover:text-cyan-400">Contact Us</a></li>
//             </ul>
//           </div>

//           {/* Social Media */}
//           <div>
//             <h3 className="text-lg font-semibold text-cyan-400 mb-3">Follow Us</h3>
//             <div className="flex justify-center md:justify-start space-x-4">
//               <a href="#" className="hover:text-cyan-400"><Facebook /></a>
//               <a href="#" className="hover:text-cyan-400"><Twitter /></a>
//               <a href="#" className="hover:text-cyan-400"><Instagram /></a>
//               <a href="#" className="hover:text-cyan-400"><Linkedin /></a>
//             </div>
//           </div>

//           {/* Newsletter Signup */}
//           <div>
//             <h3 className="text-lg font-semibold text-cyan-400 mb-3">📬 Stay Updated</h3>
//             <p className="text-gray-400 text-sm">Get the latest jobs & internships delivered to your inbox.</p>
//             <div className="mt-3 flex">
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="p-2 w-full rounded-l-lg bg-gray-800 border border-gray-700 text-white focus:outline-none"
//               />
//               <button
//                 className="bg-cyan-500 px-4 py-2 rounded-r-lg text-white hover:bg-cyan-600"
//                 onClick={handleSubscribe}
//               >
//                 Subscribe
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="text-center text-gray-500 text-sm mt-6 border-t border-gray-800 pt-4">
//           &copy; Built with ❤️ by Naseta.
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;
