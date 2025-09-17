// question.js - Question Model and Sample Data

// Question categories for career guidance
const questionCategories = {
  INTERESTS: 'interests',
  SKILLS: 'skills', 
  ACADEMICS: 'academics',
  PERSONALITY: 'personality',
  FUTURE_GOALS: 'future_goals'
};

// Sample questions for career guidance assessment
const careerQuestions = [
  // Interest-based questions
  {
    id: 1,
    category: questionCategories.INTERESTS,
    question: "Which subject do you find most interesting?",
    options: [
      { value: "science", text: "Science (Physics, Chemistry, Biology)", weight: { science: 3, commerce: 1, arts: 1 } },
      { value: "math", text: "Mathematics", weight: { science: 3, commerce: 2, arts: 0 } },
      { value: "social", text: "Social Studies/History", weight: { arts: 3, commerce: 1, science: 0 } },
      { value: "languages", text: "Languages and Literature", weight: { arts: 3, commerce: 1, science: 0 } },
      { value: "accounts", text: "Accounts/Business Studies", weight: { commerce: 3, arts: 1, science: 0 } }
    ]
  },
  {
    id: 2,
    category: questionCategories.INTERESTS,
    question: "What type of activities do you enjoy most?",
    options: [
      { value: "experiments", text: "Conducting experiments and research", weight: { science: 3, diploma: 2, vocational: 1 } },
      { value: "business", text: "Business and entrepreneurship", weight: { commerce: 3, diploma: 1, vocational: 2 } },
      { value: "creative", text: "Creative writing, art, or cultural activities", weight: { arts: 3, vocational: 2, commerce: 0 } },
      { value: "technical", text: "Working with machines or technology", weight: { diploma: 3, vocational: 3, science: 2 } },
      { value: "helping", text: "Helping and teaching others", weight: { arts: 2, science: 1, commerce: 1 } }
    ]
  },
  {
    id: 3,
    category: questionCategories.ACADEMICS,
    question: "What was your strongest subject in SSLC?",
    options: [
      { value: "science_math", text: "Science and Mathematics", weight: { science: 3, diploma: 2, commerce: 1 } },
      { value: "social_lang", text: "Social Science and Languages", weight: { arts: 3, commerce: 2, science: 0 } },
      { value: "all_equal", text: "All subjects equally", weight: { commerce: 2, arts: 2, science: 2 } },
      { value: "practical", text: "Practical subjects/Activities", weight: { vocational: 3, diploma: 3, arts: 1 } }
    ]
  },
  {
    id: 4,
    category: questionCategories.FUTURE_GOALS,
    question: "What is your primary career goal?",
    options: [
      { value: "doctor_engineer", text: "Become a Doctor/Engineer", weight: { science: 4, diploma: 1, commerce: 0 } },
      { value: "business_ca", text: "Start a business or become CA/CS", weight: { commerce: 4, arts: 1, science: 0 } },
      { value: "teacher_ias", text: "Become a teacher/IAS officer", weight: { arts: 3, commerce: 2, science: 1 } },
      { value: "quick_job", text: "Get a job quickly after studies", weight: { diploma: 4, vocational: 4, commerce: 1 } },
      { value: "creative_field", text: "Work in creative fields", weight: { arts: 4, vocational: 2, commerce: 0 } }
    ]
  },
  {
    id: 5,
    category: questionCategories.SKILLS,
    question: "Which skill describes you best?",
    options: [
      { value: "analytical", text: "Analytical and logical thinking", weight: { science: 3, commerce: 2, diploma: 1 } },
      { value: "communication", text: "Good communication and presentation", weight: { arts: 3, commerce: 2, science: 1 } },
      { value: "practical", text: "Hands-on and practical work", weight: { vocational: 4, diploma: 3, science: 1 } },
      { value: "leadership", text: "Leadership and management", weight: { commerce: 3, arts: 2, science: 1 } },
      { value: "creative", text: "Creative and artistic abilities", weight: { arts: 4, vocational: 2, commerce: 0 } }
    ]
  },
  {
    id: 6,
    category: questionCategories.ACADEMICS,
    question: "How do you prefer to learn?",
    options: [
      { value: "theory", text: "Through theory and concepts", weight: { science: 3, arts: 2, commerce: 2 } },
      { value: "practical", text: "Through hands-on practice", weight: { diploma: 3, vocational: 4, science: 1 } },
      { value: "discussion", text: "Through group discussions", weight: { arts: 3, commerce: 2, science: 1 } },
      { value: "mixed", text: "Combination of theory and practical", weight: { commerce: 3, science: 2, diploma: 2 } }
    ]
  },
  {
    id: 7,
    category: questionCategories.PERSONALITY,
    question: "Which environment do you prefer to work in?",
    options: [
      { value: "lab_research", text: "Laboratory or research facility", weight: { science: 4, diploma: 1, commerce: 0 } },
      { value: "office", text: "Office environment", weight: { commerce: 3, arts: 2, science: 1 } },
      { value: "field_outdoor", text: "Field work or outdoor", weight: { vocational: 3, diploma: 2, arts: 1 } },
      { value: "creative_space", text: "Creative studios or cultural spaces", weight: { arts: 4, vocational: 2, commerce: 0 } },
      { value: "workshop", text: "Workshop or technical facility", weight: { diploma: 4, vocational: 3, science: 1 } }
    ]
  },
  {
    id: 8,
    category: questionCategories.FUTURE_GOALS,
    question: "How long are you willing to study after SSLC?",
    options: [
      { value: "long_term", text: "5+ years (Professional courses)", weight: { science: 4, arts: 2, commerce: 2 } },
      { value: "medium_term", text: "3-4 years (Degree courses)", weight: { commerce: 3, arts: 3, science: 2 } },
      { value: "short_term", text: "1-2 years (Quick certification)", weight: { diploma: 4, vocational: 4, commerce: 1 } },
      { value: "flexible", text: "Flexible, depends on opportunities", weight: { commerce: 2, arts: 2, diploma: 2 } }
    ]
  }
];

