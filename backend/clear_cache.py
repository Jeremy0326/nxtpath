#!/usr/bin/env python3
"""
Clear job matching cache
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from django.core.cache import cache

def clear_cache():
    print("=== Clearing Job Matching Cache ===")
    
    try:
        # Clear all cache
        cache.clear()
        print("✅ Cache cleared successfully")
    except Exception as e:
        print(f"❌ Error clearing cache: {e}")

if __name__ == "__main__":
    clear_cache() 