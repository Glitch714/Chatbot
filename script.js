class Chatbot {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.suggestions = [
            "Tell me a joke",
            "What's the weather like?",
            "Latest news",
            "Random fact",
            "Help me with math",
            "What time is it?",
            "Tell me about AI",
            "Recommended ML Tools"
        ];
        this.init();
    }

    init() {
        this.loadMessages();
        this.setupEventListeners();
        this.displayWelcomeMessage();
        this.showSuggestions();
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');
        const clearModal = document.getElementById('clearModal');
        const cancelClear = document.getElementById('cancelClear');
        const confirmClear = document.getElementById('confirmClear');

        // Send message on Enter key
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send message on button click
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        // Clear chat button
        clearChatBtn.addEventListener('click', () => {
            this.showClearModal();
        });

        // Modal event listeners
        cancelClear.addEventListener('click', () => {
            this.hideClearModal();
        });

        confirmClear.addEventListener('click', () => {
            this.clearChat();
            this.hideClearModal();
        });

        // Close modal on outside click
        clearModal.addEventListener('click', (e) => {
            if (e.target === clearModal) {
                this.hideClearModal();
            }
        });

        // Input validation
        messageInput.addEventListener('input', () => {
            this.updateSendButton();
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        messageInput.value = '';
        this.updateSendButton();

        // Simulate bot response
        this.simulateBotResponse(message);
    }

    addMessage(content, sender) {
        const message = {
            id: Date.now(),
            content: content,
            sender: sender,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.messages.push(message);
        this.displayMessage(message);
        this.saveMessages();
        this.scrollToBottom();
        
        // Show suggestions after bot response
        if (sender === 'bot') {
            setTimeout(() => this.showSuggestions(), 500);
        }
    }

    displayMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}`;
        if (message.sender === 'user') {
            messageElement.innerHTML = `
                <div class="message-content">
                    ${this.escapeHtml(message.content)}
                </div>
                <div class="message-time">${message.timestamp}</div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    ${message.content}
                </div>
                <div class="message-time">${message.timestamp}</div>
            `;
        }
        chatMessages.appendChild(messageElement);
    }

    displayWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeMessage = "Hello! I'm your AI assistant with real-world knowledge. How can I help you today?";
            this.addMessage(welcomeMessage, 'bot');
        }
    }

    showSuggestions() {
        const chatMessages = document.getElementById('chatMessages');
        
        // Remove existing suggestions
        const existingSuggestions = document.querySelector('.suggestions-container');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container';
        suggestionsContainer.innerHTML = `
            <div class="suggestions-title">Quick suggestions:</div>
            <div class="suggestions-buttons">
                ${this.suggestions.map(suggestion => 
                    `<button class="suggestion-btn" onclick="chatbot.sendSuggestion('${suggestion}')">${suggestion}</button>`
                ).join('')}
            </div>
        `;
        
        chatMessages.appendChild(suggestionsContainer);
        this.scrollToBottom();
    }

    sendSuggestion(suggestion) {
        const messageInput = document.getElementById('messageInput');
        messageInput.value = suggestion;
        this.sendMessage();
    }

    async simulateBotResponse(userMessage) {
        this.showTypingIndicator();
        
        // ML Tools logic
        if (/recommended ml tools|machine learning tools|ml tools|best ml tools|best machine learning tools/i.test(userMessage)) {
            this.hideTypingIndicator();
            this.addMessage(this.getMLToolsInfo(), 'bot');
            return;
        }
        if (/python|pandas|numpy|matplotlib|seaborn|scikit-learn|keras|tensorflow|pytorch|jupyter|colab|kaggle|sagemaker|azure|vs code|pycharm|jupyterlab/i.test(userMessage)) {
            this.hideTypingIndicator();
            this.addMessage(this.getMLToolDetail(userMessage), 'bot');
            return;
        }

        // Check for Wikipedia query
        const wikiPattern = /^(who is|what is|tell me about)\s+(.+)/i;
        const match = userMessage.match(wikiPattern);
        if (match) {
            const query = match[2];
            const summary = await this.fetchWikipediaSummary(query);
            this.hideTypingIndicator();
            this.addMessage(summary, 'bot');
            return;
        }

        // Check for weather query
        if (userMessage.toLowerCase().includes('weather')) {
            const weatherInfo = await this.getWeatherInfo();
            this.hideTypingIndicator();
            this.addMessage(weatherInfo, 'bot');
            return;
        }

        // Check for news query
        if (userMessage.toLowerCase().includes('news') || userMessage.toLowerCase().includes('latest')) {
            const newsInfo = await this.getLatestNews();
            this.hideTypingIndicator();
            this.addMessage(newsInfo, 'bot');
            return;
        }

        // Check for joke request
        if (userMessage.toLowerCase().includes('joke')) {
            const joke = await this.getRandomJoke();
            this.hideTypingIndicator();
            this.addMessage(joke, 'bot');
            return;
        }

        // Check for random fact
        if (userMessage.toLowerCase().includes('fact') || userMessage.toLowerCase().includes('random')) {
            const fact = await this.getRandomFact();
            this.hideTypingIndicator();
            this.addMessage(fact, 'bot');
            return;
        }

        // Check for math help
        if (userMessage.toLowerCase().includes('math') || userMessage.toLowerCase().includes('calculate')) {
            const mathHelp = this.getMathHelp(userMessage);
            this.hideTypingIndicator();
            this.addMessage(mathHelp, 'bot');
            return;
        }

        // Simulate typing delay for normal responses
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateBotResponse(userMessage);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 2000);
    }

    async fetchWikipediaSummary(query) {
        // Use a CORS proxy to bypass browser restrictions
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const apiUrl = corsProxy + encodeURIComponent(wikiUrl);
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('No summary found.');
            const data = await response.json();
            if (data.extract) {
                return `${data.extract} <br><a href='${data.content_urls.desktop.page}' target='_blank'>Read more on Wikipedia</a>`;
            } else {
                return "Sorry, I couldn't find information on that topic.";
            }
        } catch (error) {
            console.error('Wikipedia API error:', error);
            return "Sorry, I couldn't fetch real-world information right now. Please try again later.";
        }
    }

    async getWeatherInfo() {
        try {
            // Using a free weather API (OpenWeatherMap alternative)
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true');
            const data = await response.json();
            const temp = data.current_weather.temperature;
            const weatherCode = data.current_weather.weathercode;
            
            const weatherDescriptions = {
                0: 'Clear sky',
                1: 'Mainly clear',
                2: 'Partly cloudy',
                3: 'Overcast',
                45: 'Foggy',
                48: 'Depositing rime fog',
                51: 'Light drizzle',
                53: 'Moderate drizzle',
                55: 'Dense drizzle',
                61: 'Slight rain',
                63: 'Moderate rain',
                65: 'Heavy rain',
                71: 'Slight snow',
                73: 'Moderate snow',
                75: 'Heavy snow',
                95: 'Thunderstorm'
            };
            
            const description = weatherDescriptions[weatherCode] || 'Unknown weather';
            return `Current weather: ${description}, Temperature: ${temp}°C. <br><small>Note: This is sample data for New York. For accurate local weather, check a weather app.</small>`;
        } catch (error) {
            return "I can't fetch real-time weather data right now, but I recommend checking a weather app for accurate information.";
        }
    }

    async getLatestNews() {
        try {
            // Using a news API
            const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=demo');
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                const articles = data.articles.slice(0, 3);
                let newsText = "Latest headlines:<br>";
                articles.forEach((article, index) => {
                    newsText += `${index + 1}. ${article.title}<br>`;
                });
                return newsText + "<br><small>For full articles, visit a news website.</small>";
            } else {
                return "I can't fetch the latest news right now, but you can check major news websites for current events.";
            }
        } catch (error) {
            return "I can't fetch the latest news right now, but you can check major news websites for current events.";
        }
    }

    async getRandomJoke() {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "What do you call a fake noodle? An impasta!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a bear with no teeth? A gummy bear!",
            "Why don't skeletons fight each other? They don't have the guts!",
            "What do you call a fish wearing a bowtie? So-fish-ticated!",
            "Why did the math book look so sad? Because it had too many problems!",
            "What do you call a can opener that doesn't work? A can't opener!",
            "Why did the cookie go to the doctor? Because it was feeling crumbly!"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    async getRandomFact() {
        const facts = [
            "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!",
            "A day on Venus is longer than its year. Venus takes 243 Earth days to rotate on its axis but only 225 Earth days to orbit the Sun.",
            "Bananas are berries, but strawberries aren't. In botanical terms, a berry is a fleshy fruit produced from a single ovary.",
            "The shortest war in history lasted only 38 minutes. It was between Britain and Zanzibar on August 27, 1896.",
            "A group of flamingos is called a 'flamboyance'. These social birds are known for their striking pink color.",
            "The Great Wall of China is not visible from space with the naked eye, despite the popular myth.",
            "Octopuses have three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body.",
            "The average person spends 6 months of their lifetime waiting for red lights to turn green.",
            "A day on Mars is only 37 minutes longer than a day on Earth.",
            "The human body contains enough iron to make a 3-inch nail."
        ];
        return facts[Math.floor(Math.random() * facts.length)];
    }

    getMathHelp(message) {
        // Simple math operations
        const mathPattern = /(\d+)\s*([+\-*/])\s*(\d+)/;
        const match = message.match(mathPattern);
        
        if (match) {
            const num1 = parseFloat(match[1]);
            const operator = match[2];
            const num2 = parseFloat(match[3]);
            let result;
            
            switch(operator) {
                case '+': result = num1 + num2; break;
                case '-': result = num1 - num2; break;
                case '*': result = num1 * num2; break;
                case '/': result = num2 !== 0 ? num1 / num2 : 'undefined (division by zero)'; break;
                default: result = 'invalid operation';
            }
            
            return `${num1} ${operator} ${num2} = ${result}`;
        }
        
        return "I can help with basic math! Try asking something like 'calculate 5 + 3' or 'what is 10 * 7'.";
    }

    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Greetings and basic interactions
        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "Hello! Nice to meet you. How can I assist you today?";
        }
        
        if (message.includes('how are you')) {
            return "I'm doing great, thank you for asking! I'm here to help you with any questions you might have.";
        }
        
        if (message.includes('name')) {
            return "I'm an AI assistant created to help you with various tasks and answer your questions.";
        }
        
        if (message.includes('help') || message.includes('what can you do')) {
            return "I can help you with general questions, provide information, and engage in conversation. Feel free to ask me anything!";
        }
        
        // Time and date queries
        if (message.includes('time')) {
            return `The current time is ${new Date().toLocaleTimeString()}.`;
        }
        
        if (message.includes('date') || message.includes('today')) {
            return `Today is ${new Date().toLocaleDateString()}.`;
        }
        
        // Weather queries
        if (message.includes('weather')) {
            return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for accurate information.";
        }
        
        // Gratitude
        if (message.includes('thank')) {
            return "You're welcome! I'm happy to help. Is there anything else you'd like to know?";
        }
        
        // Farewell
        if (message.includes('bye') || message.includes('goodbye')) {
            return "Goodbye! It was nice chatting with you. Feel free to come back anytime!";
        }
        
        // Question patterns
        if (message.includes('what') || message.includes('how') || message.includes('why') || message.includes('when') || message.includes('where') || message.includes('which')) {
            return this.getQuestionResponse(message);
        }
        
        // Statement patterns
        if (message.includes('i think') || message.includes('i believe') || message.includes('in my opinion')) {
            return "That's an interesting perspective! I'd love to hear more about your thoughts on that.";
        }
        
        // Factual statements
        if (message.includes('is') || message.includes('are') || message.includes('was') || message.includes('were')) {
            return this.getFactualResponse(message);
        }
        
        // Default responses for any other input
        return this.getDefaultResponse(message);
    }

    getQuestionResponse(message) {
        const questionResponses = [
            "That's a great question! Let me think about that...",
            "I find that question really interesting. Here's what I know about it...",
            "That's something worth exploring. From what I understand...",
            "I'm glad you asked that! It's a fascinating topic.",
            "That's a thoughtful question. Let me share what I can...",
            "I appreciate you asking that. Here's my perspective...",
            "That's an excellent question that deserves a good answer.",
            "I'm curious about that too! Here's what I think...",
            "That's a complex question with many interesting aspects.",
            "I love questions like this! Let me break it down..."
        ];
        
        return questionResponses[Math.floor(Math.random() * questionResponses.length)] + 
               " While I don't have all the answers, I'm here to help you explore and learn together. What specific aspect would you like to know more about?";
    }

    getFactualResponse(message) {
        const factualResponses = [
            "That's an interesting statement! I'd love to learn more about your perspective on that.",
            "That's a good point. There's definitely more to explore about that topic.",
            "I see what you mean. That's something worth discussing further.",
            "That's an observation that could lead to some interesting conversations.",
            "I appreciate you sharing that. It gives me something to think about.",
            "That's a valid point. What made you think about that?",
            "That's an interesting take on things. I'd like to hear more.",
            "That's something I hadn't considered before. Tell me more!",
            "That's a thoughtful observation. What led you to that conclusion?",
            "That's an intriguing statement. I'd love to explore that further."
        ];
        
        return factualResponses[Math.floor(Math.random() * factualResponses.length)];
    }

    getDefaultResponse(message) {
        const defaultResponses = [
            "That's an interesting topic! I'd love to learn more about what you're thinking.",
            "I'm curious about that. Could you tell me more?",
            "That's something worth exploring. What aspects interest you most?",
            "I find that fascinating! What made you bring that up?",
            "That's a great point to discuss. I'd like to hear your thoughts.",
            "That's an intriguing subject. What would you like to know about it?",
            "I'm glad you mentioned that. It's definitely worth talking about.",
            "That's an interesting perspective. I'd love to explore that with you.",
            "That's something I'd like to understand better. Can you elaborate?",
            "That's a thoughtful comment. What aspects would you like to discuss?",
            "I appreciate you sharing that. It opens up some interesting possibilities.",
            "That's a valid point that deserves attention. What's your take on it?",
            "That's an observation that could lead to some great conversations.",
            "I see what you mean. That's definitely something to think about.",
            "That's an interesting angle. What sparked your interest in that?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    showTypingIndicator() {
        this.isTyping = true;
        const chatMessages = document.getElementById('chatMessages');
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typingIndicator';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const hasText = messageInput.value.trim().length > 0;
        
        sendBtn.disabled = !hasText || this.isTyping;
    }

    showClearModal() {
        const modal = document.getElementById('clearModal');
        modal.classList.add('show');
    }

    hideClearModal() {
        const modal = document.getElementById('clearModal');
        modal.classList.remove('show');
    }

    clearChat() {
        this.messages = [];
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        this.saveMessages();
        this.displayWelcomeMessage();
    }

    saveMessages() {
        localStorage.setItem('chatbot_messages', JSON.stringify(this.messages));
    }

    loadMessages() {
        const savedMessages = localStorage.getItem('chatbot_messages');
        if (savedMessages) {
            this.messages = JSON.parse(savedMessages);
            this.messages.forEach(message => {
                this.displayMessage(message);
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getMLToolsInfo() {
        return `
<b>Recommended Tools for Machine Learning:</b><br>
<ul>
<li><b>Programming Languages:</b> Python, R, or Julia</li>
<li><b>ML Libraries/Frameworks:</b> TensorFlow, PyTorch, Scikit-learn, Keras</li>
<li><b>Data Processing/Visualization:</b> Pandas, NumPy, Matplotlib, Seaborn</li>
<li><b>Platforms:</b> Jupyter Notebook, Google Colab, Kaggle, AWS SageMaker, Azure ML Studio</li>
<li><b>Text Editors/IDEs:</b> VS Code, PyCharm, JupyterLab</li>
</ul>
Ask about any tool for a description or code example!`;
    }

    getMLToolDetail(message) {
        const lower = message.toLowerCase();
        if (lower.includes('python')) return `<b>Python</b> is the most popular language for ML. Example:<br><pre>import numpy as np\nimport pandas as pd</pre>`;
        if (lower.includes('pandas')) return `<b>Pandas</b> is used for data manipulation:<br><pre>import pandas as pd\ndf = pd.read_csv('data.csv')</pre>`;
        if (lower.includes('numpy')) return `<b>NumPy</b> is used for numerical computing:<br><pre>import numpy as np\narr = np.array([1,2,3])</pre>`;
        if (lower.includes('matplotlib')) return `<b>Matplotlib</b> is for plotting:<br><pre>import matplotlib.pyplot as plt\nplt.plot([1,2,3],[4,5,6])\nplt.show()</pre>`;
        if (lower.includes('seaborn')) return `<b>Seaborn</b> is for statistical plots:<br><pre>import seaborn as sns\nsns.histplot([1,2,2,3])</pre>`;
        if (lower.includes('scikit-learn')) return `<b>Scikit-learn</b> is for ML models:<br><pre>from sklearn.linear_model import LinearRegression</pre>`;
        if (lower.includes('keras')) return `<b>Keras</b> is for deep learning:<br><pre>from keras.models import Sequential</pre>`;
        if (lower.includes('tensorflow')) return `<b>TensorFlow</b> is a deep learning framework:<br><pre>import tensorflow as tf</pre>`;
        if (lower.includes('pytorch')) return `<b>PyTorch</b> is a deep learning library:<br><pre>import torch</pre>`;
        if (lower.includes('jupyter')) return `<b>Jupyter Notebook</b> is an interactive coding environment for Python and data science.`;
        if (lower.includes('colab')) return `<b>Google Colab</b> is a free cloud Jupyter environment with GPU support.`;
        if (lower.includes('kaggle')) return `<b>Kaggle</b> is a platform for data science competitions and datasets.`;
        if (lower.includes('sagemaker')) return `<b>AWS SageMaker</b> is a cloud ML platform by Amazon.`;
        if (lower.includes('azure')) return `<b>Azure ML Studio</b> is a cloud ML platform by Microsoft.`;
        if (lower.includes('vs code')) return `<b>VS Code</b> is a popular code editor with Python support.`;
        if (lower.includes('pycharm')) return `<b>PyCharm</b> is a Python IDE by JetBrains.`;
        if (lower.includes('jupyterlab')) return `<b>JupyterLab</b> is the next-generation interface for Jupyter Notebooks.`;
        return `Ask about any ML tool for a description or code example!`;
    }
}

// Initialize the chatbot when the page loads
let chatbot;
document.addEventListener('DOMContentLoaded', () => {
    chatbot = new Chatbot();
}); 