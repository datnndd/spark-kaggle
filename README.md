# Traffic Accident Risk Prediction (Kaggle Playground Series)

## Overview
This project aims to predict the **accident risk** on various road segments using a synthetic dataset from the Kaggle Playground Series. The goal is to build a regression model that accurately predicts the continuous variable `accident_risk` (ranging from 0 to 1) based on road characteristics and environmental factors.

## Dataset
The dataset is synthetic but mimics real-world traffic data. It includes the following key features:
-   **Road Characteristics**: `road_type`, `num_lanes`, `curvature`, `speed_limit`, `road_signs_present`, `public_road`.
-   **Environmental Factors**: `lighting`, `weather`, `time_of_day`, `holiday`, `school_season`.
-   **History**: `num_reported_accidents`.
-   **Target**: `accident_risk` (Continuous, 0.0 - 1.0).

## Prerequisites
To run this project, you need the following environment:
-   **Python 3.x**
-   **Apache Spark (PySpark)**
-   **Jupyter Notebook** or **Databricks**

### Required Libraries
```python
pyspark
pandas
matplotlib
seaborn
numpy
```

## Project Structure
-   `Bigdata.ipynb`: The main Jupyter Notebook containing the End-to-End analysis and modeling pipeline.
-   `train.csv` / `test.csv`: Data files (expected in `/Volumes/workspace/default/road/` or your local data directory).

## Methodology

### 1. Exploratory Data Analysis (EDA)
Comprehensive analysis was performed to understand the data:
-   **Data Quality**: The dataset is clean with no missing values.
-   **Target Distribution**: `accident_risk` is slightly right-skewed with a mean of ~0.35.
-   **Key Insights**:
    -   **Curvature**: Strong non-linear relationship. Risk jumps significantly when curvature > 0.5.
    -   **Lighting**: "Night" driving significantly increases accident risk compared to "Daylight" or "Dim" conditions.
    -   **Speed Limit**: Higher speed limits correlate with higher risk, specifically in the 60-70 range.
    -   **Num Lanes**: Found to have **no correlation** with accident risk (potential candidate for feature dropping).

### 2. Feature Engineering
-   **StringIndexer**: Used to convert categorical variables (`road_type`, `lighting`, `weather`, etc.) into numerical indices for the model.
-   **VectorAssembler**: Combines all features into a single vector column required by Spark MLlib.

### 3. Modeling
A **Linear Regression** model was implemented as a baseline using Spark MLlib.
-   **Split**: 70% Training, 30% Testing.
-   **Evaluation Metric**: Root Mean Squared Error (RMSE) and R-squared ($R^2$).

## Results
*Note: Specific model performance metrics (RMSE, R2) can be found in the notebook output.*

The analysis suggests that tree-based models (like Random Forest or Gradient Boosting) would likely outperform Linear Regression due to the non-linear nature of features like `curvature`.

## Usage
1.  Ensure PySpark is installed and configured.
2.  Update the file paths in the notebook to point to your `train.csv` and `test.csv` locations:
    ```python
    df_train = spark.read.csv("/path/to/train.csv", header=True, inferSchema=True)
    df_test = spark.read.csv("/path/to/test.csv", header=True, inferSchema=True)
    ```
3.  Run all cells in `Bigdata.ipynb` to execute the EDA and training pipeline.

## Author
Doan Dat
