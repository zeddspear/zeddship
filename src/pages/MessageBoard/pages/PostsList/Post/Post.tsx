import { Link } from "react-router-dom";
import { useAppContext } from "../../../../../context/AppContext";
import { PostData } from "../../PostsList/PostsList";
import { supaClient } from "../../../../../supa-client";
import { UpVote } from "../../../../../components/UpVote";
import { timeAgo } from "../../../../../utils/helpers";

function Post({
  postData,
  myVote,
  onVoteSuccess,
}: {
  postData: PostData;
  myVote: "up" | "down" | undefined;
  onVoteSuccess: () => void;
}) {
  const { userInfo } = useAppContext();
  return (
    <div className="flex bg-grey1 text-white m-4 border-2 rounded">
      <div className="flex-none grid grid-cols-1 place-content-center bg-gray-800 p-2 mr-4">
        <UpVote
          direction="up"
          // handle filling later
          filled={myVote === "up"}
          enabled={userInfo.session ? true : false}
          onClick={async () => {
            await castVote({
              postId: postData.id,
              userId: userInfo.session?.user.id as string,
              voteType: "up",
              onSuccess: () => {
                onVoteSuccess();
              },
            });
          }}
        />
        <p className="text-center" data-e2e="upvote-count">
          {postData.score}
        </p>
        <UpVote
          direction="down"
          filled={myVote === "down"}
          enabled={userInfo.session ? true : false}
          onClick={async () => {
            await castVote({
              postId: postData.id,
              userId: userInfo.session?.user.id as string,
              voteType: "down",
              onSuccess: () => {
                onVoteSuccess();
              },
            });
          }}
        />
      </div>
      <Link to={`/messageboard/post/${postData.id}`} className="flex-auto">
        <p className="mt-4">
          Posted By {postData.username} {timeAgo((postData as any).created_at)}{" "}
          ago
        </p>
        <h3 className="text-2xl">{postData.title}</h3>
      </Link>
    </div>
  );
}

export async function castVote({
  postId,
  userId,
  voteType,
  onSuccess = () => {},
}: {
  postId: string;
  userId: string;
  voteType: "up" | "down";
  voteId?: Promise<string | undefined>;
  onSuccess?: () => void;
}) {
  const voteId = await getVoteId(userId, postId);
  voteId
    ? await supaClient.from("post_votes").update({
        id: voteId,
        post_id: postId,
        user_id: userId,
        vote_type: voteType,
      })
    : await supaClient.from("post_votes").insert({
        post_id: postId,
        user_id: userId,
        vote_type: voteType,
      });
  // handle error
  onSuccess();
}

export async function getVoteId(
  userId: string,
  postId: string
): Promise<string | undefined> {
  const { data } = await supaClient
    .from("post_votes")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();
  return data?.id || undefined;
}

export default Post;
