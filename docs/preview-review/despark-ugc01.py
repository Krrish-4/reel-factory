import sys, subprocess, numpy as np, cv2
src, dst, S = sys.argv[1], sys.argv[2], sys.argv[3]
cap=cv2.VideoCapture(src); fr=[]
while True:
    ok,f=cap.read()
    if not ok: break
    fr.append(f)
gray=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in fr]
K0=24; c0=np.array([[[820.,1385.]]],np.float32)
lk=dict(winSize=(61,61),maxLevel=3,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,0.01))
pos={K0:c0[0,0].copy()}
for rng in (range(K0+1,len(fr)),range(K0-1,-1,-1)):
    p=c0.copy(); prev=K0
    for i in rng:
        n,st,_=cv2.calcOpticalFlowPyrLK(gray[prev],gray[i],p,None,**lk)
        if not st[0,0]: break
        p=n; pos[i]=n[0,0].copy(); prev=i
LAST=int(sys.argv[4])
p=np.array([[[907.,1480.]]],np.float32); early={0:p[0,0].copy()}
for i in range(1,K0+1):
    n,st,_=cv2.calcOpticalFlowPyrLK(gray[i-1],gray[i],p,None,**lk)
    p=n; early[i]=n[0,0].copy()
for i in range(0,K0+1,2): print('cmp',i,early[i].astype(int),pos[i].astype(int))
SWITCH=int(sys.argv[5])
KF=[(0,907,1480),(6,900,1473),(10,893,1477),(12,883,1467),(14,883,1457),(24,820,1385)]
ks=[k[0] for k in KF]
for i in range(0,SWITCH):
    pos[i]=np.array([np.interp(i,ks,[k[1] for k in KF]),np.interp(i,ks,[k[2] for k in KF])])
out=[]
for i,f in enumerate(fr):
    if i<=LAST and i in pos:
        x,y=pos[i]; m=np.zeros(f.shape[:2],np.uint8)
        cv2.circle(m,(int(x),int(y)),30,255,-1)
        a=cv2.GaussianBlur(m.astype(np.float32)/255,(0,0),6)[...,None]
        a=np.clip(a*1.6,0,1)
        DY=int(sys.argv[6])
        if i<=12:
            sh=np.roll(f,-DY,axis=0)  # knit from DY below
            f=(f*(1-a)+sh*a).astype(np.uint8)
        else:
            f=cv2.inpaint(f,m,7,cv2.INPAINT_NS)
        if i%6==0: print(i,int(x),int(y))
    out.append(f)
tiles=[cv2.resize(out[i][1300:1560,760:1020],(210,210)) for i in list(range(8,64,4))]
cv2.imwrite(S+'/despark-check.png',np.vstack([np.hstack(tiles[:7]),np.hstack(tiles[7:14])]))
p=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s","1080x1920","-r","24","-i","-","-i",src,"-map","0:v","-map","1:a","-c:v","libx264","-crf","14","-preset","slow","-pix_fmt","yuv420p","-g","12","-c:a","copy",dst],stdin=subprocess.PIPE)
for f in out: p.stdin.write(f.tobytes())
p.stdin.close(); p.wait()
