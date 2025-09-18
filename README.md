# Enhanced Career Guidance Platform

A comprehensive web application that provides personalized career recommendations, college listings, and educational guidance for students after completing their SSLC (10th grade) and 12th grade.

## Features

### 🔐 Authentication System
- **User Registration**: Phone number verification via OTP using Twilio
- **Secure Login**: JWT-based authentication with secure cookies
- **Profile Management**: Progressive profile completion with percentage tracking

### 🎯 Core Modules

#### 1. **Interest Detection** 
- Status: Update in Progress
- Future feature for aptitude and interest assessment

#### 2. **College List**
- Grade-specific college listings (10th/12th)
- Advanced filtering by location and college type
- Search functionality
- Comprehensive database of government colleges, ITIs, polytechnics, and universities

#### 3. **Scholarship**
- Status: Update in Progress  
- Future feature for scholarship opportunities

#### 4. **Career Guidance**
- **10th Grade Students**: Complete interactive questionnaire system
- **12th Grade Students**: "Update is Underway" status
- Personalized career path recommendations
- AI-generated career roadmaps using Mermaid diagrams
- Confidence scoring and alternative path suggestions

### 🚀 Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Notifications**: Toast notifications for user feedback
- **Progress Tracking**: Visual progress indicators
- **API Integration**: RESTful backend with comprehensive error handling
- **Security**: Rate limiting, input sanitization, and secure headers

## Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile and desktop optimized

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **Twilio**: SMS/OTP verification
- **OpenAI API**: AI-powered roadmap generation

### Security & Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection
- **Input Sanitization**: XSS protection
- **Compression**: Response optimization

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Twilio account for SMS
- OpenAI API key (optional, for roadmap generation)

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the Backend directory:
   ```env
   # Database
   DB_URI=mongodb://localhost:27017/career-guidance
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Twilio Configuration
   TWILIO_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   
   # OpenAI (Optional - for roadmap generation)
   OPENAI_API_KEY=your-openai-api-key
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # CORS Origins (comma-separated)
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build CSS (if needed)**
   ```bash
   npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
   ```

4. **Serve the application**
   - Open `index.html` in a web browser, or
   - Use a local server like Live Server extension in VS Code

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/verifyOTP` - OTP verification
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signout` - User logout

### Profile Management
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile
- `GET /api/v1/profile/completion` - Get profile completion status

### College Information
- `GET /api/v1/colleges` - Get colleges (filtered by user's grade)
- `GET /api/v1/colleges/stats` - Get college statistics

### Career Guidance
- `GET /api/v1/questions` - Get assessment questions (10th grade only)
- `POST /api/v1/questions/assess` - Submit assessment responses
- `GET /api/v1/questions/career-paths` - Get available career paths

### Roadmap Generation
- `GET /api/v1/roadmap?topic=<career-path>` - Generate career roadmap

## Database Schema

### User Model
```javascript
{
  firstName: String (required),
  middleName: String,
  lastName: String (required),
  email: String (unique, required),
  password: String (required),
  phone: String (unique, required),
  isVerified: Boolean (default: false),
  otp: String,
  otpExpiry: Date,
  isProfileComplete: Boolean (default: false),
  profileCompletionPercentage: Number (0-100)
}
```

### UserProfile Model
```javascript
{
  _id: ObjectId (same as User._id),
  dob: Date,
  gender: String (enum: ["Male", "Female", "Prefer not to say"]),
  location: String,
  class: String (enum: ["10th", "12th"]),
  stream: String (enum: ["Science", "Commerce", "Arts", "Diploma", "Vocational courses", "Other", "None"])
}
```

## User Flow

1. **Registration**: User registers with phone number → OTP verification → Redirect to login
2. **Login**: Successful login → Profile completion toast (if incomplete) → Dashboard
3. **Dashboard**: Four main options displayed based on user's grade and profile status
4. **Career Guidance**: 
   - 10th grade: Complete questionnaire → Get recommendations → View roadmap
   - 12th grade: "Update is Underway" message
5. **College List**: Grade-specific colleges with filtering and search capabilities

## Security Features

- **Rate Limiting**: Prevents abuse of authentication endpoints
- **Input Sanitization**: Protects against XSS attacks
- **Secure Headers**: Helmet.js for security headers
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Environment Variables**: Sensitive data protection

## Development Guidelines

### Code Organization
- **Modular Architecture**: Separate routes, models, and middleware
- **Error Handling**: Comprehensive error handling throughout
- **Logging**: Structured logging with different levels
- **Validation**: Input validation on both client and server

### Best Practices
- **RESTful API Design**: Consistent endpoint naming and HTTP methods
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Accessibility**: ARIA labels and semantic HTML

## Deployment

### Production Considerations
1. **Environment Variables**: Set all required environment variables
2. **Database**: Use MongoDB Atlas or similar cloud database
3. **SSL/HTTPS**: Enable HTTPS in production
4. **Process Management**: Use PM2 or similar for process management
5. **Reverse Proxy**: Use Nginx for static file serving and load balancing

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Roadmap

### Upcoming Features
- [ ] Interest Detection module implementation
- [ ] Scholarship database and search functionality
- [ ] Career guidance for 12th grade students
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] Integration with educational institutions
- [ ] AI-powered career counseling chatbot

---

**Built with ❤️ for students seeking career guidance**