#!/bin/sh
# Render one format of a film in parallel ranges, join them, mix the sound and mux.
# ./engine/render-all.sh <film folder> [format, e.g. 16:9] [name] [query, e.g. lang=zh] [page, e.g. features.html]
# Writes <film>/out/<name>.mp4. PARTS sets the number of parallel ranges (default 4).
set -e
ENGINE=$(cd "$(dirname "$0")" && pwd)
cd "$1"
FORMAT=${2:-16:9}
TAG=$(echo "$FORMAT" | tr ':' 'x')
NAME=${3:-film-$TAG}
QUERY=${4:-}
PAGE=${5:-index.html}
node "$ENGINE/build.mjs"
node "$ENGINE/render.mjs" --format="$FORMAT" --q="$QUERY" --page="$PAGE" --verify
node "$ENGINE/mix.mjs"
DUR=$(node -e "console.log(require('./out/timeline.json').DUR)")
PARTS=${PARTS:-4}
rm -f out/parts-$TAG.txt
for i in $(seq 0 $((PARTS - 1))); do
  A=$(node -e "const d=$DUR,n=$PARTS,f=60;console.log((Math.round(d*f*$i/n)/f).toFixed(6))")
  B=$(node -e "const d=$DUR,n=$PARTS,f=60;console.log((Math.round(d*f*($i+1)/n)/f).toFixed(6))")
  node "$ENGINE/render.mjs" --format="$FORMAT" --q="$QUERY" --page="$PAGE" --range=$A:$B --out=out/part-$TAG-$i.mp4 > out/part-$TAG-$i.log 2>&1 &
  echo "file 'part-$TAG-$i.mp4'" >> out/parts-$TAG.txt
done
wait
ffmpeg -y -loglevel error -f concat -safe 0 -i out/parts-$TAG.txt -i out/mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart out/$NAME.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 out/$NAME.mp4
