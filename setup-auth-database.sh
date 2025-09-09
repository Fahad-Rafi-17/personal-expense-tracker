#!/bin/bash

# Setup script to create the device_tokens table in Supabase
# This script will create the necessary tables for device-based authentication

echo "Setting up device authentication tables in Supabase..."

# Note: You need to run this SQL in your Supabase SQL editor or using psql
# The SQL commands are in create-auth-tables.sql

echo "Please run the following SQL commands in your Supabase SQL editor:"
echo ""
cat create-auth-tables.sql

echo ""
echo "After running the SQL commands, the authentication system will use database storage."
echo "This will solve the serverless environment token persistence issues."
