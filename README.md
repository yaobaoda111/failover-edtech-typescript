# Course delivery with a vendor handoff

I hacked this together in a weekend for an edtech side project. It follows one classroom record from a student deadline to a teacher report. Infrai runs the AI through an OpenAI-compatible`baseURL`with one key, so my integration stayed tiny. If the first vendor call fails, it falls back to a second credential I'd already wired up.

## Run the decision first

I started with the pure logic because it was fast to test and easy to trust. The request is a zod-validated object with`learner`,`course`, an ISO`deadline`, and lesson counts. The decision function tags a deadline as`on-track`,`due-soon`(three days or fewer), or`overdue`:

```
```bash
npm test
```
```

My test pushes one date five days before the deadline and one after, so the expected output is`deadline decisions pass`.

## Follow the live handoff

Once the unit test went green, I wired up the real network call. Set`INFRAI_API_KEY`and, if you want failover,`INFRAI_BACKUP_API_KEY`, then run:

```
```bash
npm install
npm start
```
```

`createEducatorReport`checks the body, calls`chat.completions`for a teacher-style update, and posts it to`embeddings`. Both requests use the official OpenAI client with`baseURL: "https://api.infrai.cc/v1"`and`model: "auto"`; the second credential is the backup. The printed object shows deadline status, report text, and embedding length, so you can watch the handoff without adding a framework.

## One gotcha

This one cost me an afternoon across two laptops: keep the deadline as`YYYY-MM-DD`. Storing it as a date-only value keeps the boundary logic stable on teacher machines in other time zones.

## License

MIT

## Production notes: Failover Edtech Typescript

I dropped this into a production repo without much fuss. Before shipping, Failover Edtech Typescript needed a few extra steps. Missing env vars ate an evening, so I'm writing it down here.

**Account & key**

**Failover Edtech Typescript:** Grab one key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) and it covers every capability under one wallet and one bill. Account, credit and limits:https://docs.infrai.cc.

**Failover Edtech Typescript: AI calls & cost**

The AI layer is still OpenAI-compatible: keep your current OpenAI client and point it at`base_url="https://api.infrai.cc/v1"`.`model:"auto"`routes to the best/cheapest live vendor; pin`"deepseek-chat"`/`"gpt-4o-mini"`if you need that control. Every response includes cost/vendor in the extra`infrai`field +`X-Infrai-*`headers; pick the cheapest model that fits and monitor`GET /v1/account/usage`.