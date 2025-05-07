# Flask backend Dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (same as Flask runs on)
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"]

