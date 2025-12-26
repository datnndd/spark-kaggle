/**
 * Stat card component for dashboard metrics
 */
export default function StatCard({ title, value, subtitle, trend, icon, iconBg }) {
    return (
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {title}
                </h3>
                <span className={`p-1.5 rounded-md ${iconBg}`}>
                    <span className="material-icons-round text-sm">{icon}</span>
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
                {trend && (
                    <span className="text-xs font-medium text-emerald-500 flex items-center">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{subtitle}</p>
        </div>
    );
}
