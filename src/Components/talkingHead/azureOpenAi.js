import OpenAI from "openai";

// Azure TTS Configuration

const ttsDeploymentName = 'tts-1';

const ttsClient = new OpenAI({
  apiKey: ttsApiKey,
  baseURL: `${ttsEndpoint}/openai/deployments/${ttsDeploymentName}/audio/speech?api-version=2025-03-01-preview`,
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: { 'api-key': ttsApiKey },
  dangerouslyAllowBrowser: true
});

export async function generateSpeech(text, voice = "alloy") {
  try {
    const response = await ttsClient.audio.speech.create({
      model: ttsDeploymentName,
      input: text,
      voice: voice, // Options: alloy, echo, fable, onyx, nova, shimmer
      response_format: "mp3",
      speed: 1.0
    });

    // Convert the response to a blob URL for playback
    const arrayBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error) {
    console.error("Azure OpenAI TTS Error:", error);
    console.error("Error details:", error.message);
    throw new Error(`Failed to generate speech from Azure OpenAI: ${error.message}`);
  }
}