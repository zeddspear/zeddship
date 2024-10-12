import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen text-center flex justify-center items-center flex-col">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link
        to="/"
        className="text-xl my-5"
        style={{ textDecoration: "none", color: "blue" }}
      >
        Go to Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
