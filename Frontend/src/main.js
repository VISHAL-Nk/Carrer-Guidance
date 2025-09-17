const app = document.getElementById("app");

// Career Assessment Data
const assessmentQuestions = [
  {
    id: 1,
    question: "Which subjects did you enjoy most in SSLC?",
    options: [
      { value: "science", text: "Science subjects (Physics, Chemistry, Biology)" },
      { value: "math", text: "Mathematics" },
      { value: "languages", text: "Languages (English, Regional languages)" },
      { value: "social", text: "Social Sciences (History, Geography, Civics)" }
    ]
  },
  {
    id: 2,
    question: "What type of activities do you prefer?",
    options: [
      { value: "practical", text: "Hands-on practical work and experiments" },
      { value: "creative", text: "Creative and artistic activities" },
      { value: "analytical", text: "Problem-solving and analytical thinking" },
      { value: "social", text: "Working with people and community service" }
    ]
  },
  {
    id: 3,
    question: "Which career environment appeals to you most?",
    options: [
      { value: "lab", text: "Laboratories and research facilities" },
      { value: "office", text: "Corporate offices and business settings" },
      { value: "field", text: "Fieldwork and outdoor environments" },
      { value: "creative", text: "Studios and creative spaces" }
    ]
  },
  {
    id: 4,
    question: "What is your preferred learning style?",
    options: [
      { value: "visual", text: "Visual learning with diagrams and charts" },
      { value: "practical", text: "Learning by doing and practicing" },
      { value: "theoretical", text: "Reading and theoretical understanding" },
      { value: "collaborative", text: "Group discussions and teamwork" }
    ]
  },
  {
    id: 5,
    question: "Which of these skills comes naturally to you?",
    options: [
      { value: "logical", text: "Logical reasoning and problem-solving" },
      { value: "communication", text: "Communication and interpersonal skills" },
      { value: "creativity", text: "Creative thinking and innovation" },
      { value: "technical", text: "Technical and mechanical understanding" }
    ]
  },
  {
    id: 6,
    question: "What motivates you most in your studies?",
    options: [
      { value: "discovery", text: "Discovering how things work" },
      { value: "helping", text: "Helping others and making a difference" },
      { value: "achievement", text: "Achieving high grades and recognition" },
      { value: "independence", text: "Working independently on projects" }
    ]
  },
  {
    id: 7,
    question: "Which extracurricular activities interest you?",
    options: [
      { value: "science", text: "Science clubs and competitions" },
      { value: "arts", text: "Art, music, or drama activities" },
      { value: "sports", text: "Sports and physical activities" },
      { value: "debate", text: "Debate, quiz, and literary activities" }
    ]
  },
  {
    id: 8,
    question: "What do you see yourself doing in 10 years?",
    options: [
      { value: "research", text: "Conducting research or working in labs" },
      { value: "business", text: "Running a business or working in corporate" },
      { value: "service", text: "Serving the community or in government" },
      { value: "creative", text: "Working in creative or entertainment industry" }
    ]
  }
];

const careerPaths = {
  science: {
    name: "Science Stream",
    description: "Perfect for analytical minds who love discovery and innovation",
    subjects: ["Physics", "Chemistry", "Biology/Math", "English", "Optional Subject"],
    careers: ["Engineer", "Doctor", "Scientist", "Researcher", "Pharmacist", "Biotechnologist"],
    institutions: ["Engineering Colleges", "Medical Colleges", "Research Institutes", "Universities"],
    confidence: 0
  },
  commerce: {
    name: "Commerce Stream",
    description: "Ideal for future business leaders and financial experts",
    subjects: ["Accountancy", "Business Studies", "Economics", "English", "Mathematics/Computer Science"],
    careers: ["CA", "Business Analyst", "Banker", "Entrepreneur", "Financial Advisor", "Marketing Professional"],
    institutions: ["Commerce Colleges", "Business Schools", "Management Institutes", "Universities"],
    confidence: 0
  },
  arts: {
    name: "Arts/Humanities Stream",
    description: "Perfect for creative minds and social change makers",
    subjects: ["History", "Political Science", "Psychology", "English", "Optional Language/Subject"],
    careers: ["Civil Servant", "Lawyer", "Journalist", "Teacher", "Social Worker", "Psychologist"],
    institutions: ["Arts Colleges", "Law Schools", "Universities", "Teacher Training Institutes"],
    confidence: 0
  },
  vocational: {
    name: "Vocational/Technical Stream",
    description: "Great for hands-on learners who prefer practical skills",
    subjects: ["Technical Subjects", "Computer Applications", "English", "Mathematics", "Science"],
    careers: ["Technician", "Computer Operator", "Healthcare Assistant", "Hospitality Professional", "Skilled Craftsperson"],
    institutions: ["ITIs", "Polytechnics", "Vocational Schools", "Skill Development Centers"],
    confidence: 0
  }
};

