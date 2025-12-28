window.CONFIG = {
  crawl: `Thank you for watching The Prism Network!`,
  greeting: 'Show me the sunny!',
  language: 'en-US',
  countryCode: 'US',
  units: 'm',
  unitField: 'imperial',
  loop: false,
  locationMode: "POSTAL",
  secrets: {
    twcAPIKey: 'e1f10a1e78da46f5b10a1e78da96f525'
  },

  locationOptions: [],
  options: [],

  addLocationOption: (id, name, desc) => {
    CONFIG.locationOptions.push({ id, name, desc })
  },
  addOption: (id, name, desc) => {
    CONFIG.options.push({ id, name, desc })
  },

  // Load JSON and auto-set values
  loadRemoteLocation: async () => {
    try {
      const res = await fetch('https://config.prismtv.xyz/1-l8.json', { cache: 'no-store' })
      const data = await res.json()

      CONFIG.locationMode = "AIRPORT"

      if (data.airport) localStorage.setItem('airport-code', data.airport)
      if (data.displayName) localStorage.setItem('displayName', data.displayName)
      if (data.crawl) {
        CONFIG.crawl = data.crawl
        localStorage.setItem('crawlText', data.crawl)
      }
      if (data.greeting) {
        CONFIG.greeting = data.greeting
        localStorage.setItem('greetingText', data.greeting)
      }
      if (data.background) {
        localStorage.setItem('background-url', data.background)
      }

      console.log('[Prism] Remote location loaded:', data)
    } catch (err) {
      console.warn('[Prism] Failed to load remote config', err)
    }
  },

  setMainBackground: () => {
    const bgUrl = localStorage.getItem('background-url')
    getElement('background-image').style.backgroundImage = bgUrl
      ? `url(${bgUrl})`
      : 'url(https://picsum.photos/1920/1080/?random)'
  },

  submit: () => {
    CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')
    fetchCurrentWeather()
  },

  load: async () => {
    await CONFIG.loadRemoteLocation()

    // set background immediately
    CONFIG.setMainBackground()

    // auto-submit to start everything
    CONFIG.submit()
  }
}

// Start automatically
CONFIG.load()
