const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.OPENAI_ASSISTANT_ID;

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body);
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 300));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantResponse = messages.data.find(m => m.role === 'assistant');
    
    let reply = "No pude obtener una respuesta.";
    if (assistantResponse && assistantResponse.content && assistantResponse.content[0].type === 'text') {
        reply = assistantResponse.content[0].text.value;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };

  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Hubo un error en el servidor.' }),
    };
  }
};