/**
 * API client for prediction endpoints
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Make a single prediction
 * @param {Object} inputData - The prediction input data
 * @returns {Promise<Object>} - The prediction result
 */
export async function predictSingle(inputData) {
    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Prediction failed');
    }

    return response.json();
}

/**
 * Make batch predictions from a CSV file
 * @param {File} file - The CSV file to upload
 * @returns {Promise<Object>} - The batch prediction results
 */
export async function predictBatch(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/predict/batch`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Batch prediction failed');
    }

    return response.json();
}

/**
 * Check API health
 * @returns {Promise<Object>} - Health status
 */
export async function checkHealth() {
    const response = await fetch('http://localhost:8000/health');

    if (!response.ok) {
        throw new Error('API is not available');
    }

    return response.json();
}
