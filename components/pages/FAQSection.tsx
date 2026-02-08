import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { faqData, faqCategories, FAQ } from '../../data/faqData';

interface FAQSectionProps {
    initialCategory?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ initialCategory = 'all' }) => {
    const { language } = useUserStore();
    const lang = language as 'ES' | 'EN' | 'FR';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

    const categories = ['all', ...Object.keys(faqCategories)];

    const filteredFAQs = faqData.filter(faq => {
        const matchesSearch =
            faq.question[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const toggleFAQ = (id: string) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    const getCategoryLabel = (category: string) => {
        if (category === 'all') {
            return lang === 'ES' ? 'Todas' : lang === 'EN' ? 'All' : 'Toutes';
        }
        return faqCategories[category as keyof typeof faqCategories]?.[lang] || category;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {lang === 'ES' ? 'Preguntas Frecuentes' : lang === 'EN' ? 'Frequently Asked Questions' : 'Questions Fréquemment Posées'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {lang === 'ES' ? 'Encuentra respuestas rápidas a las preguntas más comunes' :
                            lang === 'EN' ? 'Find quick answers to the most common questions' :
                                'Trouvez des réponses rapides aux questions les plus courantes'}
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={
                        lang === 'ES' ? 'Buscar en preguntas frecuentes...' :
                            lang === 'EN' ? 'Search in FAQs...' :
                                'Rechercher dans les FAQ...'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => {
                            setSelectedCategory(category);
                            setExpandedFAQ(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {getCategoryLabel(category)}
                    </button>
                ))}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredFAQs.length} {
                    lang === 'ES' ? (filteredFAQs.length === 1 ? 'pregunta encontrada' : 'preguntas encontradas') :
                        lang === 'EN' ? (filteredFAQs.length === 1 ? 'question found' : 'questions found') :
                            (filteredFAQs.length === 1 ? 'question trouvée' : 'questions trouvées')
                }
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
                {filteredFAQs.map(faq => (
                    <div
                        key={faq.id}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md"
                    >
                        <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left group"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                        {getCategoryLabel(faq.category)}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {faq.question[lang]}
                                </h3>
                            </div>
                            <ChevronDown
                                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${expandedFAQ === faq.id ? 'transform rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {expandedFAQ === faq.id && (
                            <div className="px-6 pb-4 animate-fade-in">
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {faq.answer[lang]}
                                    </p>
                                    {faq.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {faq.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredFAQs.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {lang === 'ES' ? 'No se encontraron preguntas' :
                            lang === 'EN' ? 'No questions found' :
                                'Aucune question trouvée'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {lang === 'ES' ? 'Intenta con otros términos de búsqueda o categoría' :
                            lang === 'EN' ? 'Try other search terms or category' :
                                'Essayez d\'autres termes de recherche ou catégorie'}
                    </p>
                    <a
                        href="mailto:support@onyxsuite.com"
                        className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                        {lang === 'ES' ? 'Contactar Soporte' :
                            lang === 'EN' ? 'Contact Support' :
                                'Contacter le Support'}
                    </a>
                </div>
            )}
        </div>
    );
};

export default FAQSection;
