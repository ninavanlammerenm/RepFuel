import { createContext, useContext, useState } from 'react';

type OnboardingData = {
  name: string;
  gender: string;
  birthDate: string;
  height: string;
  weight: string;
  bodyFat: string;
  activityLevel: string;
  goal: string;
};

type OnboardingContextType = {
  data: OnboardingData;
  setData: (data: Partial<OnboardingData>) => void;
};

const OnboardingContext = createContext<OnboardingContextType>({
  data: {
    name: '',
    gender: '',
    birthDate: '',
    height: '',
    weight: '',
    bodyFat: '',
    activityLevel: '',
    goal: '',
  },
  setData: () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<OnboardingData>({
    name: '',
    gender: '',
    birthDate: '',
    height: '',
    weight: '',
    bodyFat: '',
    activityLevel: '',
    goal: '',
  });

  function setData(newData: Partial<OnboardingData>) {
    setDataState((prev) => ({ ...prev, ...newData }));
  }

  return (
    <OnboardingContext.Provider value={{ data, setData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}