'use client'
import { AtpAgent } from "@atproto/api";
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { FormEvent, useState } from "react";
import "./styles.css"
import Winner from "./components/Winner";

import { FaGithub } from "react-icons/fa";

export default function Home() {
  const [reposts, setReposts] = useState<ProfileView[]>([]);
  const [winner, setWinner] = useState<ProfileView>();
  const [triggered, setTriggered] = useState(false);
  const [post, setPost] = useState("");
  const agent = new AtpAgent({
    service: "https://api.bsky.app"
  });

  const parseBskyPost = (): string[] => {
    if(post === ""){
      console.info("You must put in a post from bluesky!");
    }
    return post.split("/");
  }

  const selectWinner = async (e: FormEvent) => {
    e.preventDefault();
    if(post === ""){
      console.info("You must put in a post from bluesky!");
    }
    const postUrl = parseBskyPost();
    const did = (await agent.com.atproto.identity.resolveHandle({handle: postUrl[4]})).data.did;
    agent.app.bsky.feed.getRepostedBy({uri: `at://${did}/app.bsky.feed.post/${postUrl[6]}`}).then((res) => setReposts(res.data.repostedBy))
    if(reposts.length == 0){
      console.info("There are no reposts on this post!");
    }
    const randomIndex = Math.floor(Math.random() * reposts.length);
    setWinner(reposts[randomIndex]);
    setTriggered(true)
    setTimeout(() => {
      setTriggered(false)
    }, 1500);
  }


  return (
    <div className="flex flex-col items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col justify-items-center gap-8 row-start-2 items-center sm:items-start">
      <h1 className="text-center text-3xl font-bold">Choose your Winner!</h1>
      <section>
          {winner !== undefined ? <Winner avatar={winner.avatar!} displayName={winner.displayName!} handle={winner.handle} triggered={triggered}/>
              : 
              <h2>There is no winner yet.</h2>}
        </section>
        <form onSubmit={selectWinner} className="winner-form self-center">
          <input className="post-input h-10 rounded-l-md" type="text" name="" id="" placeholder="Your raffle's post" onChange={(e) => setPost(e.target.value)}/>
          <button className="choose-winner [400px]:justify-self-center p-2 rounded-r-md transition delay-75 duration-200 ease-in-out hover:bg-linear-to-r from-cyan-500 to-pink-400 text-white">Submit</button>
        </form>
        <a style={{display: winner ? "block":"none"}} className="p-3 bg-linear-0 from-sky-700 to-cyan-500 rounded-lg self-center text-white" href={`https://bsky.app/intent/compose?text=The%20winner%20of%20the%20giveaway%20is%20${winner?.handle}!%20Congratulations!`} target="_blank">Announce</a>
        <footer className="absolute bottom-0 pb-4 self-center ">
          <a href="https://github.com/CinnamonDoe" target="_blank" className="flex align-middle items-center">
            <h2 className="mr-2">Made and Maintained by @CinnamonDoe on</h2>
            <FaGithub className="ml-2.5 space-x-1"/>
          </a>
        </footer>
      </main>
    </div>
  );
}
