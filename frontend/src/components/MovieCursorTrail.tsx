"use client"

import React from "react"
import ImageCursorTrail from "./ui/image-cursortrail"

// Movie posters and cinema-related images
const movieImages = [
 
  "https://tse4.mm.bing.net/th/id/OIP.m0WHztjn01Y2PyeUMF9mxwHaK2?rs=1&pid=ImgDetMain&o=7&rm=3", // Film reels
  "https://tse4.mm.bing.net/th/id/OIP.d5zK_jXcvLWBnG0V_90ltAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://wallpapercave.com/wp/wp1945933.jpg", 
  "https://th.bing.com/th/id/R.7035b3da4a1afc74552ad12cd3a1b4a2?rik=VkWdSWQtb0GsPA&riu=http%3a%2f%2fblog.karachicorner.com%2fwp-content%2fuploads%2f2013%2f04%2flarge%2fTheWolverine%2bmovie%2bposters.jpg&ehk=N%2bbfqw%2bRWmlunIYyKg0rzZvWYKrqrujZiaIw1YB5%2fhs%3d&risl=&pid=ImgRaw&r=0", // Film strip
  "https://tse2.mm.bing.net/th/id/OIP.Tcrx2XtyPgNt5fTv9M_pGAHaKX?rs=1&pid=ImgDetMain&o=7&rm=3", // Movie camera
  "https://tse4.mm.bing.net/th/id/OIP._HQZesg_3XXMq2wLegBn5gHaK-?rs=1&pid=ImgDetMain&o=7&rm=3", // Cinema seats
  "https://th.bing.com/th/id/R.ffee1179efb0dbabf4eeb2759dfa8753?rik=E7J9w0iS5obPKQ&riu=http%3a%2f%2fgo.rappler.com%2fimages%2fbestmovieposters-looper-20121221-06.jpg&ehk=PDnTDYQPGFHtZ4RLqYPnSzFCVwH6hVLFjdeFUqKJeR0%3d&risl=&pid=ImgRaw&r=0",
  "https://th.bing.com/th/id/OIP.beuK7grxz2fmHLF8czZpKQHaK-?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse1.explicit.bing.net/th/id/OIP.n1xXNU_4mqEPNQhihkSCBQHaLl?rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse2.mm.bing.net/th/id/OIP.7CbUf1vKJqFNc596HpSBkwHaNH?rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://th.bing.com/th/id/OIP.7KHFXo5U0RgSgJaVEXkPSgHaMC?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://tse4.mm.bing.net/th/id/OIP.BwRiUFRuVyvCuEraiKPvygHaKl?rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://i.pinimg.com/originals/52/e0/8a/52e08ad82f583b4a6cb5eb5dca09ecf1.jpg",
  "https://th.bing.com/th/id/OIP.9kHjYBavvuQxkHvsLmk1DAHaLP?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://th.bing.com/th/id/OIP.y-jlaYYIKT0UgGw1k3HM8AHaJi?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
  "https://m.media-amazon.com/images/I/517Z6szPDrL.jpg",
  "https://tse1.mm.bing.net/th/id/OIP.ZqPNIV7ovf2Fsup2JGvH3gHaK-?rs=1&pid=ImgDetMain&o=7&rm=3",
]

export function MovieCursorTrail() {
  return (
    <section className="w-full h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-transparent to-purple-600/30" />
        
        {/* Animated light rays */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/10 to-transparent animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Floating light orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "3s" }} />
        
        {/* Subtle dot pattern */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px] opacity-30" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <ImageCursorTrail
        items={movieImages}
        maxNumberOfImages={6}
        distance={25}
        imgClass="sm:w-48 w-32 sm:h-64 h-40"
        className="w-full h-full"
        fadeAnimation={true}
      >
        <article className="relative z-50 flex flex-col items-center justify-center h-full px-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight tracking-tight pacifico-regular">
              Step into endless stories .
            </h1>
          </div>
        </article>
      </ImageCursorTrail>
    </section>
  )
}

export default MovieCursorTrail
