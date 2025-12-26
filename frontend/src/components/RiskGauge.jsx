/**
 * Animated risk gauge component
 */
export default function RiskGauge({ value = 0 }) {
    // Calculate needle rotation: 0% = -90deg, 100% = 90deg
    const rotation = -90 + (value * 180);

    return (
        <div className="risk-gauge">
            <div className="risk-gauge-bg"></div>
            <div
                className="risk-gauge-needle"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            ></div>
            <div className="risk-gauge-center"></div>
        </div>
    );
}
