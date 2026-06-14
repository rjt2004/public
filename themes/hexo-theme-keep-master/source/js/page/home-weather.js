(function () {
  const CACHE_KEY = 'tone-home-weather-v3';
  const CACHE_TTL = 30 * 60 * 1000;
  const LOCATION = { latitude: 31.2304, longitude: 121.4737, place: '\u4e0a\u6d77' };
  const WEATHER_LABELS = {
    'clear-day': '\u6674',
    'partly-cloudy-day': '\u591a\u4e91',
    cloudy: '\u9634',
    rain: '\u5c0f\u96e8',
    'showers-day': '\u9635\u96e8',
    sleet: '\u96e8\u5939\u96ea',
    'rain-snow': '\u96e8\u96ea',
    snow: '\u96ea',
    'snow-showers-day': '\u9635\u96ea',
    wind: '\u6709\u98ce',
    fog: '\u96fe',
    'thunder-rain': '\u96f7\u96e8',
    hail: '\u51b0\u96f9'
  };

  function mapWeather(code, windSpeed) {
    if ([45, 48].includes(code)) return 'fog';
    if ([95, 96, 99].includes(code)) return 'thunder-rain';
    if (code === 66 || code === 67) return 'sleet';
    if (code >= 71 && code <= 77) return 'snow';
    if (code === 85 || code === 86) return 'snow-showers-day';
    if (code >= 80 && code <= 82) return 'showers-day';
    if (code >= 51 && code <= 65) return 'rain';
    if (code === 1 || code === 2) return windSpeed >= 30 ? 'wind' : 'partly-cloudy-day';
    if (code === 3) return windSpeed >= 30 ? 'wind' : 'cloudy';
    if (windSpeed >= 34) return 'wind';
    return 'clear-day';
  }

  function drawIcon(canvas, type) {
    if (!canvas || !window.Skycons) return;
    if (canvas._toneSkycon) canvas._toneSkycon.pause();
    const skycons = new window.Skycons({ monochrome: false, resizeClear: true });
    const iconName = (type || 'clear-day').toUpperCase().replace(/-/g, '_');
    skycons.add(canvas, window.Skycons[iconName] || window.Skycons.CLEAR_DAY);
    skycons.play();
    canvas._toneSkycon = skycons;
  }

  function fallbackState() {
    return { weather: 'clear-day', temp: null, place: LOCATION.place };
  }

  function readCache() {
    try {
      const data = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (data && Date.now() - data.savedAt < CACHE_TTL) return data.state;
    } catch (error) {}
    return null;
  }

  function writeCache(state) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), state }));
    } catch (error) {}
  }

  function fetchWeather() {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', LOCATION.latitude.toFixed(4));
    url.searchParams.set('longitude', LOCATION.longitude.toFixed(4));
    url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m');
    url.searchParams.set('timezone', 'Asia/Shanghai');
    return fetch(url.toString()).then(res => res.json()).then(data => {
      const current = data.current || {};
      return {
        weather: mapWeather(Number(current.weather_code || 0), Number(current.wind_speed_10m || 0)),
        temp: Number.isFinite(Number(current.temperature_2m)) ? Math.round(Number(current.temperature_2m)) : null,
        place: LOCATION.place
      };
    });
  }

  function render(state) {
    document.querySelectorAll('[data-home-weather-status]').forEach(el => {
      const canvas = el.querySelector('canvas');
      const text = el.querySelector('span');
      drawIcon(canvas, state.weather);
      const temp = state.temp === null ? '' : ' ' + state.temp + '\u00b0C';
      text.textContent = (state.place || LOCATION.place) + ' \u00b7 ' + (WEATHER_LABELS[state.weather] || '\u5929\u6c14') + temp;
    });
  }

  function init() {
    const cached = readCache();
    if (cached) {
      render(cached);
      return;
    }
    render(fallbackState());
    fetchWeather()
      .then(state => { writeCache(state); render(state); })
      .catch(() => {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('pjax:complete', init);
})();
