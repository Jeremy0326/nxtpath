"""
Alternative Free LLM Providers Configuration
Based on: https://github.com/cheahjs/free-llm-api-resources

This file provides configuration for free LLM providers that can be used
instead of Gemini to avoid rate limiting issues.
"""

# Free LLM Providers with API Access
FREE_LLM_PROVIDERS = {
    # OpenRouter - Free tier with good limits
    'openrouter': {
        'api_base': 'https://openrouter.ai/api/v1',
        'models': [
            'deepseek/deepseek-r1',
            'microsoft/phi-3-mini-4k-instruct',
            'meta-llama/llama-3.2-3b-instruct',
            'qwen/qwen-2.5-7b-instruct'
        ],
        'limits': '20 requests/minute, 50 requests/day',
        'api_key_env': 'OPENROUTER_API_KEY',
        'headers': {
            'HTTP-Referer': 'https://nxtpath.com',
            'X-Title': 'NxtPath Job Matching'
        }
    },
    
    # HuggingFace Inference API - Free tier
    'huggingface': {
        'api_base': 'https://api-inference.huggingface.co/models',
        'models': [
            'microsoft/DialoGPT-medium',
            'microsoft/DialoGPT-large',
            'facebook/blenderbot-400M-distill'
        ],
        'limits': 'Rate limited but generous',
        'api_key_env': 'HUGGINGFACE_API_KEY'
    },
    
    # Groq - Very fast inference
    'groq': {
        'api_base': 'https://api.groq.com/openai/v1',
        'models': [
            'llama-3.1-8b-instant',
            'llama-3.1-70b-versatile',
            'mixtral-8x7b-32768'
        ],
        'limits': 'Generous free tier',
        'api_key_env': 'GROQ_API_KEY'
    },
    
    # Together AI - $1 free credit
    'together': {
        'api_base': 'https://api.together.xyz/v1',
        'models': [
            'meta-llama/Llama-3-8b-chat-hf',
            'meta-llama/Llama-3-70b-chat-hf',
            'mistralai/Mixtral-8x7B-Instruct-v0.1'
        ],
        'limits': '$1 free credit',
        'api_key_env': 'TOGETHER_API_KEY'
    },
    
    # Cohere - Free tier
    'cohere': {
        'api_base': 'https://api.cohere.ai/v1',
        'models': [
            'command-light',
            'command',
            'command-nightly'
        ],
        'limits': 'Free tier available',
        'api_key_env': 'COHERE_API_KEY'
    }
}

# Recommended provider fallback order
PROVIDER_FALLBACK_ORDER = [
    'openrouter',  # Best free tier for our use case
    'groq',        # Fast inference
    'together',    # Good models with free credit
    'cohere',      # Reliable fallback
    'huggingface'  # Last resort
]

def get_provider_config(provider_name: str) -> dict:
    """Get configuration for a specific provider"""
    return FREE_LLM_PROVIDERS.get(provider_name, {})

def get_available_providers() -> list:
    """Get list of providers that have API keys configured"""
    import os
    available = []
    
    for provider, config in FREE_LLM_PROVIDERS.items():
        api_key_env = config.get('api_key_env')
        if api_key_env and os.getenv(api_key_env):
            available.append(provider)
    
    return available

def get_next_available_provider(current_provider: str = None) -> str:
    """Get the next available provider in the fallback order"""
    available = get_available_providers()
    
    if not available:
        return None
    
    if current_provider is None:
        # Return first available provider
        for provider in PROVIDER_FALLBACK_ORDER:
            if provider in available:
                return provider
        return available[0]
    
    # Find next provider after current one
    try:
        current_index = PROVIDER_FALLBACK_ORDER.index(current_provider)
        for i in range(current_index + 1, len(PROVIDER_FALLBACK_ORDER)):
            if PROVIDER_FALLBACK_ORDER[i] in available:
                return PROVIDER_FALLBACK_ORDER[i]
    except ValueError:
        pass
    
    # If no next provider found, return first available
    for provider in PROVIDER_FALLBACK_ORDER:
        if provider in available:
            return provider
    
    return available[0] if available else None

# Sample .env configuration
SAMPLE_ENV_CONFIG = """
# Add these to your .env file to use alternative LLM providers

# OpenRouter (Recommended - Best free tier)
OPENROUTER_API_KEY=your_openrouter_key_here

# Groq (Fast inference)
GROQ_API_KEY=your_groq_key_here

# Together AI ($1 free credit)
TOGETHER_API_KEY=your_together_key_here

# Cohere (Free tier)
COHERE_API_KEY=your_cohere_key_here

# HuggingFace (Free inference API)
HUGGINGFACE_API_KEY=your_huggingface_key_here

# Current Gemini (keep as fallback)
GEMINI_API_KEY=your_gemini_key_here
"""

if __name__ == "__main__":
    print("Free LLM Providers Configuration")
    print("=" * 40)
    
    available = get_available_providers()
    print(f"Available providers: {available}")
    
    recommended = get_next_available_provider()
    print(f"Recommended provider: {recommended}")
    
    if not available:
        print("\n⚠️  No LLM providers configured!")
        print("Add API keys to your .env file:")
        print(SAMPLE_ENV_CONFIG)
    else:
        print(f"\n✅ {len(available)} provider(s) configured")
        for provider in available:
            config = get_provider_config(provider)
            print(f"  - {provider}: {config.get('limits', 'Unknown limits')}") 