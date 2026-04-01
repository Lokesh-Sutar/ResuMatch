declare module 'aos' {
  interface AosOptions {
    offset?: number
    delay?: number
    duration?: number
    easing?: string
    once?: boolean
    mirror?: boolean
    anchorPlacement?:
      | 'top-bottom'
      | 'top-center'
      | 'top-top'
      | 'center-bottom'
      | 'center-center'
      | 'center-top'
      | 'bottom-bottom'
      | 'bottom-center'
      | 'bottom-top'
  }

  interface AosApi {
    init: (options?: AosOptions) => void
    refresh: () => void
    refreshHard: () => void
  }

  const AOS: AosApi
  export default AOS
}
