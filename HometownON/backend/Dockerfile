# 1. Build Stage: Install dependencies
FROM python:3.12-slim as builder

WORKDIR /app

# Install poetry for dependency management if needed, or just use pip
# For now, using pip as per requirements.txt

# Copy and install requirements
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /app/wheels -r requirements.txt

# 2. Final Stage: Setup the runtime environment
FROM python:3.12-slim

WORKDIR /app

# Copy installed wheels from the builder stage
COPY --from=builder /app/wheels /wheels

# Install the dependencies from the wheels
RUN pip install --no-cache /wheels/*

# Copy the application code
COPY ./app /app/app

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# Use --host 0.0.0.0 to make it accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
