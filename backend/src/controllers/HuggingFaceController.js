const huggingfaceService = require("../services/HuggingFaceService");
const fileService = require("../services/FileService");
const Common = require("../helpers/Common");
class HuggingFaceController {
    constructor() {
    }
    // async calculatePrice(prompt, model, user_id) {
    //     const num_token = Common.calculateTokens(prompt);
    //     const pricing = await Pricing.findOne({
    //         where: { model: model }
    //     });
    //     const total_price = pricing.price * num_token;
    //     const tokenUsage = new TokenUsage({
    //         user_id,
    //         model: model,
    //         tokens_used: num_token,
    //         price: pricing.price,
    //         total_price
    //     });
    //     await tokenUsage.save();
    //     const wallet = await Wallet.findOne(
    //         {
    //             where: { user_id: user_id }
    //         }
    //     );
    //     wallet.balance -= pricing.price;
    //     await wallet.save();
    // }
    async chatCompletion(req, res) {
        try {
            const { prompt, model, max_tokens } = req.body;
            const chatResponse = await huggingfaceService.chatCompletion(prompt, model, max_tokens);
            // await this.calculatePrice(prompt, model, req.user.id);
            res.status(200).json({ message: chatResponse });
        } catch (error) {
            console.error("Error in chatCompletion:", error);
            res.status(500).json({ message: "Failed to generate chat response" });
        }
    }
    async textToImage(req, res) {
        try {
            const { prompt, model } = req.body;
            console.log(req.body);
            const imageResponse = await huggingfaceService.textToImage(prompt, model);
            const image = await fileService.uploadFile(imageResponse);
            // await this.calculatePrice(prompt, model, req.user.id);
            res.status(200).json({ image });
        } catch (error) {
            console.error("Error in textToImage:", error);
            res.status(500).json({ message: "Failed to generate image" });
        }
    }
    async textToSpeech(req, res) {
        try {
            const { prompt, model } = req.body;
            console.log(req.body);
            const speechResponse = await huggingfaceService.textToSpeech(prompt, model);
            console.log(speechResponse);
            const speech = await fileService.uploadFile(speechResponse, "raw");
            // await this.calculatePrice(prompt, model, req.user.id);
            res.status(200).json({ speech });
        } catch (error) {
            console.error("Error in textToSpeech:", error);
            res.status(500).json({ message: "Failed to generate speech" });
        }
    }
}
module.exports = new HuggingFaceController();