
import { genkit, GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

let apiKey: string | undefined = process.env.GEMINI_API_KEY;

if (typeof window !== 'undefined') {
  const storedKey = localStorage.getItem('gemini_api_key');
  if (storedKey) {
    apiKey = storedKey;
  }
}

const plugins = [];

if (apiKey) {
    plugins.push(googleAI({ apiKey }));
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-1.5-flash',
  genericError: (details) => {
    if (!apiKey) {
      return new GenkitError({
        source: 'genkit',
        status: 'UNAUTHENTICATED',
        message:
          'To use the AI features, please add your Gemini API key in the settings.',
      });
    }
    return new GenkitError({
      source: 'genkit',
      status: 'INTERNAL',
      message: 'An unexpected AI error occurred. Please try again.',
      details,
    });
  },
});
