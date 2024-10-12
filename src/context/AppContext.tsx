import React, { createContext, useContext, ReactNode } from "react";
import { useSession, ZeddshipUserInfo } from "../utils/useSession";

interface AppContextProps {
  userInfo: ZeddshipUserInfo;
}

const AppContext = createContext<AppContextProps | undefined>({
  userInfo: { profile: null, session: null },
});

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const userInfo = useSession();

  return (
    <AppContext.Provider value={{ userInfo }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
