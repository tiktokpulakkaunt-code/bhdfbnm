"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import type { User } from "@/types"
import { gameLogic } from "@/lib/game-logic"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface TapSectionProps {
  user: User
  onTap: (event?: React.MouseEvent | React.TouchEvent) => any
  onOpenRank: () => void
}

export const TapSection = ({ user, onTap, onOpenRank }: TapSectionProps) => {
  const [tapEffects, setTapEffects] = useState<
    Array<{ id: number; x: number; y: number; amount: number; type: string }>
  >([])
  const [isPressed, setIsPressed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const effectIdRef = useRef(0)
  const { toast } = useToast()

  const energyPercentage = (user.tapsLeft / user.energyLimit) * 100
  const { rank, icon } = gameLogic.calculateRank(user.totalEarned)

  const handleTapStart = useCallback(() => {
    setIsPressed(true)
  }, [])

  const handleTapEnd = useCallback(() => {
    setIsPressed(false)
  }, [])

  const handleTap = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      // Remove preventDefault to avoid passive event listener warning

      const result = onTap(event)

      if (result?.success) {
        // Show toast for special taps
        if (result.type === "critical") {
          toast({
            title: "🔥 Critical Hit!",
            description: `+${gameLogic.formatNumber(result.earned)} UC`,
            duration: 2000,
          })
        } else if (result.type === "jackpot") {
          toast({
            title: "🎰 JACKPOT!",
            description: `Amazing! +${gameLogic.formatNumber(result.earned)} UC`,
            duration: 3000,
          })
        }

        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          let clientX, clientY

          if ("clientX" in event) {
            clientX = event.clientX
            clientY = event.clientY
          } else if (event.touches && event.touches[0]) {
            clientX = event.touches[0].clientX
            clientY = event.touches[0].clientY
          } else {
            clientX = rect.left + rect.width / 2
            clientY = rect.top + rect.height / 2
          }

          const x = clientX - rect.left
          const y = clientY - rect.top

          const effect = {
            id: effectIdRef.current++,
            x,
            y,
            amount: result.earned,
            type: result.type,
          }

          setTapEffects((prev) => [...prev, effect])

          setTimeout(() => {
            setTapEffects((prev) => prev.filter((e) => e.id !== effect.id))
          }, 1000)
        }
      }
    },
    [onTap],
  )

  return (
    <>
      {/* Responsive Header for larger screens */}
      <div className="hidden min-h-[800px]:block lg:min-h-[900px]:block">
        <div className="flex items-center gap-2 mb-4 px-4">
          {/* Rank Button */}
          <button
            onClick={onOpenRank}
            className="relative bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-xl p-3 lg:p-4 hover:border-yellow-500/60 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-500/40 group overflow-hidden flex flex-col items-center justify-center min-w-[60px] lg:min-w-[80px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20 animate-pulse" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75" />

            <div className="relative text-center">
              <div className="text-xl lg:text-2xl mb-1 animate-bounce">{icon}</div>
              <div className="text-sm lg:text-base text-yellow-400 font-bold bg-black/30 px-2 py-1 rounded-full">#{rank}</div>
            </div>
          </button>

          {/* Enhanced Stats for larger screens */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-black/30 border border-orange-400/30 rounded-xl p-3 lg:p-4 text-center">
              <div className="text-xl lg:text-2xl mb-1">🔥</div>
              <div className="text-orange-400 font-bold text-lg lg:text-xl">{user.combo}</div>
              <div className="text-sm text-gray-300 font-semibold uppercase tracking-wide">COMBO</div>
            </div>

            <div className="bg-black/30 border border-blue-400/30 rounded-xl p-3 lg:p-4 text-center">
              <div className="text-xl lg:text-2xl mb-1">⚡</div>
              <div className="text-blue-400 font-bold text-lg lg:text-xl">{user.streak}</div>
              <div className="text-sm text-gray-300 font-semibold uppercase tracking-wide">STREAK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Original compact header for smaller screens */}
      <div className="block min-h-[800px]:hidden lg:min-h-[900px]:hidden pb-4">

    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Main Tap Area - 800px da 2%, 850px da 6%, 900px+ da 8% pastroqqa */}
      <div className="flex-1 flex flex-col items-center justify-start pt-[4vh] sm:pt-[6vh] md:pt-[10vh] lg:pt-[4.24vh] xl:pt-[4.32vh] px-1 sm:px-3 py-2 sm:py-4 md:py-6 lg:py-9 xl:py-11">
        {/* Coin Container - 800px dan uzun ekranlarda kattalashadi */}
        <div className="relative mb-4 sm:mb-6 md:mb-8 lg:mb-14 xl:mb-16" ref={containerRef}>
          <div
            className={`relative w-[80vw] h-[80vw] max-w-[360px] max-h-[360px] sm:max-w-[450px] sm:max-h-[450px] md:max-w-[600px] md:max-h-[600px] lg:max-w-[800px] lg:max-h-[800px] xl:max-w-[960px] xl:max-h-[960px] mx-auto cursor-pointer transition-transform duration-200 group ${
              isPressed ? "scale-95" : "hover:scale-105"
            }`}
            onClick={handleTap}
            onTouchStart={(e) => {
              handleTapStart()
              handleTap(e)
            }}
            onTouchEnd={handleTapEnd}
            onMouseDown={handleTapStart}
            onMouseUp={handleTapEnd}
            onMouseLeave={handleTapEnd}
            style={{ touchAction: 'none' }}
          >
            {/* Aura Layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/15 via-cyan-400/15 to-indigo-400/15 rounded-full animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20 rounded-full animate-ping" />

            {/* Main Coin Container */}
            <div className="relative z-10 w-full h-full bg-gradient-to-br from-teal-400/25 to-cyan-400/25 rounded-full border-4 border-teal-400/50 shadow-2xl shadow-teal-400/50 flex items-center justify-center overflow-hidden backdrop-blur-md">
              {/* Inner Glow */}
              <div className="absolute inset-4 bg-gradient-to-br from-teal-300/15 to-cyan-300/15 rounded-full animate-pulse" />

              {/* Coin Image - 800px dan uzun ekranlarda kattalashadi */}
              <div className={`relative z-20 transition-transform duration-200 flex items-center justify-center w-full h-full ${isPressed ? "scale-90" : ""}`}>
                <Image
                  src="/images/uc-coin.png"
                  alt="UC Coin"
                  width={600}
                  height={600}
                  className="w-[88%] h-[88%] sm:w-[93%] sm:h-[93%] md:w-[98%] md:h-[98%] lg:w-[104%] lg:h-[104%] xl:w-[110%] xl:h-[110%] object-contain drop-shadow-2xl"
                  priority
                  quality={80}
                />
              </div>

              {/* Tap Ripple Effect */}
              <div
                className={`absolute inset-0 rounded-full border-4 border-white/25 transition-all duration-200 ${
                  isPressed ? "scale-100 opacity-0" : "scale-0 opacity-70"
                }`}
              />
            </div>

            {/* Tap Effects - 800px dan uzun ekranlarda kattalashadi */}
            {tapEffects.map((effect) => (
              <div
                key={effect.id}
                className={`absolute pointer-events-none z-30 font-bold select-none ${
                  effect.type === "critical"
                    ? "text-red-300 text-base sm:text-lg md:text-xl lg:text-3xl xl:text-4xl drop-shadow-lg animate-bounce-up-critical font-extrabold lg:font-black xl:font-black"
                    : effect.type === "jackpot"
                    ? "text-green-300 text-lg sm:text-xl md:text-2xl lg:text-4xl xl:text-5xl drop-shadow-xl animate-bounce-up-jackpot font-extrabold lg:font-black xl:font-black"
                    : "text-orange-300 text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl drop-shadow-md animate-bounce-up font-extrabold lg:font-black xl:font-black"
                }`}
                style={{
                  left: effect.x,
                  top: effect.y,
                  transform: "translate(-50%, -50%)",
                  textShadow: "0 0 12px currentColor",
                }}
              >
                +{gameLogic.formatNumber(effect.amount)}
                {effect.type === "jackpot" && " 🎰"}
                {effect.type === "critical" && " 🔥"}
              </div>
            ))}

            {/* Floating Particles - 800px dan uzun ekranlarda kattalashadi */}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 lg:w-5 lg:h-5 xl:w-7 xl:h-7 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-ping opacity-25"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${15 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Tap Instruction with Rank Button - Ekran enining 80% ni egallaydi, ichidagilar to'liq moslashadi */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-5 lg:gap-8 xl:gap-14 w-[80%] z-10 justify-between">
          {/* Rank Button */}
          <button
            onClick={onOpenRank}
            aria-label={`View rank ${rank}`}
            className="flex-1 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400/50 rounded-xl p-1.5 sm:p-2 md:p-3 lg:p-6 xl:p-8 hover:border-yellow-400/70 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-400/40 group overflow-hidden"
          >
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-[2.4rem] xl:text-[3.2rem] mb-0.5 sm:mb-1 md:mb-1.5 lg:mb-3 xl:mb-3.5 animate-bounce font-extrabold lg:font-black xl:font-black">{icon}</div>
              <div className="text-[0.65rem] sm:text-xs md:text-sm lg:text-[1.2rem] xl:text-[1.6rem] text-yellow-300 font-extrabold lg:font-black xl:font-black">#{rank}</div>
            </div>
          </button>

          {/* Tap Instruction */}
          <div className="flex-1 bg-gradient-to-r from-black/40 to-gray-800/40 backdrop-blur-md border-2 border-teal-400/50 rounded-xl px-3 sm:px-5 md:px-7 lg:px-12 xl:px-16 py-1.5 sm:py-2 md:py-3 lg:py-6 xl:py-8 shadow-lg shadow-teal-400/30 z-10">
            <p className="text-teal-300 font-bold text-xs sm:text-sm md:text-base lg:text-[1.2rem] xl:text-[1.8rem] flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-6 xl:gap-8 font-extrabold lg:font-black xl:font-black justify-center">
              <span className="animate-bounce text-base sm:text-lg md:text-xl lg:text-[2.4rem] xl:text-[3.2rem]">👆</span>
              <span className="mb-0.5 sm:mb-1 md:mb-2 lg:mb-[3.5em] xl:mb-[5em]">Tap to Mine UC!</span>
              <span className="animate-pulse text-base sm:text-lg md:text-xl lg:text-[2.4rem] xl:text-[3.2rem]">💎</span>
            </p>
          </div>
        </div>

        {/* Energy System - Eng pastki qism, 800px dan uzun ekranlarda juda pastga tushadi */}
        <div className="relative mx-1 sm:mx-3 md:mx-5 lg:mx-8 xl:mx-10 mt-4 sm:mt-6 md:mt-10 lg:mt-24 xl:mt-40 bg-gradient-to-r from-black/40 to-gray-800/40 backdrop-blur-md border-2 border-teal-400/50 rounded-xl p-3 sm:p-4 md:p-5 lg:p-[3.6rem] xl:p-[4.8rem] w-[calc(100%-0.5rem)] sm:w-[calc(100%-1.5rem)] md:w-[calc(100%-2.5rem)] lg:w-[calc(100%-4.8rem)] xl:w-[calc(100%-6rem)] max-w-[640px] sm:max-w-[720px] md:max-w-[800px] lg:max-w-[960px] xl:max-w-[1200px] min-h-[80px] sm:min-h-[90px] md:min-h-[100px] lg:min-h-[140px] xl:min-h-[192px] z-20">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-[12rem] lg:h-[12rem] xl:w-[16rem] xl:h-[16rem] bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl flex items-center justify-center text-lg sm:text-2xl md:text-3xl lg:text-[3.6rem] xl:text-[4.8rem] shadow-lg overflow-hidden font-extrabold lg:font-black xl:font-black">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-400/25 to-yellow-400/25 animate-pulse" />
                <span className="relative">⚡</span>
              </div>
              <div>
                <p className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-[2.4rem] xl:text-[3.2rem] font-display font-extrabold lg:font-black xl:font-black">
                  {user.tapsLeft} / {user.energyLimit}
                </p>
                <p className="text-xs sm:text-sm md:text-base lg:text-[1.2rem] xl:text-[1.6rem] text-gray-200 font-semibold uppercase tracking-wide font-extrabold lg:font-black xl:font-black">Energy</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base sm:text-lg md:text-xl lg:text-[2.4rem] xl:text-[3.2rem] font-bold text-yellow-300 drop-shadow-lg font-display font-extrabold lg:font-black xl:font-black">
                {Math.round(energyPercentage)}%
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-[1.2rem] xl:text-[1.6rem] text-gray-300 font-extrabold lg:font-black xl:font-black">Charged</div>
            </div>
          </div>

          {/* Progress Bar - 800px dan uzun ekranlarda kattalashadi */}
          <div className="relative w-full h-2 sm:h-3 md:h-4 lg:h-[2.4rem] xl:h-[3.2rem] bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600/40 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-yellow-400/70 via-orange-400/70 to-red-400/70 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${energyPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>

            {energyPercentage > 50 && (
              <div className="absolute top-0.5 left-1/4 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 lg:w-[1.8rem] lg:h-[1.8rem] xl:w-[2.4rem] xl:h-[2.4rem] bg-yellow-300 rounded-full animate-ping" />
            )}
          </div>
        </div>
      </div>
    </div>
      </div>
    </>
  )
}