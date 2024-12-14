import { useEffect, useState, useRef } from 'react'
import '../App.css'
import NeuralNetwork from '../components/NeuralNetwork'
import Loading from '../components/Loading'
import '../styles/colors.css'

const aiThoughts = [
  "Processing authentic human intelligence...",
  "Optimizing agent-to-agent data flows...",
  "Analyzing community sentiment patterns...",
  "Cross-referencing upstream data sources...",
  "Validating source data authenticity...",
  "Deploying autonomous agent crews...",
  "Semantic analysis in progress...",
  "Real-time intelligence gathering active...",
  "Monitoring community signal strength...",
  "Establishing broker node connections..."
]

function Landing() {
  const [showLoader, setShowLoader] = useState(true)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const easterEggTimeoutRef = useRef(null)

  useEffect(() => {
    // Initialize loader
    const initLoader = () => {
      const neuralGrid = document.querySelector('.neural-grid')
      if (!neuralGrid) return

      // Create neurons
      for (let i = 0; i < 30; i++) {
        const neuron = document.createElement('div')
        neuron.className = 'neuron'
        neuron.style.width = `${Math.random() * 4 + 2}px`
        neuron.style.height = neuron.style.width
        neuron.style.left = `${Math.random() * 100}%`
        neuron.style.top = `${Math.random() * 100}%`
        neuron.style.backgroundColor = 'var(--grey-light)'
        
        gsap.to(neuron, {
          opacity: 0.9,
          duration: Math.random() * 1.5 + 1,
          repeat: -1,
          yoyo: true,
          delay: Math.random()
        })

        gsap.to(neuron, {
          scale: Math.random() * 2 + 1,
          duration: Math.random() * 3 + 2,
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2
        })

        neuralGrid.appendChild(neuron)
      }

      // Create synapses
      for (let i = 0; i < 40; i++) {
        const synapse = document.createElement('div')
        synapse.className = 'synapse'
        synapse.style.width = `${Math.random() * 150 + 50}px`
        synapse.style.left = `${Math.random() * 100}%`
        synapse.style.top = `${Math.random() * 100}%`
        synapse.style.transform = `rotate(${Math.random() * 360}deg)`
        synapse.style.backgroundColor = 'var(--grey-dark)'

        gsap.to(synapse, {
          opacity: 0.5,
          duration: Math.random() * 1.5 + 1,
          repeat: -1,
          yoyo: true,
          delay: Math.random()
        })

        neuralGrid.appendChild(synapse)
      }

      // Create quantum particles
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div')
        particle.className = 'quantum-particle'
        particle.style.backgroundColor = 'var(--primary-yellow)'
        
        gsap.set(particle, {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        })

        gsap.to(particle, {
          duration: Math.random() * 8 + 4,
          motionPath: {
            path: [
              {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight},
              {x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight}
            ],
            autoRotate: true
          },
          repeat: -1,
          ease: "none"
        })

        neuralGrid.appendChild(particle)
      }

      // Create floating initialization texts
      const initializationPhrases = [
        "Initializing agent network protocols",
        "Establishing secure data pipelines",
        "Calibrating intelligence gathering modules",
        "Synchronizing agent communication channels",
        "Validating source data authenticity",
        "Optimizing cross-agent data flows",
        "Engaging semantic analysis engines",
        "Activating real-time monitoring systems"
      ]

      for (let i = 0; i < 4; i++) {
        const text = document.createElement('div')
        text.className = 'initialization-text'
        text.textContent = initializationPhrases[i % initializationPhrases.length]
        text.style.left = `${Math.random() * 70 + 15}%`
        text.style.top = `${Math.random() * 70 + 15}%`
        text.style.color = 'var(--primary-white)'
        text.style.fontFamily = 'Orbitron, sans-serif'
        
        gsap.to(text, {
          opacity: 0.5,
          duration: 3,
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 5
        })

        gsap.to(text, {
          y: '-=30',
          duration: Math.random() * 4 + 3,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        })

        neuralGrid.appendChild(text)
      }
    }

    // Create and animate sci-fi text
    const createSciFiText = () => {
      // Create container for final company branding
      const brandContainer = document.createElement('div')
      brandContainer.className = 'brand-container'
      document.body.appendChild(brandContainer)

      // Create company name
      const companyName = document.createElement('img')
      companyName.src = '/assets/images/4GENTIC_white.png'
      companyName.className = 'company-name'
      brandContainer.appendChild(companyName)

      // Create company face
      const companyFace = document.createElement('img')
      companyFace.src = '/assets/images/profile_lowres_nobg.png'
      companyFace.className = 'company-face'
      companyFace.style.marginBottom = '10px'
      brandContainer.appendChild(companyFace)

      // Create product tiles container
      const productTilesContainer = document.createElement('div')
      productTilesContainer.className = 'product-tiles'
      document.body.appendChild(productTilesContainer)

      // Create products
      const products = [
        {
          title: 'Agentic Summaries',
          subtitle: '(for Humans)',
          description: 'Insights of your favorite Telegram channels and Subreddits delivered multiple times per day tailored to your interests',
          link: '/summaries',
          clickable: true
        },
        {
          title: 'API Access',
          subtitle: '(For Agents)',
          description: 'A programmatic interface to enable downstream agents to make decisions based on authentic, upstream information',
          link: '/api',
          clickable: false
        },
        {
          title: 'Real Time Semantic Monitoring',
          subtitle: '(For Humans and Agents)',
          description: 'Advanced semantic analysis to detect and alert users to critical information the moment it emerges',
          link: '/monitoring',
          clickable: false
        }
      ]

      products.forEach((product, index) => {
        const tile = document.createElement('div')
        tile.className = `product-tile ${product.clickable ? 'clickable' : 'coming-soon'}`
        if (product.clickable) {
          tile.onclick = () => window.location.href = product.link
        }

        const title = document.createElement('h3')
        title.textContent = `${product.title} ${product.subtitle}`
        
        const description = document.createElement('p')
        description.textContent = product.description

        tile.appendChild(title)
        tile.appendChild(description)
        productTilesContainer.appendChild(tile)
      })

      // Create litepaper tile
      const litepaperTile = document.createElement('div')
      litepaperTile.className = 'litepaper-tile'
      litepaperTile.style.marginTop = '10px'
      litepaperTile.style.marginBottom = '30px'
      brandContainer.appendChild(litepaperTile)

      const litepaperButton = document.createElement('button')
      litepaperButton.className = 'litepaper-button'
      litepaperButton.textContent = 'Read Litepaper'
      litepaperTile.appendChild(litepaperButton)

      const tldrButton = document.createElement('button')
      tldrButton.className = 'tldr-button'
      tldrButton.textContent = 'TLDR'
      litepaperTile.appendChild(tldrButton)

      // Add TLDR modal functionality
      tldrButton.addEventListener('click', () => {
        const modal = document.createElement('div')
        modal.className = 'tldr-modal'
        
        const modalContent = document.createElement('div')
        modalContent.className = 'tldr-modal-content'
        
        // Add font toggle
        const fontToggle = document.createElement('button')
        fontToggle.className = 'font-toggle'
        fontToggle.textContent = 'Aa'
        fontToggle.title = 'Toggle font style'
        modalContent.appendChild(fontToggle)
        
        const closeButton = document.createElement('button')
        closeButton.className = 'tldr-close-button'
        closeButton.innerHTML = '&times;'
        modalContent.appendChild(closeButton)
        
        const title = document.createElement('h2')
        title.textContent = 'Executive Summary'
        modalContent.appendChild(title)
        
        const summary = document.createElement('p')
        summary.innerHTML = `In a digital landscape increasingly dominated by AI agents, access to authentic source data has become the new
digital gold. The 4GS Protocol introduces a groundbreaking paradigm: the first-ever Agent-to-Agent (A2A) Data
Brokerage system, specifically designed to capture, process, and distribute genuine source intelligence from
fragmented data sources.<br><br>Through a sophisticated network of AI agents working together, the protocol monitors,
captures, and aggregates data across multiple platforms. This cross-platform approach ensures capture of authentic
community signals at their source, rather than relying on downstream information. Our upstream data collection and
distribution system allows AI agents to tap into interactions, decisions, and insights that are typically difficult to
capture effectively. 4GS serves as a crucial upstream data provider in the AI agent ecosystem, ensuring that
downstream agents, humans, and organizations can leverage unique source data effectively. <br><br> 4GS not only delivers
raw data but also performs semantic aggregations to produce context-aware insights, enabling users to make
informed decisions. 4GS addresses a fundamental challenge in the AI industry by providing scalable access to
authentic, real-time human intelligence through both raw data and actionable insights.`
        summary.style.fontFamily = 'Orbitron, sans-serif'
        summary.style.textAlign = 'justify'
        modalContent.appendChild(summary)
        
        modal.appendChild(modalContent)
        document.body.appendChild(modal)
        
        // Add font toggle functionality
        let isDefaultFont = true
        fontToggle.addEventListener('click', () => {
          isDefaultFont = !isDefaultFont
          summary.style.fontFamily = isDefaultFont ? 'Orbitron, sans-serif' : 'Arial, sans-serif'
          fontToggle.classList.toggle('active')
        })
        
        // Add close functionality
        const closeModal = () => {
          modal.remove()
        }
        
        closeButton.addEventListener('click', closeModal)
        modal.addEventListener('click', (e) => {
          if (e.target === modal) closeModal()
        })
      })

      // Animate everything simultaneously
      gsap.fromTo([companyName, companyFace, productTilesContainer, litepaperTile],
        { 
          opacity: 0,
          y: 20,
          scale: 0.8
        },
        { 
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          stagger: 0,  // Makes all elements animate at the same time
          onComplete: () => {
            // Add rotating glow effect to face
            gsap.to(companyFace, {
              rotate: 360,
              duration: 20,
              repeat: -1,
              ease: "none"
            })
            
            // Start showing random thoughts
            showRandomThoughts()
          }
        }
      )
    }

    // Show random AI thoughts
    const showRandomThoughts = () => {
      // Reduce number of simultaneous thoughts
      const numThoughts = 3  // Reduced from 6
      // Increase duration each thought stays visible
      const thoughtDuration = 3000  // Increased from 2000
      
      const createRandomThought = () => {
        const thought = document.createElement('div')
        thought.className = 'ai-thought'
        thought.style.position = 'fixed'
        thought.style.color = '#F4E409' // Using brand yellow
        thought.style.fontSize = '24px'
        thought.style.fontFamily = 'Orbitron, sans-serif'
        thought.style.opacity = '0'
        thought.style.zIndex = '1000'
        
        thought.textContent = aiThoughts[Math.floor(Math.random() * aiThoughts.length)]
        
        // Add to body temporarily to measure
        thought.style.visibility = 'hidden'
        document.body.appendChild(thought)
        const textWidth = thought.offsetWidth
        const textHeight = thought.offsetHeight
        document.body.removeChild(thought)
        thought.style.visibility = 'visible'

        // Position the thought
        const isMobile = window.innerWidth <= 600
        const padding = isMobile ? 20 : 50
        const maxAttempts = 50
        let attempts = 0
        let foundPosition = false
        
        while (attempts < maxAttempts && !foundPosition) {
          const availableHeight = window.innerHeight - textHeight - 200
          const section = availableHeight / 3
          const sectionIndex = Math.floor(attempts / (maxAttempts / 3))
          
          const maxLeft = window.innerWidth - textWidth - (isMobile ? 30 : padding * 2)
          const minLeft = isMobile ? 10 : padding
          const left = Math.random() * (maxLeft - minLeft) + minLeft
          
          let top
          if (isMobile) {
            const bottomPadding = 150
            top = Math.min(
              (sectionIndex * section) + Math.random() * (section - textHeight),
              window.innerHeight - bottomPadding - textHeight
            )
          } else {
            top = Math.random() * (window.innerHeight - textHeight - padding * 2) + padding
          }

          thought.style.left = left + 'px'
          thought.style.top = top + 'px'
          foundPosition = true
        }

        document.body.appendChild(thought)
        
        gsap.to(thought, {
          opacity: 0.15,  // Reduced from 1
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            setTimeout(() => {
              gsap.to(thought, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                  thought.remove()
                  // Add random delay before creating new thought
                  setTimeout(createRandomThought, Math.random() * 2000 + 1000)
                }
              })
            }, thoughtDuration + Math.random() * 2000) // Added more random delay
          }
        })
      }

      // Create initial set of thoughts with more delay between each
      for (let i = 0; i < numThoughts; i++) {
        setTimeout(createRandomThought, i * 1000) // Increased from 200
      }
    }

    // Initialize everything
    initLoader()
    createSciFiText()

    // Remove loader after delay
    setTimeout(() => {
      setShowLoader(false)
    }, 1500)

    // Cleanup
    return () => {
      if (easterEggTimeoutRef.current) {
        clearTimeout(easterEggTimeoutRef.current)
      }
    }
  }, [])

  // Handle easter egg
  const handleMoonClick = () => {
    setShowEasterEgg(true)
    
    // Clear existing timeout
    if (easterEggTimeoutRef.current) {
      clearTimeout(easterEggTimeoutRef.current)
    }

    // Hide easter egg after 3 seconds and start floating animation
    easterEggTimeoutRef.current = setTimeout(() => {
      setShowEasterEgg(false)
      // Start floating animation after easter egg disappears
      const neuralNetwork = document.querySelector('#neural-network')
      if (neuralNetwork) {
        const event = new CustomEvent('startFloating')
        neuralNetwork.dispatchEvent(event)
      }
    }, 3000)
  }

  return (
    <>
      {showLoader ? (
        <Loading />
      ) : (
        <>
          <NeuralNetwork />
          <div className="moon" onClick={handleMoonClick}></div>
          
          {showEasterEgg && (
            <div className="easter-egg-container" style={{ display: 'flex' }}>
              <img src="/assets/images/easteregg.png" alt="" className="easter-egg-image" />
              <div className="easter-egg-text">Every agent I know know I hate agents</div>
            </div>
          )}

          <div className="social-buttons">
            <a href="https://app.virtuals.io/virtuals/10669" target="_blank" rel="noopener noreferrer" className="social-button buy-button">Buy (Virtuals)</a>
            <a href="https://app.uniswap.org/#/swap?&chain=base&use=v2&outputCurrency=0x135fa55546758cf398da675a064f39d215ab1ff6" target="_blank" rel="noopener noreferrer" className="social-button buy-button">Buy (Uniswap)</a>
            <a href="https://x.com/4GS_virtuals" target="_blank" rel="noopener noreferrer" className="social-button">X</a>
            <a href="https://t.me/AGENTICVIRTUALS_BOT" target="_blank" rel="noopener noreferrer" className="social-button">Telegram</a>
            <a href="https://t.me/AGENTIC_COMMUNITY" target="_blank" rel="noopener noreferrer" className="social-button">Community</a>
            <a href="https://dexscreener.com/base/0x26db0e6d360fa999af88f54e0e9237339a84dc63" target="_blank" rel="noopener noreferrer" className="social-button">Dex</a>
          </div>

          <div className="mobile-resources">
            <button className="mobile-resources-button" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              Resources
            </button>
            {showMobileMenu && (
              <div className="mobile-resources-menu">
                <a href="https://app.virtuals.io/virtuals/10669" target="_blank" rel="noopener noreferrer" className="social-button buy-button">Buy via Virtuals</a>
                <a href="https://app.uniswap.org/#/swap?&chain=base&use=v2&outputCurrency=0x135fa55546758cf398da675a064f39d215ab1ff6" target="_blank" rel="noopener noreferrer" className="social-button buy-button">Buy via Uniswap</a>
                <a href="https://x.com/4GS_virtuals" target="_blank" rel="noopener noreferrer" className="social-button">X</a>
                <a href="https://t.me/AGENTICVIRTUALS_BOT" target="_blank" rel="noopener noreferrer" className="social-button">Telegram</a>
                <a href="https://t.me/AGENTIC_COMMUNITY" target="_blank" rel="noopener noreferrer" className="social-button">Community</a>
                <a href="https://dexscreener.com/base/0x26db0e6d360fa999af88f54e0e9237339a84dc63" target="_blank" rel="noopener noreferrer" className="social-button">Dex</a>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default Landing 
