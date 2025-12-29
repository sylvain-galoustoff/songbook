import { createContext, useContext, useState, type ReactNode } from "react";

interface CommentsContextType {
  commentsTime: number | undefined;
  setCommentsTime: (value: number | undefined) => void;
}

const CommentsContext = createContext<CommentsContextType | undefined>(
  undefined
);

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [commentsTime, setCommentsTime] = useState<number | undefined>(
    undefined
  );

  return (
    <CommentsContext.Provider value={{ commentsTime, setCommentsTime }}>
      {children}
    </CommentsContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentsContext);
  if (!context)
    throw new Error("useAudio must be used within an AudioProvider");
  return context;
}
