import { supaClient } from "../../../../supa-client";
import { ZeddshipUserInfo } from "../../../../utils/useSession";
import { CommentMain, DepthFirstComment, Post } from "./PostDetails";

export async function postDetailLoader({
  params: { postId },
  userContext,
}: {
  params: { postId: string };
  userContext: ZeddshipUserInfo;
}) {
  const { data, error } = await supaClient
    .rpc("get_single_post_with_comments", { post_id: postId })
    .select("*");
  if (error || !data || data.length === 0) {
    throw new Error("Post not found");
  }

  const postMap = data.reduce((acc, post) => {
    acc[post.id] = post as Post;
    return acc;
  }, {} as Record<string, Post>);

  const post = postMap[postId];
  const comments = data.filter((x) => x.id !== postId);
  if (!userContext.session?.user) {
    return { post, comments };
  }

  const { data: votesData } = await supaClient
    .from("post_votes")
    .select("*")
    .eq("user_id", userContext.session.user.id);

  if (!votesData) {
    return;
  }

  const votes = votesData.reduce((acc, vote) => {
    acc[vote.post_id] = vote.vote_type as "up" | "down" | undefined;
    return acc;
  }, {} as Record<string, "up" | "down" | undefined>);
  return { post, comments, myVotes: votes } 
}


export function unsortedCommentsToNested(comments: DepthFirstComment[]): CommentMain[]  {
    const commentMap = comments.reduce((acc, comment) => {
      acc[comment.id] = {
        ...comment,
        comments: [],
        depth: getDepth(comment.path),
      };
      return acc;
    }, {} as Record<string, DepthFirstComment>);
    const result: CommentMain[] = [];
    const sortedByDepthThenCreationTime = [...Object.values(commentMap)].sort(
      (a, b) =>
        a.depth > b.depth
          ? 1
          : a.depth < b.depth
          ? -1
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    for (const post of sortedByDepthThenCreationTime) {
      if (post.depth === 1) {
        result.push(post as unknown as CommentMain);
      } else {
        const parentNode = getParent(commentMap, post.path);
        parentNode.comments!.push(post as unknown as DepthFirstComment);
      }
    }
    return result;
  }
  
  function getParent(map: Record<string, DepthFirstComment>, path: string): DepthFirstComment {
    const parentId = path.replace("root.", "").split(".").slice(-1)[0];
    const parent = map[convertToUuid(parentId)];
    if (!parent) {
      throw new Error(`Parent not found at ${parentId}`);
    }
    return parent;
  }
  
  function convertToUuid(path: string): string {
    return path.replaceAll("_", "-");
  }
  
  export function getDepth(path: string): number {
    const rootless = path.replace(".", "");
    return rootless.split(".").filter((x) => !!x).length;
  }