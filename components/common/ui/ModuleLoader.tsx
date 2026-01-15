import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const ModuleLoader: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#FAFAFA] animate-fade-in h-screen w-full">
            <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Loader Main */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-center mb-6 border border-gray-100">
                        <Loader2 className="w-10 h-10 text-gray-900 animate-spin" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Onyx Intelligence</span>
                    </div>

                    <div className="h-1 w-32 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900 animate-loading-bar"></div>
                    </div>
                </div>
            </div>

            {/* Global Animation Styles (if not already in index.css) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s infinite ease-in-out;
                }
            `}} />
        </div>
    );
};

export default ModuleLoader;
