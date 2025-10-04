export async function sendTelegramMessage(message: string) {
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChannelId = "-1003131624386";
  
    if (!telegramBotToken || !telegramChannelId) {
      console.error("Telegram bot token or chat ID is not set");
      return;
    }
  
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: telegramChannelId,
        text: message,
      }),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Failed to send Telegram message",
        response.status,
        response.statusText,
        errorText,
      );
      return;
    }
  
    return response.json();
  }
  