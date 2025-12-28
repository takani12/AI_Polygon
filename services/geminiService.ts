import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProblemSpec, TestCase, TestStrategy, ConfidenceLevel, BugHuntResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// --- Helper for Models ---
// Logic/Reasoning: gemini-3-pro-preview
// Vision/OCR: gemini-2.5-flash-image

/**
 * Parses a problem statement (text or image) into a structured specification.
 */
export const parseProblemStatement = async (
  text: string,
  imageBase64?: string,
  mimeType: string = 'image/png'
): Promise<ProblemSpec> => {
  const modelId = imageBase64 ? 'gemini-2.5-flash-image' : 'gemini-3-pro-preview';
  
  // Explicit schema text for the image model
  const jsonTemplate = `
  {
    "title": "Tên Bài Toán",
    "summary": "Tóm tắt logic bằng Tiếng Việt...",
    "timeLimit": "1.0s",
    "memoryLimit": "256MB",
    "inputFormat": "Mô tả input...",
    "outputFormat": "Mô tả output...",
    "variables": [
      { "name": "n", "type": "int", "description": "Mô tả biến n bằng tiếng Việt", "constraints": "1 <= n <= 10^5" }
    ],
    "constraints": ["1 <= n <= 10^5"],
    "edgeCasesAnalysis": ["Nếu n = 0 thì..."],
    "confidence": "Cao",
    "logicCheck": "OK"
  }
  `;

  const promptText = `
    You are an expert Competitive Programming Architect. 
    Analyze the provided problem statement (which may be an image or text).
    
    Your goal is to extract a formal "Problem Specification".
    
    1. Identify the core logic.
    2. Extract variables, types, and EXACT constraints.
    3. Identify edge cases (e.g., n=0, n=1, graph is a tree, disconnected, overflow).
    4. Determine the input/output format strictly.
    5. Rate your confidence (Cao/Trung Bình/Thấp).
    
    LANGUAGE & FORMATTING RULES:
    - **ALL** text fields (summary, description, edgeCasesAnalysis) MUST be in **VIETNAMESE** (Tiếng Việt).
    - Maintain mathematical precision. Use standard LaTeX math delimiters '$' for formulas.
      Example: "Tìm số nguyên $k$ nhỏ nhất sao cho $N \le 10^9$."
    - Do NOT translate standard CP terms like "integer", "string", "array" in the 'type' field, but DO translate descriptions.
    
    ${imageBase64 
      ? `OUTPUT STRICT JSON ONLY. Do not use Markdown blocks. Follow this structure strictly:\n${jsonTemplate}` 
      : "Return the result in JSON format matching the schema."
    }
  `;

  const parts: any[] = [{ text: promptText }];
  if (text) parts.push({ text: `Problem Text:\n${text}` });
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64
      }
    });
  }

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING, description: "Logic summary in VIETNAMESE. Use $...$ for math formulas." },
      timeLimit: { type: Type.STRING, description: "e.g., 1.0s" },
      memoryLimit: { type: Type.STRING, description: "e.g., 256MB" },
      inputFormat: { type: Type.STRING },
      outputFormat: { type: Type.STRING },
      variables: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING, description: "e.g. integer, long long, string" },
            description: { type: Type.STRING, description: "Description in VIETNAMESE" },
            constraints: { type: Type.STRING, description: "Math constraints e.g. $1 \\le N \\le 10^5$" },
          }
        }
      },
      constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
      edgeCasesAnalysis: { type: Type.ARRAY, items: { type: Type.STRING, description: "Analysis in VIETNAMESE" } },
      confidence: { type: Type.STRING, enum: [ConfidenceLevel.HIGH, ConfidenceLevel.MEDIUM, ConfidenceLevel.LOW] },
      logicCheck: { type: Type.STRING }
    },
    required: ["title", "summary", "inputFormat", "outputFormat", "variables", "constraints", "confidence"]
  };

  const config: any = {};
  if (modelId === 'gemini-3-pro-preview') {
    config.responseMimeType = "application/json";
    config.responseSchema = responseSchema;
    config.thinkingConfig = { thinkingBudget: 1024 };
  }

  const response = await ai.models.generateContent({
    model: modelId,
    contents: { parts },
    config: config
  });

  if (!response.text) throw new Error("No response from AI");
  
  // Clean up markdown if present
  let jsonStr = response.text.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(json)?\n?/, '').replace(/```$/, '');
  }

  try {
    const parsed = JSON.parse(jsonStr);
    // Sanitize
    parsed.variables = Array.isArray(parsed.variables) ? parsed.variables : [];
    parsed.constraints = Array.isArray(parsed.constraints) ? parsed.constraints : [];
    parsed.edgeCasesAnalysis = Array.isArray(parsed.edgeCasesAnalysis) ? parsed.edgeCasesAnalysis : [];
    
    if (!Object.values(ConfidenceLevel).includes(parsed.confidence)) {
       parsed.confidence = ConfidenceLevel.LOW; 
    }
    
    return parsed as ProblemSpec;
  } catch (e) {
    console.error("Failed to parse JSON:", jsonStr);
    throw new Error("AI returned invalid JSON format. Please try again or provide a clearer image.");
  }
};

/**
 * Generates specific test cases based on the strategy and spec.
 */
export const generateSmartTestCase = async (
  spec: ProblemSpec,
  strategy: TestStrategy,
  count: number = 1
): Promise<TestCase[]> => {
  const prompt = `
    Context: You are a Test Case Generator for a Competitive Programming Judge.
    Problem Spec: ${JSON.stringify(spec)}
    
    Task: Generate ${count} distinct test cases (Input and Correct Output).
    Strategy: ${strategy}
    
    Requirements:
    1. The inputs MUST strictly follow the 'inputFormat' and 'constraints'.
    2. If the strategy is 'Max Constraints', use values near the upper bound.
    3. If 'Edge Case', use values like 0, 1, -1, or boundary conditions.
    4. Provide the correct output by solving the problem internally (act as the Oracle).
    5. Explain briefly why each test case fits the strategy in VIETNAMESE.
    
    Output JSON containing an array of test cases.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      testCases: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            input: { type: Type.STRING, description: "Raw input string ready for stdin" },
            expectedOutput: { type: Type.STRING, description: "Raw output string" },
            explanation: { type: Type.STRING, description: "Explanation in VIETNAMESE" }
          },
          required: ["input", "expectedOutput", "explanation"]
        }
      }
    },
    required: ["testCases"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 2048 }
    }
  });

  if (!response.text) throw new Error("Failed to generate tests");
  const data = JSON.parse(response.text);

  if (!data.testCases || !Array.isArray(data.testCases)) {
    throw new Error("Invalid response format from AI");
  }

  return data.testCases.map((tc: any) => ({
    id: crypto.randomUUID(),
    strategy,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
    explanation: tc.explanation,
    generatedAt: Date.now()
  }));
};

