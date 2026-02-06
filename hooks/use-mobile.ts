import * as React from "react"

// O breakpoint foi aumentado para 1025px para incluir larguras de tablets (iPad).
// Telas com 768px, 820px e 1024px de largura agora serão consideradas "mobile".
const MOBILE_BREAKPOINT = 1025

// Detecta se o dispositivo é um iPad
function isIPad(): boolean {
  if (typeof window === "undefined") return false
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIPadUserAgent = /ipad/.test(userAgent) || 
    (/macintosh/.test(userAgent) && 'ontouchend' in document)
  
  return isIPadUserAgent
}

// Verifica se o iPad está em modo landscape
function isIPadLandscape(): boolean {
  if (!isIPad()) return false
  
  // iPad em landscape tem largura maior que altura
  return window.innerWidth > window.innerHeight
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
    // A media query agora usa o novo breakpoint.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      // Considera mobile se:
      // 1. A largura é menor que o breakpoint OU
      // 2. É um iPad em modo landscape
      const shouldBeMobile = window.innerWidth < MOBILE_BREAKPOINT || isIPadLandscape()
      setIsMobile(shouldBeMobile)
    }
    
    mql.addEventListener("change", onChange)
    
    // Também escuta mudanças de orientação para detectar quando iPad muda de portrait para landscape
    window.addEventListener("orientationchange", onChange)
    window.addEventListener("resize", onChange)
    
    // Define o estado inicial na montagem do componente.
    const shouldBeMobile = window.innerWidth < MOBILE_BREAKPOINT || isIPadLandscape()
    setIsMobile(shouldBeMobile)
    
    // Limpa os event listeners na desmontagem.
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("orientationchange", onChange)
      window.removeEventListener("resize", onChange)
    }
  }, [])

  // Durante a hidratação, sempre retorna false para evitar inconsistências.
  if (!hasMounted) {
    return false
  }

  return isMobile
}
