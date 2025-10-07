import * as React from "react"

// O breakpoint foi aumentado para 1025px para incluir larguras de tablets (iPad).
// Telas com 768px, 820px e 1024px de largura agora serão consideradas "mobile".
const MOBILE_BREAKPOINT = 1025

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
    // A media query agora usa o novo breakpoint.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    
    // Define o estado inicial na montagem do componente.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Limpa o event listener na desmontagem.
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Durante a hidratação, sempre retorna false para evitar inconsistências.
  if (!hasMounted) {
    return false
  }

  return isMobile
}
