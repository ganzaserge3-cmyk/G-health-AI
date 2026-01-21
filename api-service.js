// api-service.js - Complete Gemini API Service for Health Guard AI
class ApiService {
    constructor() {
        this.apiKey = null;
        // ✅ UPDATED: Changed model names to gemini-1.5-pro
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
        this.visionURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent';
        this.initializeAPI();
    }
    
    initializeAPI() {
        // ⬇️⬇️⬇️ PASTE YOUR GEMINI API KEY HERE ⬇️⬇️⬇️
        this.apiKey = "AIzaSyBI59NP60WLBh2ikap5WaHTwgkRXSKOOKY";
        // ⬆️⬆️⬆️ YOUR ACTUAL KEY IS HERE ⬆️⬆️⬆️
        // Get key from: https://makersuite.google.com/app/apikey
        
        console.log("✅ API Service initialized. Key loaded:", this.apiKey ? "Yes" : "No");
        
        // Optional: If you want to use config.js instead, comment above and uncomment below:
        /*
        if (window.HealthGuardConfig && window.HealthGuardConfig.getApiKey) {
            this.apiKey = window.HealthGuardConfig.getApiKey();
        }
        
        if (!this.apiKey) {
            const storedKey = localStorage.getItem('gemini_api_key');
            if (storedKey) {
                this.apiKey = storedKey;
            }
        }
        
        if (!this.apiKey) {
            this.promptForAPIKey();
        }
        */
    }
    
    promptForAPIKey() {
        const apiKey = prompt(
            '🔑 Gemini API Key Required\n\n' +
            '1. Get FREE key from: https://makersuite.google.com/app/apikey\n' +
            '2. Paste it below:\n\n' +
            '(Key will be saved locally in your browser)',
            ''
        );
        
        if (apiKey && apiKey.trim().startsWith('AIzaSy')) {
            this.apiKey = apiKey.trim();
            localStorage.setItem('gemini_api_key', this.apiKey);
            console.log('API key saved to localStorage');
        } else if (apiKey) {
            alert('Invalid API key format. Should start with "AIzaSy"');
            this.promptForAPIKey();
        }
    }
    
    async sendToGemini(message, imageData = null) {
        // Validate API key
        if (!this.apiKey || this.apiKey === "") {
            this.promptForAPIKey();
            if (!this.apiKey) {
                throw new Error('API key is required');
            }
        }
        
        console.log("📤 Sending to Gemini API...");
        
        try {
            let response;
            
            if (imageData) {
                response = await this.sendToGeminiVision(message, imageData);
            } else {
                response = await this.sendToGeminiText(message);
            }
            
            return this.parseResponse(response);
        } catch (error) {
            console.error('❌ API Error:', error);
            
            // Fallback responses if API fails
            return this.getFallbackResponse(message, error);
        }
    }
    
