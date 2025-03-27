const socket = io(); // Инициализация сокета

// Получение элементов из DOM
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const chatBox = document.getElementById('chatBox');
const onlineCount = document.getElementById('onlineCount');

// Отправка сообщения
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('chat message', message);
        messageInput.value = ''; // Очистка поля ввода
    }
});

// Получение и отображение сообщений
socket.on('chat message', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<p>${msg}</p>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Прокрутка вниз
});

// Обновление количества онлайн пользователей
socket.on('online count', (count) => {
    onlineCount.textContent = count;
});
