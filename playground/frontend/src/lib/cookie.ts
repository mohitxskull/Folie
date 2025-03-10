import {
  getCookie as getCook,
  setCookie as setCook,
  deleteCookie as removeCook,
} from "cookies-next";

export const COOKIE_KEY = {
  SESSION: "session-token",
  CAPTCHA: "captcha-token",
};

type Keys = keyof typeof COOKIE_KEY;

export const getCookie = (key: Keys) => {
  const cook = getCook(COOKIE_KEY[key]);

  if (typeof cook !== "string") {
    return null;
  }

  return cook;
};

export const removeCookie = (key: Keys) => removeCook(COOKIE_KEY[key]);

export const setCookie = (key: Keys, value: string) => {
  removeCookie(key);

  setCook(COOKIE_KEY[key], value);
};
