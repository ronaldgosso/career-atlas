import { RecommendationSchema, type RecommendationPayload } from "@/lib/validators";

export class AISStreamParser {
  private buffer = "";
  private isComplete = false;
  private hasStarted = false;

  feed(chunk: string): RecommendationPayload | null {
    this.buffer += chunk;
    if (!this.hasStarted && this.buffer.includes("{")) {
      this.hasStarted = true;
      this.buffer = this.buffer.slice(this.buffer.indexOf("{"));
    }
    if (!this.isComplete && this.hasStarted) {
      this.isComplete = this.isBalancedJSON(this.buffer);
      if (this.isComplete) {
        const cleaned = this.buffer
          .replace(/^```json\s*/, "")
          .replace(/```\s*$/, "")
          .trim();
        try {
          const parsed = JSON.parse(cleaned);
          return RecommendationSchema.parse(parsed);
        } catch {
          // LLM may still be generating trailing text; wait for full balance
          this.isComplete = false;
        }
      }
    }
    return null;
  }

  private isBalancedJSON(str: string): boolean {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (escape) { escape = false; continue; }
      if (char === "\\") { escape = true; continue; }
      if (char === '"') inString = !inString;
      if (!inString) {
        if (char === "{" || char === "[") depth++;
        if (char === "}" || char === "]") depth--;
      }
    }
    return depth === 0 && str.endsWith("}");
  }
}