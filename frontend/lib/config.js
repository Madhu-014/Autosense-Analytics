export function getModelId() {
  // Default to GPT-5.1-Codex-Max for all clients
  return process.env.NEXT_PUBLIC_MODEL_ID || "gpt-5.1-codex-max";
}
