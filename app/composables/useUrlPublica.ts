export function useUrlPublica() {
  const roteador = useRouter()

  function getUrlAbsoluta(caminho: string) {
    const href = roteador.resolve(caminho).href
    if (!import.meta.client) return href
    return new URL(href, window.location.origin).href
  }

  return { getUrlAbsoluta }
}
