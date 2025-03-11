'use client'
import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link';
import Fireworks from 'react-canvas-confetti/dist/presets/fireworks';

interface Winner {
    avatar: string
    handle: string
    displayName: string
    triggered: boolean
}

export default function Winner({avatar, handle, displayName, triggered}: Winner) {

  return (
    <Suspense fallback={<h1>Loading...</h1>}>
        <section className='flex flex-col justify-center items-center'>
        <Image className='rounded-2xl winner-img' loader={() => avatar} src={avatar} width={300} height={300} alt={`${displayName}'s avatar.`}/>
        <section className='pt-2 text-center'>
            <h2 className='font-bold text-2xl'>{displayName}</h2>
            <Link href={`https://bsky.app/profile/${handle}`}>{handle}</Link>
        </section>
        {triggered && <Fireworks autorun={{speed: 3, duration: 3}}/>}
      </section>
    </Suspense>
  )
}
