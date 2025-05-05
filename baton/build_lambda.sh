#!/bin/bash

# Create a temporary directory for building
mkdir -p build
cd build

# Create a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Copy all Python files
cp ../*.py .
cp -r ../models.py .

# Create the deployment package
zip -r ../lambda_deployment.zip . -x "*.pyc" -x "__pycache__/*" -x "venv/*"

# Clean up
cd ..
rm -rf build

echo "Deployment package created: lambda_deployment.zip" 