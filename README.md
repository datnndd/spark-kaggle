# Traffic Accident Risk Prediction Platform

## Overview
A comprehensive full-stack application for predicting and visualizing traffic accident risks. This system transforms raw road and environmental data into actionable insights using a **FastAPI** backend, **Apache Spark** for data processing, and a modern **React** dashboard for visualization.

## Key Features
-   **Interactive Dashboard**: Real-time visualization of accident statistics, risk factors, and model performance using Chart.js.
-   **Batch Risk Prediction**: Upload CSV files to generate risk assessments for multiple road segments simultaneously.
-   **Big Data Processing**: Leverages PySpark to handle large datasets efficiently.
-   **User Management**: Role-based access control for administrators and standard users.
-   **Containerized Deployment**: fully Dockerized environment for consistent deployment across platforms.

## Technology Stack
### Backend
-   **Framework**: FastAPI
-   **Data Processing**: Apache Spark (PySpark), Pandas, NumPy
-   **Database**: SQLite (default) / PostgreSQL (supported)

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: TailwindCSS
-   **Visualization**: Chart.js, React-Chartjs-2
-   **State Management**: React Hooks

### DevOps
-   **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites
-   Docker & Docker Compose (Recommended)
-   *Or for local dev*: Python 3.10+, Node.js 18+, Java 17 (for Spark)

### Quick Start (Docker)
The easiest way to run the application is using Docker Compose.

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd spark-kaggle
    ```

2.  **Start the services**
    ```bash
    docker-compose up --build
    ```
    This will start:
    -   Backend API at `http://localhost:8000`
    -   Frontend Dashboard at `http://localhost:3000`

### Local Development Setup

#### Backend
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the application:
    ```bash
    python run.py
    ```

#### Frontend
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Data Analysis Pipeline
The original data analysis and model training pipeline is documented in `Bigdata.ipynb`.
-   **EDA**: Exploratory Data Analysis identifying correlations between road curvature, lighting, and accident risk.
-   **Model**: Linear Regression (baseline) trained on Spark MLlib.

## Project Structure
```
spark-kaggle/
├── backend/                # FastAPI application
│   ├── app/                # Application logic (routes, models, services)
│   ├── run.py              # Entry point
│   └── Dockerfile
├── frontend/               # React application
│   ├── src/                # Components, pages, assets
│   ├── public/             # Static files
│   └── Dockerfile
├── accident_risk_pipeline/ # Spark pipeline artifacts
├── docker-compose.yml      # Orchestration
├── Bigdata.ipynb           # Original analysis notebook
└── README.md               # This file
```

## Author
Doan Dat
