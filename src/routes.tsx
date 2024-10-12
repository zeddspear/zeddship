import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Welcome from "./pages/WelcomePage";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import MessageBoard from "./pages/MessageBoard";
import PostsList from "./pages/MessageBoard/pages/PostsList";
import Post from "./pages/MessageBoard/pages/PostDetails";
import { welcomeLoader } from "./pages/WelcomePage/Welcome";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "messageboard",
        element: <MessageBoard />,
        children: [
          {
            path: "",
            element: <Navigate to="1" replace />,
          },
          {
            path: ":page",
            element: <PostsList />,
          },
          {
            path: "post/:postId",
            element: <Post />,
          },
        ],
      },
    ],
  },
  {
    path: "/welcome",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Welcome />,
      },
    ],
  },
]);
