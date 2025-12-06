import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";

const router = createBrowserRouter(
  [
    { path: "/", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/dashboard/*", element: <Dashboard /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
