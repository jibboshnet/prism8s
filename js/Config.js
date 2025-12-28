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

  // Location & Option Arrays
  locationOptions: [],
  options: [],

  addLocationOption: (id, name, desc) => {
    CONFIG.locationOptions.push({ id, name, desc })
  },
  addOption: (id, name, desc) => {
    CONFIG.options.push({ id, name, desc })
  },

  // Load remote JSON for auto airport and display info
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

      console.log('[Prism] Remote location loaded:', data)
    } catch (err) {
      console.warn('[Prism] Failed to load remote config', err)
    }
  },

  submit: (btn, e) => {
    let args = {}
    const currentLoop = (localStorage.getItem('loop') === 'y')

    CONFIG.locationOptions.forEach((opt) => {
      args[opt.id] = getElement(`${opt.id}-text`).value
      args[`${opt.id}-button`] = getElement(`${opt.id}-button`).checked
      if (!currentLoop) localStorage.setItem(opt.id, args[opt.id])
    })

    args['countryCode'] = getElement('country-code-text')?.value || 'US'
    if (!currentLoop) localStorage.setItem('countryCode', args['countryCode'])

    CONFIG.options.forEach((opt) => {
      args[opt.id] = getElement(`${opt.id}-text`).value
      if (!currentLoop) localStorage.setItem(opt.id, args[opt.id])
    })

    console.log(args)

    // Loop / localStorage overrides
    if (currentLoop) {
      if (localStorage.getItem('crawlText')) CONFIG.crawl = localStorage.getItem('crawlText')
      if (localStorage.getItem('greetingText')) CONFIG.greeting = localStorage.getItem('greetingText')
      if (localStorage.getItem('countryCode')) CONFIG.countryCode = localStorage.getItem('countryCode')
    } else {
      if (args.crawlText) CONFIG.crawl = args.crawlText
      if (args.greetingText) CONFIG.greeting = args.greetingText
      if (args.countryCode) CONFIG.countryCode = args.countryCode
      if (args.loop === 'y') CONFIG.loop = true
    }

    // Force AIRPORT if enabled or remote loaded
    if (CONFIG.locationMode === "AIRPORT" || args['airport-code-button'] === true) {
      CONFIG.locationMode = "AIRPORT"
      if (!args['airport-code'] && !localStorage.getItem('airport-code')) {
        alert("Please enter an airport code")
        return
      }
    } else {
      CONFIG.locationMode = "POSTAL"
      if (!currentLoop && args['zip-code'].length === 0) {
        alert("Please enter a postal code")
        return
      }
    }

    const zipCode = args['zip-code'] || localStorage.getItem('zip-code')
    const airportCode = args['airport-code'] || localStorage.getItem('airport-code')

    CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')

    fetchCurrentWeather()
  },

  load: async () => {
    await CONFIG.loadRemoteLocation() // load airport & greetings

    let settingsPrompt = getElement('settings-prompt')
    let advancedSettingsOptions = getElement('advanced-settings-options')

    CONFIG.options.forEach((option) => {
      let label = document.createElement('div')
      label.classList.add('strong-text', 'settings-item', 'settings-text', 'settings-padded')
      label.style.textAlign='left'
      label.appendChild(document.createTextNode(option.name))
      label.id = `${option.id}-label`

      let textbox = document.createElement('textarea')
      textbox.classList.add('settings-item', 'settings-text', 'settings-input')
      textbox.type = 'text'
      textbox.style.fontSize = '20px'
      textbox.placeholder = option.desc
      textbox.id = `${option.id}-text`
      textbox.style.maxWidth='320px'
      textbox.style.minWidth='320px'
      textbox.style.height='100px'
      textbox.style.marginTop='10px'
      if (localStorage.getItem(option.id)) textbox.value = localStorage.getItem(option.id)

      let br = document.createElement('br')
      advancedSettingsOptions.appendChild(label)
      advancedSettingsOptions.appendChild(textbox)
      advancedSettingsOptions.appendChild(br)
    })

    let advancedButtonContainer = document.createElement('div')
    advancedButtonContainer.classList.add('settings-container')
    settingsPrompt.appendChild(advancedButtonContainer)

    let advancedButton = document.createElement('button')
    advancedButton.innerHTML = "Show advanced options"
    advancedButton.id = "advanced-options-text"
    advancedButton.setAttribute('onclick', 'toggleAdvancedSettings()')
    advancedButton.classList.add('regular-text', 'settings-input', 'button')
    advancedButtonContainer.appendChild(advancedButton)

    let btn = document.createElement('button')
    btn.classList.add('setting-item', 'settings-text', 'settings-input', 'button')
    btn.id = 'submit-button'
    btn.onclick = CONFIG.submit
    btn.style = 'margin-bottom: 10px;'
    btn.appendChild(document.createTextNode('Start'))
    settingsPrompt.appendChild(btn)

    if (CONFIG.loop || localStorage.getItem('loop') === 'y') {
      CONFIG.loop = true
      hideSettings()
      CONFIG.submit()
    }
  }
}

CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')
