# Use Python 3.11 for stability
FROM python:3.11-slim

# Set the working directory to /code
WORKDIR /code

# Copy the requirements file and install dependencies
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy EVERYTHING (including your models/ folder) into the container
COPY . /code/

# Expose the required port for Hugging Face
EXPOSE 7860

# Run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
