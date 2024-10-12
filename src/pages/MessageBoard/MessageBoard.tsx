import { Link, Outlet } from "react-router-dom";

function MessageBoard() {
  return (
    <div>
      <Link to={"#"}>
        <h1 className="text-5xl text-center m-5">MessageBoard</h1>
      </Link>
      <Outlet />
    </div>
  );
}

export default MessageBoard;
