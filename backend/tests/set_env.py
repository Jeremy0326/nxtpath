#!/usr/bin/env python3
"""
Script to set environment variables for local LLM usage
"""
import os

def set_environment_variables():
    """Set environment variables for local LLM configuration"""
    
    # Local LLM Configuration (LM Studio)
    os.environ['USE_LOCAL_LLM'] = 'true'
    os.environ['USE_OPENAI'] = 'false'
    os.environ['LOCAL_LLM_BASE_URL'] = 'http://127.0.0.1:1234/v1'
    os.environ['LOCAL_LLM_API_KEY'] = 'lm-studio'
    os.environ['LLM_MODEL'] = 'llama-3-13b-instruct-v0.1'
    
    # Django Settings
    os.environ['DEBUG'] = 'True'
    
    print("Environment variables set for local LLM usage:")
    print(f"USE_LOCAL_LLM: {os.environ.get('USE_LOCAL_LLM')}")
    print(f"USE_OPENAI: {os.environ.get('USE_OPENAI')}")
    print(f"LOCAL_LLM_BASE_URL: {os.environ.get('LOCAL_LLM_BASE_URL')}")
    print(f"LLM_MODEL: {os.environ.get('LLM_MODEL')}")

if __name__ == "__main__":
    set_environment_variables() 