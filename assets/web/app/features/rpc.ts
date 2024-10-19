import type { API } from "@/routes/admin/api";
import { hc } from "hono/client";

const client = hc<API>("/admin/api");
export default client;
