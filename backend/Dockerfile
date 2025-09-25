# Start Python base image
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

# --- UPDATED STEP: PRE-WARM THE MODEL CACHE WITH THE MODEL NAME ---
# This command now imports DEFAULT_MODEL and passes it to the constructors.
RUN python -c "from speciesnet import SpeciesNetDetector, SpeciesNetClassifier, DEFAULT_MODEL; SpeciesNetDetector(DEFAULT_MODEL); SpeciesNetClassifier(DEFAULT_MODEL)"

# Copy your application code into the container
COPY . .

# Create the 'uploads' directory so the app can write to it
RUN mkdir -p uploads

# The command to run your application using the Gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]

