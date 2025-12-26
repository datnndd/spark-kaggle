/**
 * Footer component
 */
export default function Footer() {
    return (
        <footer className="bg-surface-light dark:bg-[#162035] border-t border-border-light dark:border-border-dark py-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="material-icons-round text-slate-400">verified_user</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        © 2024 TrafficSafe Analytics. All rights reserved.
                    </p>
                </div>
                <div className="flex gap-6 text-sm">
                    <a className="text-slate-500 hover:text-primary dark:text-slate-400 transition-colors" href="#">
                        Documentation
                    </a>
                    <a className="text-slate-500 hover:text-primary dark:text-slate-400 transition-colors" href="#">
                        Privacy Policy
                    </a>
                    <a className="text-slate-500 hover:text-primary dark:text-slate-400 transition-colors" href="#">
                        Support
                    </a>
                </div>
            </div>
        </footer>
    );
}
