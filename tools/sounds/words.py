"""Every taught word, spoken: public/assets/audio/words/<word>.mp3.

Kokoro TTS (Apache-2.0, github.com/thewh1teagle/kokoro-onnx), voice
`af_heart` — a warm American English voice, the clearest of Kokoro's
American voices when each word was checked by ear-model (Whisper
small.en). Taught words are American English.

    python3 -m venv venv && venv/bin/pip install kokoro-onnx soundfile
    # kokoro-v1.0.onnx + voices-v1.0.bin from that repo's releases, beside you
    venv/bin/python tools/sounds/words.py <dir with the model files>
"""

import os
import subprocess
import sys

import soundfile as sf
from kokoro_onnx import Kokoro

WORDS = [
    # Pinki — Shapes, Colors
    "circle", "square", "triangle", "rectangle", "heart", "diamond", "oval",
    "red", "blue", "yellow", "green", "orange", "purple", "pink", "brown", "black", "white",
    # Nova — Vegetables, My Garden
    "carrot", "broccoli", "potato", "tomato", "pepper",
    "flower", "tree", "leaf", "grass", "nest", "bench",
    # Bloo — Animals, Seasons and Weather
    "cat", "dog", "fish", "elephant", "mouse", "bird", "parrot", "turtle", "gecko",
    "spring", "summer", "fall", "winter", "rainy", "sunny", "windy", "snowy",
]

# Said this way to be heard right (text, speed): Kokoro swallows the f of a
# plain "Fish.", and its "Leaf." trails off like "leafs" at full speed.
SAY = {"fish": ("Fiish.", 1.0), "leaf": ("Leaf.", 0.95)}

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "assets", "audio", "words")

if __name__ == "__main__":
    models = sys.argv[1]
    kokoro = Kokoro(os.path.join(models, "kokoro-v1.0.onnx"), os.path.join(models, "voices-v1.0.bin"))
    os.makedirs(OUT, exist_ok=True)
    for word in WORDS:
        text, speed = SAY.get(word, (f"{word.capitalize()}.", 1.0))
        samples, rate = kokoro.create(text, voice="af_heart", speed=speed, lang="en-us")
        wav = os.path.join(OUT, f"{word}.wav")
        sf.write(wav, samples, rate)
        # Trim the silence round it (keeping a breath, so a soft f or s is
        # not cut), even out the loudness, then MP3.
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", wav, "-af",
                        "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.03,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.03,areverse,"
                        "apad=pad_dur=0.08,loudnorm=I=-16:TP=-1.5:LRA=11",
                        "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k",
                        os.path.join(OUT, f"{word}.mp3")], check=True)
        os.remove(wav)
        print(word)
