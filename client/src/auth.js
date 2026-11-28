export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export function clearToken() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
}

export function setToken(token, remember) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem("token", token);
}