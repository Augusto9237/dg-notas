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
    }, [videoUrl])

    return (
        <div ref={wrapperRef} className='w-full h-auto aspect-video'>
            <ReactPlayer
                src={videoUrl}
                width='100%'
                height='100%'
                controls={true}
                onReady={disableDownload}
                light={<img src='/Sublogo1.svg' alt='Thumbnail' />}
                style={{ width: '100%', height: 'auto' }}
                config={{
                    html: {
                        attributes: {
                            controlsList: ['nodownload'],
                            preload: 'metadata', // Baixa apenas as informações básicas estruturais do vídeo, salvando gigabytes de banda caso o aluno não dê play
                        }
                    }
                }}
            />
        </div>
    )
}