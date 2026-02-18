import axios from 'axios';

export class DiscordAgent {
    private webhookUrl: string;
    private maxDailyAlerts: number = 10;
    private alertsSentToday: number = 0;
    private lastReset: Date = new Date();

    constructor() {
        this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";
    }

    private checkRateLimit(): boolean {
        const now = new Date();
        // Reset counter if it's a new day
        if (now.getDate() !== this.lastReset.getDate()) {
            this.alertsSentToday = 0;
            this.lastReset = now;
        }
        
        if (this.alertsSentToday >= this.maxDailyAlerts) {
            console.log("⚠️ Discord Rate Limit Reached (10/10). Alert suppressed.");
            return false;
        }
        
        this.alertsSentToday++;
        return true;
    }

    async sendAlert(title: string, fields: any[], color: number = 0x00ff00) {
        if (!this.webhookUrl) return;
        if (!this.checkRateLimit()) return;

        try {
            await axios.post(this.webhookUrl, {
                embeds: [{
                    title: title,
                    color: color,
                    fields: fields,
                    footer: { text: "👻 Scout & Strategist | Powered by Gemini 2.5" },
                    timestamp: new Date().toISOString()
                }]
            });
        } catch (e: any) {
            console.error("❌ Discord Alert Failed:", e.message);
            if (e.response) {
                console.error("Status:", e.response.status);
                console.error("Data:", JSON.stringify(e.response.data, null, 2));
            }
        }
    }

    async sendBriefing(content: string) {
        if (!this.webhookUrl) return;
        // Briefings bypass rate limit (assumed to be once/twice a day)
        
        const chunks = content.match(/.{1,1900}/g) || [content];
        for (const chunk of chunks) {
            try {
                await axios.post(this.webhookUrl, { 
                    content: `**☀️ Daily Scout Report**\n${chunk}` 
                });
            } catch (e: any) {
                console.error("❌ Discord Briefing Failed:", e.message);
                if (e.response) {
                    console.error("Status:", e.response.status);
                    console.error("Data:", JSON.stringify(e.response.data, null, 2));
                }
            }
        }
    }
}
