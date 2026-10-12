"""Cuts a thing out of a course video's still — the videos' own animal,
fur and all — with BiRefNet (the open model best at hair and fur edges),
run straight on onnxruntime. Writes the RGBA cut-out and its matte
(`<out>.matte.png`). Then `stand.py` stands it in its world.

Not a project dependency, like Playwright for `render.cjs`: a venv of
its own with `onnxruntime numpy pillow`, and the model (BiRefNet-general,
~970 MB, MIT) downloaded once into a folder of its own:

    python3 -m venv /tmp/cutenv && /tmp/cutenv/bin/pip install onnxruntime numpy pillow
    curl -L -o /tmp/birefnet/birefnet-general.onnx https://github.com/danielgatis/rembg/releases/download/v0.0.0/BiRefNet-general-epoch_244.onnx
    /tmp/cutenv/bin/python -I tools/picnic-scene/cut.py /tmp/birefnet/birefnet-general.onnx still.png out/cut/dog.png
"""
import sys
import numpy as np
import onnxruntime as ort
from PIL import Image

model, src, dst = sys.argv[1:4]
img = Image.open(src).convert("RGB")
x = np.asarray(img.resize((1024, 1024), Image.BICUBIC)).astype(np.float32) / 255
x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
x = x.transpose(2, 0, 1)[None].astype(np.float32)
sess = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
out = sess.run(None, {sess.get_inputs()[0].name: x})[0]
m = 1 / (1 + np.exp(-out[0, 0]))
m = (m - m.min()) / (m.max() - m.min() + 1e-6)
matte = Image.fromarray((m * 255).astype(np.uint8)).resize(img.size, Image.BICUBIC)
matte.save(dst.replace(".png", ".matte.png"))
rgba = img.copy(); rgba.putalpha(matte)
rgba.save(dst)
print("done", img.size)
