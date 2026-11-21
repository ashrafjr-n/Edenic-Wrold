"""Learn's sound effects, synthesised from nothing (no samples, no licence).

    python3 tools/sounds/sfx.py          # -> public/assets/audio/sfx/<id>.mp3

Every sound is soft, round and toy-like: marimba and glockenspiel notes,
bubble pops, wood blocks — nothing harsh, and no buzzer for a miss.
Pitched ones (letter, found) are one note; the site raises them with the
playback rate, so a word or a hunt climbs a scale.
"""

import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "assets", "audio", "sfx")
rng = np.random.default_rng(7)  # fixed: the same files on every run


def t(seconds):
    return np.arange(int(SR * seconds)) / SR


def decay(seconds, rate):
    return np.exp(-t(seconds) * rate)


def attack(signal, ms=3):
    """Ramp the start in and the last 8 ms out, so nothing clicks."""
    n = min(len(signal), int(SR * ms / 1000))
    signal[:n] *= np.linspace(0, 1, n)
    m = min(len(signal), int(SR * 0.008))
    signal[-m:] *= np.linspace(1, 0, m)
    return signal


def sweep(f0, f1, seconds):
    """A sine gliding exponentially from f0 to f1."""
    freq = f0 * (f1 / f0) ** (t(seconds) / seconds)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def marimba(freq, seconds=0.6):
    x = t(seconds)
    tone = (np.sin(2 * np.pi * freq * x) * np.exp(-x * 7)
            + 0.35 * np.sin(2 * np.pi * freq * 4 * x) * np.exp(-x * 30)
            + 0.12 * np.sin(2 * np.pi * freq * 9.9 * x) * np.exp(-x * 60))
    return attack(tone, 2)


def glock(freq, seconds=0.9):
    x = t(seconds)
    tone = (np.sin(2 * np.pi * freq * x) * np.exp(-x * 4)
            + 0.4 * np.sin(2 * np.pi * freq * 2.76 * x) * np.exp(-x * 9)
            + 0.2 * np.sin(2 * np.pi * freq * 5.4 * x) * np.exp(-x * 16))
    return attack(tone, 1)


def wood(freq, seconds=0.18):
    x = t(seconds)
    tone = np.sin(2 * np.pi * freq * x) * np.exp(-x * 38) + 0.3 * np.sin(2 * np.pi * freq * 2.3 * x) * np.exp(-x * 60)
    click = rng.standard_normal(len(x)) * np.exp(-x * 400) * 0.25
    return attack(tone + click, 1)


def pop(f0=620, f1=260, seconds=0.11):
    body = sweep(f0, f1, seconds) * decay(seconds, 38)
    return attack(body, 2)


def bloop(f0, f1, seconds=0.14):
    return attack(sweep(f0, f1, seconds) * np.sin(np.pi * t(seconds) / seconds) ** 0.7, 2)


