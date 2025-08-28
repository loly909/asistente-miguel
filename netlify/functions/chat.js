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
    
    // Usamos un método más moderno y robusto que espera la respuesta
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
    });

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const assistantResponse = messages.data.find(m => m.role === 'assistant');
      const reply = assistantResponse ? assistantResponse.content[0].text.value : "No pude obtener una respuesta.";
      
      return {
        statusCode: 200,
        body: JSON.stringify({ reply }),
      };
    } else {
      // Si el estado no es 'completed', informamos del problema
      console.log(`El estado del asistente es: ${run.status}`);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'La ejecución del asistente no se completó.' }),
      };
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Hubo un error en el servidor.' }),
    };
  }
};