// Career path definitions
const careerPaths = {
  science: {
    name: "Science Stream",
    description: "For students interested in medicine, engineering, research, and technology",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology (optional)"],
    careerOptions: ["Engineering", "Medicine", "Research", "Biotechnology", "Pharmacy", "Nursing"],
    minScore: 15,
    institutions: ["Government/Private colleges", "Medical colleges", "Engineering colleges"]
  },
  commerce: {
    name: "Commerce Stream", 
    description: "For students interested in business, finance, accounting, and management",
    subjects: ["Accountancy", "Business Studies", "Economics", "Mathematics (optional)"],
    careerOptions: ["CA", "CS", "Banking", "Business Management", "Economics", "Finance"],
    minScore: 12,
    institutions: ["Commerce colleges", "Business schools", "Professional institutes"]
  },
  arts: {
    name: "Arts/Humanities Stream",
    description: "For students interested in literature, social sciences, psychology, and creative fields",
    subjects: ["History", "Geography", "Political Science", "Economics", "Psychology", "Literature"],
    careerOptions: ["Teaching", "Civil Services", "Journalism", "Psychology", "Social Work", "Law"],
    minScore: 10,
    institutions: ["Arts colleges", "Universities", "Specialized institutes"]
  },
  diploma: {
    name: "Diploma Courses",
    description: "Technical and professional diploma courses for quick employment",
    subjects: ["Varies by specialization"],
    careerOptions: ["Engineering Diploma", "Hotel Management", "Fashion Design", "Computer Applications", "Pharmacy"],
    minScore: 8,
    institutions: ["Polytechnics", "Technical institutes", "Specialized colleges"]
  },
  vocational: {
    name: "Vocational Training",
    description: "Skill-based training for immediate employment opportunities",
    subjects: ["Trade-specific skills"],
    careerOptions: ["ITI trades", "Skill development programs", "Apprenticeships", "Self-employment"],
    minScore: 5,
    institutions: ["ITI", "Skill development centers", "Training institutes"]
  }
};

// Function to calculate career recommendation based on responses
function calculateCareerPath(responses) {
  const scores = {
    science: 0,
    commerce: 0, 
    arts: 0,
    diploma: 0,
    vocational: 0
  };

  // Calculate scores based on responses
  responses.forEach(response => {
    const question = careerQuestions.find(q => q.id === response.questionId);
    const selectedOption = question.options.find(opt => opt.value === response.answer);
    
    if (selectedOption && selectedOption.weight) {
      Object.keys(selectedOption.weight).forEach(path => {
        if (scores.hasOwnProperty(path)) {
          scores[path] += selectedOption.weight[path];
        }
      });
    }
  });

  // Find the path with highest score
  const recommendedPath = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );

  return {
    recommendedPath,
    scores,
    pathDetails: careerPaths[recommendedPath],
    allPaths: careerPaths
  };
}

export {
  careerQuestions,
  careerPaths,
  questionCategories,
  calculateCareerPath
};