/**
 * Bug Hunter Mode: Finds a counter-example where 'Suspect Code' fails compared to the Spec.
 */
export const huntBug = async (
  spec: ProblemSpec,
  suspectCode: string
): Promise<BugHuntResult> => {
  const prompt = `
    Role: You are a "Hack" generator or Stress Tester.
    Problem Spec: ${JSON.stringify(spec)}
    
    Suspect Code:
    \`\`\`
    ${suspectCode}
    \`\`\`
    
    Task:
    1. Analyze the suspect code logic.
    2. Identify a flaw (e.g., overflow, logic error, off-by-one, greedy failure).
    3. Generate a SMALL counter-example (input) where this code fails but a correct solution succeeds.
    4. Predict the 'Actual Output' of the suspect code.
    5. Provide the 'Expected Output' based on the spec.
    
    IMPORTANT: Provide the 'analysis' in VIETNAMESE.
    
    Return JSON.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      input: { type: Type.STRING },
      expectedOutput: { type: Type.STRING },
      actualOutput: { type: Type.STRING, description: "What the suspect code likely outputs" },
      analysis: { type: Type.STRING, description: "Why the code fails on this input (in VIETNAMESE)" }
    },
    required: ["input", "expectedOutput", "actualOutput", "analysis"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 2048 }
    }
  });

  if (!response.text) throw new Error("Failed to hunt bug");
  return JSON.parse(response.text) as BugHuntResult;
};
