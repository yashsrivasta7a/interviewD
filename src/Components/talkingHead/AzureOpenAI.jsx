import { AzureOpenAI } from "@azure/openai";

const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY;
const ttsDeploymentName = import.meta.env.VITE_AZURE_TTS_DEPLOYMENT_NAME || "tts-1";

const client = new AzureOpenAI({
  endpoint: endpoint,
  apiKey: apiKey,
  apiVersion: "2024-06-01"
});

//  Text-to-Speech
export async function generateSpeech(text, voice = "alloy") {
  try {
    const response = await client.audio.speech.create({
      model: ttsDeploymentName,
      input: text,
      voice: voice, // Options: alloy, echo, fable, onyx, nova, shimmer
      response_format: "mp3",
      speed: 1.0
    });

    // Convert the response to a blob URL for playback
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error) {
    console.error("Azure OpenAI TTS Error:", error);
    throw new Error("Failed to generate speech from Azure OpenAI");
  }
}