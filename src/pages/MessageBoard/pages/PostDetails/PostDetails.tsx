import { useParams } from "react-router-dom";
import { useAppContext } from "../../../../context/AppContext";
import {
  getDepth,
  postDetailLoader,
  unsortedCommentsToNested,
} from "./FetchingFunctions";
import { useEffect, useMemo, useState } from "react";
import { timeAgo } from "../../../../utils/helpers";
import { castVote } from "../PostsList/Post/Post";
import { UpVote } from "../../../../components/UpVote";
import CreateComment from "./CreateComment";

export interface CommentMain {
  id: string;
  author_name: string;
  title?: string;
  content: string;
  score: number;
  created_at: string;
  path: string;
  depth: number;
  comments: CommentMain[];
}

export interface Post {
  id: string;
  author_name: string;
  title: string;
  content: string;
  score: number;
  created_at: string;
  path: string;
  comments: CommentMain[];
}

export interface DepthFirstComment {
  id: string;
  author_name: string;
  created_at: string;
  title: string;
  content: string;
  score: number;
  path: string;
  comments?: DepthFirstComment[];
  depth: number; // Ensure this property is included
}

export interface PostDetailData {
  post: Post | null;
  comments: DepthFirstComment[];
  myVotes?: Record<string, "up" | "down" | undefined>;
}

const START_ASKING_DEPTH = 3;

function PostDetails() {
  const { userInfo } = useAppContext();
  const { postId } = useParams();
  const [postDetailData, setPostDetailData] = useState<PostDetailData>({
    post: null,
    comments: [],
  });
  const [bumper, setBumper] = useState(0);

  useEffect(() => {
    postDetailLoader({
      params: { postId: postId! },
      userContext: userInfo,
    }).then((data) => {
      if (data) {
        setPostDetailData(data as PostDetailData);
      }
    });
  }, [userInfo, postId, bumper]);

  const nestedComments = useMemo(
    () => unsortedCommentsToNested(postDetailData.comments),
    [postDetailData]
  );

  return (
    <div className="flex flex-col place-content-center">
      <div className="flex text-white ml-4 my-4 border-l-2 border-l-[#725ac1] rounded grow">
        <div className="flex flex-col bg-gray-800 p-2 h-full rounded">
          <UpVote
            direction="up"
            filled={
              postDetailData.myVotes &&
              postDetailData.post &&
              postDetailData.myVotes[postDetailData.post.id] === "up"
            }
            enabled={!!userInfo.session}
            onClick={async () => {
              if (!postDetailData.post) {
                return;
              }
              await castVote({
                postId: postDetailData.post.id,
                userId: userInfo.session?.user.id as string,
                voteType: "up",
                onSuccess: () => {
                  setBumper(bumper + 1);
                },
              });
            }}
          />
          <p className="text-center" data-e2e="upvote-count">
            {postDetailData.post?.score}
          </p>
          <UpVote
            direction="down"
            filled={
              postDetailData.myVotes &&
              postDetailData.post &&
              postDetailData.myVotes[postDetailData.post.id] === "down"
            }
            enabled={!!userInfo.session}
            onClick={async () => {
              if (!postDetailData.post) {
                return;
              }
              await castVote({
                postId: postDetailData.post.id,
                userId: userInfo.session?.user.id as string,
                voteType: "down",
                onSuccess: () => {
                  setBumper(bumper + 1);
                },
              });
            }}
          />
        </div>

        <div className="grid m-2 w-full">
          <p>
            Posted By {postDetailData.post?.author_name}{" "}
            {postDetailData.post &&
              `${timeAgo(postDetailData.post?.created_at)} ago`}
          </p>
          <h3 className="text-2xl">{postDetailData.post?.title}</h3>
          <div
            className="font-sans bg-gray-600 rounded p-4 m-4"
            data-e2e="post-content"
          >
            {postDetailData.post?.content.split("\n").map((paragraph) => (
              <p className="font-sans p-2">{paragraph}</p>
            ))}
          </div>
          {userInfo.session && postDetailData.post && (
            <CreateComment
              parent={postDetailData.post}
              onSuccess={() => {
                setBumper(bumper + 1);
              }}
            />
          )}
          {nestedComments.map((comment) => (
            <CommentView
              key={comment.id}
              comment={comment}
              myVotes={postDetailData.myVotes}
              onVoteSuccess={() => {
                setBumper(bumper + 1);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CommentView({
  comment,
  myVotes,
  onVoteSuccess,
}: {
  comment: CommentMain;
  myVotes: Record<string, "up" | "down" | undefined> | undefined;
  onVoteSuccess: () => void;
}) {
  const [commenting, setCommenting] = useState(false);
  const [goDeeper, setGoDeeper] = useState(false);
  const { userInfo } = useAppContext();
  const shouldShowChildren = (): boolean => {
    const depth = getDepth(comment.path);
    return depth < START_ASKING_DEPTH
      ? true
      : !!comment.comments.length && goDeeper;
  };

  return (
    <>
      <div
        className="flex bg-grey1 text-white my-4 ml-4 border-l-2 border-l-[#725ac1] rounded"
        data-e2e={`comment-${comment.id}`}
      >
        <div className="flex w-full grow">
          <div className="flex flex-col grow-0 bg-gray-800 p-2 h-full rounded">
            <UpVote
              direction="up"
              filled={myVotes?.[comment.id] === "up"}
              enabled={!!userInfo.session}
              onClick={async () => {
                await castVote({
                  postId: comment.id,
                  userId: userInfo.session?.user.id as string,
                  voteType: "up",
                  onSuccess: () => {
                    onVoteSuccess();
                  },
                });
              }}
            />
            <p className="text-center" data-e2e="upvote-count">
              {comment.score}
            </p>
            <UpVote
              direction="down"
              filled={myVotes?.[comment.id] === "down"}
              enabled={!!userInfo.session}
              onClick={async () => {
                await castVote({
                  postId: comment.id,
                  userId: userInfo.session?.user.id as string,
                  voteType: "down",
                  onSuccess: () => {
                    onVoteSuccess();
                  },
                });
              }}
            />
          </div>
          <div className="grid grid-cols-1 ml-2 my-2 w-full">
            <p>
              {comment.author_name} - {timeAgo(comment.created_at)} ago
            </p>
            <div
              className="bg-gray-600 rounded p-4 m-4"
              data-e2e="comment-content"
            >
              {comment.content.split("\n").map((paragraph) => (
                <p className="font-sans p-2">{paragraph}</p>
              ))}
            </div>
            {commenting && (
              <CreateComment
                parent={comment as DepthFirstComment}
                onCancel={() => setCommenting(false)}
                onSuccess={() => {
                  onVoteSuccess();
                  setCommenting(false);
                }}
              />
            )}
            {!commenting && (
              <div className="ml-4">
                <button
                  onClick={() => setCommenting(!commenting)}
                  disabled={!userInfo.session}
                >
                  {commenting ? "Cancel" : "Reply"}
                </button>
              </div>
            )}
            {/* <p>{comment.id}</p> */}
            {shouldShowChildren() ? (
              comment.comments.map((childComment) => (
                <CommentView
                  key={childComment.id}
                  comment={childComment}
                  myVotes={myVotes}
                  onVoteSuccess={() => onVoteSuccess()}
                />
              ))
            ) : comment.comments.length ? (
              <div className="ml-4 border-2 border-white rounded bg-gray-600 p-2 m-2 w-64">
                <p>There are more comments nested deeper.</p>
                <button
                  className="bg-gray-400 rounded font-display text-lg p-2"
                  onClick={() => setGoDeeper(true)}
                >
                  Go Deeper
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PostDetails;
