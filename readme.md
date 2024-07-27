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
