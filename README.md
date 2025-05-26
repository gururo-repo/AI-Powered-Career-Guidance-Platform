# 🚀 AI-Powered Career Guidance Platform

<div align="center">
  <h3>Intelligent Career Advancement & Insights Platform</h3>
  <p>Bridge skill gaps, compare opportunities globally, and land your dream job with AI-powered insights</p>
</div>

🌐 **Live Demo**:  
- [https://tools.gururo.com](https://tools.gururo.com) (Custom Domain)  
- [https://ai-powered-career-guidance-platform.vercel.app](https://ai-powered-career-guidance-platform.vercel.app) (Vercel Default)

## ✨ Features

- **🤖 AI Job Matching**: Get personalized job recommendations based on your skills and preferences
- **📊 Skill Gap Analysis**: Identify missing skills and receive course recommendations to improve your profile
- **📈 Industry Insights**: Access real-time data on industry trends, salary ranges, and in-demand skills with detailed tooltips
- **🌎 Global Comparison**: Compare salary ranges and required skills between countries and roles
- **📊 City Salary Analysis**: View detailed salary information for top cities with trend indicators
- **📝 Modern Resume Builder**: Create an ATS-optimized resume with AI assistance and get feedback
- **🧠 Competency Testing**: Take assessments to showcase your skills and stand out to employers

## 🛠️ Tech Stack

### Frontend
- **⚛️ React** with Vite for fast development
- **🎨 Tailwind CSS** for modern, responsive design
- **� Recharts** for interactive data visualization
- **�🔐 Google OAuth** for authentication

### Backend
- **📡 Node.js** with Express for API development
- **🗄️ MongoDB** for database
- **🔒 JWT** for secure authentication
- **📋 JSON Parser** for robust API response handling

### AI Services
- **🧠 Google Generative AI** (Gemini) for intelligent features and data generation
- **🔍 AI-powered industry insights** with real-time data analysis

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google API credentials

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/jobnest.git
   cd jobnest
   ```

2. **Install dependencies**:
   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```
   - For the backend:
     ```bash
     cd backend
     npm install
     ```

3. **Environment Variables**:
   - Copy the `.env.example` files to create your own `.env` files:
     ```bash
     # For frontend
     cd frontend
     cp .env.example .env

     # For backend
     cd ../backend
     cp .env.example .env
     ```
   - Edit both `.env` files to add your actual credentials:
     - Frontend `.env`:
       ```
       VITE_API_URL=http://localhost:8000
       VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
       VITE_APP_NAME=JobNest
       ```
     - Backend `.env`:
       ```
       # Google OAuth
       GOOGLE_CLIENT_ID=your_google_client_id_here
       GOOGLE_CLIENT_SECRET=your_google_client_secret_here
       GOOGLE_REDIRECT_URI=http://localhost:5174/auth

       # JWT and Database
       JWT_SECRET=your_jwt_secret_here
       MONGO_URI=your_mongodb_connection_string_here

       # Gemini AI
       GEMINI_API_KEY=your_gemini_api_key_here

       # Other settings
       EMAIL_FROM=your_email@example.com
       EMAIL_PASSWORD=your_email_password_here
       SESSION_SECRET=your_session_secret_here
       FRONTEND_URL=http://localhost:5174
       PORT=8000
       ```
   - **Important**: Never commit your `.env` files to version control. They are already added to `.gitignore`.

4. **Run the application**:
   - Start the backend server:
     ```bash
     cd backend
     npm run dev
     ```
   - Start the frontend development server:
     ```bash
     cd frontend
     npm run dev
     ```

5. **Access the application**:
   - Open your browser and navigate to `http://localhost:5174` to access the frontend

## 🖥️ Usage

### 👤 User Authentication
- **Sign Up**: Create a new account with email or Google authentication
- **Login**: Returning users can log in to access their personalized dashboard
- **Password Reset**: Forgot password functionality available

### 📊 Industry Insights
- View real-time data on job market trends
- Filter insights by countries
- Compare salary ranges and job roles across different countries


### 📝 Resume Building
- Create a professional resume with AI assistance
- Get feedback on your resume's ATS compatibility
- Export your resume in multiple formats

### 🧠 Competency Testing
- Take assessments in your field of interest
- Showcase your skills to potential employers
- Get personalized recommendations for improvement

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


