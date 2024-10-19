import { createContext, PropsWithChildren, useContext } from "hono/jsx";
import { use } from "marked";

const rootContext = createContext({ editable: true, data: undefined });

type RootProviderProps = PropsWithChildren<{
  editable: boolean;
}>;

export function RootContext();

const editableContext = createContext({
  editable: false,
});

type ProviderProps = PropsWithChildren;

export function Provider({ children }: ProviderProps) {
  return (
    <editableContext.Provider value={{ editable: true }}>
      {children}
    </editableContext.Provider>
  );
}

export function useEditable() {
  return useContext(editableContext).editable;
}
