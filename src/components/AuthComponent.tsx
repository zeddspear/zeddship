import { useState } from "react";
import ModalBox from "./ModalBox";
import { Auth } from "@supabase/auth-ui-react";
import { supaClient } from "../supa-client";
import { supabase } from "../variables/Supabase_Auth_Variables";

function AuthComponent() {
  //@ts-ignore
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [authView, setAuthView] = useState<"sign_in" | "sign_up">("sign_in");

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => {
          setIsOpen(true);
          setAuthView("sign_in");
        }}
      >
        Log In
      </button>{" "}
      Or{" "}
      <button
        className="btn btn-primary"
        onClick={() => {
          setIsOpen(true);
          setAuthView("sign_up");
        }}
      >
        Sign Up
      </button>
      <ModalBox
        open={isOpen}
        dialogStateChange={(open) => setIsOpen(open)}
        contents={
          <>
            <Auth
              supabaseClient={supaClient}
              view={authView}
              //You can add providers if you need any
              providers={[]}
              appearance={{
                variables: {
                  default: supabase,
                },

                className: {
                  container: "grid grid-cols-1 place-content-center",
                  label: "text-white text-xl font-display",
                  button:
                    "text-white bg-[rgb(114,90,193)] outline-none border-none text-xl font-display",
                  input:
                    "text-2xl font-display font-normal rounded border-2 text-[rgb(114,90,193)] border-[rgb(114,90,193)] text-center drop-shadow-[0_0_9px_rgba(114,90,193,0.9)] bg-white",
                },
              }}
            />
          </>
        }
      />
    </>
  );
}

export default AuthComponent;
