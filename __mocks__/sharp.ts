import { vi } from "vitest";

const result = {
  resize: vi.fn().mockReturnThis(),
  toFormat: vi.fn().mockReturnThis(),
  toBuffer: vi.fn(() => Buffer.from("")),
};

export default vi.fn(() => result);
