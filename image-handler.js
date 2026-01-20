// Image Upload and Handling
class ImageHandler {
    constructor() {
        this.currentImage = null;
        this.setupImageHandlers();
    }
    
    setupImageHandlers() {
        const imageUpload = document.getElementById('imageUpload');
        const previewModal = document.getElementById('imagePreviewModal');
        const closeModal = document.getElementById('closeModal');
        const removeImage = document.getElementById('removeImage');
        const useImage = document.getElementById('useImage');
        
        imageUpload.addEventListener('change', (e) => {
            this.handleImageSelect(e.target.files[0]);
        });
        
        closeModal.addEventListener('click', () => {
            this.hidePreviewModal();
        });
        
        removeImage.addEventListener('click', () => {
            this.clearImage();
            this.hidePreviewModal();
        });
        
        useImage.addEventListener('click', () => {
            // Image is already stored in this.currentImage
            this.hidePreviewModal();
            
            // Update message input placeholder
            const messageInput = document.getElementById('messageInput');
            messageInput.placeholder = "Describe what you see in the image or ask your health question...";
            
            // Show notification
            this.showImageNotification();
        });
        
        // Close modal when clicking outside
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                this.hidePreviewModal();
            }
        });
    }
    
    handleImageSelect(file) {
        if (!file) return;
        
        // Validate file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPEG, PNG, GIF, etc.)');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.currentImage = e.target.result;
            this.showPreviewModal(this.currentImage);
        };
        
        reader.readAsDataURL(file);
    }
    
    showPreviewModal(imageData) {
        const previewModal = document.getElementById('imagePreviewModal');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = imageData;
        previewModal.style.display = 'flex';
        previewModal.classList.add('show');
    }
    
    hidePreviewModal() {
        const previewModal = document.getElementById('imagePreviewModal');
        previewModal.style.display = 'none';
        previewModal.classList.remove('show');
        
        // Clear file input
        document.getElementById('imageUpload').value = '';
    }
    
    clearImage() {
        this.currentImage = null;
        
        // Reset message input placeholder
        const messageInput = document.getElementById('messageInput');
        messageInput.placeholder = "Describe your health concern or upload an image...";
        
        // Clear file input
        document.getElementById('imageUpload').value = '';
    }
    
    showImageNotification() {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'image-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Image ready to send. Describe it or ask your question.</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    getCurrentImage() {
        return this.currentImage;
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .image-notification {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .history-item-title {
        font-weight: 500;
        margin-bottom: 2px;
    }
    
    .history-item-preview {
        font-size: 12px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .history-item-time {
        font-size: 11px;
        color: var(--text-secondary);
        margin-top: 4px;
    }
    
    .history-group {
        margin-bottom: 20px;
    }
    
    .history-group h4 {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .empty-history {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary);
    }
    
    .empty-history i {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }
`;
document.head.appendChild(style);

// Initialize Image Handler
const imageHandler = new ImageHandler();

// Make it available globally
window.ImageHandler = imageHandler;