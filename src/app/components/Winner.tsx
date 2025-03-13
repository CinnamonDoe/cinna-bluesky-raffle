'use client'
import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link';

interface Winner {
    avatar: string
    handle: string
    displayName: string
    triggered: boolean
}

export default function Winner({avatar, handle, displayName}: Winner) {

  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <section className='flex justify-between dark:bg-[#242727] max-w-[600px] px-5 py-2 rounded-xl my-1'>
        <Image className='rounded-2xl winner-img' loader={() => avatar} src={avatar} width={75} height={75} alt={`${displayName}'s avatar.`}/>
        <section className='pt-2 justify-end text-end items-end'>
            <h2 className='font-bold text-xl'>{displayName}</h2>
            <Link href={`https://bsky.app/profile/${handle}`}>{handle}</Link>
        </section>
      </section>
    </Suspense>
  )
}
