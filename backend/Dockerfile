# Start from an official Python base image
FROM python:3.11-slim

# --- ADD THIS BLOCK TO PATCH VULNERABILITIES ---
# Update the package list and upgrade all installed packages to their latest versions
RUN apt-get update && apt-get upgrade -y && \
    # Clean up the package cache to keep the image size small
    rm -rf /var/lib/apt/lists/*
# --- END OF SECURITY PATCH BLOCK ---

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application code into the container
COPY . .

# Create the 'uploads' directory so the app can write to it
RUN mkdir -p uploads

# The command to run your application using the Gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
