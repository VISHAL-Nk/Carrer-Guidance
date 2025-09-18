const app = document.getElementById("app");

// Global state
let currentUser = null;
let userProfile = null;

// Utility functions
function isAuthenticated() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return token;
}

function isAuthenticated() {
  const token = getTokenFromCookie() || localStorage.getItem('authToken');
  return !!token;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' :
    type === 'error' ? 'bg-red-500 text-white' :
    type === 'warning' ? 'bg-yellow-500 text-black' :
    'bg-blue-500 text-white'
  }`;
  toast.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg font-bold">&times;</button>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

// Authentication screens
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
        currentUser = data.user;
        
        showToast("Login successful!", 'success');
        
        // Check profile completion and show toast if incomplete
        if (data.profileCompletion && !data.profileCompletion.isComplete) {
          setTimeout(() => {
            showProfileCompletionToast(data.profileCompletion.percentage);
          }, 1000);
        }
        
        await renderApp();
      } else {
        const data = await response.json();
        showToast("Login failed: " + data.message, 'error');
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Network error. Please check if the server is running.", 'error');
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
  
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const firstName = document.getElementById("firstName").value;
    const middleName = document.getElementById("middleName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/register", {
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
      });

      if (response.ok) {
        showToast("Registration successful! Please verify OTP.", 'success');
        verifyOTPScreen(phone);
      } else {
        const data = await response.json();
        showToast("Registration failed: " + data.message, 'error');
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToast("Network error. Please check if the server is running.", 'error');
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
      const response = await fetch("http://localhost:5000/api/v1/auth/verifyOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
        credentials: "include",
      });

      if (response.ok) {
        showToast("OTP verification successful! You can now log in.", 'success');
        loginScreen();
      } else {
        const data = await response.json();
        showToast("OTP verification failed: " + data.message, 'error');
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      showToast("Network error. Please check if the server is running.", 'error');
    }
  });
}

// Profile completion toast
function showProfileCompletionToast(percentage) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 z-50 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg max-w-sm';
  toast.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <p class="text-sm text-yellow-800 font-medium">Complete Your Profile</p>
        <p class="text-sm text-yellow-700 mt-1">Your profile is ${percentage}% complete. Complete it to get personalized recommendations.</p>
        <div class="w-full bg-yellow-200 rounded-full h-2 mt-2">
          <div class="bg-yellow-400 h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
        </div>
        <div class="mt-3 flex space-x-2">
          <button onclick="profileUpdateScreen()" class="text-xs bg-yellow-400 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-500 transition-colors">
            Complete Now
          </button>
          <button onclick="this.closest('.fixed').remove()" class="text-xs text-yellow-600 hover:text-yellow-800">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
}

// Main dashboard
async function renderDashboard() {
  // Fetch user profile
  try {
    const response = await fetch("http://localhost:5000/api/v1/profile", {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      userProfile = data.profile;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }

  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-800">Career Guidance Platform</h1>
              <p class="text-gray-600 mt-2">Welcome back, ${currentUser?.firstName || 'Student'}!</p>
            </div>
            <button id="logoutBtn" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Logout
            </button>
          </div>
        </div>

        <!-- Main Options Grid -->
        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <!-- Interest Detection -->
          <div class="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Interest Detection</h3>
            <p class="text-gray-600 mb-4">Discover your interests and aptitudes</p>
            <div class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
              Update in Progress
            </div>
          </div>

          <!-- College List -->
          <div id="collegeListCard" class="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 8h10M7 12h4m1 8l-1-8h4l-1 8"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">College List</h3>
            <p class="text-gray-600 mb-4">Explore colleges and institutions</p>
            <div class="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
              View Colleges
            </div>
          </div>

          <!-- Scholarship -->
          <div class="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Scholarship</h3>
            <p class="text-gray-600 mb-4">Find scholarship opportunities</p>
            <div class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
              Update in Progress
            </div>
          </div>

          <!-- Career Guidance -->
          <div id="careerGuidanceCard" class="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Career Guidance</h3>
            <p class="text-gray-600 mb-4">Get personalized career recommendations</p>
            <div class="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium">
              Take Assessment
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
      await fetch("http://localhost:5000/api/v1/auth/signout", {
        method: "POST",
        credentials: "include",
      });
      showToast("Logged out successfully!", 'success');
      currentUser = null;
      userProfile = null;
      await renderApp();
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Logout completed", 'info');
      currentUser = null;
      userProfile = null;
      await renderApp();
    }
  });

  document.getElementById("collegeListCard").addEventListener("click", () => {
    collegeListScreen();
  });

  document.getElementById("careerGuidanceCard").addEventListener("click", () => {
    careerGuidanceScreen();
  });
}

// College List Screen
async function collegeListScreen() {
  let colleges = [];
  let filters = { locations: [], types: [] };
  let userClass = '';

  try {
    const response = await fetch("http://localhost:5000/api/v1/colleges", {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      colleges = data.data.colleges;
      filters = data.data.filters;
      userClass = data.data.userClass;
    } else {
      const errorData = await response.json();
      showToast(errorData.message, 'error');
      return;
    }
  } catch (error) {
    console.error("Error fetching colleges:", error);
    showToast("Error fetching colleges", 'error');
    return;
  }

  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-gray-800">College List</h1>
              <p class="text-gray-600 mt-2">Colleges for ${userClass} Grade Students (${colleges.length} colleges found)</p>
            </div>
            <button id="backToDashboard" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label for="searchInput" class="block text-sm font-medium text-gray-700 mb-2">Search:</label>
              <input type="text" id="searchInput" placeholder="Search colleges..." 
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
            </div>
            <div>
              <label for="locationFilter" class="block text-sm font-medium text-gray-700 mb-2">Location:</label>
              <select id="locationFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                <option value="">All Locations</option>
                ${filters.locations.map(location => `<option value="${location}">${location}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="typeFilter" class="block text-sm font-medium text-gray-700 mb-2">Type:</label>
              <select id="typeFilter" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                <option value="">All Types</option>
                ${filters.types.map(type => `<option value="${type}">${type}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- College Grid -->
        <div id="collegeGrid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${renderCollegeCards(colleges)}
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById("backToDashboard").addEventListener("click", renderDashboard);

  // Filter functionality
  const searchInput = document.getElementById("searchInput");
  const locationFilter = document.getElementById("locationFilter");
  const typeFilter = document.getElementById("typeFilter");

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedLocation = locationFilter.value;
    const selectedType = typeFilter.value;

    const filteredColleges = colleges.filter(college => {
      const matchesSearch = !searchTerm || 
        college.collegeName.toLowerCase().includes(searchTerm) ||
        college.location.toLowerCase().includes(searchTerm);
      const matchesLocation = !selectedLocation || college.location === selectedLocation;
      const matchesType = !selectedType || college.CollegeType === selectedType;

      return matchesSearch && matchesLocation && matchesType;
    });

    document.getElementById("collegeGrid").innerHTML = renderCollegeCards(filteredColleges);
  }

  searchInput.addEventListener("input", applyFilters);
  locationFilter.addEventListener("change", applyFilters);
  typeFilter.addEventListener("change", applyFilters);
}

function renderCollegeCards(colleges) {
  if (colleges.length === 0) {
    return `
      <div class="col-span-full text-center py-12">
        <div class="text-gray-500 text-lg">No colleges found matching your criteria.</div>
      </div>
    `;
  }

  return colleges.map(college => `
    <div class="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${college.collegeName}</h3>
          <div class="flex items-center text-gray-600 mb-2">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span class="text-sm">${college.location}</span>
          </div>
          <div class="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            ${college.CollegeType}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Career Guidance Screen
async function careerGuidanceScreen() {
  // Check if user can access career guidance
  try {
    const response = await fetch("http://localhost:5000/api/v1/questions", {
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.status === 'update_underway') {
        // Show update underway message for 12th grade students
        app.innerHTML = `
          <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Update is Underway</h2>
              <p class="text-gray-600 mb-6">Career guidance for ${errorData.userClass || '12th'} grade students is currently being updated. Please check back soon!</p>
              <button id="backToDashboard" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Back to Dashboard
              </button>
            </div>
          </div>
        `;
        document.getElementById("backToDashboard").addEventListener("click", renderDashboard);
        return;
      } else {
        showToast(errorData.message, 'error');
        return;
      }
    }

    const data = await response.json();
    startCareerAssessment(data.data.questions);

  } catch (error) {
    console.error("Error accessing career guidance:", error);
    showToast("Error accessing career guidance", 'error');
  }
}

// Career Assessment Implementation
let assessmentQuestions = [];
let currentQuestion = 0;
let studentAnswers = [];

function startCareerAssessment(questions) {
  assessmentQuestions = questions;
  currentQuestion = 0;
  studentAnswers = [];

  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-purple-700">
      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🎯 Career Assessment
          </h1>
          <p class="text-xl text-white opacity-90">
            Discover Your Perfect Career Path
          </p>
        </div>

        <!-- Assessment Questions -->
        <div id="assessmentSection" class="bg-white rounded-2xl p-8 shadow-xl mb-6">
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
            <span id="questionCounter" class="text-gray-600 font-medium">Question 1 of ${assessmentQuestions.length}</span>
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
          <!-- Results will be populated here -->
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById("prevBtn").addEventListener("click", previousQuestion);
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);
  document.getElementById("submitBtn").addEventListener("click", submitAssessment);

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
      document.getElementById("submitBtn").disabled = false;
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

async function submitAssessment() {
  // Save last answer
  const selectedOption = document.querySelector(`input[name="question${assessmentQuestions[currentQuestion].id}"]:checked`);
  if (selectedOption) {
    studentAnswers[currentQuestion] = selectedOption.value;
  }
  
  // Show loading
  document.getElementById("assessmentSection").classList.add("hidden");
  document.getElementById("loadingSection").classList.remove("hidden");
  
  // Prepare responses for API
  const responses = assessmentQuestions.map((question, index) => ({
    questionId: question.id,
    answer: studentAnswers[index]
  }));

  try {
    const response = await fetch("http://localhost:5000/api/v1/questions/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses }),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      await showResults(data.data);
    } else {
      const errorData = await response.json();
      showToast("Error processing assessment: " + errorData.message, 'error');
      document.getElementById("loadingSection").classList.add("hidden");
      document.getElementById("assessmentSection").classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error submitting assessment:", error);
    showToast("Network error occurred", 'error');
    document.getElementById("loadingSection").classList.add("hidden");
    document.getElementById("assessmentSection").classList.remove("hidden");
  }
}

async function showResults(assessmentData) {
  document.getElementById("loadingSection").classList.add("hidden");
  
  const pathData = assessmentData.recommendation.pathDetails;
  const confidence = Math.round(assessmentData.recommendation.confidence);
  
  // Generate mermaid diagram
  let mermaidCode = '';
  try {
    const roadmapResponse = await fetch(`http://localhost:5000/api/v1/roadmap?topic=${encodeURIComponent(pathData.name)}`, {
      credentials: "include",
    });
    
    if (roadmapResponse.ok) {
      const roadmapData = await roadmapResponse.json();
      mermaidCode = roadmapData.mermaidCode;
    }
  } catch (error) {
    console.error("Error fetching roadmap:", error);
  }

  const resultHTML = `
    <div class="bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-2xl p-8 text-center mb-6">
      <h2 class="text-4xl font-bold mb-2">${pathData.name}</h2>
      <p class="text-xl opacity-90 mb-4">${pathData.description}</p>
      <div class="text-2xl font-bold">
        Confidence: <span>${confidence}%</span>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-8 shadow-xl mb-6">
      <h3 class="text-2xl font-semibold text-blue-600 mb-6">📚 Recommended Path Details</h3>
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-800 mb-3">Subjects:</h4>
        <div class="flex flex-wrap gap-2">
          ${pathData.subjects.map(subject => 
            `<span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">${subject}</span>`
          ).join('')}
        </div>
      </div>
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-800 mb-3">Career Options:</h4>
        <div class="flex flex-wrap gap-2">
          ${pathData.careerOptions.map(career => 
            `<span class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">${career}</span>`
          ).join('')}
        </div>
      </div>
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-800 mb-3">Institutions:</h4>
        <div class="flex flex-wrap gap-2">
          ${pathData.institutions.map(institution => 
            `<span class="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">${institution}</span>`
          ).join('')}
        </div>
      </div>
    </div>

    ${mermaidCode ? `
    <div class="bg-white rounded-2xl p-8 shadow-xl mb-6">
      <h3 class="text-2xl font-semibold text-blue-600 mb-6">🗺️ Career Roadmap</h3>
      <div class="bg-gray-50 p-4 rounded-lg overflow-x-auto">
        <pre class="text-sm text-gray-800 whitespace-pre-wrap">${mermaidCode}</pre>
      </div>
    </div>
    ` : ''}

    <div class="bg-white rounded-2xl p-8 shadow-xl mb-6">
      <h3 class="text-2xl font-semibold text-blue-600 mb-6">📊 Your Score Breakdown</h3>
      ${Object.keys(assessmentData.recommendation.scores).map(path => {
        const score = assessmentData.recommendation.scores[path];
        const percentage = Math.round((score / Math.max(...Object.values(assessmentData.recommendation.scores))) * 100);
        return `
          <div class="flex justify-between items-center mb-4 p-4 rounded-lg bg-gray-50">
            <span class="font-medium text-gray-800">${path.charAt(0).toUpperCase() + path.slice(1)}</span>
            <div class="flex items-center space-x-4">
              <div class="w-32 h-5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500" style="width: ${percentage}%"></div>
              </div>
              <span class="font-bold text-gray-700 w-12">${percentage}%</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="text-center">
      <button id="backToDashboardBtn" class="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors mr-4">
        Back to Dashboard
      </button>
      <button id="retakeAssessmentBtn" class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Retake Assessment
      </button>
    </div>
  `;

  document.getElementById("resultSection").innerHTML = resultHTML;
  document.getElementById("resultSection").classList.remove("hidden");

  // Add event listeners for result buttons
  document.getElementById("backToDashboardBtn").addEventListener("click", renderDashboard);
  document.getElementById("retakeAssessmentBtn").addEventListener("click", () => {
    startCareerAssessment(assessmentQuestions);
  });
}

// Profile update screen
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
        <div class="mt-6 text-center">
          <button id="backToDashboard" class="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Dashboard
          </button>
        </div>
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
  
  document.getElementById("profileForm").addEventListener("submit", async (e) => {
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
          showToast(`Profile updated successfully! Your profile is now 100% complete.`, 'success');
        } else {
          showToast(`Profile updated successfully! Your profile is ${completionData.percentage}% complete.`, 'success');
        }
        
        await renderApp();
      } else {
        const data = await response.json();
        showToast("Profile update failed: " + data.message, 'error');
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Network error occurred", 'error');
    }
  });
  
  document.getElementById("backToDashboard").addEventListener("click", renderDashboard);
}

// Main app renderer
async function renderApp() {
  if (isAuthenticated()) {
    await renderDashboard();
  } else {
    app.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Career Guidance Platform</h1>
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

// Initialize app
(async () => {
  await renderApp();
})();