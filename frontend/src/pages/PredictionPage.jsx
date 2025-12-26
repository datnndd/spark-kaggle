import { useState } from 'react';
import { predictSingle, predictBatch } from '../api/predictions';

/**
 * Prediction page component
 */
export default function PredictionPage() {
    const [activeTab, setActiveTab] = useState('manual');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [batchResults, setBatchResults] = useState(null);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);

    const [formData, setFormData] = useState({
        road_type: 'urban',
        num_lanes: 2,
        curvature: 0.1,
        speed_limit: 35,
        lighting: 'daylight',
        weather: 'clear',
        road_signs_present: true,
        public_road: true,
        time_of_day: 'afternoon',
        holiday: false,
        school_season: true,
        num_reported_accidents: 0,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' || type === 'range' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await predictSingle(formData);
            setResult(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBatchSubmit = async () => {
        if (!file) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await predictBatch(file);
            setBatchResults(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'low': return 'text-emerald-500';
            case 'medium': return 'text-yellow-500';
            case 'high': return 'text-red-500';
            default: return 'text-slate-500';
        }
    };

    const getRiskBg = (level) => {
        switch (level) {
            case 'low': return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
            case 'high': return 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            default: return '';
        }
    };

    return (
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full space-y-8">
            {/* Header */}
            <header className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-2">
                    <span className="material-icons-round text-3xl">car_crash</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    Traffic Accident Risk Prediction
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                    Enter road and environmental conditions to predict accident probability, or upload a CSV for batch analysis.
                </p>
            </header>

            {/* Tab Navigation */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => { setActiveTab('manual'); setBatchResults(null); }}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'manual'
                                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                    >
                        <span className="material-icons-round text-sm mr-2 align-middle">edit</span>
                        Manual Input
                    </button>
                    <button
                        onClick={() => { setActiveTab('batch'); setResult(null); }}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'batch'
                                ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                    >
                        <span className="material-icons-round text-sm mr-2 align-middle">upload_file</span>
                        CSV Upload
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
                    <span className="material-icons-round text-sm mr-2 align-middle">error</span>
                    {error}
                </div>
            )}

            {/* Manual Input Form */}
            {activeTab === 'manual' && !result && (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Road Characteristics */}
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="material-icons-round">route</span>
                            Road Characteristics
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Road Type</label>
                                <select name="road_type" value={formData.road_type} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <option value="urban">Urban</option>
                                    <option value="rural">Rural</option>
                                    <option value="highway">Highway</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Number of Lanes: <span className="text-primary">{formData.num_lanes}</span>
                                </label>
                                <input type="range" name="num_lanes" min="1" max="8" step="1" value={formData.num_lanes} onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Road Curvature: <span className="text-primary">{(formData.curvature * 100).toFixed(0)}%</span>
                                </label>
                                <input type="range" name="curvature" min="0" max="1" step="0.01" value={formData.curvature} onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Speed Limit: <span className="text-primary">{formData.speed_limit} mph</span>
                                </label>
                                <input type="range" name="speed_limit" min="15" max="75" step="5" value={formData.speed_limit} onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Road Signs Present</label>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, road_signs_present: !prev.road_signs_present }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.road_signs_present ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.road_signs_present ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Public Road</label>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, public_road: !prev.public_road }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.public_road ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.public_road ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Environmental Factors */}
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="material-icons-round">wb_sunny</span>
                            Environmental Factors
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Lighting</label>
                                <select name="lighting" value={formData.lighting} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary">
                                    <option value="daylight">☀️ Daylight</option>
                                    <option value="dim">🌅 Dim</option>
                                    <option value="night">🌙 Night</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Weather</label>
                                <select name="weather" value={formData.weather} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary">
                                    <option value="clear">☀️ Clear</option>
                                    <option value="rainy">🌧️ Rainy</option>
                                    <option value="foggy">🌫️ Foggy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time of Day</label>
                                <select name="time_of_day" value={formData.time_of_day} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary">
                                    <option value="morning">🌅 Morning</option>
                                    <option value="afternoon">☀️ Afternoon</option>
                                    <option value="evening">🌆 Evening</option>
                                    <option value="night">🌙 Night</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Context Factors */}
                    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
                            <span className="material-icons-round">info</span>
                            Context Factors
                        </h3>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Holiday Period</label>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, holiday: !prev.holiday }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.holiday ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.holiday ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">School Season</label>
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, school_season: !prev.school_season }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${formData.school_season ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.school_season ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Previous Accidents: <span className="text-primary">{formData.num_reported_accidents}</span>
                                </label>
                                <input type="range" name="num_reported_accidents" min="0" max="10" step="1" value={formData.num_reported_accidents} onChange={handleChange}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
                            </div>

                            <button type="submit" disabled={isLoading}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin material-icons-round text-xl">refresh</span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-round">search</span>
                                        Predict Risk
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Single Result Display */}
            {result && (
                <div className={`max-w-md mx-auto border rounded-2xl p-8 text-center ${getRiskBg(result.risk_level)}`}>
                    <div className="mb-6">
                        <span className="material-icons-round text-6xl mb-4 block" style={{ color: result.risk_level === 'low' ? '#10b981' : result.risk_level === 'medium' ? '#f59e0b' : '#ef4444' }}>
                            {result.risk_level === 'low' ? 'check_circle' : result.risk_level === 'medium' ? 'warning' : 'error'}
                        </span>
                        <p className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Accident Risk Assessment</p>
                        <p className={`text-5xl font-bold ${getRiskColor(result.risk_level)}`}>
                            {result.risk_percentage.toFixed(1)}%
                        </p>
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold uppercase ${getRiskBg(result.risk_level)}`}>
                        {result.risk_level === 'low' && '✅ Low Risk Zone'}
                        {result.risk_level === 'medium' && '⚠️ Moderate Risk'}
                        {result.risk_level === 'high' && '🚨 High Risk Alert'}
                    </div>
                    <button onClick={() => setResult(null)}
                        className="mt-6 w-full py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                        ← Make Another Prediction
                    </button>
                </div>
            )}

            {/* Batch Upload */}
            {activeTab === 'batch' && !batchResults && (
                <div className="max-w-2xl mx-auto bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${file ? 'border-emerald-400' : 'border-slate-300 dark:border-slate-600 hover:border-primary'}`}
                        onClick={() => document.getElementById('csvInput').click()}
                    >
                        <input type="file" id="csvInput" accept=".csv" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        <span className="material-icons-round text-5xl text-slate-400 dark:text-slate-500 mb-4 block">upload_file</span>
                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                            {file ? file.name : 'Drag & drop your CSV file here, or click to browse'}
                        </p>
                        <p className="text-sm text-slate-400">Supports CSV files with prediction features</p>
                    </div>
                    {file && (
                        <button onClick={handleBatchSubmit} disabled={isLoading}
                            className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <span className="animate-spin material-icons-round">refresh</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-round">analytics</span>
                                    Analyze Batch
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Batch Results */}
            {batchResults && (
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-icons-round text-primary">assessment</span>
                        Batch Analysis Results
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{batchResults.total_count}</p>
                            <p className="text-xs text-slate-500">Total Records</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-2xl font-bold text-primary">{batchResults.summary.average_percentage.toFixed(1)}%</p>
                            <p className="text-xs text-slate-500">Average Risk</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-emerald-500">{batchResults.summary.risk_distribution.low}</p>
                            <p className="text-xs text-slate-500">Low Risk</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-500">{batchResults.summary.risk_distribution.medium}</p>
                            <p className="text-xs text-slate-500">Medium Risk</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-2xl font-bold text-red-500">{batchResults.summary.risk_distribution.high}</p>
                            <p className="text-xs text-slate-500">High Risk</p>
                        </div>
                    </div>
                    <button onClick={() => { setBatchResults(null); setFile(null); }}
                        className="py-2 px-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                        ← Upload Another File
                    </button>
                </div>
            )}
        </main>
    );
}