// Assessment state
let currentQuestion = 0;
let studentAnswers = [];
let studentInfo = {};

function isAuthenticated() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return !!token;
}

function loginScreen() {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>
        <form id="loginForm" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
            <input type="email" id="email" placeholder="Email" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password:</label>
            <input type="password" id="password" placeholder="Password" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <button type="submit" class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200">
            Login
          </button>
        </form>
        <div class="mt-6 text-center">
          <button id="backToMainBtn" class="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Main
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        alert("Login successful!");
        
        // Check profile completion status
        if (data.profileCompletion && !data.profileCompletion.isComplete) {
          showProfileCompletionScreen(data.profileCompletion.percentage);
        } else {
          await renderApp();
        }
      } else {
        const data = await response.json();
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(
        "Network error. Please check if the server is running on port 5000."
      );
    }
  });
  
  document.getElementById("backToMainBtn").addEventListener("click", async () => {
    await renderApp();
  });
}

function registerScreen() {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full max-h-screen overflow-y-auto">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Register</h2>
        <form id="registerForm" class="space-y-4">
          <div>
            <label for="firstName" class="block text-sm font-semibold text-gray-700 mb-2">First Name:</label>
            <input type="text" id="firstName" placeholder="First Name" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="middleName" class="block text-sm font-semibold text-gray-700 mb-2">Middle Name:</label>
            <input type="text" id="middleName" placeholder="Middle Name" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="lastName" class="block text-sm font-semibold text-gray-700 mb-2">Last Name:</label>
            <input type="text" id="lastName" placeholder="Last Name" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email:</label>
            <input type="email" id="email" placeholder="Email" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">Phone:</label>
            <input type="tel" id="phone" placeholder="Phone" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password:</label>
            <input type="password" id="password" placeholder="Password" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password:</label>
            <input type="password" id="confirmPassword" placeholder="Confirm Password" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <button type="submit" class="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transform hover:-translate-y-1 transition-all duration-200">
            Register
          </button>
        </form>
        <div class="mt-6 text-center">
          <button id="backToMainBtn" class="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Main
          </button>
        </div>
      </div>
    </div>
  `;
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const firstName = document.getElementById("firstName").value;
      const middleName = document.getElementById("middleName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      try {
        const response = await fetch(
          "http://localhost:5000/api/v1/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName,
              middleName,
              lastName,
              email,
              phone,
              password,
              confirmPassword,
            }),
            credentials: "include",
          }
        );

        if (response.ok) {
          alert("Registration successful! Please verify OTP.");
          verifyOTPScreen(phone);
        } else {
          const data = await response.json();
          alert("Registration failed: " + data.message);
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert(
          "Network error. Please check if the server is running on port 5000."
        );
      }
    });
  
  document.getElementById("backToMainBtn").addEventListener("click", async () => {
    await renderApp();
  });
}

function verifyOTPScreen(phone) {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Verify OTP</h2>
        <form id="otpForm" class="space-y-6">
          <p class="text-gray-600 text-center">Please enter the OTP sent to your phone number <span class="font-semibold">${phone}</span></p>
          <div>
            <label for="otp" class="block text-sm font-semibold text-gray-700 mb-2">OTP:</label>
            <input type="text" id="otp" placeholder="Enter 6-digit OTP" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base text-center tracking-widest" 
                   maxlength="6" />
          </div>
          <button type="submit" class="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transform hover:-translate-y-1 transition-all duration-200">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  `;
  document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otp").value;

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/verifyOTP",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("OTP verification successful! You can now log in.");
        loginScreen();
      } else {
        const data = await response.json();
        alert("OTP verification failed: " + data.message);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      alert(
        "Network error. Please check if the server is running on port 5000."
      );
    }
  });
}

