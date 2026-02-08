import React, { useState } from 'react';
import { Logo } from '../Logo';
import { LegalPage } from '../../legal/LegalPage';

interface LandingFooterProps {
    onNavigate: (view: 'HOME' | 'FINANCE' | 'LIFE') => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate }) => {
    const [showLegalModal, setShowLegalModal] = useState<'privacy' | 'terms' | null>(null);

    return (
        <>
            {showLegalModal && (
                <LegalPage
                    document={showLegalModal}
                    onClose={() => setShowLegalModal(null)}
                />
            )}

            <footer className="py-12 px-6 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2" onClick={() => onNavigate('HOME')}>
                        <Logo className="w-6 h-6 text-black cursor-pointer" />
                        <span className="font-bold tracking-tight cursor-pointer">ONYX INC.</span>
                    </div>
                    <div className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Onyx System. Made for better living.</div>
                    <div className="flex gap-6 text-sm font-medium text-gray-600">
                        <button
                            onClick={() => setShowLegalModal('privacy')}
                            className="hover:text-black transition-colors"
                        >
                            Privacy
                        </button>
                        <button
                            onClick={() => setShowLegalModal('terms')}
                            className="hover:text-black transition-colors"
                        >
                            Terms
                        </button>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-black">Twitter</a>
                    </div>
                </div>
            </footer>
        </>
    );
};
