// Configuration file
// DO NOT commit this file to git - add to .gitignore

const CONFIG = {
    OPENAI_API_KEY: '',
    GEMINI_API_KEY: ''
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