function careerAssessmentScreen() {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-purple-700">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🎯 Career Guidance Platform
          </h1>
          <p class="text-xl text-white opacity-90">
            Discover Your Perfect Career Path After SSLC
          </p>
        </div>

        <!-- Student Information Form -->
        <div id="studentInfoSection" class="bg-white rounded-2xl p-8 shadow-xl mb-6">
          <div class="mb-8">
            <h3 class="text-2xl font-semibold text-blue-600 mb-6 flex items-center">
              📝 Student Information
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="studentName" class="block text-sm font-semibold text-gray-700">Full Name:</label>
                <input type="text" id="studentName" placeholder="Enter your full name" 
                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
              </div>
              <div class="space-y-2">
                <label for="studentAge" class="block text-sm font-semibold text-gray-700">Age:</label>
                <input type="number" id="studentAge" min="14" max="20" placeholder="Enter your age"
                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
              </div>
              <div class="space-y-2">
                <label for="sslcPercentage" class="block text-sm font-semibold text-gray-700">SSLC Percentage:</label>
                <input type="number" id="sslcPercentage" min="35" max="100" step="0.01" placeholder="Enter your SSLC percentage"
                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
              </div>
              <div class="space-y-2">
                <label for="location" class="block text-sm font-semibold text-gray-700">Location (State):</label>
                <select id="location" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
                  <option value="">Select your state</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="kerala">Kerala</option>
                  <option value="andhra-pradesh">Andhra Pradesh</option>
                  <option value="telangana">Telangana</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <button id="startAssessment" class="mt-8 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200">
              Start Career Assessment
            </button>
          </div>
        </div>

        <!-- Assessment Questions -->
        <div id="assessmentSection" class="bg-white rounded-2xl p-8 shadow-xl mb-6 hidden">
          <div class="w-full h-2 bg-gray-200 rounded-full mb-6">
            <div id="progressFill" class="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
          
          <div id="questionContainer">
            <!-- Questions will be loaded here -->
          </div>
          
          <div class="flex justify-between items-center mt-8">
            <button id="prevBtn" class="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Previous
            </button>
            <span id="questionCounter" class="text-gray-600 font-medium">Question 1 of 8</span>
            <button id="nextBtn" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Next
            </button>
            <button id="submitBtn" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors hidden">
              Get My Results
            </button>
          </div>
        </div>

        <!-- Loading Section -->
        <div id="loadingSection" class="bg-white rounded-2xl p-8 shadow-xl mb-6 hidden">
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
            <h3 class="text-2xl font-semibold text-gray-800 mb-2">Analyzing Your Responses...</h3>
            <p class="text-gray-600">Please wait while we determine your ideal career path</p>
          </div>
        </div>

        <!-- Results Section -->
        <div id="resultSection" class="hidden">
          <div class="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl p-8 text-center mb-6">
            <h2 class="text-4xl font-bold mb-2" id="recommendedPath">Science Stream</h2>
            <p class="text-xl opacity-90 mb-4" id="pathDescription">Perfect match for your interests and skills!</p>
            <div class="text-2xl font-bold">
              Confidence: <span id="confidenceScore">85%</span>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-xl mb-6">
            <h3 class="text-2xl font-semibold text-blue-600 mb-6">📚 Recommended Path Details</h3>
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Subjects:</h4>
              <div id="subjectTags" class="flex flex-wrap gap-2"></div>
            </div>
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Career Options:</h4>
              <div id="careerTags" class="flex flex-wrap gap-2"></div>
            </div>
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">Institutions:</h4>
              <div id="institutionTags" class="flex flex-wrap gap-2"></div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-xl mb-6">
            <h3 class="text-2xl font-semibold text-blue-600 mb-6">📊 Your Score Breakdown</h3>
            <div id="scoreContainer"></div>
          </div>

          <div class="text-center">
            <button id="backToHomeBtn" class="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors mr-4">
              Back to Home
            </button>
            <button id="retakeAssessmentBtn" class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById("startAssessment").addEventListener("click", startAssessment);
  document.getElementById("prevBtn").addEventListener("click", previousQuestion);
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);
  document.getElementById("submitBtn").addEventListener("click", submitAssessment);
}

function startAssessment() {
  // Validate student info
  const name = document.getElementById("studentName").value.trim();
  const age = document.getElementById("studentAge").value;
  const percentage = document.getElementById("sslcPercentage").value;
  const location = document.getElementById("location").value;

  if (!name || !age || !percentage || !location) {
    alert("Please fill in all required information before starting the assessment.");
    return;
  }

  if (percentage < 35 || percentage > 100) {
    alert("Please enter a valid SSLC percentage between 35 and 100.");
    return;
  }

  // Store student info
  studentInfo = { name, age, percentage, location };
  
  // Reset assessment state
  currentQuestion = 0;
  studentAnswers = [];
  
  // Show assessment section
  document.getElementById("studentInfoSection").classList.add("hidden");
  document.getElementById("assessmentSection").classList.remove("hidden");
  
  // Load first question
  loadQuestion();
}

