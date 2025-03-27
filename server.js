const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 3000;

const wss = new WebSocket.Server({ noServer: true });

let onlineUsers = {}; // Храним пользователей
let onlineCount = 0; // Счётчик онлайн пользователей

// Обрабатываем соединения WebSocket
wss.on('connection', (ws, req) => {
  const username = req.url.split('?username=')[1]; // Получаем имя пользователя из URL

  if (!username || onlineUsers[username]) {
    ws.send(JSON.stringify({ type: 'error', message: 'Username is already taken or invalid.' }));
    ws.close();
    return;
  }

  onlineUsers[username] = ws;
  onlineCount++; // Увеличиваем счетчик пользователей

  console.log(`${username} joined`);
  broadcastUserCount();

  // Сообщаем всем подключенным пользователям о новом пользователе
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Отправляем сообщение всем пользователям, кроме того, кто его отправил
    Object.keys(onlineUsers).forEach(user => {
      if (onlineUsers[user] !== ws) {
        onlineUsers[user].send(JSON.stringify({ username, text: message }));
      }
    });
  });

  // Обработка отключения пользователя
  ws.on('close', () => {
    delete onlineUsers[username];
    onlineCount--; // Уменьшаем счетчик пользователей
    console.log(`${username} left`);
    broadcastUserCount();
  });
});

// Функция для отправки обновленного количества онлайн пользователей
function broadcastUserCount() {
  const userCount = Object.keys(onlineUsers).length;
  Object.keys(onlineUsers).forEach(user => {
    onlineUsers[user].send(JSON.stringify({ type: 'updateOnline', count: userCount }));
  });
}

app.use(express.static('public')); // Папка для статических файлов, например, HTML и CSS

// Обрабатываем HTTP запросы для WebSocket
app.server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
