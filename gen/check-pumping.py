"""Is the music bed PUMPING? Run it whenever a bed is rebuilt.

    python gen/check-pumping.py <raw-bed.wav> <ducked-bed.mp3>

THE DEFECT THIS EXISTS FOR
--------------------------
`bed-afm1.mp3` shipped in afm-1-v16 ducked at ratio 20 / release 250ms, which is
not ducking but GATING keyed to the voice: measured 41.8 dB of gain-reduction
swing, moving a median 2.5 dB every 50ms. Rahul heard it immediately -- "getting
mute again and again and is not consistent". `gen/check-audio.py` PASSED it,
because masking and pumping are different faults: a bed that keeps vanishing
cannot mask anything.

The two failure modes pull opposite ways and a bed has to clear both:
  duck too little -> the bed masks the read       (check-audio)
  duck too much   -> the bed pumps, or disappears (this)

And a third, which is how the first fix went wrong: releasing SLOWER than the
script's pauses (1800ms against gaps of 0.14-0.70s) stops the bed recovering at
all. That measured beautifully here and put the bed 28.8 dB under the read,
where it is simply inaudible. Check the absolute level too -- a bed wants to sit
roughly 15-25 dB under the read.

Pumping = what the DUCK does, not what the music does.

Gain-reduction curve: the ducked bed minus the SAME bed un-ducked, in 50ms
windows. Music with its own dynamics under a steady duck reads flat here; a
gated bed swings tens of dB several times a second. Measuring the ducked
envelope on its own cannot tell those apart -- it counts the kick drum.
"""
import subprocess, wave, numpy as np, sys, os, tempfile
def env(path, tag):
    t = os.path.join(tempfile.gettempdir(), f"_e{tag}.wav")
    subprocess.run(["ffmpeg","-y","-v","error","-i",path,"-ar","16000","-ac","1",t],check=True)
    with wave.open(t) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)/32768
    W = 800; k = len(x)//W
    return 20*np.log10(np.sqrt((x[:k*W].reshape(k,W)**2).mean(axis=1))+1e-12)
raw, duck = env(sys.argv[1], "r"), env(sys.argv[2], "d")
n = min(len(raw), len(duck))
gr = np.clip((duck[:n]-raw[:n])[2:-2], -60, 0)
lo, hi = np.percentile(gr, 5), np.percentile(gr, 95)
mid = (lo+hi)/2
cross = np.sum(np.diff((gr > mid).astype(int)) != 0)/(len(gr)*0.05)
print(f"{hi-lo:5.1f} {cross:5.2f} {np.median(np.abs(np.diff(gr))):5.1f}")
