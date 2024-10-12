import { useParams } from "react-router-dom";
import { useAppContext } from "../../../../context/AppContext";
import { useEffect, useState } from "react";
import { supaClient } from "../../../../supa-client";
import CreatePost from "./CreatePost";
import Pagination from "../../../../components/Pagination";
import Post from "./Post/Post";

export interface PostData {
  id: string;
  title: string;
  score: number;
  username: string;
  user_id: string;
}

function PostsList() {
  const { userInfo } = useAppContext();
  const { page } = useParams();
  const [bumper, setBumper] = useState(0);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [myVotes, setMyVotes] = useState<
    Record<string, "up" | "down" | undefined>
  >({});
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const queryPageNumber = page ? +page : 1;

    Promise.all([
      supaClient
        .rpc("get_posts", { page_number: queryPageNumber })
        .select("*")
        .then(({ data }) => {
          setPosts(data as PostData[]);
          if (userInfo.session?.user) {
            supaClient
              .from("post_votes")
              .select("*")
              .eq("user_id", userInfo.session.user.id)
              .then(({ data: votesData }) => {
                if (!votesData) {
                  return;
                }

                const votes = votesData.reduce((acc, vote) => {
                  acc[vote.post_id] = vote.vote_type as
                    | "up"
                    | "down"
                    | undefined;
                  return acc;
                }, {} as Record<string, "up" | "down" | undefined>);
                setMyVotes(votes);
              });
          }
        }),
      supaClient
        .from("posts")
        .select("*", { count: "exact", head: true })
        .filter("path", "eq", "root")
        .then(({ count }) => {
          count == null ? 0 : setTotalPages(Math.ceil(count / 10));
        }),
    ]);
  }, [userInfo.session, bumper, page]);

  useEffect(() => {
    // Subscribe to changes in the 'posts' table
    const postsSubscription = supaClient
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => {
          setBumper((prev) => prev + 1);
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supaClient.removeChannel(postsSubscription);
    };
  }, []);

  return (
    <div>
      {userInfo.session && (
        <CreatePost
          newPostCreated={() => {
            setBumper(bumper + 1);
          }}
        />
      )}
      <Pagination totalPages={totalPages} currentPage={page ? +page : 0} />
      <div className="grid grid-cols-1 width-xl">
        {posts?.map((post) => (
          <Post
            key={post.id}
            postData={post}
            myVote={myVotes?.[post.id] || undefined}
            onVoteSuccess={() => {
              setBumper(bumper + 1);
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default PostsList;
