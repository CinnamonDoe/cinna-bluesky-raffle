'use client'
import { AtpAgent } from "@atproto/api";
import { ProfileView, ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { ChangeEvent, FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import Winner from "./components/Winner";
import Image from "next/image";

import { FaGithub } from "react-icons/fa";
import WinnersModal from "./components/WinnersModal";

export default function Home() {
  const [reposts, setReposts] = useState<ProfileView[]>([]);
  const [likes, setLikes] = useState<ProfileView[]>([]);
  const [did, setDID] = useState("");
  const [postID, setPostID] = useState("");
  const [followers, setFollowers] = useState<ProfileView[]>([]);
  const [includeF, setInclude] = useState(false);
  const [winnerList, setWinnerList] = useState<(ProfileView|ProfileViewBasic)[]>([]);
  const [winnerLen, setWinnerLen] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [post, setPost] = useState("");

  const [filters, setFilter] = useState<string[]>([]);

  const agent = new AtpAgent({
    service: "https://api.bsky.app"
  });


  const parseBskyPost = useCallback(async () => {
    if(post === ""){
      console.info("You must put in a post from bluesky!");
    }
    const postArr = post.split("/")
    await agent.com.atproto.identity.resolveHandle({handle: postArr[4]}).then((res) => setDID(() => res.data.did));
    setPostID(() => postArr[6])
  }, [agent.com.atproto.identity, post])

  const getLikes = async (): Promise<ProfileView[] | undefined> => {
    const liked: ProfileView[] = []
    try{
      await agent.app.bsky.feed.getLikes({uri: `at://${did}/app.bsky.feed.post/${postID}`}).then((res) => {
        res.data.likes.forEach((like) => {
          liked.push(like.actor);
        })
        setLikes(() => liked)
      });
      return likes
    } catch(err) {
      console.error(err);
    }
  }

  const getReposts = useCallback(async ():  Promise<ProfileView[] | undefined> => {
    try {
        if(did !== "" || postID !== ""){
          await agent.app.bsky.feed.getRepostedBy({uri: `at://${did}/app.bsky.feed.post/${postID}`}).then((res) => {if(res) setReposts(() => res.data.repostedBy)}).catch((err) => console.error(err));
        }
        return reposts
    } catch(err) {
      console.error(err);
    }
  }, [agent.app.bsky.feed, did, postID, reposts]);

  const getReplies = useCallback(async (did: string, postId: string) => {
    const items: ProfileViewBasic[] = []
    try {
        await agent.app.bsky.feed.getPostThread({uri: `at://${did}/app.bsky.feed.post/${postId}`}).then((res) => {
          const data = res.data.thread
          //@ts-expect-error doesn't match type but it is part of that API.
          data.replies.forEach(item => {
            items.push(item.post.author)
          })
          return 
        });
      return items
    } catch (err) {
      console.error(err);
    }
  }, [agent.app.bsky.feed]);

  const selectFilter = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const isChecked = target.checked;

    if(isChecked){
      setFilter(() => [...filters, target.value])
    } else {
      setFilter(() => filters.filter(item => item !== target.value))
    }
  }


  const constructList = useCallback(async () => {
      const replies = await getReplies(did, postID);
      await getReposts();

      if(filters.length > 1){
        if(filters.includes("replies") && filters.includes("reposts")){
          if(reposts && replies){
            return reposts.filter(repost => {return replies.some((reply) => {return (repost.handle == reply.handle)})});
          }
          return reposts
        }
        else if(filters.includes("likes") && filters.includes("replies")){
          if(likes && replies){
            return likes.filter(like => {return replies.some((reply) => {return (like.handle == reply.handle)})});
          }
          return likes
        }
        else if(filters.includes("reposts") && filters.includes("likes")){
          if(reposts && likes){
            return reposts.filter(like => {return likes.some((repost) => {return (like.handle == repost.handle)})});
          }
          return reposts
        }
        else {
          if(reposts && replies && likes){
            const filteredOnce = reposts.filter(repost => {return likes!.some((like) => {return (like.handle == repost.handle)})});
            return filteredOnce.filter(repost => {return replies.some((reply) => {return repost.handle === reply.handle})})
          }
          return reposts
        }
      }

      if(filters.length === 1 && post !== ""){
        switch (true) {
          case filters[0] === "reposts":
            return reposts
          case filters[0] === "likes":
            return likes
          case filters[0] === "replies":
            return replies
        }
        
      }

  }, [did, filters, getReplies, getReposts, likes, post, postID, reposts]);

  const pickRandom = (threshold: (ProfileViewBasic|ProfileView)[]): number => {
    return Math.floor(Math.random() * threshold.length);
  }

  const pickWinner = useCallback((list: (ProfileViewBasic|ProfileView)[]): (ProfileViewBasic|ProfileView)[] => {
    let w = 0;
    const items = [];
    if(list && list.length > 0){
      while(w <= winnerLen){
        const chosen = list[pickRandom(list)]
        items.push(chosen)
        if(list.length === winnerLen){
          break;
        }
        ++w;
      }
    }
    const newItems = Array.from(new Set(items))
    console.log(newItems);
    return newItems;
  }, [winnerLen])

  const selectWinner = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if(post === ""){
      console.log("please provide a link.");
    }
    parseBskyPost();
    await getReposts();
    await getLikes();
    // const postUrl = parseBskyPost();
    // const did = (await agent.com.atproto.identity.resolveHandle({handle: postUrl[4]})).data.did;
    const list = await constructList();
    if(includeF === true){
      await agent.app.bsky.graph.getFollowers({actor: did}).then((res) => setFollowers(() => res.data.followers));
      const filteredFollows = followers.filter(follower => {return list?.some(item => {return item.handle === follower.handle})});
      if(list?.length == 0 && list){
        setWinnerList(() => pickWinner(followers))
      }
      setWinnerList(() => pickWinner(filteredFollows))
    } else {
        if(list){
          setWinnerList(() => pickWinner(list))
        }
    }
    setTriggered(true)
    setTimeout(() => {
      setTriggered(false)
    }, 1500);
  }, [post, agent.app.bsky.graph, constructList, did, followers, getLikes, getReposts, includeF, parseBskyPost, pickWinner]);

  useEffect(() => {
    console.log("Winner")
  }, [selectWinner])

  return (
    <div className="flex flex-col items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col justify-items-center gap-8 row-start-2 items-center sm:items-start">
      <Image src={"/bskyraffleticket.png"} width={70} height={70} alt="web icon"/>
      <h1 className="text-center text-3xl font-bold flex justify-center items-center">Cinna Bluesky Raffler</h1>
      <WinnersModal>
          <section className="flex">
            <Suspense fallback={<h1>Loading...</h1>}>
              {winnerList.map((winner, i) => (
                    <Winner key={i} avatar={winner.avatar!} displayName={winner.displayName!} handle={winner.handle} triggered={triggered}/>
                ))}
            </Suspense>
          </section>
      </WinnersModal>
        <form onSubmit={selectWinner} className="winner-form self-center justify-center">
          <input className="post-input h-10 rounded-l-md" type="text" name="" id="" placeholder="Your raffle's post" onChange={(e) => setPost(e.target.value)}/>
          <button className="choose-winner [400px]:justify-self-center p-2 rounded-r-md transition delay-75 duration-200 ease-in-out hover:bg-linear-to-r from-cyan-500 to-pink-400 text-white">Submit</button>
          <fieldset className="mt-5 self-center justify-center items-center flex flex-col filter-options pt-4 pb-7 px-5 max-w-[300px] rounded-2xl">
            <legend className="mr-auto ml-auto px-1 text-xl"><h3>Options</h3></legend>
            <p>Paste in your giveaway post and select one of the following options to get started!</p>
            <section className="flex-row justify-between mt-5 gap-1">
              <input type="checkbox" value="reposts" name="reposts" onChange={(e) => selectFilter(e)}/>
              <label htmlFor="reposts">Reposts</label>
              <input type="checkbox" value="likes" name="likes" onChange={(e) => selectFilter(e)}/>
              <label htmlFor="likes">Likes</label>
              <input type="checkbox" value="replies" name="replies" onChange={(e) => selectFilter(e)}/>
              <label htmlFor="replies">Replies</label>
            </section>
            <section className="mt-5 flex flex-col">
            <label htmlFor="winners">Total Winners: {winnerLen}</label>
              <input type="range" min="1" max="10" name="winners" defaultValue="1" onChange={(e) => setWinnerLen(parseInt(e.target.value))}/>
              <span><input type="checkbox" value="following" name="followers" onChange={() => setInclude(!includeF)}/>
              <label htmlFor="followers">Include Followers</label>
              </span>
            </section>
          </fieldset>
        </form>
        <a style={{display: winnerList.length > 0 ? "block":"none"}} className="p-3 bg-linear-0 from-sky-700 to-cyan-500 rounded-lg self-center text-white" href={`https://bsky.app/intent/compose?text=The%20winner%20of%20the%20giveaway%20is%20${winnerList.join(", ")}!%20Congratulations!`} target="_blank">Announce</a>
        <footer className="bottom-0 pb-4 self-center absolute">
          <a href="https://github.com/CinnamonDoe" target="_blank" className="flex align-middle items-center">
            <h2 className="mr-2">Made and Maintained by @CinnamonDoe on</h2>
            <FaGithub className="ml-1"/>
          </a>
        </footer>
      </main>
    </div>
  );
}
