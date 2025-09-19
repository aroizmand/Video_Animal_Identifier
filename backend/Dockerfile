# Start from an official Python base image
FROM python:3.11-slim

# Install system dependencies needed for OpenCV and video codecs
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y libgl1 libglib2.0-0 ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# --- NEW STEP: PRE-WARM THE MODEL CACHE ---
# This command runs a short Python script to download the models during the build.
# The downloaded files will be saved in the Docker image layer.
RUN python -c "from speciesnet import SpeciesNetDetector, SpeciesNetClassifier; SpeciesNetDetector(); SpeciesNetClassifier()"

# Copy your application code into the container
COPY . .

# Create the 'uploads' directory so the app can write to it
RUN mkdir -p uploads

# The command to run your application using the Gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]

