# Top k youtube videos

```js
enum Period {
  Minute,
  Hour,
  Day,
  AllTime,
}

type Video {}

function getTopK(k: Number, period: Period): Video[] {}
```

- Window types:
  - Tumbling: 05:00 - 06:00 (1 hour window)
  - Sliding: 05:01 - 06:01 (1 hour window)

## TODOs
- Heap
- Count min sketch (vs bloom filter)
- Similar: watchtime service, youtube views count

## Ref
- https://youtu.be/1lfktgZ9Eeo?si=A-nCRmIAGfhLRSxK
- https://youtu.be/nQpkRONzEQI?si=eXrZRQmN1M43hD3Q
