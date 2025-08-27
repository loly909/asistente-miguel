document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    const addMessage = (text, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.textContent = text;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const sendMessage = async () => {
        const userText = userInput.value.trim();
        if (userText === '') return;

        addMessage(userText, 'user');
        userInput.value = '';
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'assistant');
        thinkingMessage.textContent = 'Miguel está pensando...';
        chatBox.appendChild(thinkingMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText }),
            });

            const data = await response.json();
            thinkingMessage.textContent = data.reply;

        } catch (error) {
            thinkingMessage.textContent = 'Hubo un error. Por favor, intenta de nuevo.';
            console.error('Error:', error);
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});