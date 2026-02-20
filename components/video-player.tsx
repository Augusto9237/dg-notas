'use client'
import React, { useRef, useCallback } from 'react'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
    videoUrl: string
}
export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
    const wrapperRef = useRef<HTMLDivElement>(null)

    const disableDownload = useCallback(() => {
        const applyNoDownload = () => {
            const video = wrapperRef.current?.querySelector('video')
            if (video) {
                video.setAttribute('controlsList', 'nodownload')
                return true
            }
            return false
        }
        if (!applyNoDownload()) {
            setTimeout(applyNoDownload, 100)
        }
    }, [])

    return (
        <div ref={wrapperRef} className='w-full h-full'>
            <ReactPlayer
                src={videoUrl}
                width='100%'
                height='100%'
                controls={true}
                onReady={disableDownload}
            />
        </div>
    )
}