# Stage 1: Build dependencies to leverage Docker layer caching
FROM python:3.11-slim as builder

WORKDIR /usr/src/app

# Install system dependencies needed for building mysqlclient
RUN apt-get update && apt-get install -y pkg-config default-libmysqlclient-dev build-essential && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install --upgrade pip
COPY requirements.txt .
# Using wheel to build dependencies, which can be faster
RUN pip wheel --no-cache-dir --wheel-dir /usr/src/app/wheels -r requirements.txt


# Stage 2: Final application image
FROM python:3.11-slim

WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system app && adduser --system --group app

# Copy built wheels and install them
COPY --from=builder /usr/src/app/wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy the application code
COPY ./app /usr/src/app/app

# Change ownership to the non-root user
RUN chown -R app:app /usr/src/app
USER app

EXPOSE 8000

# Command to run the app using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
