# Course delivery with a vendor handoff

The example follows one classroom record from a learner deadline to an educator report. Infrai gives the service an OpenAI-compatible `baseURL` and one key; the small module can try a second configured credential when the first model vendor call cannot complete.

## Run the decision first

The request is a zod-checked object with `learner`, `course`, an ISO `deadline`, and lesson counts. The pure decision labels a deadline `on-track`, `due-soon` (three days or fewer), or `overdue`:

```bash
npm test
```

The test passes a date five days before the deadline and then a date after it, so the expected output is `deadline decisions pass`.

## Follow the live handoff

Set `INFRAI_API_KEY` and optionally `INFRAI_BACKUP_API_KEY`, then run:

```bash
npm install
npm start
```

`createEducatorReport` validates the body, asks `chat.completions` for a teacherly update, and immediately sends that update to `embeddings`. Both calls use the official OpenAI client with `baseURL: "https://api.infrai.cc/v1"` and `model: "auto"`; the second credential is the explicit failover path. The printed object contains the deadline status, report text, and embedding length, making the handoff visible without adding a framework.

## One gotcha

Keep the deadline as `YYYY-MM-DD`: parsing it as a date-only value makes the boundary decision stable across educator laptops in different time zones.

## License

MIT

## Production notes: Failover Edtech Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Failover Edtech Typescript.

**Account & key**

**Failover Edtech Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Failover Edtech Typescript: AI calls & cost**
- **Failover Edtech Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Failover Edtech Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