function loadQuestion() {
  const question = assessmentQuestions[currentQuestion];
  const container = document.getElementById("questionContainer");
  
  container.innerHTML = `
    <div class="mb-8">
      <div class="flex items-center mb-6">
        <div class="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-6">
          ${currentQuestion + 1}
        </div>
        <h3 class="text-xl font-semibold text-gray-800 flex-1">${question.question}</h3>
      </div>
      
      <div class="space-y-3">
        ${question.options.map((option, index) => `
          <div class="option border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200" 
               data-value="${option.value}">
            <label class="flex items-center cursor-pointer">
              <input type="radio" name="question${question.id}" value="${option.value}" class="mr-3 text-blue-600">
              <span class="text-gray-700">${option.text}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add click handlers for options
  const options = container.querySelectorAll('.option');
  options.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selected class from all options
      options.forEach(opt => opt.classList.remove('selected', 'border-blue-500', 'bg-blue-100'));
      
      // Add selected class to clicked option
      this.classList.add('selected', 'border-blue-500', 'bg-blue-100');
      
      // Check the radio button
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
      
      // Enable next button
      document.getElementById("nextBtn").disabled = false;
    });
  });
  
  // Update progress
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;
  document.getElementById("progressFill").style.width = `${progress}%`;
  
  // Update question counter
  document.getElementById("questionCounter").textContent = `Question ${currentQuestion + 1} of ${assessmentQuestions.length}`;
  
  // Update navigation buttons
  document.getElementById("prevBtn").disabled = currentQuestion === 0;
  document.getElementById("nextBtn").disabled = true;
  
  // Show/hide submit button
  if (currentQuestion === assessmentQuestions.length - 1) {
    document.getElementById("nextBtn").classList.add("hidden");
    document.getElementById("submitBtn").classList.remove("hidden");
    document.getElementById("submitBtn").disabled = true;
  } else {
    document.getElementById("nextBtn").classList.remove("hidden");
    document.getElementById("submitBtn").classList.add("hidden");
  }
  
  // If we have a previous answer, select it
  if (studentAnswers[currentQuestion]) {
    const selectedOption = container.querySelector(`input[value="${studentAnswers[currentQuestion]}"]`);
    if (selectedOption) {
      selectedOption.checked = true;
      selectedOption.closest('.option').classList.add('selected', 'border-blue-500', 'bg-blue-100');
      document.getElementById("nextBtn").disabled = false;
      document.getElementById("submitBtn").disabled = false;
    }
  }
}

function nextQuestion() {
  // Save current answer
  const selectedOption = document.querySelector(`input[name="question${assessmentQuestions[currentQuestion].id}"]:checked`);
  if (selectedOption) {
    studentAnswers[currentQuestion] = selectedOption.value;
    currentQuestion++;
    loadQuestion();
  }
}

function previousQuestion() {
  currentQuestion--;
  loadQuestion();
}

function submitAssessment() {
  // Save last answer
  const selectedOption = document.querySelector(`input[name="question${assessmentQuestions[currentQuestion].id}"]:checked`);
  if (selectedOption) {
    studentAnswers[currentQuestion] = selectedOption.value;
  }
  
  // Show loading
  document.getElementById("assessmentSection").classList.add("hidden");
  document.getElementById("loadingSection").classList.remove("hidden");
  
  // Calculate results after delay
  setTimeout(() => {
    calculateResults();
  }, 2000);
}

