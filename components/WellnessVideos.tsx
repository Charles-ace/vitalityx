'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, PlayCircle, Clock, ExternalLink } from 'lucide-react'

interface WellnessVideo {
  id: string
  title: string
  channel: string
  duration: string
  category: string
  thumbnail: string
  youtubeId: string
}

const WELLNESS_VIDEOS: WellnessVideo[] = [
  {
    id: '1',
    title: 'Science of Optimal Sleep — Full Protocol',
    channel: 'Andrew Huberman',
    duration: '2h 4m',
    category: 'Sleep',
    thumbnail: 'https://i.ytimg.com/vi/nm1TxQj9IsQ/maxresdefault.jpg',
    youtubeId: 'nm1TxQj9IsQ',
  },
  {
    id: '2',
    title: 'Longevity Biomarkers — What to Track & Why',
    channel: 'Peter Attia MD',
    duration: '1h 18m',
    category: 'Lab Tests',
    thumbnail: 'https://i.ytimg.com/vi/cX7aVqMW9CU/maxresdefault.jpg',
    youtubeId: 'cX7aVqMW9CU',
  },
  {
    id: '3',
    title: 'Knee Injury Rehab — Evidence-Based Protocol',
    channel: 'JeffNippard',
    duration: '22m',
    category: 'Recovery',
    thumbnail: 'https://i.ytimg.com/vi/YQ6OwxJg3eM/maxresdefault.jpg',
    youtubeId: 'YQ6OwxJg3eM',
  },
  {
    id: '4',
    title: 'Hormone Optimization for Longevity',
    channel: 'Peter Attia MD',
    duration: '58m',
    category: 'Telehealth',
    thumbnail: 'https://i.ytimg.com/vi/HxjdIWRqmGQ/maxresdefault.jpg',
    youtubeId: 'HxjdIWRqmGQ',
  },
  {
    id: '5',
    title: 'Cold Exposure & Deliberate Heat for Recovery',
    channel: 'Andrew Huberman',
    duration: '1h 12m',
    category: 'Recovery',
    thumbnail: 'https://i.ytimg.com/vi/x3MgDtZovks/maxresdefault.jpg',
    youtubeId: 'x3MgDtZovks',
  },
  {
    id: '6',
    title: 'Understanding Your Blood Panel Results',
    channel: 'Peter Attia MD',
    duration: '44m',
    category: 'Lab Tests',
    thumbnail: 'https://i.ytimg.com/vi/UF5G1EtLoVY/maxresdefault.jpg',
    youtubeId: 'UF5G1EtLoVY',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Sleep: 'bg-indigo-50 text-indigo-700',
  'Lab Tests': 'bg-emerald-50 text-emerald-700',
  Recovery: 'bg-amber-50 text-amber-700',
  Telehealth: 'bg-blue-50 text-blue-700',
}

export function WellnessVideos() {
  const [activeVideo, setActiveVideo] = useState<WellnessVideo | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(WELLNESS_VIDEOS.map((v) => v.category)))]
  const filtered =
    activeFilter === 'All' ? WELLNESS_VIDEOS : WELLNESS_VIDEOS.filter((v) => v.category === activeFilter)

  const closeModal = useCallback(() => setActiveVideo(null), [])

  // Close modal on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [closeModal])

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = activeVideo ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [activeVideo])

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10" data-animate="fade-up">
        <div>
          <span className="text-xs font-extrabold text-clinical-red uppercase tracking-wider">
            Wellness Resource Hub
          </span>
          <span className="accent-bar" />
          <h2 className="text-3xl font-extrabold text-clinical-text tracking-tight mt-1">
            Evidence-based wellness content
          </h2>
          <p className="text-sm text-clinical-muted mt-2 max-w-xl leading-relaxed">
            Curated videos from leading longevity researchers to support each procurement category.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                activeFilter === cat
                  ? 'bg-clinical-red text-white border-clinical-red shadow-md scale-[1.03]'
                  : 'bg-white text-clinical-muted border-clinical-border hover:border-clinical-text hover:text-clinical-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((video, idx) => (
          <div
            key={video.id}
            onClick={() => setActiveVideo(video)}
            className="video-card group"
            data-animate="fade-up"
            data-animate-delay={String(((idx % 3) + 1) * 100)}
            role="button"
            tabIndex={0}
            aria-label={`Play: ${video.title}`}
            onKeyDown={(e) => e.key === 'Enter' && setActiveVideo(video)}
          >
            {/* Thumbnail */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnail}
              alt={video.title}
              loading="lazy"
              onError={(e) => {
                // Fallback to lower-res thumbnail if maxresdefault fails
                const img = e.currentTarget
                img.src = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
              }}
            />

            {/* Play Button Overlay */}
            <div className="play-btn">
              <div className="play-circle">
                <PlayCircle className="w-6 h-6 text-clinical-red" />
              </div>
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${CATEGORY_COLORS[video.category] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {video.category}
              </span>
            </div>

            {/* Duration badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {video.duration}
            </div>

            {/* Title / channel overlay */}
            <div className="video-label">
              <p className="font-extrabold text-[13px] leading-snug">{video.title}</p>
              <p className="text-[11px] text-white/70 mt-0.5 font-medium">{video.channel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* VIDEO MODAL */}
      {activeVideo && (
        <div
          className="video-modal-backdrop"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
        >
          <div className="video-modal-inner">
            {/* Close button */}
            <button
              className="video-modal-close"
              onClick={closeModal}
              aria-label="Close video"
            >
              <X className="w-4 h-4" />
            </button>

            {/* YouTube Embed */}
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Meta below modal */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 text-white/80 text-xs font-semibold">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${CATEGORY_COLORS[activeVideo.category] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {activeVideo.category}
            </span>
            <span>{activeVideo.title}</span>
            <span className="text-white/40">•</span>
            <span>{activeVideo.channel}</span>
            <a
              href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              YouTube
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
