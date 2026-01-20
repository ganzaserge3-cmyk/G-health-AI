// Main Application Script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const chatUI = new ChatUI();
    const chatManager = new ChatManager();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load chat history
    chatManager.loadChatHistory();
    
    console.log('Health Guard AI initialized successfully!');
});

// Chat Manager Class
class ChatManager {
    constructor() {
        this.currentChatId = null;
        this.messages = [];
        this.apiService = new ApiService();
    }
    
    startNewChat() {
        this.currentChatId = 'chat_' + Date.now();
        this.messages = [];
        localStorage.setItem('currentChatId', this.currentChatId);
        
        // Clear chat container and show welcome
        document.getElementById('chatContainer').innerHTML = '';
        document.getElementById('welcomeScreen').style.display = 'block';
        
        // Update active chat in history
        this.updateChatHistory();
    }
    
    async sendMessage(message, imageData = null) {
        // Hide welcome screen
        document.getElementById('welcomeScreen').style.display = 'none';
        
        // Add user message to UI
        ChatUI.addMessage('user', message, imageData);
        
        // Add to messages array
        this.messages.push({
            role: 'user',
            content: message,
            image: imageData,
            timestamp: new Date().toISOString()
        });
        
        // Show typing indicator
        ChatUI.showTypingIndicator();
        
        try {
            // Send to Gemini API
            const response = await this.apiService.sendToGemini(message, imageData);
            
            // Remove typing indicator
            ChatUI.hideTypingIndicator();
            
            // Add AI response to UI
            ChatUI.addMessage('ai', response);
            
            // Add to messages array
            this.messages.push({
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            });
            
            // Update chat history
            this.updateChatHistory();
            
            // Scroll to bottom
            ChatUI.scrollToBottom();
            
        } catch (error) {
            ChatUI.hideTypingIndicator();
            ChatUI.addMessage('ai', 'Sorry, I encountered an error. Please try again.');
            console.error('Error:', error);
        }
    }
    
    updateChatHistory() {
        if (this.messages.length > 0) {
            const lastMessage = this.messages[this.messages.length - 1];
            const chatTitle = this.messages[0].content.substring(0, 30) + '...';
            
            saveToChatHistory({
                id: this.currentChatId,
                title: chatTitle,
                lastMessage: lastMessage.content.substring(0, 50) + '...',
                timestamp: new Date().toISOString(),
                messageCount: this.messages.length
            });
            
            loadChatHistory();
        }
    }
    
    loadChatHistory() {
        // Load and display chat history from localStorage
        loadChatHistory();
    }
    
    loadChat(chatId) {
        // Load a specific chat from history
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chat = history.find(c => c.id === chatId);
        
        if (chat) {
            // In a real app, you would load the full conversation
            this.currentChatId = chatId;
            localStorage.setItem('currentChatId', chatId);
            
            // For demo, just show a message
            ChatUI.addMessage('ai', `Loaded chat: ${chat.title}`);
        }
    }
}

// Chat UI Management
class ChatUI {
    static addMessage(role, content, imageData = null) {
        const chatContainer = document.getElementById('chatContainer');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        // Hide welcome screen if it's visible
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const avatar = role === 'user' 
            ? '<div class="message-avatar user-avatar"><i class="fas fa-user"></i></div>'
            : '<div class="message-avatar ai-avatar"><i class="fas fa-robot"></i></div>';
        
        let contentHtml = '';
        if (imageData) {
            contentHtml += `<img src="${imageData}" alt="Uploaded image" style="max-width: 300px;"><br>`;
        }
        contentHtml += this.formatMessage(content);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${avatar}
                <div class="message-text">
                    ${contentHtml}
                </div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    static formatMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/### (.*?)(?=\n|$)/g, '<h3>$1</h3>')
            .replace(/## (.*?)(?=\n|$)/g, '<h3>$1</h3>')
            .replace(/# (.*?)(?=\n|$)/g, '<h2>$1</h2>');
        
        // Add list formatting
        formatted = formatted.replace(/\* (.*?)(?=\n|$)/g, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        return formatted;
    }
    
    static showTypingIndicator() {
        const chatContainer = document.getElementById('chatContainer');
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-text">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        chatContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    static hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    static scrollToBottom() {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Hide scroll down button when at bottom
        const scrollDownBtn = document.getElementById('scrollDownBtn');
        const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100;
        scrollDownBtn.style.display = isAtBottom ? 'none' : 'flex';
    }
    
    static showScrollDownButton() {
        const chatContainer = document.getElementById('chatContainer');
        const scrollDownBtn = document.getElementById('scrollDownBtn');
        
        const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100;
        scrollDownBtn.style.display = isAtBottom ? 'none' : 'flex';
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const scrollDownBtn = document.getElementById('scrollDownBtn');
    const chatContainer = document.getElementById('chatContainer');
    const quickQuestionBtns = document.querySelectorAll('.quick-btn');
    
    const chatManager = new ChatManager();
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 200) + 'px';
    });
    
    // Send message on Enter (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // New chat button
    newChatBtn.addEventListener('click', () => {
        chatManager.startNewChat();
    });
    
    // Upload image
    uploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', (e) => {
        handleImageUpload(e.target.files[0]);
    });
    
    // Scroll down button
    scrollDownBtn.addEventListener('click', () => {
        ChatUI.scrollToBottom();
    });
    
    // Chat container scroll
    chatContainer.addEventListener('scroll', () => {
        ChatUI.showScrollDownButton();
    });
    
    // Quick question buttons
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            messageInput.value = question;
            sendMessage();
        });
    });
    
    // Send message function
    async function sendMessage() {
        const message = messageInput.value.trim();
        const imageData = ImageHandler.getCurrentImage();
        
        if (message || imageData) {
            // Clear input and reset height
            messageInput.value = '';
            messageInput.style.height = '56px';
            
            // Clear any uploaded image
            ImageHandler.clearImage();
            
            // Send message
            await chatManager.sendMessage(message, imageData);
        }
    }
}