function calculateResults() {
  // Initialize scores
  const scores = {
    science: 0,
    commerce: 0,
    arts: 0,
    vocational: 0
  };
  
  // Score mapping based on answers
  const scoringMatrix = {
    science: ['science', 'practical', 'lab', 'visual', 'logical', 'discovery', 'science', 'research'],
    commerce: ['math', 'analytical', 'office', 'theoretical', 'logical', 'achievement', 'debate', 'business'],
    arts: ['languages', 'creative', 'creative', 'collaborative', 'communication', 'helping', 'arts', 'service'],
    vocational: ['science', 'practical', 'field', 'practical', 'technical', 'independence', 'sports', 'business']
  };
  
  // Calculate scores based on answers
  studentAnswers.forEach((answer, index) => {
    Object.keys(scoringMatrix).forEach(path => {
      if (scoringMatrix[path][index] === answer) {
        scores[path] += 1;
      }
    });
  });
  
  // Add bonus points based on SSLC percentage
  const percentage = parseFloat(studentInfo.percentage);
  if (percentage >= 90) {
    scores.science += 2;
    scores.commerce += 1;
  } else if (percentage >= 80) {
    scores.science += 1;
    scores.commerce += 1;
  } else if (percentage >= 70) {
    scores.commerce += 1;
    scores.arts += 1;
  } else {
    scores.vocational += 1;
    scores.arts += 1;
  }
  
  // Find the highest scoring path
  const maxScore = Math.max(...Object.values(scores));
  const recommendedPath = Object.keys(scores).find(path => scores[path] === maxScore);
  
  // Calculate confidence percentage
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const confidence = Math.round((maxScore / totalScore) * 100);
  
  // Update career path confidence scores
  Object.keys(careerPaths).forEach(path => {
    careerPaths[path].confidence = Math.round((scores[path] / totalScore) * 100);
  });
  
  // Show results
  showResults(recommendedPath, confidence, scores);
}