def noise_band(seconds, low, high):
    """White noise kept between two frequencies (FFT mask)."""
    n = int(SR * seconds)
    spec = np.fft.rfft(rng.standard_normal(n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec[(freqs < low) | (freqs > high)] = 0
    return np.fft.irfft(spec, n)


def note(name):
    names = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}
    return 440 * 2 ** ((names[name[0]] + 12 * (int(name[1:]) - 4)) / 12)


def mix(length, *parts):
    """Lay (start seconds, signal, gain) parts on one track."""
    out = np.zeros(int(SR * length))
    for start, signal, gain in parts:
        i = int(SR * start)
        j = min(len(out), i + len(signal))
        out[i:j] += signal[: j - i] * gain
    return out


def room(signal, seconds=0.5, wet=0.18):
    """A small soft room: the dry sound plus decaying noise convolved in."""
    ir = rng.standard_normal(int(SR * seconds)) * decay(seconds, 9)
    ir /= np.sqrt(np.sum(ir ** 2))
    tail = np.convolve(signal, ir)[: len(signal) + len(ir)]
    dry = np.concatenate([signal, np.zeros(len(ir))])[: len(tail)]
    return dry + wet * tail


def finish(signal, peak):
    signal = signal / np.max(np.abs(signal)) * peak
    fade = min(len(signal), int(SR * 0.02))
    signal[-fade:] *= np.linspace(1, 0, fade)
    return signal


# ---- The sounds ----

def tap():
    """Any button: a small soft bubble pop."""
    return finish(room(pop(), 0.2, 0.08), 0.45)


def correct():
    """A step solved: two marimba notes up and a glint."""
    s = mix(1.0, (0, marimba(note("C6")), 0.8), (0.1, marimba(note("G6")), 0.9), (0.2, glock(note("C7"), 0.7), 0.25))
    return finish(room(s), 0.7)


def oops():
    """A miss: a toy's gentle "uh-oh" — two soft low notes, never a buzzer."""
    def hum(freq, seconds):
        x = t(seconds)
        wobble = freq * (1 + 0.012 * np.sin(2 * np.pi * 6 * x))
        phase = 2 * np.pi * np.cumsum(wobble) / SR
        tone = np.sin(phase) + 0.25 * np.sin(2 * phase)
        return attack(tone * np.exp(-x * 5), 12)
    s = mix(0.7, (0, hum(note("E4"), 0.25), 0.8), (0.17, hum(note("C4"), 0.45), 0.9))
    return finish(room(s, 0.3, 0.1), 0.5)


def letter():
    """A letter set in its space: a wood block (raised per space)."""
    return finish(room(wood(note("C5")), 0.25, 0.1), 0.6)


def found():
    """A thing found in a hunt: one glockenspiel note (raised per find)."""
    return finish(room(glock(note("E6"), 0.7)), 0.55)


def pickup():
    """A thing lifted to drag: an upward bloop."""
    return finish(bloop(300, 720, 0.13), 0.4)


def chomp():
    """Three bites, in time with the animal's three squashes (0.12/0.4/0.68 s)."""
    def bite():
        crunch = noise_band(0.12, 900, 4200) * decay(0.12, 30)
        grain = (rng.random(len(crunch)) < 0.04) * rng.standard_normal(len(crunch)) * decay(0.12, 25)
        thump = sweep(160, 70, 0.1) * decay(0.1, 35)
        return attack(crunch * 0.7 + grain * 0.5, 2), thump
    parts = []
    for start in (0.1, 0.38, 0.66):
        crunch, thump = bite()
        parts += [(start, crunch, 0.8), (start, thump, 0.9)]
    return finish(mix(0.9, *parts), 0.6)


def plop():
    """Into the basket: a soft thud and a bloop."""
    thud = sweep(180, 80, 0.15) * decay(0.15, 25)
    s = mix(0.4, (0, attack(thud, 2), 1), (0.02, bloop(260, 620, 0.12), 0.6))
    return finish(room(s, 0.25, 0.1), 0.6)


def bubbles():
    """Paint mixing: a run of little bubbles."""
    parts = []
    for k in range(11):
        start = 0.06 * k + rng.random() * 0.03
        f0 = 260 + rng.random() * 380
        parts.append((start, bloop(f0, f0 * 2.2, 0.07 + rng.random() * 0.04), 0.5 + 0.5 * rng.random()))
    return finish(room(mix(0.95, *parts), 0.3, 0.12), 0.5)


def whoosh():
    """A soft swish: skipping a reel, a popup opening."""
    seconds = 0.4
    n = int(SR * seconds)
    size, hop = 1024, 256
    window = np.hanning(size)
    out = np.zeros(n + size)
    for i in range(0, n, hop):  # overlapping grains of noise, their band sweeping up then down
        p = i / n
        centre = 500 + 2200 * np.sin(np.pi * p)
        out[i:i + size] += noise_band(size / SR, centre * 0.6, centre * 1.4) * window * np.sin(np.pi * p) ** 1.5
    return finish(out[:n], 0.35)


def hooray():
    """A lesson done: a party popper, a marimba run up and a bright last note."""
    popper = noise_band(0.08, 1200, 7000) * decay(0.08, 50)
    run = [(0.06 + 0.09 * k, marimba(note(n), 0.5), 0.8) for k, n in enumerate(["C5", "E5", "G5", "C6"])]
    top = (0.42, marimba(note("E6"), 1.0) + 0.5 * glock(note("E7"), 1.0), 1.0)
    sparkle = [(0.5 + 0.07 * k, glock(note(n), 0.5), 0.18) for k, n in enumerate(["G6", "C7", "E7", "G7"])]
    return finish(room(mix(1.8, (0, attack(popper, 1), 0.7), *run, top, *sparkle), 0.7, 0.22), 0.75)


def chest():
    """The gold chest: a wobble (its shake), a creak (the lid) and magic
    shimmer as the light comes up. The play is 46 frames at 25/s = 1.84 s."""
    knocks = [(0.02 + 0.11 * k, wood(note("G3") * (1 + 0.06 * (k % 2)), 0.15), 0.7) for k in range(4)]
    x = t(0.55)
    creak_freq = 140 + 40 * np.sin(2 * np.pi * 3 * x) + 30 * x
    phase = 2 * np.pi * np.cumsum(creak_freq) / SR
    creak = np.sign(np.sin(phase)) * (rng.random(len(x)) < 0.6) * np.sin(np.pi * x / 0.55) ** 2
    creak = attack(np.convolve(creak, np.ones(24) / 24, "same"), 5)  # dull it
    shimmer = [(0.95 + 0.06 * k, glock(note(n), 0.9), 0.35) for k, n in enumerate(["C6", "E6", "G6", "C7", "E7", "G7", "C8"])]
    pad = (0.95, sum(np.sin(2 * np.pi * note(n) * t(1.4)) for n in ("C5", "G5", "E6")) * np.sin(np.pi * t(1.4) / 1.4) ** 2, 0.12)
    return finish(room(mix(2.6, *knocks, (0.45, creak, 0.35), *shimmer, pad), 0.8, 0.25), 0.7)


def star():
    """The chest's star rising: a twinkle up and a glow."""
    run = [(0.04 * k, glock(note(n), 0.6), 0.5) for k, n in enumerate(["G6", "A6", "C7", "D7", "E7", "G7", "A7", "C8"])]
    glow = (0.32, glock(note("C7"), 1.2) + glock(note("G7"), 1.2) * 0.5, 0.6)
    return finish(room(mix(1.8, *run, glow), 0.8, 0.3), 0.6)


def clouds():
    """The friend's clouds rising over the page: three soft breaths of air, one
    per bank (they set off 0.11 s apart and cover in 0.7 s), and a harp-like
    run up as they pass."""
    def breath(seconds):
        n = int(SR * seconds)
        size, hop = 2048, 512
        window = np.hanning(size)
        out = np.zeros(n + size)
        for i in range(0, n, hop):
            p = i / n
            centre = 300 + 900 * p
            out[i:i + size] += noise_band(size / SR, centre * 0.5, centre * 1.6) * window * np.sin(np.pi * p) ** 2
        return out[:n]
    air = [(0.11 * k, breath(1.1), 1 - 0.15 * k) for k in range(3)]
    harp = [(0.15 + 0.08 * k, glock(note(n), 0.8), 0.07) for k, n in enumerate(["C6", "E6", "G6", "A6", "C7"])]
    return finish(room(mix(2.0, *air, *harp), 0.8, 0.25), 0.4)


def snap():
    """Play's Find (2026-11-20): a toy camera taking the photo — a soft
    click-clack of its shutter, a little whirr of the film winding on, and a
    bright ding as the picture comes out."""
    click = noise_band(0.03, 1500, 6000) * decay(0.03, 160)
    clack = noise_band(0.04, 700, 3500) * decay(0.04, 120)
    x = t(0.32)
    whirr = noise_band(0.32, 2200, 5200) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * x))) * np.sin(np.pi * x / 0.32) ** 2
    ding = glock(note("E7"), 0.9) + 0.5 * glock(note("B7"), 0.9)
    return finish(room(mix(1.4, (0, attack(click, 1), 0.9), (0.07, attack(clack, 1), 0.7), (0.16, attack(whirr, 5), 0.22), (0.42, ding, 0.35)), 0.6, 0.2), 0.6)


