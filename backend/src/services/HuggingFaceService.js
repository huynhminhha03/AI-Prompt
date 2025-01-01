require("dotenv").config();
const fs = require("fs");
const { HfInference } = require("@huggingface/inference");
class HuggingFaceService {
  constructor() {
    this.inference = new HfInference(process.env.HF_TOKEN);
  }
  async chatCompletion(prompt, model = "Qwen/Qwen2.5-1.5B-Instruct", max_tokens = 512) {
    try {
      const chatResponse = await this.inference.chatCompletion({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: max_tokens,
      });
      return chatResponse;
    } catch (error) {
      console.error("Error in chatCompletion:", error);
      throw new Error("Failed to generate chat response");
    }
  }
  async textToImage(prompt, model = 'black-forest-labs/FLUX.1-dev') {
    try {
      const imageResponse = await this.inference.textToImage({
        model: model,
        inputs: prompt,
      });
      return imageResponse;
    } catch (error) {
      console.error("Error in textToImage:", error);
      throw new Error("Failed to generate image");
    }
  }
  async textToSpeech(prompt, model = "espnet/kan-bayashi_ljspeech_vits") {
    try {
      const speechResponse = await this.inference.textToSpeech({
        model: model,
        inputs: prompt,
      });
      return speechResponse;
    } catch (error) {
      console.error("Error in textToSpeech:", error);
      throw new Error("Failed to generate speech");
    }
  }
}
module.exports = new HuggingFaceService();