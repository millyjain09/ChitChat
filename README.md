💬 ChitChat - Real-Time Messaging App
ChitChat is a full-stack real-time video and text chat application built using the MERN stack. It features instant messaging, user authentication, and a responsive UI designed for seamless communication.

🚀 Features
🔐 Secure Authentication: Robust User Login and Logout functionality powered by JWT and bcrypt.

⚡ Real-Time Messaging: Instant text communication with "typing..." indicators.

📞 Voice & Video Calls: Peer-to-peer high-quality audio and video calling integrated via WebRTC.

😊 Emoji Support: Integrated emoji picker for expressive messaging.

📁 Media Sharing: Send and receive images or files seamlessly.

🔔 Push Notifications: Real-time alerts so you never miss a message or a call.

📱 Fully Responsive: Optimized UI for all devices (Mobile, Tablet, and Desktop).

🛠️ Tech Stack
Frontend:

React.js

Tailwind CSS (Styling)

Framer Motion (Animations)

Lucide React (Icons)

Backend:

Node.js & Express.js

Socket.io (Real-time engine)

WebRTC (Real Time call)

MongoDB (Database)

Cloudinary (Image/Avatar storage)

📋 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v16+)

npm or yarn

A MongoDB Atlas account (or local MongoDB)

⚙️ Installation & Setup
Clone the repository:

Bash
git clone https://github.com/your-username/chitchat.git
cd chitchat
Install dependencies:
For Backend:

Bash
cd backend
npm install
For Frontend:

Bash
cd frontend
npm install
Environment Variables:
Create a .env file in the backend directory and add:

Code snippet
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
Run the Application:
Start Backend:

Bash
npm run dev
Start Frontend:

Bash
cd ../frontend
npm run dev
