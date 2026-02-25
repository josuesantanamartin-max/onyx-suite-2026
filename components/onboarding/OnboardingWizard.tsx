import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import OnboardingLayout from './OnboardingLayout';
import WelcomeStep from './steps/WelcomeStep';
import ProfileSelectionStep from './steps/ProfileSelectionStep';
import FamilySetupStep from './steps/FamilySetupStep';
import CurrencyStep from './steps/CurrencyStep';
import AccountsStep from './steps/AccountsStep';
import ImportDataStep from './steps/ImportDataStep';

const OnboardingWizard: React.FC = () => {
    const { onboardingStep, userProfile, subscription } = useUserStore();

    const isFamilyPlan = subscription.plan === 'FAMILIA';
    const hasFamilyPersona = userProfile?.persona_type?.includes('FAMILY');
    const isFamily = isFamilyPlan || hasFamilyPersona;

    // Calculate display step skipping the Family step for Personal users
    const displayStep = isFamily ? onboardingStep : (onboardingStep >= 3 ? onboardingStep - 1 : onboardingStep);
    const totalSteps = isFamily ? 5 : 4;

    const renderStep = () => {
        switch (onboardingStep) {
            case 0: return <WelcomeStep />;
            case 1: return <ProfileSelectionStep />;
            case 2: return <FamilySetupStep />;
            case 3: return <CurrencyStep />;
            case 4: return <AccountsStep />;
            case 5: return <ImportDataStep />;
            default: return <WelcomeStep />;
        }
    };

    return (
        <OnboardingLayout>
            <div className="flex-1 flex flex-col justify-center items-center w-full">
                {/* Progress Bar (Hidden on Welcome Step) */}
                {onboardingStep > 0 && (
                    <div className="w-full max-w-xl mb-8 flex items-center gap-2 animate-fade-in">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-onyx-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                                style={{ width: `${(displayStep / totalSteps) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-gray-400">
                            Paso {displayStep} de {totalSteps}
                        </span>
                    </div>
                )}

                {renderStep()}

            </div>
        </OnboardingLayout>
    );
};

export default OnboardingWizard;
