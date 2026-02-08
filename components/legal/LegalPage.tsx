import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface LegalPageProps {
    document: 'privacy' | 'terms';
    onClose: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ document, onClose }) => {
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                setLoading(true);
                const fileName = document === 'privacy' ? 'PRIVACY_POLICY.md' : 'TERMS_OF_SERVICE.md';
                const response = await fetch(`/legal/${fileName}`);
                const text = await response.text();
                setContent(text);
            } catch (error) {
                console.error('Error loading legal document:', error);
                setContent('Error loading document. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [document]);

    const title = document === 'privacy' ? 'Privacy Policy' : 'Terms of Service';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                                {content}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-6 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
