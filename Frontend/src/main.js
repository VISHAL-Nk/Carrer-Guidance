const app = document.getElementById("app");

function isAuthenticated() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
  return !!token;
}

function loginScreen() {
  app.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm" action="http://localhost:5000/api/v1/auth/login" method="POST">
            <label for="email">Email:</label>
            <input type="email" id="email" placeholder="Email" required />
            <label for="password">Password:</label>
            <input type="password" id="password" placeholder="Password" required />
            <button type="submit">Login</button>
        </form>
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
        alert("Login successful!");
        profileUpdateScreen();
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
}

function registerScreen() {
  app.innerHTML = `
        <h2>Register</h2>
        <form id="registerForm" action="http://localhost:5000/api/v1/auth/register" method="POST">
            <div>
                <label for="firstName">First Name:</label>
                <input type="text" id="firstName" placeholder="First Name" required />
            </div>
            <div>
                <label for="middleName">Middle Name:</label>
                <input type="text" id="middleName" placeholder="Middle Name"  />
            </div>
            <div>
                <label for="lastName">Last Name:</label>
                <input type="text" id="lastName" placeholder="Last Name" required />
            </div>
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email" placeholder="Email" required />
            </div>
            <div>
                <label for="phone">Phone:</label>
                <input type="tel" id="phone" placeholder="Phone" required />
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" placeholder="Password" required />
            </div>
            <div>
                <label for="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" placeholder="Confirm Password" required />
            </div>
            <button type="submit" class="cursor-pointer">Register</button>
        </form>
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
}

function verifyOTPScreen(phone) {
  app.innerHTML = `
        <h2>Verify OTP</h2>
        <form id="otpForm" action="http://localhost:5000/api/v1/auth/verifyOTP" method="POST">
            <p>Please enter the OTP sent to your phone. for number ${phone}</p>
            <label for="otp">OTP:</label>
            <input type="text" id="otp" placeholder="OTP" required />
            <button type="submit">Verify OTP</button>
        </form>
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

function renderApp() {
  if (isAuthenticated()) {
    app.innerHTML = `
            <h2>Welcome to the App!</h2>
            <button id="logoutBtn">Logout</button>
        `;
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
            <button id="loginBtn">Login</button>
            <button id="registerBtn">Register</button>
        `;
    document.getElementById("loginBtn").addEventListener("click", loginScreen);
    document
      .getElementById("registerBtn")
      .addEventListener("click", registerScreen);
  }
}

function profileUpdateScreen() {
  app.innerHTML = `
        <h2>Update Profile</h2>
        <form id="profileForm">
            <div>
                <label for="dob">Date of Birth:</label>
                <input type="date" id="dob" required />
            </div>
            <div>
                <label for="gender">Gender:</label>
                <select id="gender" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say" selected>Prefer not to say</option>
                </select>
            </div>
            <div>
                <label for="location">Location:</label>
                <input type="text" id="location" placeholder="Location" />
            </div>
            <div>
                <label for="class">Class:</label>
                <select id="class" onchange=${toggleStream()} required>
                    <option value="">Select Class</option>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                </select>
            </div>
            <div style="display: none;" id="streamDiv">
                <label for="stream">Stream:</label>
                <select id="stream">
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Vocational courses">Vocational courses</option>
                    <option value="Other" selected>Other</option>
                </select>
            </div>
            <button type="submit">Update Profile</button>
        </form>
    `;
  function toggleStream() {
    const classValue = document.getElementById("class").value;
    if (classValue === "12th") {
      document.getElementById("streamDiv").style.display = "block";
    }
  }
  document
    .getElementById("profileForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const dob = document.getElementById("dob").value;
      const gender = document.getElementById("gender").value;
      const location = document.getElementById("location").value;
      const classValue = document.getElementById("class").value;
      if (classValue === "10th") {
        document.getElementById("streamDiv").style.display = "none";
      } else {
        document.getElementById("streamDiv").style.display = "block";
      }
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
          alert("Profile updated successfully!");
          renderApp();
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
renderApp();
