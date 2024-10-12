import { Navigate } from "react-router-dom";
import AuthComponent from "../../components/AuthComponent";
import { useAppContext } from "../../context/AppContext";

function Home() {
  const { userInfo } = useAppContext();
  return (
    <div className="flex justify-center items-center py-5">
      {userInfo.session ? (
        <Navigate to={"/messageboard"} replace />
      ) : (
        <div className="my-5">
          <h1 className="text-4xl">
            Yo! Dawg you have to <AuthComponent /> to join the discussion and
            slay.
          </h1>
        </div>
      )}
    </div>
  );
}

export default Home;
