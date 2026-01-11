# Use official Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend and frontend
COPY backend ./backend
COPY frontend ./frontend

# Install dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose port
EXPOSE 5000

# Start the app
CMD ["python", "backend/app.py"]