function showResults(recommendedPath, confidence, scores) {
  document.getElementById("loadingSection").classList.add("hidden");
  document.getElementById("resultSection").classList.remove("hidden");
  
  const pathData = careerPaths[recommendedPath];
  
  // Update result card
  document.getElementById("recommendedPath").textContent = pathData.name;
  document.getElementById("pathDescription").textContent = pathData.description;
  document.getElementById("confidenceScore").textContent = `${confidence}%`;
  
  // Update path details
  const subjectTags = document.getElementById("subjectTags");
  subjectTags.innerHTML = pathData.subjects.map(subject => 
    `<span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">${subject}</span>`
  ).join('');
  
  const careerTags = document.getElementById("careerTags");
  careerTags.innerHTML = pathData.careers.map(career => 
    `<span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">${career}</span>`
  ).join('');
  
  const institutionTags = document.getElementById("institutionTags");
  institutionTags.innerHTML = pathData.institutions.map(institution => 
    `<span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">${institution}</span>`
  ).join('');
  
  // Update score breakdown
  const scoreContainer = document.getElementById("scoreContainer");
  scoreContainer.innerHTML = Object.keys(careerPaths).map(path => {
    const pathData = careerPaths[path];
    const score = pathData.confidence;
    return `
      <div class="flex justify-between items-center mb-4 p-4 rounded-lg bg-gray-50">
        <span class="font-medium text-gray-800">${pathData.name}</span>
        <div class="flex items-center space-x-4">
          <div class="w-32 h-5 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500" style="width: ${score}%"></div>
          </div>
          <span class="font-bold text-gray-700 w-12">${score}%</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners for result buttons
  document.getElementById("backToHomeBtn").addEventListener("click", async () => {
    await renderApp();
  });
  document.getElementById("retakeAssessmentBtn").addEventListener("click", () => {
    currentQuestion = 0;
    studentAnswers = [];
    careerAssessmentScreen();
  });
}

async function renderApp() {
  if (isAuthenticated()) {
    // Fetch profile completion status
    let profileCompletion = { isComplete: true, percentage: 100 };
    try {
      const response = await fetch("http://localhost:5000/api/v1/profile/completion", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        profileCompletion = data.profileCompletion;
      } else if (response.status === 401) {
        // Token might be invalid, redirect to login
        console.log("Authentication expired, redirecting to login");
        loginScreen();
        return;
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    }

    const profileStatusHTML = !profileCompletion.isComplete ? `
      <div class="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm text-yellow-800">
              Profile ${profileCompletion.percentage}% complete
            </p>
            <div class="w-full bg-yellow-200 rounded-full h-2 mt-2">
              <div class="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                   style="width: ${profileCompletion.percentage}%"></div>
            </div>
          </div>
          <button id="completeProfileBtn" class="ml-4 text-sm bg-yellow-400 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-500 transition-colors">
            Complete
          </button>
        </div>
      </div>
    ` : '';

    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-6">Welcome to the App!</h2>
          ${profileStatusHTML}
          <div class="space-y-4">
            <button id="careerAssessmentBtn" class="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200">
              🎯 Take Career Assessment
            </button>
            <button id="logoutBtn" class="w-full px-6 py-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transform hover:-translate-y-1 transition-all duration-200">
              Logout
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById("careerAssessmentBtn").addEventListener("click", careerAssessmentScreen);
    
    if (!profileCompletion.isComplete) {
      document.getElementById("completeProfileBtn").addEventListener("click", () => {
        showProfileCompletionScreen(profileCompletion.percentage);
      });
    }
    
    document.getElementById("logoutBtn").addEventListener("click", async () => {
      try {
        await fetch("http://localhost:5000/api/v1/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        alert("Logged out successfully!");
        loginScreen();
      } catch (error) {
        console.error("Logout error:", error);
        alert("Logout completed (network error)");
        loginScreen();
      }
    });
  } else {
    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Career Guidance</h1>
          <p class="text-gray-600 mb-8">Discover your perfect career path</p>
          <div class="space-y-4">
            <button id="loginBtn" class="w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200">Login</button>
            <button id="registerBtn" class="w-full px-6 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transform hover:-translate-y-1 transition-all duration-200">Register</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("loginBtn").addEventListener("click", loginScreen);
    document.getElementById("registerBtn").addEventListener("click", registerScreen);
  }
}

function showProfileCompletionScreen(completionPercentage) {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Complete Your Profile</h2>
        
        <div class="mb-8">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">Profile Completion</span>
            <span class="text-sm font-medium text-blue-600">${completionPercentage}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                 style="width: ${completionPercentage}%"></div>
          </div>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800">
                Your profile is ${completionPercentage}% complete. Complete your profile to get personalized career guidance and recommendations.
              </p>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <button id="updateProfileBtn" class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200">
            Complete Profile Now
          </button>
          <button id="skipForNowBtn" class="w-full px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transform hover:-translate-y-1 transition-all duration-200">
            Skip for Now
          </button>
        </div>
        
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">
            You can complete your profile later from the dashboard
          </p>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById("updateProfileBtn").addEventListener("click", () => {
    profileUpdateScreen();
  });
  
  document.getElementById("skipForNowBtn").addEventListener("click", async () => {
    await renderApp();
  });
}

function profileUpdateScreen() {
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Update Profile</h2>
        <form id="profileForm" class="space-y-6">
          <div>
            <label for="dob" class="block text-sm font-semibold text-gray-700 mb-2">Date of Birth:</label>
            <input type="date" id="dob" required 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="gender" class="block text-sm font-semibold text-gray-700 mb-2">Gender:</label>
            <select id="gender" required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say" selected>Prefer not to say</option>
            </select>
          </div>
          <div>
            <label for="location" class="block text-sm font-semibold text-gray-700 mb-2">Location:</label>
            <input type="text" id="location" placeholder="Location" 
                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base" />
          </div>
          <div>
            <label for="class" class="block text-sm font-semibold text-gray-700 mb-2">Class:</label>
            <select id="class" required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
              <option value="">Select Class</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
            </select>
          </div>
          <div id="streamDiv" class="hidden">
            <label for="stream" class="block text-sm font-semibold text-gray-700 mb-2">Stream:</label>
            <select id="stream" 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base">
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Arts">Arts</option>
              <option value="Diploma">Diploma</option>
              <option value="Vocational courses">Vocational courses</option>
              <option value="Other" selected>Other</option>
            </select>
          </div>
          <button type="submit" class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  `;
  // Add event listener for class selection
  document.getElementById("class").addEventListener("change", function() {
    const streamDiv = document.getElementById("streamDiv");
    if (this.value === "12th") {
      streamDiv.classList.remove("hidden");
    } else {
      streamDiv.classList.add("hidden");
    }
  });
  
  document
    .getElementById("profileForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const dob = document.getElementById("dob").value;
      const gender = document.getElementById("gender").value;
      const location = document.getElementById("location").value;
      const classValue = document.getElementById("class").value;
      const stream = document.getElementById("stream").value;

      try {
        const response = await fetch("http://localhost:5000/api/v1/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dob,
            gender,
            location,
            class: classValue,
            stream,
          }),
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const completionData = data.profileCompletion;
          
          if (completionData.isComplete) {
            alert(`Profile updated successfully! Your profile is now 100% complete.`);
            await renderApp();
          } else {
            alert(`Profile updated successfully! Your profile is ${completionData.percentage}% complete.`);
            // Show updated completion screen or go to main app
            showProfileCompletionScreen(completionData.percentage);
          }
        } else {
          const data = await response.json();
          alert("Profile update failed: " + data.message);
        }
      } catch (error) {
        console.error("Profile update error:", error);
        alert(
          "Network error. Please check if the server is running on port 5000."
        );
      }
    });
}

// Initialize app
(async () => {
  await renderApp();
})();
