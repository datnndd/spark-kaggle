import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import StatCard from '../components/StatCard';

/**
 * About Models page - displays information about the Linear Regression model
 */
export default function AboutModelsPage() {
    const featureChartRef = useRef(null);
    const distributionChartRef = useRef(null);
    const chartsRef = useRef([]);

    const getChartColor = () => '#64748b';
    const getGridColor = () => '#e2e8f0';

    useEffect(() => {
        // Feature Importance Chart - from actual model coefficients
        const featureChart = new Chart(featureChartRef.current, {
            type: 'bar',
            data: {
                labels: ['Speed Limit', 'Curvature', 'Lighting (Night)', 'Weather×Curvature', 'Is Night', 'Reported Accidents'],
                datasets: [{
                    label: 'Coefficient (Abs)',
                    data: [0.079578, 0.063628, 0.060182, 0.044646, 0.027613, 0.014016],
                    backgroundColor: '#22d3ee',
                    borderRadius: 4,
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: getGridColor() }, ticks: { color: getChartColor() } },
                    y: { grid: { display: false }, ticks: { color: getChartColor() } }
                }
            }
        });

        // Train vs Test Metrics Chart
        const distributionChart = new Chart(distributionChartRef.current, {
            type: 'bar',
            data: {
                labels: ['R²', 'MAE', 'RMSE'],
                datasets: [
                    {
                        label: 'Train',
                        data: [0.79076, 0.06063, 0.07612],
                        backgroundColor: '#22d3ee',
                        borderRadius: 4,
                    },
                    {
                        label: 'Test',
                        data: [0.79121, 0.06068, 0.07605],
                        backgroundColor: '#10b981',
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: getChartColor() } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: getGridColor() }, ticks: { color: getChartColor() } },
                    x: { grid: { display: false }, ticks: { color: getChartColor() } }
                }
            }
        });

        chartsRef.current = [featureChart, distributionChart];

        return () => {
            chartsRef.current.forEach(chart => chart.destroy());
        };
    }, []);

    return (
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full space-y-8">
            {/* Header */}
            <header className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
                    <span className="material-icons-round text-3xl">analytics</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">About the Model</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                    Linear Regression model trained on traffic accident data using Apache Spark ML Pipeline.
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Model Type"
                    value="Linear Reg"
                    subtitle="Spark ML PipelineModel"
                    icon="psychology"
                    iconBg="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="R² Score"
                    value="0.79121"
                    subtitle="Test dataset accuracy"
                    trend="Consistent"
                    icon="check_circle"
                    iconBg="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    title="MAE"
                    value="0.06068"
                    subtitle="Mean Absolute Error"
                    icon="straighten"
                    iconBg="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="RMSE"
                    value="0.07605"
                    subtitle="Root Mean Squared Error"
                    icon="speed"
                    iconBg="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Dataset Info */}
            <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-cyan-500">storage</span>
                    Training Dataset
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-slate-900">517,754</p>
                        <p className="text-sm text-slate-500">Total Samples</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-slate-900">13</p>
                        <p className="text-sm text-slate-500">Input Features</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-slate-900">80/20</p>
                        <p className="text-sm text-slate-500">Train/Test Split</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">road_type</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">num_lanes</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">curvature</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">speed_limit</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">lighting</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">weather</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">accident_risk</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600">
                            <tr className="border-b border-slate-100">
                                <td className="py-2 px-3">urban</td>
                                <td className="py-2 px-3">2</td>
                                <td className="py-2 px-3">0.06</td>
                                <td className="py-2 px-3">35</td>
                                <td className="py-2 px-3">daylight</td>
                                <td className="py-2 px-3">rainy</td>
                                <td className="py-2 px-3 font-semibold text-emerald-600">0.13</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="py-2 px-3">rural</td>
                                <td className="py-2 px-3">4</td>
                                <td className="py-2 px-3">0.63</td>
                                <td className="py-2 px-3">70</td>
                                <td className="py-2 px-3">dim</td>
                                <td className="py-2 px-3">clear</td>
                                <td className="py-2 px-3 font-semibold text-yellow-600">0.30</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="py-2 px-3">highway</td>
                                <td className="py-2 px-3">3</td>
                                <td className="py-2 px-3">0.54</td>
                                <td className="py-2 px-3">70</td>
                                <td className="py-2 px-3">night</td>
                                <td className="py-2 px-3">foggy</td>
                                <td className="py-2 px-3 font-semibold text-red-600">0.61</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-slate-400 mt-2 text-center">Sample data from train.csv (showing 3 of 517,754 rows)</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Importance */}
                <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <span className="material-icons-round text-primary">bar_chart</span>
                            Feature Importance
                        </h3>
                        <p className="text-sm text-slate-500">Model coefficient magnitudes (absolute values)</p>
                    </div>
                    <div className="relative h-64 w-full">
                        <canvas ref={featureChartRef}></canvas>
                    </div>
                </div>

                {/* Model Performance */}
                <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <span className="material-icons-round text-emerald-500">assessment</span>
                            Model Performance
                        </h3>
                        <p className="text-sm text-slate-500">Train vs Test metrics comparison</p>
                    </div>
                    <div className="relative h-64 w-full">
                        <canvas ref={distributionChartRef}></canvas>
                    </div>
                </div>
            </div>

            {/* Model Details */}
            <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-purple-500">info</span>
                    Model Pipeline Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Input Features</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>• <strong>Categorical:</strong> road_type, lighting_bin, time_of_day</li>
                            <li>• <strong>Numerical:</strong> curvature, speed_limit, num_lanes</li>
                            <li>• <strong>Boolean:</strong> road_signs_present, public_road, holiday, school_season</li>
                            <li>• <strong>Engineered:</strong> is_night, bad_visibility, curvature_x_weather</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Pipeline Stages</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li>1. <strong>StringIndexer</strong> - Encode categorical variables</li>
                            <li>2. <strong>OneHotEncoder</strong> - One-hot encoding (dropLast=True)</li>
                            <li>3. <strong>VectorAssembler</strong> - Combine numeric features</li>
                            <li>4. <strong>StandardScaler</strong> - Scale numeric features</li>
                            <li>5. <strong>LinearRegression</strong> - Final estimator</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm mb-12">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-yellow-500">lightbulb</span>
                    Key Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                        <p className="text-sm font-semibold text-red-600 mb-1">High Risk Factors</p>
                        <p className="text-sm text-slate-600">Speed limit and road curvature are the strongest predictors of accident risk.</p>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                        <p className="text-sm font-semibold text-orange-600 mb-1">Night Conditions</p>
                        <p className="text-sm text-slate-600">Night-time lighting significantly increases predicted risk probability.</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-sm font-semibold text-blue-600 mb-1">Weather Impact</p>
                        <p className="text-sm text-slate-600">Curvature combined with bad weather amplifies risk substantially.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
