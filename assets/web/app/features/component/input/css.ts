import { css } from "hono/css";

export const input = css`
  display: block;
  box-sizing: border-box;
  width: 100%;
  font-size: 20px;
  border: 1px solid black;
  border-radius: 8px;
  padding: 8px 12px;

  &[readonly] {
    background-color: transparent;
    border-color: rgba(0, 0, 0, 0.1);
  }
`;

export const button = css`
  display: block;
  box-sizing: border-box;
  width: 100%;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
`;

export const primaryButton = css`
  background-color: #000;
  color: #fff;
  border: 1px solid #000;
`;

export const secondaryButton = css`
  background-color: #fff;
  color: #000;
  border: 1px solid #000;
`;