    async sendToGeminiText(message) {
        const url = `${this.baseURL}?key=${this.apiKey}`;
        
        console.log("🌐 API URL:", url.substring(0, 80) + "...");
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: this.generateHealthPrompt(message)
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        
        console.log("📦 Request body prepared");
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log("📊 API Response Status:", response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("❌ API Error Details:", errorData);
            throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log("✅ API Success - Received response");
        return data;
    }
    
    async sendToGeminiVision(message, imageData) {
        const url = `${this.visionURL}?key=${this.apiKey}`;
        
        // Extract base64 data from data URL
        const base64Data = imageData.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
        const mimeType = imageData.match(/^data:image\/(png|jpeg|jpg|webp);/)?.[1] || 'jpeg';
        
        const requestBody = {
            contents: [{
                parts: [
                    {
                        text: this.generateHealthPrompt(message, true)
                    },
                    {
                        inline_data: {
                            mime_type: `image/${mimeType}`,
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                topK: 32,
                topP: 1,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Vision API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        return await response.json();
    }
    
    parseResponse(response) {
        try {
            if (response.candidates && 
                response.candidates[0] && 
                response.candidates[0].content &&
                response.candidates[0].content.parts &&
                response.candidates[0].content.parts[0]) {
                
                const text = response.candidates[0].content.parts[0].text;
                console.log("📥 Parsed response length:", text.length, "chars");
                
                // Add disclaimer to health responses
                return this.addDisclaimer(text);
                
            } else if (response.error) {
                console.error("API returned error:", response.error);
                throw new Error(response.error.message || 'Unknown API error');
            } else {
                console.error("Unexpected API response format:", response);
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('Parse error:', error, response);
            return 'I apologize, but I encountered an issue processing the response. Please try again.';
        }
    }
    
    generateHealthPrompt(userMessage, isVision = false) {
        const basePrompt = `You are Health Guard AI, a specialized medical assistant. Your role is to provide helpful, accurate, and safe health information.

IMPORTANT GUIDELINES:
1. You are an AI assistant, NOT a substitute for professional medical advice
2. For serious symptoms, always recommend consulting a healthcare professional
3. Be specific but cautious in your recommendations
4. If unsure about something, acknowledge the limitation
5. Structure your response clearly
6. Use simple, understandable language
7. Include practical advice when possible
8. Always remind about consulting professionals for serious issues

User's ${isVision ? 'image and question' : 'query'}: ${userMessage}

Please provide a comprehensive but concise response following the above guidelines.`;

        return basePrompt;
    }
    
    addDisclaimer(text) {
        const disclaimer = "\n\n---\n*⚠️ **Disclaimer**: I am an AI assistant, not a medical professional. This information is for educational purposes only. Always consult with a qualified healthcare provider for medical advice, diagnosis, or treatment. For emergencies, contact local emergency services immediately.*";
        
        // Don't add disclaimer if it's already there
        if (text.includes('Disclaimer') || text.includes('disclaimer')) {
            return text;
        }
        
        return text + disclaimer;
    }
    
    getFallbackResponse(message, error) {
        console.log("🔄 Using fallback response due to error:", error.message);
        
        const lowerMessage = message.toLowerCase();
        
        // Common health questions fallback responses
        if (lowerMessage.includes('flu') || lowerMessage.includes('influenza')) {
            return "Common flu symptoms include fever, cough, sore throat, runny nose, body aches, headache, chills, and fatigue. Most people recover in 1-2 weeks. Rest, hydration, and fever reducers can help. Seek medical attention if you have difficulty breathing, chest pain, or severe symptoms.\n\n⚠️ **Note**: AI service is currently unavailable. Please verify this information with a healthcare provider.";
        }
        
        if (lowerMessage.includes('headache')) {
            return "For headaches: rest in a dark room, apply cold compress, stay hydrated, and consider over-the-counter pain relievers. See a doctor if headaches are severe, frequent, or accompanied by vision changes, fever, or neck stiffness.\n\n⚠️ **Note**: AI service is currently unavailable. Please verify this information with a healthcare provider.";
        }
        
        if (lowerMessage.includes('blood pressure') || lowerMessage.includes('bp')) {
            return "To help maintain healthy blood pressure: reduce sodium intake, eat potassium-rich foods, exercise regularly, maintain healthy weight, limit alcohol, and manage stress. Normal BP is around 120/80 mmHg.\n\n⚠️ **Note**: AI service is currently unavailable. Please verify this information with a healthcare provider.";
        }
        
        if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
            return "For cough/cold: stay hydrated, use humidifier, try honey for cough, get plenty of rest. Most viral infections resolve in 7-10 days. See a doctor if symptoms last more than 10 days or include high fever.\n\n⚠️ **Note**: AI service is currently unavailable. Please verify this information with a healthcare provider.";
        }
        
        // Generic fallback
        return `I understand you're asking about "${message.substring(0, 50)}...". 

Due to technical issues with the AI service, I cannot provide a specific response right now.

**Error Details:** ${error.message || 'Connection issue'}

**Troubleshooting:**
1. Check your API key is valid
2. Ensure internet connection
3. Try refreshing the page
4. Consult a healthcare professional for accurate medical advice.`;
    }
    
    // Utility method to validate API key
    async validateApiKey() {
        if (!this.apiKey) return false;
        
        try {
            const testUrl = `${this.baseURL}?key=${this.apiKey}`;
            const response = await fetch(testUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    contents: [{parts: [{text: "Hello"}]}],
                    generationConfig: {maxOutputTokens: 1}
                })
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    // Clear stored API key
    clearApiKey() {
        this.apiKey = null;
        localStorage.removeItem('gemini_api_key');
        console.log('API key cleared');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ ApiService module loaded');
    console.log('🔧 Model URLs updated to gemini-1.5-pro');
});

// Test the API immediately
setTimeout(() => {
    const api = new ApiService();
    console.log("🧪 API Key present:", api.apiKey ? "Yes" : "No");
    console.log("🔑 API Key first 15 chars:", api.apiKey ? api.apiKey.substring(0, 15) + "..." : "None");
}, 1000);