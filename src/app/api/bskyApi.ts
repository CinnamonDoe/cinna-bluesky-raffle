import { ProfileView, ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { AtpAgent } from "@atproto/api";

export const agent = new AtpAgent({
  service: "https://api.bsky.app"
});


export const getRepostsAsync = async (did: string, postID: string):  Promise<ProfileView[] | undefined> => {
  try {
      if(did !== "" || postID !== ""){
        const reposts = (await agent.app.bsky.feed.getRepostedBy({uri: `at://${did}/app.bsky.feed.post/${postID}`, limit: 100})).data.repostedBy;
        return reposts
      }
  } catch(err) {
    console.error(err);
  }
};


export const getFollowersAsync = async (did: string, postID: string): Promise<ProfileView[]|undefined> => {
  try{
    if(did !== "" || postID !== ""){
      const followers = (await agent.app.bsky.graph.getFollowers({actor: did})).data.followers;
      return followers
    }
  }
  catch (err){
    console.log(err);
  }
}

export const getRepliesAsync = async (did: string, postID: string) => {
    const items: ProfileViewBasic[] = []
    try {
      if(did !== "" && postID !== ""){
          await agent.app.bsky.feed.getPostThread({uri: `at://${did}/app.bsky.feed.post/${postID}`}).then((res) => {
            const data = res.data.thread
            //@ts-expect-error doesn't match type but it is part of that API.
            data.replies.forEach(item => {
              items.push(item.post.author)
            })
          });
      return items
      }
    } catch (err) {
      console.error(err);
    }
};

export const getLikesAsync = async (did: string, postID: string): Promise<ProfileView[] | undefined> => {
    const liked: ProfileView[] = []
    try{
      if(did !== "" && postID !== ""){
        console.info("You must put in a post from bluesky!");
        await agent.app.bsky.feed.getLikes({uri: `at://${did}/app.bsky.feed.post/${postID}`, limit: 100}).then((res) => {
          res.data.likes.forEach((like) => {
            liked.push(like.actor);
          })
          
        });
        return liked
      }
    } catch(err) {
      console.error(err);
    }
};