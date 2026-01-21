// Chat History Management
function saveToChatHistory(chatData) {
    let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // Check if chat already exists
    const existingIndex = history.findIndex(chat => chat.id === chatData.id);
    
    if (existingIndex !== -1) {
        // Update existing chat
        history[existingIndex] = chatData;
    } else {
        // Add new chat at the beginning
        history.unshift(chatData);
        
        // Limit history to 50 chats
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(history));
}

function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const chatHistoryElement = document.getElementById('chatHistory');
    
    if (history.length === 0) {
        chatHistoryElement.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-comment-medical"></i>
                <p>No chat history yet</p>
            </div>
        `;
        return;
    }
    
    // Group by date
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let todayChats = [];
    let yesterdayChats = [];
    let olderChats = [];
    
    history.forEach(chat => {
        const chatDate = new Date(chat.timestamp).toDateString();
        
        if (chatDate === today) {
            todayChats.push(chat);
        } else if (chatDate === yesterday) {
            yesterdayChats.push(chat);
        } else {
            olderChats.push(chat);
        }
    });
    
    let html = '';
    
    // Today's chats
    if (todayChats.length > 0) {
        html += '<div class="history-group"><h4>Today</h4>';
        todayChats.forEach(chat => {
            html += createChatHistoryItem(chat);
        });
        html += '</div>';
    }
    
    // Yesterday's chats
    if (yesterdayChats.length > 0) {
        html += '<div class="history-group"><h4>Yesterday</h4>';
        yesterdayChats.forEach(chat => {
            html += createChatHistoryItem(chat);
        });
        html += '</div>';
    }
    
    // Older chats
    if (olderChats.length > 0) {
        // Group by month
        const groupedByMonth = {};
        olderChats.forEach(chat => {
            const date = new Date(chat.timestamp);
            const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            
            if (!groupedByMonth[monthYear]) {
                groupedByMonth[monthYear] = [];
            }
            groupedByMonth[monthYear].push(chat);
        });
        
        Object.keys(groupedByMonth).forEach(monthYear => {
            html += `<div class="history-group"><h4>${monthYear}</h4>`;
            groupedByMonth[monthYear].forEach(chat => {
                html += createChatHistoryItem(chat);
            });
            html += '</div>';
        });
    }
    
    chatHistoryElement.innerHTML = html;
    
    // Add event listeners to chat history items
    document.querySelectorAll('.chat-history-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.getAttribute('data-chat-id');
            // In a real app, you would load the chat here
            alert(`Loading chat: ${chatId}\n\nNote: Full chat loading would be implemented with backend storage.`);
        });
    });
}

function createChatHistoryItem(chat) {
    const time = new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `
        <div class="chat-history-item" data-chat-id="${chat.id}">
            <div class="history-item-title">${chat.title}</div>
            <div class="history-item-preview">${chat.lastMessage}</div>
            <div class="history-item-time">${time}</div>
        </div>
    `;
}

function clearChatHistory() {
    if (confirm('Are you sure you want to clear all chat history?')) {
        localStorage.removeItem('chatHistory');
        loadChatHistory();
    }
}

// Initialize chat history when page loads
document.addEventListener('DOMContentLoaded', loadChatHistory);