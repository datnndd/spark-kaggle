# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install Java (Required for PySpark)
# openjdk-17-jre-headless is a good choice for Spark 3.x/4.x
RUN apt-get update && \
    apt-get install -y openjdk-17-jre-headless procps && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME environment variable
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy logic
COPY app ./app
COPY run.py .

# Copy model (Ensure this path is correct relative to build context)
COPY app/models/spark_model ./app/models/spark_model

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "run.py"]
