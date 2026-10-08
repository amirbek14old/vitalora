export type ChatMessage = { role: "user" | "assistant"; content: string };
export type ImageInput = { mediaType: "image/jpeg" | "image/png" | "image/webp"; base64: string };

export type CompletionRequest = {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  /** Attach an image to the last user message (vision models only). */
  image?: ImageInput;
  vision?: boolean;
};

export interface AIProvider {
  readonly name: string;
  complete(req: CompletionRequest): Promise<string>;
}

export class AINotConfiguredError extends Error {
  constructor() {
    super("AI provider is not configured");
  }
}

export class AIProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}
