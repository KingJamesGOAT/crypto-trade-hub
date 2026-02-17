import axios from 'axios';

export class DiscordAgent {
    private webhookUrl: string;

    constructor() {
        this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";
    }

    async sendAlert(title: string, fields: any[], color: number = 0x00ff00) {
        if (!this.webhookUrl) return;
        try {
            await axios.post(this.webhookUrl, {
                embeds: [{
                    title: title,
                    color: color,
                    fields: fields,
                    footer: { text: "🤖 Ghost Engine (Gemini Powered)" },
                    timestamp: new Date().toISOString()
                }]
            });
        } catch (e) {
            console.error("Discord Error", e);
        }
    }

    async sendBriefing(content: string) {
        if (!this.webhookUrl) return;
        // Chunking for Discord 2000 char limit
        const chunks = content.match(/.{1,1900}/g) || [content];
        for (const chunk of chunks) {
            await axios.post(this.webhookUrl, { 
                content: `**☀️ Daily Market Briefing**\n${chunk}` 
            });
        }
    }
}
