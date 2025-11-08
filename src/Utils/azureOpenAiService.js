// import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

// const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
// const apiKey = process.env.AZURE_OPENAI_API_KEY;
// const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID;

// const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

// export async function generateQuestion(profileData) {
//   const prompt = `Based on this LeetCode profile:
// - Easy problems solved: ${profileData.easySolved}
// - Medium problems solved: ${profileData.mediumSolved}
// - Hard problems solved: ${profileData.hardSolved}
// - Total solved: ${profileData.totalSolved}

// Generate a coding question appropriate for their skill level. Include:
// 1. Title
// 2. Description
// 3. Examples with input/output
// 4. Test cases
// 5. Code template

// Format as JSON.`;

//   const response = await client.getCompletions(deploymentId, prompt, {
//     temperature: 0.7,
//     maxTokens: 1000,
//   });

//   return JSON.parse(response.choices[0].text);
// }

// export async function evaluateCode(submission) {
//   const { code, testResults, question } = submission;
  
//   const prompt = `Evaluate this code submission:

// Question: ${question.title}
// ${question.description}

// Submitted Code:
// ${code}

// Test Results:
// ${JSON.stringify(testResults, null, 2)}

// Provide feedback on:
// 1. Code correctness
// 2. Time complexity
// 3. Space complexity
// 4. Code style and best practices
// 5. Potential improvements
// 6. Follow-up questions to test understanding

// Main focus is follow up questions to test a user's understadning 

// Format response in markdown.`;

//   const response = await client.getCompletions(deploymentId, prompt, {
//     temperature: 0.7,
//     maxTokens: 1000,
//   });

//   return {
//     feedback: response.choices[0].text
//   };
// }