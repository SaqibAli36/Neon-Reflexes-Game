# Use official Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend and frontend
COPY backend ./backend
COPY frontend ./frontend

# Install dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt
# Add gunicorn
RUN pip install --no-cache-dir gunicorn

# Expose port
EXPOSE 5000

# Start the app using Gunicorn
CMD ["gunicorn", "backend.app:app", "--bind", "0.0.0.0:5000", "--workers", "2"]
