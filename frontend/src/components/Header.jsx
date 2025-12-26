/**
 * Header component with app branding
 */
export default function Header() {
    return (
        <header className="header">
            <div className="container header-content">
                <div className="logo">
                    <div className="logo-icon">🚦</div>
                    <div>
                        <div className="logo-text">TrafficSafe</div>
                        <div className="header-subtitle">Accident Risk Prediction</div>
                    </div>
                </div>
                <div className="header-status">
                    <span className="text-muted">Powered by </span>
                    <span style={{ color: 'var(--signal-green)' }}>Spark ML</span>
                </div>
            </div>
        </header>
    );
}
