'use client'
interface props {
    children: React.ReactNode
}

export default function WinnersModal({children}: props) {
  return (
    <section className="winners-modal">
        {children}
    </section>
  )
}
