// src/auth/index.js

// Gom nhóm các thành phần theo chức năng
export * from "./authStorage";
export * from "./AuthContext";

// Export mặc định cho RequireAdmin để khi import không cần dấu {}
export { default as RequireAdmin } from "./RequireAdmin";