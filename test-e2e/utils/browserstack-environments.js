module.exports = [

  // Windows
  {
    'desc': 'Win10-Chrome-71.0',
    'browserName': 'Chrome',
    'browser_version': '71.0',
    'os': 'Windows',
    'os_version': '10',
    'resolution': '1024x768'
  }, {
    'desc': 'Win10-Firefox-64.0',
    'browserName' : 'Firefox',
    'browser_version' : '64.0',
    'os' : 'Windows',
    'os_version' : '10',
    'resolution' : '1024x768',
  }, {
    'desc': 'Win10-Edge-18.0',
    'browserName' : 'Edge',
    'browser_version' : '18.0',
    'os' : 'Windows',
    'os_version' : '10',
    'resolution' : '1024x768',
  }, 

  // macOS
  {
    'desc': 'macOS-10.14-Mojave-Chrome-71.0', 
    'browserName' : 'Chrome',
    'browser_version' : '71.0',
    'os' : 'OS X',
    'os_version' : 'Mojave',
    'resolution' : '1024x768',
  }, {
    'desc': 'macOS-10.14-Mojave-Firefox-64.0', 
    'browserName' : 'Firefox',
    'browser_version' : '64.0',
    'os' : 'OS X',
    'os_version' : 'Mojave',
    'resolution' : '1024x768',
  }, {
    'desc': 'macOS-10.14-Mojave-Safari-12.0', 
    'browserName' : 'Safari',
    'browser_version' : '12.0',
    'os' : 'OS X',
    'os_version' : 'Mojave',
    'resolution' : '1024x768',
  },

  // iOS
  {
    'desc': 'iOS-12-iPhone-XS',
    'browserName' : 'iPhone',
    'device' : 'iPhone XS',
    'realMobile' : 'true',
    'os_version' : '12',
  }, {
    'desc': 'iOS-11-iPhone-8',
    'browserName' : 'iPhone',
    'device' : 'iPhone 8',
    'realMobile' : 'true',
    'os_version' : '11'
  },

  // Android
  {
    'desc': 'Android-9.0-Google-Pixel-3',
    'browserName' : 'android',
    'device' : 'Google Pixel 3',
    'realMobile' : 'true',
    'os_version' : '9.0',
  }, {
    'desc': 'Android-6.0-Google-Nexus-6',
    'browserName' : 'android',
    'device' : 'Google Nexus 6',
    'realMobile' : 'true',
    'os_version' : '6.0',
  }, {
    'desc': 'Android-8.0-Samsung-Galaxy-S9',
    'browserName' : 'android',
    'device' : 'Samsung Galaxy S9',
    'realMobile' : 'true',
    'os_version' : '8.0',
  }

]
