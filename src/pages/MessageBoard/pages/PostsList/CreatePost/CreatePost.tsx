import { supaClient } from "../../../../../supa-client";
import { useState } from "react";
import { useAppContext } from "../../../../../context/AppContext";

export interface CreatePostProps {
  newPostCreated?: () => void;
}

//@ts-ignore
function CreatePost({ newPostCreated = () => {} }) {
  const { userInfo } = useAppContext();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  return (
    <>
      <form
        className="rounded border-2 p-4 m-5 flex flex-col justify-start gap-4 mb-8"
        data-e2e="create-post-form"
        onSubmit={(event) => {
          event.preventDefault();
          supaClient
            .rpc("create_new_post", {
              userId: userInfo.session?.user.id!,
              title,
              content,
            })
            .then(({ data, error }) => {
              if (error) {
                console.log(error);
              } else {
                console.log(data);
                // navigate(`/messageboard/post/${newId}`);
                setTitle("");
                setContent("");
                newPostCreated();
              }
            });
        }}
      >
        <h3>Create A New Post</h3>
        <input
          type="text"
          name="title"
          value={title}
          className="text-gray-800 p-2 rounded text-xl"
          placeholder="Your Title Here"
          onChange={({ target: { value } }) => {
            setTitle(value);
          }}
        />
        <textarea
          name="contents"
          placeholder="Your content here"
          value={content}
          className="text-gray-800 p-4 rounded h-24"
          onChange={({ target: { value } }) => {
            setContent(value);
          }}
        />
        <div>
          <button
            type="submit"
            className="bg-[#725ac1] rounded font-display text-lg p-2"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}

export default CreatePost;
