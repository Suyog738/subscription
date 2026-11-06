export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== "false",
};
