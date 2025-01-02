const {
  CozeAPI,
  ChatEventType,
  RoleType,
  COZE_COM_BASE_URL,
} = require("@coze/api");
const Bot = require("../models/Bot");
const Conversation = require("../models/Conversation");
const TokenUsage = require("../models/TokenUsage");
const Wallet = require("../models/Wallet");
require("dotenv").config();
class CozeController {
  constructor() {
    this.spaceId = process.env.COZE_SPACE_ID;
    this.botId = process.env.COZE_BOT_ID;
    this.token = process.env.COZE_API_TOKEN;
    this.client = new CozeAPI({
      baseURL: COZE_COM_BASE_URL,
      token: this.token,
      allowPersonalAccessTokenInBrowser: true,
    });
  }
  async getModels(req, res) {
    try {
      const models = await Bot.findAll();
      res.json(models);
    } catch (error) {
      console.error("Error during get models:", error);
      res.status(500).json({ error: "Failed to get models." });
    }
  }
  async createConversation(req, res) {
    const model = req.query.model;
    const bot = await Bot.findOne({
      where: {
        name: model,
      },
    });
    try {
      const response = await this.client.conversations.create({
        bot_id: bot.id,
        space_id: bot.space_id,
      });
      if (!response.id) {
        return res
          .status(500)
          .json({ error: "Failed to create conversation." });
      }
      const conversation = await Conversation.create({
        id: response.id,
        bot_id: bot.id,
        user_id: req.user.id,
      });
      res.json(conversation);
    } catch (error) {
      console.error("Error during conversation creation:", error);
      res.status(500).json({ error: "Failed to create conversation." });
    }
  }
  async chatCompletion(req, res) {
    const { prompt, conversation_id } = req.query;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (!conversation_id) {
      return res.status(400).json({ error: "Conversation is required." });
    }
    try {
      const conversation = await Conversation.findByPk(conversation_id);
      if (!conversation) {
        res.write(
          `data: ${JSON.stringify({ error: "Conversation not found." })}\n\n`
        );
        return res.end();
      }
      const stream = this.client.chat.stream({
        bot_id: conversation.bot_id,
        conversation_id: conversation.id,
        auto_save_history: true,
        messages: [
          {
            role: RoleType.User,
            content: prompt,
            content_type: "text",
          },
        ],
      });
      console.log(stream);
      for await (const part of stream) {
        console.log(part);
        const { event, data } = part;
        if (event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
          res.write(`data: ${JSON.stringify(data.content)}\n\n`);
          process.stdout.write(data.content);
        } else if (event === ChatEventType.CONVERSATION_ERROR) {
          process.stdout.write(data);
          res.write(`data: ${JSON.stringify({ error: data })}\n\n`);
          return res.end();
        } else if (event === ChatEventType.CONVERSATION_CHAT_COMPLETED) {
          // Update token usage and wallet balance
          await TokenUsage.create({
            user_id: conversation.user_id,
            bot_id: conversation.bot_id,
            conversation_id: conversation.id,
            token_count: data.usage.token_count,
            input_count: data.usage.input_count,
            output_count: data.usage.output_count,
          });
          const wallet = await Wallet.findOne({
            where: { user_id: conversation.user_id },
          });
          wallet.balance -= data.usage.output_tokens;
          await wallet.save();
          res.write(`data: ${JSON.stringify({ completed: true })}\n\n`);
        }
      }
    } catch (error) {
      console.error("Error during chat completion:", error);
      res.write(
        `data: ${JSON.stringify({
          error: "Failed to generate chat response.",
        })}\n\n`
      );
    } finally {
      res.end(); // Ensure the response ends
    }
  }
  async streamChat(req, res) {
    const { prompt, model } = req.query;
    console.log(prompt);
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }
    if (!model) {
      return res.status(400).json({ error: "Model is required." });
    }
    const bot = await Bot.findOne({
      where: {
        name: model,
      },
    });
    if (!bot) {
      return res.status(404).json({ error: "Bot not found." });
    }

    try {
      const stream = this.client.chat.stream({
        bot_id: bot.id,
        additional_messages: [
          {
            role: RoleType.User,
            content: prompt,
            content_type: "text",
          },
        ],
      });

      let fullContent = ""; // Biến lưu trữ toàn bộ nội dung

      for await (const part of stream) {
        const data = part.data;

        if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
          // Ghi nhận từng phần nội dung
          fullContent += data.content;
          res.write(`data: ${JSON.stringify(data.content)}\n\n`);
        } else if (part.event === ChatEventType.CONVERSATION_ERROR) {
          res.write(`data: ${JSON.stringify({ error: data })}\n\n`);
          return res.end();
        } else if (part.event === ChatEventType.CONVERSATION_CHAT_COMPLETED) {
          // Lưu toàn bộ nội dung vào cơ sở dữ liệu
          const conversation = await Conversation.create({
            id: data.conversation_id,
            bot_id: bot.id,
            content: fullContent, // Lưu nội dung đầy đủ
            user_id: req.user.id,
            status: data.status,
            completed_at: data.completed_at,
          });

          // Lưu thông tin token usage
          await TokenUsage.create({
            user_id: conversation.user_id,
            conversation_id: conversation.id,
            bot_id: conversation.bot_id,
            token_count: data.usage.token_count,
            input_count: data.usage.input_count,
            output_count: data.usage.output_count,
          });

          // Cập nhật số dư ví
          const wallet = await Wallet.findOne({
            where: { user_id: req.user.id },
          });
          wallet.balance -= data.usage.token_count;
          await wallet.save();
        }
      }
      res.end();
    } catch (error) {
      console.error("Error during streaming chat completion:", error);
      res.write(
        `data: ${JSON.stringify({ error: "Failed to stream response." })}\n\n`
      );
      res.end();
    }
  }

  countConversations(req, res) {
    const user_id = req.user.id;
    console.log("user_id:", user_id);
    Conversation.count({ where: { user_id } })
      .then((count) => {
        res.json({ count });
      })
      .catch((error) => {
        console.error("Error during count conversation:", error);
        res.status(500).json({ error: "Failed to count conversation." });
      });
  }
  getBalance(req, res) {
    const user_id = req.user.id;
    Wallet.findOne({ where: { user_id } })
      .then((wallet) => {
        res.json({ balance: wallet.balance, expired_at: wallet.expired_at });
      })
      .catch((error) => {
        console.error("Error during get balance:", error);
        res.status(500).json({ error: "Failed to get balance." });
      });
  }

  async uploadFile(req, res) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "File là bắt buộc." });
    }
    const blob = new Blob([file.buffer], { type: file.mimetype });
    const image_url = await fileService.uploadFile(blob, "image");
    return res.json({ image_url });
  }
}

module.exports = new CozeController();
