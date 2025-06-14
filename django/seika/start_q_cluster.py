#!/usr/bin/env python
"""
Script to start Django Q2 cluster and test scheduling
Run this in a separate terminal to process your scheduled tasks
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'seika.settings')
    django.setup()
    
    print("Starting Django Q2 cluster...")
    print("This will process your scheduled tasks.")
    print("Keep this running in a separate terminal.")
    print("Press Ctrl+C to stop the cluster.")
    
    execute_from_command_line(['manage.py', 'qcluster'])
