import { createRoute } from "honox/factory";
import { Provider } from "@/islands/EditableContext";

export const GET = createRoute(async (c) => {
  return c.render(<Provider>hello</Provider>, { title: "Home" });
});
