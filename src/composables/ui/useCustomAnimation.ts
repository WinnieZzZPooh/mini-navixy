import gsap from 'gsap'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

export function useCustomAnimation() {
  const sidebarAnimation = {
    beforeEnter: (el: Element) => {
      const panel = el as HTMLElement
      gsap.set(panel, {
        transformOrigin: 'left center',
        x: -320,
        opacity: 0,
        scale: 0.8,
      })
    },

    onEnter: (el: Element, done: () => void) => {
      const panel = el as HTMLElement
      const tl = gsap.timeline({
        onComplete: () => {
          done()
        },
      })

      tl.to(panel, {
        duration: 0.2,
        x: 40,
        scale: 1.05,
        opacity: 1,
        boxShadow: '2px 0 15px rgba(0, 0, 0, 0.2)',
        ease: 'power2.out',
      }).to(panel, {
        duration: 1,
        x: 0,
        scale: 1,
        ease: 'elastic.out(1, 0.5)',
      })
    },

    onLeave: (el: Element, done: () => void) => {
      const panel = el as HTMLElement
      gsap.to(panel, {
        duration: 0.5,
        x: -320,
        opacity: 0,
        scale: 0.8,
        boxShadow: '0px 0px 0px rgba(0, 0, 0, 0)',
        ease: 'power3.inOut',
        onComplete: done,
      })
    },
  }

  const infoPanelAnimation = {
    beforeEnter: (el: Element) => {
      gsap.set(el, {
        opacity: 0,
        x: -320,
        transformOrigin: 'left center',
        scale: 0.8,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0)',
      })
    },

    onEnter: (el: Element, done: () => void) => {
      const tl = gsap.timeline({
        onComplete: done,
      })

      tl.to(el, {
        duration: 0.3,
        opacity: 1,
        x: uiStore.isSidebarOpen ? 310 : 60,
        y: 10,
        scale: 1,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        ease: 'power3.out',
      })
    },

    beforeLeave: (el: Element) => {
      gsap.set(el, {
        transformOrigin: 'left center',
      })
    },

    onLeave: (el: Element, done: () => void) => {
      gsap.to(el, {
        duration: 0.2,
        opacity: 0,
        x: -320,
        scale: 0.8,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0)',
        onComplete: done,
      })
    },
  }

  const rightPanelAnimation = {
    beforeEnter: (el: Element) => {
      gsap.set(el, {
        opacity: 0,
        x: 100,
        transformOrigin: 'right center',
        scale: 0.9,
      })
    },

    onEnter: (el: Element, done: () => void) => {
      gsap.to(el, {
        duration: 0.3,
        opacity: 1,
        x: 0,
        scale: 1,
        ease: 'power2.out',
        onComplete: done,
      })
    },

    onLeave: (el: Element, done: () => void) => {
      gsap.to(el, {
        duration: 0.2,
        opacity: 0,
        x: 100,
        scale: 0.9,
        ease: 'power2.in',
        onComplete: done,
      })
    },
  }

  const animateTextScramble = (element: HTMLElement, originalText: string, newText: string) => {
    const duration = 0.5
    const chars = '!<>-_\\/[]{}—=+*^?#________'

    const timeline = gsap.timeline()

    const steps = 10
    const textSteps = []

    for (let i = 0; i < steps; i++) {
      let scrambledText = ''
      const progress = i / steps

      for (let j = 0; j < originalText.length; j++) {
        if (Math.random() < progress) {
          scrambledText += chars[Math.floor(Math.random() * chars.length)]
        } else {
          scrambledText += originalText[j]
        }
      }

      textSteps.push(scrambledText)
    }

    textSteps.forEach((text, index) => {
      timeline.to(
        element,
        {
          duration: duration / (steps * 2),
          onUpdate: () => {
            element.textContent = text
          },
          ease: 'none',
        },
        index * (duration / (steps * 2)),
      )
    })

    const finalSteps = 5
    for (let i = 0; i < finalSteps; i++) {
      let finalText = ''
      const progress = i / finalSteps

      if (newText) {
        for (let j = 0; j < newText.length; j++) {
          if (Math.random() < progress) {
            finalText += newText[j]
          } else {
            finalText += chars[Math.floor(Math.random() * chars.length)]
          }
        }
      } else {
        finalText = originalText
      }

      const position = duration / 2 + i * (duration / (finalSteps * 2))
      timeline.to(
        element,
        {
          duration: duration / (finalSteps * 2),
          onUpdate: () => {
            element.textContent = finalText
          },
          ease: 'none',
        },
        position,
      )
    }

    timeline.to(element, {
      duration: 0.1,
      onComplete: () => {
        element.textContent = newText
      },
    })

    return timeline
  }

  return {
    sidebarAnimation,
    infoPanelAnimation,
    rightPanelAnimation,
    animateTextScramble,
  }
}
