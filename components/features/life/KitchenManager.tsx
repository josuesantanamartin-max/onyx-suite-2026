import React, { useState } from 'react';
import { Recipe } from '../../../types';
import { useLifeStore } from '../../../store/useLifeStore';
import { KitchenDashboard } from './KitchenDashboard';
import { Pantry } from './Pantry';
import { RecipeBook } from './RecipeBook';
import { MealPlanner } from './MealPlanner';
import { ShoppingListComponent } from './ShoppingListComponent';
import { LayoutDashboard, CalendarDays, ChefHat, ShoppingCart, Package } from 'lucide-react';

interface KitchenManagerProps {
    view: string; // DASHBOARD, PLANNER, RECIPES, PANTRY, LIST
    onViewChange: (view: string) => void;
}

export const KitchenManager: React.FC<KitchenManagerProps> = ({ view, onViewChange }) => {
    const { recipeToOpen, setRecipeToOpen } = useLifeStore();
    const [cookNowRecipe, setCookNowRecipe] = useState<Recipe | null>(null);

    const handleOpenCookNow = (recipe: Recipe) => {
        onViewChange('PLANNER');
    };

    const handleOpenRecipe = (recipe: Recipe) => {
        setRecipeToOpen(recipe);
        onViewChange('RECIPES');
    };

    const renderContent = () => {
        switch (view) {
            case 'DASHBOARD':
                return <KitchenDashboard
                    onViewChange={onViewChange}
                    onOpenAiPlanner={() => onViewChange('PLANNER')}
                    onOpenRecipe={handleOpenRecipe}
                />;
            case 'PANTRY':
                return <Pantry />;
            case 'RECIPES':
                return <RecipeBook
                    onOpenCookNow={handleOpenCookNow}
                    initialRecipeToOpen={recipeToOpen}
                    onClearInitialRecipe={() => setRecipeToOpen(null)}
                />;
            case 'PLANNER':
                return <MealPlanner
                    onOpenRecipe={handleOpenRecipe}
                />;
            case 'LIST':
                return <ShoppingListComponent />;
            default:
                return null;
        }
    };

    const navItems = [
        { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Inicio' },
        { id: 'PLANNER', icon: CalendarDays, label: 'Plan' },
        { id: 'RECIPES', icon: ChefHat, label: 'Recetas' },
        { id: 'LIST', icon: ShoppingCart, label: 'Lista' },
        { id: 'PANTRY', icon: Package, label: 'Despensa' },
    ];

    return (
        <div className="h-full relative flex flex-col bg-[#FAFAFA]">
            {/* Desktop Sub Navigation */}
            <div className="hidden md:flex justify-center pt-6 px-6 shrink-0">
                <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1">
                    {navItems.map(item => {
                        const isActive = view === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : ''}`} />
                                {item.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-6 md:p-8 pb-24 md:pb-8">
                {renderContent()}
            </div>

            {/* Mobile Floating Bottom Bar for Kitchen Sub-navigation */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-lg border border-emerald-100 shadow-2xl rounded-2xl p-2 flex justify-between items-center z-40">
                {navItems.map(item => {
                    const isActive = view === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onViewChange(item.id)}
                            className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-300 ${isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <item.icon className={`w-5 h-5 mb-0.5 ${isActive ? 'fill-emerald-600/20' : ''}`} />
                            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
