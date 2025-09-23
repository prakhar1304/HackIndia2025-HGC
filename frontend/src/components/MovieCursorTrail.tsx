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
    <section className="w-full h-screen bg-gradient-to-br from-black via-purple-900 to-black relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 rounded-full border-4 border-white shadow-[8px_8px_0_0_#fff] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-yellow-400 rounded-full border-4 border-white shadow-[6px_6px_0_0_#fff] animate-bounce" />
        <div className="absolute top-1/3 right-10 w-12 h-12 bg-green-400 rounded-full border-2 border-white shadow-[4px_4px_0_0_#fff] animate-ping" />
        <div className="absolute bottom-1/3 left-20 w-14 h-14 bg-red-400 rounded-full border-3 border-white shadow-[5px_5px_0_0_#fff] animate-pulse" />
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
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-pulse">
                Movies
              </span>
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
              That Follow Your{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-bounce">
                Imagination
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-purple-200 font-bold max-w-2xl mx-auto opacity-80">
              Move your cursor and watch the magic happen
            </p>
          </div>
        </article>
      </ImageCursorTrail>
    </section>
  )
}

export default MovieCursorTrail
