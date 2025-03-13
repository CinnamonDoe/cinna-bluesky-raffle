'use client'
import { ProfileView, ProfileViewBasic } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { ChangeEvent, createContext, FormEvent, Suspense, useCallback, useEffect, useRef, useState } from "react";
import Winner from "./components/Winner";
import Image from "next/image";

import { FaGithub } from "react-icons/fa";
import WinnersModal from "./components/WinnersModal";
import { getFollowersAsync, getLikesAsync, getRepliesAsync, getRepostsAsync } from "./api/bskyApi";
import {agent} from './api/bskyApi'
import { constructList } from "./api/listCompilation";

interface ModalContext {
  isViewing: boolean,
  setView: React.Dispatch<React.SetStateAction<boolean>>
}

export const ModalContext = createContext<ModalContext>({} as ModalContext);

export default function Home() {
  const [did, setDID] = useState("");
  const [postID, setPostID] = useState("");
  const [winnerList, setWinnerList] = useState<(ProfileView|ProfileViewBasic)[]>([]);
  const [winnerLen, setWinnerLen] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [post, setPost] = useState("");
  const [isViewing, setView] = useState(false);

  const [filters, setFilter] = useState<string[]>([]);

  const checkRef = useRef<HTMLInputElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);

  const parseBskyPost = useCallback(async () => {
    if(post === ""){
      console.info("You must put in a post from bluesky!");
    }
    const postArr = post.split("/")
    const didData = (await agent.com.atproto.identity.resolveHandle({handle: postArr[4]})).data.did;
    setPostID(postArr[6])
    setDID(didData);
  }, [post])

  const selectFilter = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const isChecked = target.checked;

    if(isChecked){
      setFilter(() => [...filters, target.value])
    } else {
      setFilter(() => filters.filter(item => item !== target.value))
    }
  }

  const pickWinner = useCallback((list: (ProfileViewBasic|ProfileView)[]): (ProfileViewBasic|ProfileView)[] => {
    let w = 0;
    const items: (ProfileView|ProfileViewBasic)[] = [];

    const pickRandom = (threshold: (ProfileViewBasic|ProfileView)[]): number => {
      return Math.floor(Math.random() * threshold.length);
    }

    if(list && list.length > 0){
      while(w <= winnerLen-1){ // subtract 1 from winner len because it will always go over the set length.
        const chosen = list[pickRandom(list)]
        items.push(chosen)
        w += 1;
      }
    }
    const newItems = Array.from(new Set(items)) // removes potential duplicates.
    return newItems;
  }, [winnerLen])

  const selectWinner = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const reposts = await getRepostsAsync(did, postID);
    const likes = await getLikesAsync(did, postID);
    const replies = await getRepliesAsync(did, postID);
    const list = await constructList({filters: filters, reposts: reposts, likes: likes, replies: replies, post: post});
    const followers = await getFollowersAsync(did, postID);
    const isChecked = checkRef.current?.checked

    if(post === ""){
      console.log("please provide a link.");
    }
    if(followers && isChecked === true){
      setWinnerList(() => [...pickWinner(followers)])
    }else if(followers && isChecked === true && list){
      const filteredFollows = followers.filter(follower => list.some(item => item.handle === follower.handle));
      setWinnerList(() => [...pickWinner(filteredFollows)]);
    }
    if(list){
      setWinnerList(() => [...pickWinner(list)])
    }

    setTriggered(true);
    setView(true);
    setTimeout(() => {
      setTriggered(false)
    }, 1500);
  }, [did, filters, pickWinner, post, postID]);

  const selectWinnerLen = (e: ChangeEvent<HTMLInputElement>) => {
    setWinnerLen(() => parseInt(e.target.value));
  }

  useEffect(() => {
    if(post === ""){
      console.log("Enter a post to get started!")
    } else {
      parseBskyPost();
    }
  }, [post, selectWinner, parseBskyPost, did, postID, winnerLen])

  return (
      <div className="flex flex-col items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <ModalContext.Provider value={{isViewing, setView}}>
        <main className="flex flex-col justify-items-center gap-8 row-start-2 items-center text-center content-center sm:items-start">
        <Image src={"/bskyraffleticket.png"} width={70} height={70} alt="web icon" className="self-center"/>
        <h1 className="text-center text-3xl font-bold flex justify-center items-center">Cinna Bluesky Raffler</h1>
        <WinnersModal triggered={triggered} winnerList={winnerList} style={{display: isViewing ? "block" : "none"}}>
            <section className="flex flex-col">
              <Suspense fallback={<h1>Loading...</h1>}>
                {winnerList.map((winner, i) => (
                      <Winner key={i} avatar={winner.avatar ? winner.avatar : "https://cdn-icons-png.flaticon.com/512/8136/8136031.png"} displayName={winner.displayName!} handle={winner.handle} triggered={triggered}/>
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
                <input type="range" min="1" max="10" name="winners" defaultValue='1' step="1" ref = {rangeRef} onChange={(e) => selectWinnerLen(e)}/>
                <span><input type="checkbox" value="following" name="followers" ref={checkRef}/>
                <label htmlFor="followers">Include Followers</label>
                </span>
              </section>
            </fieldset>
          </form>
          <footer className="bottom-0 pb-4 self-center absolute">
            <a href="https://github.com/CinnamonDoe" target="_blank" className="flex align-middle items-center">
              <h2 className="mr-2">Made and Maintained by @CinnamonDoe on</h2>
              <FaGithub className="ml-1"/>
            </a>
          </footer>
        </main>
        </ModalContext.Provider>
      </div>
    );
}
