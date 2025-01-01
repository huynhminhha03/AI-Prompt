const { CozeAPI, ChatEventType, RoleType, COZE_COM_BASE_URL } = require('@coze/api');
require('dotenv').config();

class CozeService {
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

    /**
     * Chat completion using streaming.
     * @param {string} prompt - The user's message.
     */
    async chatCompletion(prompt) {
        try {
            const stream = this.client.chat.stream({
                bot_id: this.botId,
                additional_messages: [
                    {
                        role: RoleType.User,
                        content: prompt,
                        content_type: 'text',
                    },
                ],
            });
            let botResponse = '';
            for await (const part of stream) {
                if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
                    botResponse += part.data.content;
                    process.stdout.write(part.data.content);
                }
            }
            return botResponse;
        } catch (error) {
            console.error('Error during streaming chat completion:', error);
            throw error;
        }
    }
    
}

module.exports = new CozeService();