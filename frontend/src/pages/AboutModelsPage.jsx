import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import StatCard from '../components/StatCard';

/**
 * Trang About Models - hiển thị thông tin về mô hình Logistic Regression
 */
export default function AboutModelsPage() {
    const featureChartRef = useRef(null);
    const metricsChartRef = useRef(null);
    const chartsRef = useRef([]);

    const getChartColor = () => '#64748b';
    const getGridColor = () => '#e2e8f0';

    useEffect(() => {
        // Biểu đồ Độ quan trọng tính năng - từ model Logistic Regression thực tế
        const featureChart = new Chart(featureChartRef.current, {
            type: 'bar',
            data: {
                labels: [
                    'Buổi sáng',
                    'Đường nông thôn',
                    'Thời tiết sương mù',
                    'Đêm + Độ cong cao',
                    'Thời tiết mưa',
                    'Độ cong cao + TT xấu',
                    'Thời tiết quang đãng',
                    'Tốc độ cao',
                    'Độ cong cao',
                    'Buổi chiều'
                ],
                datasets: [{
                    label: 'Hệ số tuyệt đối trung bình',
                    data: [1.4077, 0.6154, 0.5915, 0.5915, 0.3447, 0.3381, 0.3381, 0.2794, 0.2674, 0.2534],
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

        // Biểu đồ so sánh chỉ số Train vs Test
        const metricsChart = new Chart(metricsChartRef.current, {
            type: 'bar',
            data: {
                labels: ['Độ chính xác', 'Precision', 'Recall', 'Điểm F1'],
                datasets: [
                    {
                        label: 'Huấn luyện (Train)',
                        data: [0.7883, 0.8030, 0.7883, 0.7923],
                        backgroundColor: '#22d3ee',
                        borderRadius: 4,
                    },
                    {
                        label: 'Kiểm thử (Test)',
                        data: [0.7880, 0.8027, 0.7880, 0.7919],
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
                    y: {
                        beginAtZero: false,
                        min: 0.7,
                        max: 0.85,
                        grid: { color: getGridColor() },
                        ticks: { color: getChartColor() }
                    },
                    x: { grid: { display: false }, ticks: { color: getChartColor() } }
                }
            }
        });

        chartsRef.current = [featureChart, metricsChart];

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
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Về Mô Hình</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                    Mô hình Logistic Regression đa biến được huấn luyện trên dữ liệu tai nạn giao thông sử dụng Apache Spark ML Pipeline.
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title="Loại Mô Hình"
                    value="Logistic Reg"
                    subtitle="Phân loại đa lớp"
                    icon="psychology"
                    iconBg="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Độ chính xác"
                    value="78.80%"
                    subtitle="Độ chính xác trên tập test"
                    trend="Ổn định"
                    icon="check_circle"
                    iconBg="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    title="Precision"
                    value="80.27%"
                    subtitle="Độ chính xác dự báo dương"
                    icon="gps_fixed"
                    iconBg="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Recall"
                    value="78.80%"
                    subtitle="Khả năng bao phủ"
                    icon="my_location"
                    iconBg="bg-cyan-100 text-cyan-600"
                />
                <StatCard
                    title="Điểm F1"
                    value="79.19%"
                    subtitle="Trung bình điều hòa F1"
                    icon="speed"
                    iconBg="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Output Classes */}
            <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-cyan-500">category</span>
                    Các Mức Độ Rủi Ro
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                    Mô hình dự báo rủi ro tai nạn theo một trong ba cấp độ phân loại:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                        <span className="material-icons-round text-4xl text-emerald-500 mb-2">check_circle</span>
                        <p className="text-xl font-bold text-emerald-600">THẤP (LOW)</p>
                        <p className="text-sm text-slate-500">Điều kiện an toàn</p>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <span className="material-icons-round text-4xl text-yellow-500 mb-2">warning</span>
                        <p className="text-xl font-bold text-yellow-600">TRUNG BÌNH</p>
                        <p className="text-sm text-slate-500">Cần thận trọng</p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                        <span className="material-icons-round text-4xl text-red-500 mb-2">error</span>
                        <p className="text-xl font-bold text-red-600">CAO (HIGH)</p>
                        <p className="text-sm text-slate-500">Điều kiện nguy hiểm</p>
                    </div>
                </div>
            </div>

            {/* Dataset Info */}
            <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-cyan-500">storage</span>
                    Tập Dữ Liệu Huấn Luyện
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-slate-900">517,754</p>
                        <p className="text-sm text-slate-500">Tổng số mẫu</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-slate-900">12</p>
                        <p className="text-sm text-slate-500">Tính năng đầu vào</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-slate-900">80/20</p>
                        <p className="text-sm text-slate-500">Tỉ lệ Train/Test</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">id</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">road_type</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">num_lanes</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">curvature</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">speed_limit</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">lighting</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">weather</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">road_signs_present</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">public_road</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">time_of_day</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">holiday</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">school_season</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">num_reported_accidents</th>
                                <th className="text-left py-2 px-3 font-semibold text-slate-700">accident_risk_level</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600">
                            <tr className="border-b border-slate-100">
                                <td className="py-2 px-3">0</td>
                                <td className="py-2 px-3">urban</td>
                                <td className="py-2 px-3">2</td>
                                <td className="py-2 px-3">0.06</td>
                                <td className="py-2 px-3">35</td>
                                <td className="py-2 px-3">daylight</td>
                                <td className="py-2 px-3">rainy</td>
                                <td className="py-2 px-3">False</td>
                                <td className="py-2 px-3">True</td>
                                <td className="py-2 px-3">afternoon</td>
                                <td className="py-2 px-3">False</td>
                                <td className="py-2 px-3">True</td>
                                <td className="py-2 px-3">1</td>
                                <td className="py-2 px-3 font-bold text-emerald-600">low</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="py-2 px-3">1</td>
                                <td className="py-2 px-3">urban</td>
                                <td className="py-2 px-3">4</td>
                                <td className="py-2 px-3">0.99</td>
                                <td className="py-2 px-3">35</td>
                                <td className="py-2 px-3">daylight</td>
                                <td className="py-2 px-3">clear</td>
                                <td className="py-2 px-3">True</td>
                                <td className="py-2 px-3">False</td>
                                <td className="py-2 px-3">evening</td>
                                <td className="py-2 px-3">True</td>
                                <td className="py-2 px-3">True</td>
                                <td className="py-2 px-3">0</td>
                                <td className="py-2 px-3 font-bold text-yellow-600">medium</td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <td className="py-2 px-3">2</td>
                                <td className="py-2 px-3">rural</td>
                                <td className="py-2 px-3">4</td>
                                <td className="py-2 px-3">0.63</td>
                                <td className="py-2 px-3">70</td>
                                <td className="py-2 px-3">dim</td>
                                <td className="py-2 px-3">clear</td>
                                <td className="py-2 px-3">False</td>
                                <td className="py-2 px-3">True</td>
                                <td className="py-2 px-3">morning</td>
                                <td className="py-2 px-3">True</td>
                                <td className="py-2 px-3">False</td>
                                <td className="py-2 px-3">2</td>
                                <td className="py-2 px-3 font-bold text-yellow-600">medium</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-slate-400 mt-2 text-center">Dữ liệu mẫu từ train.csv (hiển thị 3 trong số 517,754 dòng)</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Importance */}
                <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <span className="material-icons-round text-primary">bar_chart</span>
                            Độ Quan Trọng Của Tính Năng
                        </h3>
                        <p className="text-sm text-slate-500">Top 10 yếu tố ảnh hưởng mạnh nhất theo hệ số trung bình</p>
                    </div>
                    <div className="relative h-72 w-full">
                        <canvas ref={featureChartRef}></canvas>
                    </div>
                </div>

                {/* Model Performance */}
                <div className="bg-surface-light border border-border-light rounded-xl p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <span className="material-icons-round text-emerald-500">assessment</span>
                            Hiệu Suất Mô Hình
                        </h3>
                        <p className="text-sm text-slate-500">So sánh chỉ số hiệu suất trên tập Train và Test</p>
                    </div>
                    <div className="relative h-72 w-full">
                        <canvas ref={metricsChartRef}></canvas>
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <div className="bg-surface-light border border-border-light rounded-2xl p-8 shadow-sm mb-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600">
                        <span className="material-icons-round">lightbulb</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Phân Tích Quan Trọng</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* High Risk Factors */}
                    <div className="p-6 bg-white border border-red-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                            <span className="material-icons-round">warning</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Yếu Tố Rủi Ro Cao</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Thời tiết có sương mù và độ cong của đường cao kết hợp với lái xe ban đêm là những yếu tố dự báo mạnh nhất cho rủi ro tai nạn cao.
                        </p>
                    </div>

                    {/* Night + Speed */}
                    <div className="p-6 bg-white border border-orange-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
                            <span className="material-icons-round">speed</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Đêm + Tốc Độ Cao</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Sự tương tác giữa điều kiện ban đêm và giới hạn tốc độ cao làm tăng đáng kể tỉ lệ phân loại vào nhóm rủi ro nguy hiểm.
                        </p>
                    </div>

                    {/* Accident History */}
                    <div className="p-6 bg-white border border-blue-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                            <span className="material-icons-round">history</span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Lịch Sử Tai Nạn</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Số lượng tai nạn được báo cáo trước đó tại một vị trí cụ thể là chỉ báo quan trọng cho các mức độ rủi ro trong tương lai.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
