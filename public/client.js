// Socket.IO client-side implementation
const socket = io();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const userCountDisplay = document.getElementById('user-count');
const errorMessage = document.getElementById('error-message');

// Username Join Handler
joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    
    if (username) {
        socket.emit('user join', username);
    }
});

// Username Join Response
socket.on('username error', (error) => {
    errorMessage.textContent = error;
});

socket.on('user joined', (data) => {
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'block';
    userCountDisplay.textContent = `Users: ${data.userCount}`;
    
    // Add system message for user joining
    addSystemMessage(`${data.username} has joined the chat`);
});

// Message Sending Handler
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('chat message', message);
        messageInput.value = '';
    }
}

// Receive Chat Messages
socket.on('chat message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <strong>${data.username}</strong>
        <span class="timestamp">${data.timestamp}</span>
        <p>${data.message}</p>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// User Left Handling
socket.on('user left', (data) => {
    userCountDisplay.textContent = `Users: ${data.userCount}`;
    addSystemMessage(`${data.username} has left the chat`);
});

// System Message Function
function addSystemMessage(message) {
    const systemMessage = document.createElement('div');
    systemMessage.classList.add('system-message');
    systemMessage.textContent = message;
    messagesContainer.appendChild(systemMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}