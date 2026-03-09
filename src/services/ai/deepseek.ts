export async function deepseekStream(messages){
    const API_KEY = import.meta.env.VITE_DEEPSEEKAPI
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        stream: true,
      }),
    });
    return response;
}