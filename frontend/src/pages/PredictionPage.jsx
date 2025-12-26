import { useState } from 'react';
import { predictSingle, predictBatch } from '../api/predictions';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

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

    const getRiskLabel = (level) => {
        switch (level) {
            case 'low': return '✅ Low Risk';
            case 'medium': return '⚠️ Medium Risk';
            case 'high': return '🚨 High Risk';
            default: return level;
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
                    Enter road and environmental conditions to predict accident risk level, or upload a CSV for batch analysis.
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
            {activeTab === 'manual' && (
                <div className="space-y-8">
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
                                        Number of Lanes
                                    </label>
                                    <input type="number" name="num_lanes" min="1" max="8" step="1" value={formData.num_lanes} onChange={handleChange}
                                        placeholder="e.g., 2"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Typical: 1-4 lanes (max 8)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Road Curvature
                                    </label>
                                    <input type="number" name="curvature" min="0" max="1" step="0.01" value={formData.curvature} onChange={handleChange}
                                        placeholder="e.g., 0.1"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">0 = Straight, 1 = Very curved (typical: 0.05-0.3)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Speed Limit (mph)
                                    </label>
                                    <input type="number" name="speed_limit" min="15" max="75" step="5" value={formData.speed_limit} onChange={handleChange}
                                        placeholder="e.g., 35"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Urban: 25-35, Highway: 55-75</p>
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
                                        Previous Accidents at Location
                                    </label>
                                    <input type="number" name="num_reported_accidents" min="0" max="100" step="1" value={formData.num_reported_accidents} onChange={handleChange}
                                        placeholder="e.g., 0"
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent" />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Number of reported accidents in past year (typical: 0-5)</p>
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

                    {/* Single Result Display */}
                    {result && (
                        <div className={`animation-fade-in-up max-w-2xl mx-auto border rounded-2xl p-8 text-center ${getRiskBg(result.accident_risk_level)}`}>
                            <div className="mb-6">
                                <span className="material-icons-round text-6xl mb-4 block" style={{ color: result.accident_risk_level === 'low' ? '#10b981' : result.accident_risk_level === 'medium' ? '#f59e0b' : '#ef4444' }}>
                                    {result.accident_risk_level === 'low' ? 'check_circle' : result.accident_risk_level === 'medium' ? 'warning' : 'error'}
                                </span>
                                <p className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Accident Risk Level</p>
                                <p className={`text-4xl font-bold uppercase ${getRiskColor(result.accident_risk_level)}`}>
                                    {result.accident_risk_level}
                                </p>
                            </div>
                            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getRiskBg(result.accident_risk_level)}`}>
                                {getRiskLabel(result.accident_risk_level)}
                            </div>
                        </div>
                    )}
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
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 animation-fade-in-up">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <span className="material-icons-round text-primary">assessment</span>
                        Batch Analysis Results
                    </h3>

                    {/* Key Statistics & Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        {/* Stats Cards */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Records</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{batchResults.total_count}</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                <p className="text-sm text-red-600 dark:text-red-400 mb-1">Err_data</p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{batchResults.summary.error_count}</p>
                            </div>
                        </div>

                        {/* Chart & Legend */}
                        <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-around gap-8">
                            <div className="w-48 h-48 relative">
                                <Pie data={{
                                    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
                                    datasets: [{
                                        data: [
                                            batchResults.summary.risk_distribution.low,
                                            batchResults.summary.risk_distribution.medium,
                                            batchResults.summary.risk_distribution.high
                                        ],
                                        backgroundColor: [
                                            '#10b981', // emerald-500
                                            '#f59e0b', // amber-500
                                            '#ef4444', // red-500
                                        ],
                                        borderWidth: 0,
                                    }]
                                }} options={{
                                    plugins: {
                                        legend: { display: false }
                                    }
                                }} />
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Risk Level Distribution</h4>
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
                                    <span className="font-medium text-slate-900 dark:text-white">Low: {batchResults.summary.risk_distribution.low}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                                    <span className="font-medium text-slate-900 dark:text-white">Medium: {batchResults.summary.risk_distribution.medium}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                                    <span className="font-medium text-slate-900 dark:text-white">High: {batchResults.summary.risk_distribution.high}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Table */}
                    <div className="mb-8">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between">
                            <span>Preview (First 10 Records)</span>
                            <span className="text-xs font-normal text-slate-500">Full results in export</span>
                        </h4>
                        <div className="overflow-x-auto border border-border-light dark:border-border-dark rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800 border-b border-border-light dark:border-border-dark">
                                    <tr>
                                        <th className="px-4 py-3 whitespace-nowrap">accident_risk_level</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Road Type</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Lanes</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Curvature</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Speed Limit</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Lighting</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Weather</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Signs</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Public</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Time</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Holiday</th>
                                        <th className="px-4 py-3 whitespace-nowrap">School</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Prev. Accidents</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                    {batchResults.predictions.slice(0, 10).map((row, idx) => (
                                        <tr key={idx} className={`transition-colors 
                                            ${row.error ? 'bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50' :
                                                row.accident_risk_level === 'low' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100/50' :
                                                    row.accident_risk_level === 'medium' ? 'bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-100/50' :
                                                        'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/50'}`}>
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white uppercase">
                                                {row.error ? (
                                                    <span className="text-xs text-red-500 font-normal" title={row.error}>ERROR</span>
                                                ) : (
                                                    row.accident_risk_level
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize whitespace-nowrap">{row.input_data.road_type}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.num_lanes}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.curvature}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.speed_limit} mph</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize whitespace-nowrap">{row.input_data.lighting}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize whitespace-nowrap">{row.input_data.weather}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.road_signs_present ? 'Yes' : 'No'}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.public_road ? 'Yes' : 'No'}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize whitespace-nowrap">{row.input_data.time_of_day}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.holiday ? 'Yes' : 'No'}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.school_season ? 'Yes' : 'No'}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.input_data.num_reported_accidents}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => {
                            const headers = [
                                'road_type', 'num_lanes', 'curvature', 'speed_limit', 'lighting',
                                'weather', 'road_signs_present', 'public_road', 'time_of_day',
                                'holiday', 'school_season', 'num_reported_accidents',
                                'accident_risk_level'
                            ];

                            const csvContent = [
                                headers.join(','),
                                ...batchResults.predictions.map(row => {
                                    const data = row.input_data;
                                    return [
                                        data.road_type,
                                        data.num_lanes,
                                        data.curvature,
                                        data.speed_limit,
                                        data.lighting,
                                        data.weather,
                                        data.road_signs_present,
                                        data.public_road,
                                        data.time_of_day,
                                        data.holiday,
                                        data.school_season,
                                        data.num_reported_accidents,
                                        row.error ? '' : row.accident_risk_level
                                    ].join(',');
                                })
                            ].join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = `prediction_results_${new Date().toISOString().split('T')[0]}.csv`;
                            link.click();
                        }}
                            className="flex-1 py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg shadow transition-all flex items-center justify-center gap-2">
                            <span className="material-icons-round">download</span>
                            Export Results
                        </button>

                        <button onClick={() => { setBatchResults(null); setFile(null); }}
                            className="flex-1 py-2 px-4 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                            ← Upload Another File
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
