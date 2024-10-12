import { Link } from "react-router-dom";
import logoImag from "../assets/logo.png";
import { useAppContext } from "../context/AppContext";
import { supaClient } from "../supa-client";

function Navbar() {
  const { userInfo } = useAppContext();
  console.log(userInfo);
  return (
    <div className="container flex justify-center items-center w-full px-5">
      <div className="max-w-[1920px] w-full flex justify-between items-center">
        <div className="py-5">
          <Link to={"/"}>
            <img
              src={logoImag}
              className="w-44 hover:scale-110 transition-all hover:brightness-150"
            />
          </Link>
        </div>
        <div className="flex gap-5">
          <ul className="flex justify-center items-center gap-5">
            <li className="hover:scale-110 transition-transform">
              <Link to={"/messageboard/1"}>
                <p className="text-xl">Message Board</p>
              </Link>
            </li>
            <li className="hover:scale-110 transition-transform">
              {!userInfo.profile?.username && (
                <Link to={"/"}>
                  <p className="text-xl">Login/Signup</p>
                </Link>
              )}
            </li>
          </ul>
          <div>
            {userInfo.profile?.username && (
              <>
                <p className="text-xl">Username: {userInfo.profile.username}</p>
                <button
                  onClick={() => supaClient.auth.signOut()}
                  className="md:inline-block px-2 py-0 text-xl font-display text-black hover:text-white bg-white hover:bg-purple-600 drop-shadow-[6px_6px_0_black] hover:drop-shadow-[0_0_7px_rgba(168,85,247,0.5)] transition-all duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
