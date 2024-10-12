import { useMemo, useState } from "react";
import { redirect, replace, useNavigate } from "react-router-dom";
import ModalBox from "../../components/ModalBox";
import { supaClient } from "../../supa-client";
import { useAppContext } from "../../context/AppContext";

export async function welcomeLoader() {
  try {
    const {
      data: { user },
      error: userError,
    } = await supaClient.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError.message);
      return redirect("/");
    }

    if (!user) {
      return redirect("/");
    }

    const { data: profile, error: profileError } = await supaClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError.message);
      return redirect("/welcome");
    }

    if (profile?.username) {
      return { user, profile };
    } else {
      return redirect("/welcome");
    }
  } catch (error) {
    console.error("Unexpected error in welcomeLoader:", error);
    return redirect("/welcome");
  }
}

export function Welcome() {
  const { userInfo } = useAppContext();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [serverError, setServerError] = useState("");
  const [formIsDirty, setFormIsDirty] = useState(false);
  const invalidString = useMemo(() => validateUsername(userName), [userName]);

  return (
    <ModalBox
      allowClose={false}
      open={true}
      contents={
        <>
          <h2 className="text-[rgb(114,90,193)] drop-shadow-[0_0_9px_rgba(114,90,193,0.9)] m-4 text-center text-3xl">
            Welcome to Zeddship!!
          </h2>
          <p className="text-center">
            Let's get started by creating a username:
          </p>
          <form
            className="grid grid-cols-1 place-items-center"
            onSubmit={(event) => {
              event.preventDefault();
              if (userInfo.session?.user.id) {
                supaClient
                  .from("user_profiles")
                  .insert([
                    {
                      user_id: userInfo.session.user.id,
                      username: userName,
                    },
                  ])
                  .then(({ error }) => {
                    if (error) {
                      setServerError(`Username "${userName}" is already taken`);
                    } else {
                      const target = localStorage.getItem("returnPath") || "/";
                      localStorage.removeItem("returnPath");
                      navigate(target);
                    }
                  });
              } else {
                setServerError("User ID is missing");
              }
            }}
          >
            <input
              name="username"
              placeholder="Username"
              onChange={({ target }) => {
                setUserName(target.value);
                if (!formIsDirty) {
                  setFormIsDirty(true);
                }
                if (serverError) {
                  setServerError("");
                }
              }}
              className="text-2xl font-display rounded border-2 text-color-green-400 border-[rgb(114,90,193)] p-2 m-4 text-center text-[rgb(114,90,193)] drop-shadow-[0_0_9px_rgba(114,90,193,0.9)] xl:text-3xl"
            ></input>
            {formIsDirty && (invalidString || serverError) && (
              <p className="text-red-400 validation-feedback text-center">
                {serverError || invalidString}
              </p>
            )}
            <p className="text-center">
              This is the name people will see you as on the Message Board
            </p>
            <button
              className="font-display text-2xl bg-[rgb(114,90,193)] text-center rounded p-2 m-2 mb-8"
              type="submit"
              disabled={invalidString != null}
            >
              Submit
            </button>
          </form>
        </>
      }
    />
  );
}

/**
 * This only validates the form on the front end.
 * Server side validation is done at the sql level.
 */
function validateUsername(username: string): string | undefined {
  if (!username) {
    return "Username is required";
  }
  const regex = /^[a-zA-Z0-9_]+$/;
  if (username.length < 4) {
    return "Username must be at least 4 characters long";
  }
  if (username.length > 14) {
    return "Username must be less than 15 characters long";
  }
  if (!regex.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return undefined;
}
