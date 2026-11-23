/* Rhythm engine: real moon phase, real sun times, and cycle-day maths. No network needed. */
var Rhythm = (function () {
  var DAY = 864e5;
  var SYNODIC = 29.530588853;
  var NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
  var MOON_NAMES = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];
  var rad = Math.PI / 180;

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function fromISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12); }

  function moon(date) {
    var f = (((date.getTime() - NEW_MOON) / DAY) % SYNODIC) / SYNODIC;
    if (f < 0) f += 1;
    var idx = Math.round(f * 8) % 8;
    return { fraction: f, index: idx, name: MOON_NAMES[idx], lit: Math.round((1 - Math.cos(2 * Math.PI * f)) / 2 * 100), art: 'assets/moon-' + idx + '.svg' };
  }

  /* Moon fractions mapped onto the four inner seasons. Winter straddles the new moon. */
  var MOON_STOPS = [['winter', 0, 0.07], ['spring', 0.07, 0.43], ['summer', 0.43, 0.57], ['autumn', 0.57, 0.93], ['winter', 0.93, 1]];

  function moonRhythm(date) {
    var m = moon(date), season = 'winter';
    MOON_STOPS.forEach(function (s) { if (m.fraction >= s[1] && m.fraction < s[2]) season = s[0]; });
    return { mode: 'moon', season: season, progress: m.fraction, stops: MOON_STOPS, label: m.name, sub: m.lit + '% lit', moon: m };
  }

  function cycleRhythm(startISO, len, date) {
    if (!startISO) return null;
    len = len || 28;
    var n = Math.round((startOfDay(date) - fromISO(startISO)) / DAY) + 1;
    var estimated = n > len || n < 1;
    var day = (((n - 1) % len) + len) % len + 1;
    var ovStart = Math.max(7, len - 16), ovEnd = ovStart + 3;
    var season = day <= 5 ? 'winter' : day < ovStart ? 'spring' : day <= ovEnd ? 'summer' : 'autumn';
    var stops = [['winter', 0, 5 / len], ['spring', 5 / len, (ovStart - 1) / len], ['summer', (ovStart - 1) / len, ovEnd / len], ['autumn', ovEnd / len, 1]];
    return { mode: 'cycle', season: season, progress: (day - 0.5) / len, stops: stops, day: day, len: len, label: 'Day ' + day, sub: 'of ' + len, estimated: estimated, moon: moon(date) };
  }

  function rhythm(settings, date) {
    var c = settings.mode === 'cycle' ? cycleRhythm(settings.start, settings.len, date) : null;
    return c || moonRhythm(date);
  }

  function daysUntil(settings, date, season) {
    for (var i = 1; i <= 45; i++) if (rhythm(settings, addDays(date, i)).season === season) return i;
    return null;
  }

  /* Sunrise equation. lng east-positive. Returns Date objects, or null near the poles. */
  function sun(date, lat, lng) {
    var n = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12) / DAY + 2440587.5 - 2451545;
    var j = n + 0.0008 - lng / 360;
    var M = (357.5291 + 0.98560028 * j) % 360;
    var C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    var L = (M + C + 180 + 102.9372) % 360;
    var transit = 2451545 + j + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
    var dec = Math.asin(Math.sin(L * rad) * Math.sin(23.44 * rad));
    var cosW = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(dec)) / (Math.cos(lat * rad) * Math.cos(dec));
    if (cosW < -1 || cosW > 1) return null;
    var w = Math.acos(cosW) / rad;
    function toDate(jd) { return new Date((jd - 2440587.5) * DAY); }
    var set = toDate(transit + w / 360);
    return { rise: toDate(transit - w / 360), set: set, golden: new Date(set.getTime() - 55 * 60000) };
  }

  /* The most recent and the next new or full moon: the two ritual nights. */
  function moonEvents(date) {
    var f = moon(date).fraction, t = date.getTime();
    var sinceNew = f * SYNODIC, sinceFull = ((f + 0.5) % 1) * SYNODIC, toNew = (1 - f) * SYNODIC, toFull = ((1.5 - f) % 1) * SYNODIC;
    return {
      last: sinceNew < sinceFull ? { kind: 'new', date: new Date(t - sinceNew * DAY) } : { kind: 'full', date: new Date(t - sinceFull * DAY) },
      next: toNew < toFull ? { kind: 'new', date: new Date(t + toNew * DAY) } : { kind: 'full', date: new Date(t + toFull * DAY) }
    };
  }

  /* With no location permission, guess from the clock: longitude from the UTC offset, a mid latitude. */
  function guessPlace() { return { lat: 38, lng: -new Date().getTimezoneOffset() / 4, guessed: true }; }

  return { moon: moon, moonEvents: moonEvents, rhythm: rhythm, daysUntil: daysUntil, sun: sun, guessPlace: guessPlace, iso: iso, fromISO: fromISO, addDays: addDays, startOfDay: startOfDay };
})();
