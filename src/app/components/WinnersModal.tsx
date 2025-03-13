'use client'
import { useContext, useState } from 'react';
import { BsXLg } from 'react-icons/bs';
import { ModalContext } from '../page';
import { ProfileView, ProfileViewBasic } from '@atproto/api/dist/client/types/app/bsky/actor/defs';
import Fireworks from 'react-canvas-confetti/dist/presets/fireworks';

interface props {
    children: React.ReactNode
    style?: React.CSSProperties
    winnerList: (ProfileView|ProfileViewBasic)[]
    triggered: boolean
}

export default function WinnersModal({children, style, winnerList, triggered}: props) {
  const [winnerHandles, setWinnerHandles] = useState<string[]>([]);

  const getWinnerHandles = () => {
    const handles: string[] = [];

    winnerList.forEach((winner) => handles.push(winner.handle));
    setWinnerHandles(handles);
  };

  const {setView} = useContext(ModalContext);

  return (
    <span style={style}>
      <section className="winners-modal dark:bg-[#141616] p-10 absolute left-0 right-0 top-10 m-auto max-w-[600px] rounded-2xl flex flex-col z-3">
        <button className='justify-end right-0 relative' onClick={() => setView(false)}><BsXLg/></button>
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold">Winners</h2>
          <p>Congratulations to these winners!</p>
        </section>
        <section className="flex flex-col space-y-4 max-h-[400px] overflow-y-scroll dark:border-[#2a2e2e] border-1 py-2">
          {children}
        </section>
        <a style={{display: winnerList.length > 0 ? "block":"none"}} className="p-3 bg-linear-0 from-sky-700 to-cyan-500 rounded-lg self-center text-white mt-10" onClick={getWinnerHandles} href={`https://bsky.app/intent/compose?text=The%20winner%20of%20the%20giveaway%20is%20${winnerHandles.join(", ")}!%20Congratulations!`} target="_blank">Announce</a>
      </section>
    <div className="bg-[#00000098] w-[100vw] h-[100vh] absolute z-2 top-0 left-0" onClick={() => setView(false)}></div>
    {triggered && <Fireworks autorun={{speed: 3, duration: 3}}/>}
    </span>
  )
}
