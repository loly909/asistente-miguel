import fetch from "node-fetch";

export async function handler(event) {
  try {
    // Tomamos el mensaje que escribió el usuario en index.html
    const { message } = JSON.parse(event.body);

    // Llamamos a la API de OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // La key la toma de las variables de entorno en Netlify
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",  // Podés cambiar a otro modelo si querés
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices[0].message.content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
