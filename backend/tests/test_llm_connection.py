#!/usr/bin/env python3
"""
Simple test to verify LM Studio connection
"""
import os
import requests
import json

def test_lm_studio_connection():
    """Test connection to LM Studio"""
    url = "http://127.0.0.1:1234/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer lm-studio"
    }
    
    data = {
        "model": "llama-3-13b-instruct-v0.1",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant. Respond with a simple JSON object."
            },
            {
                "role": "user",
                "content": "Extract the name from this text: 'Hello, my name is John Doe and I am a software engineer.' Return only: {\"name\": \"extracted_name\"}"
            }
        ],
        "temperature": 0.1,
        "max_tokens": 100
    }
    
    try:
        print("Testing LM Studio connection...")
        print(f"URL: {url}")
        print(f"Model: {data['model']}")
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            print(f"Response: {content}")
            print("✅ LM Studio connection successful!")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: LM Studio is not running or not accessible")
    except requests.exceptions.Timeout:
        print("❌ Timeout: LM Studio took too long to respond")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_lm_studio_connection() 