def rustle():
    """Play's Find: what is hidden stirring where it is — a soft rustle of
    leaves, three little shakes."""
    shakes = []
    for k in range(3):
        x = t(0.16)
        shakes.append((0.12 * k, noise_band(0.16, 1800, 7000) * np.sin(np.pi * x / 0.16) ** 3, 0.8 - 0.15 * k))
    return finish(room(mix(0.7, *shakes), 0.5, 0.15), 0.45)


def flip():
    """Play's Memory Match (2026-11-21): a card turning over — a soft paper
    "fwip" and a tiny wood tick as it lands face up."""
    x = t(0.09)
    fwip = noise_band(0.09, 1800, 7500) * np.sin(np.pi * x / 0.09) ** 1.5
    return finish(room(mix(0.24, (0, attack(fwip, 4), 0.5), (0.06, wood(note("G5"), 0.12), 0.55)), 0.3, 0.1), 0.5)


SOUNDS = [tap, correct, oops, letter, found, pickup, chomp, plop, bubbles, whoosh, hooray, chest, star, clouds, snap, rustle, flip]


def write_mp3(name, signal):
    pcm = (np.clip(signal, -1, 1) * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        with wave.open(tmp.name, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", tmp.name, "-c:a", "libmp3lame", "-b:a", "96k",
                        os.path.join(OUT, f"{name}.mp3")], check=True)


if __name__ == "__main__":
    import sys
    os.makedirs(OUT, exist_ok=True)
    only = sys.argv[1:]  # e.g. `sfx.py clouds` makes that one alone
    for make in SOUNDS:
        if only and make.__name__ not in only:
            continue
        write_mp3(make.__name__, make())
        print(make.__name__)
