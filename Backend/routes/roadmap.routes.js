import express from 'express';
import OpenAI from 'openai';

const roadmapRouter = express.Router();

// Initialize OpenAI client (make sure to set your API key in environment variables)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Custom prompt for generating roadmaps
const ROADMAP_PROMPT = `Generate a detailed learning roadmap for the given topic. 
Create a Mermaid flowchart diagram that shows:
1. Clear progression from beginner to advanced levels
2. Specific skills, technologies, or concepts to learn
3. Logical dependencies between topics
4. Estimated timeframes for each phase
5. Key milestones and projects

Format the response as valid Mermaid flowchart syntax only. Use:
- flowchart TD (top-down direction)
- Rectangle nodes for main topics: [Topic Name]
- Rounded rectangle nodes for skills: (Skill Name)
- Diamond nodes for decisions/milestones: {Milestone}
- Arrows to show progression: -->
- Subgraphs for grouping related concepts

Make sure the diagram is syntactically correct and follows Mermaid standards.
Only return the Mermaid code, no explanations or markdown formatting.`;

// Function to validate Mermaid syntax
function validateMermaidSyntax(mermaidCode) {
  try {
    // Basic syntax validation
    if (!mermaidCode.trim()) return false;
    
    // Check for required flowchart declaration
    if (!mermaidCode.includes('flowchart')) return false;
    
    // Check for common syntax errors
    const lines = mermaidCode.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('flowchart') && 
          !trimmedLine.startsWith('subgraph') && !trimmedLine.startsWith('end') &&
          !trimmedLine.includes('-->') && !trimmedLine.match(/^[A-Za-z0-9_]+[\[\(\{].*[\]\)\}]$/)) {
        // If line doesn't match expected patterns, it might be invalid
        if (!trimmedLine.match(/^[A-Za-z0-9_]+$/)) {
          continue; // Allow simple node IDs
        }
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Function to generate roadmap with AI
async function generateRoadmap(topic, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: ROADMAP_PROMPT
          },
          {
            role: "user",
            content: `Create a comprehensive learning roadmap for: ${topic}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const mermaidCode = completion.choices[0].message.content.trim();
      
      // Validate the generated Mermaid code
      if (validateMermaidSyntax(mermaidCode)) {
        return {
          success: true,
          mermaidCode,
          attempt
        };
      } else {
        console.log(`Attempt ${attempt}: Invalid Mermaid syntax generated`);
        if (attempt === maxRetries) {
          throw new Error('Failed to generate valid Mermaid syntax after maximum retries');
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}

// GET route for generating roadmaps
roadmapRouter.get('/', async (req, res) => {
  try {
    const { topic } = req.query;
    
    // Validate input
    if (!topic) {
      return res.status(400).json({
        error: 'Missing required parameter: topic',
        message: 'Please provide a topic in the query parameter. Example: /?topic=javascript'
      });
    }

    if (typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid topic parameter',
        message: 'Topic must be a non-empty string'
      });
    }

    // Generate roadmap with retry mechanism
    console.log(`Generating roadmap for topic: ${topic}`);
    const result = await generateRoadmap(topic.trim());

    // Send successful response
    res.json({
      success: true,
      topic: topic.trim(),
      mermaidCode: result.mermaidCode,
      generatedAt: new Date().toISOString(),
      attempt: result.attempt,
      message: 'Roadmap generated successfully'
    });

  } catch (error) {
    console.error('Error generating roadmap:', error);
    
    // Handle different types of errors
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'OpenAI API key is not configured properly'
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }
    
    if (error.message.includes('Failed to generate valid Mermaid syntax')) {
      return res.status(500).json({
        error: 'Generation Failed',
        message: 'Unable to generate valid roadmap diagram after multiple attempts'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while generating the roadmap'
    });
  }
});

export default roadmapRouter;