# PRF research ratification demonstration

This is a separate, user-owned Next.js frontend for illustrating researcher agreement and dissent against one immutable research basis. It is not part of PRF and has no live service connection. It renders the committed sample fixture and lets a visitor preview a response locally; no keys are requested and no contributions are signed or submitted. The production build is a static export in `out/`.

The visible **DEMONSTRATION ONLY** label is intentional. The fixture uses test identities and a test-only signing key. A ratified research result does not establish governance authority, resolve a SEW dispute, issue a ruling, or authorize an operation.

## Run locally

Requires Node.js 22 or later and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Then open http://localhost:3000. `pnpm typecheck` and `pnpm build` validate the app.

## AWS publication

The standalone site follows the `prf-site` pattern: static export to its own
private, versioned S3 bucket; CloudFront Origin Access Control; its own
CloudFront distribution on the default `*.cloudfront.net` domain; and a
GitHub Actions OIDC role scoped to this repository and its bucket/distribution.
The additive Terraform resources are in the existing
`infra/assurance-lab-terraform` repository (`ratification_site.tf`, matching
variables and outputs). Apply them there before enabling the deploy workflow.

Set these GitHub repository variables from the Terraform outputs:
`AWS_SITE_BUCKET`, `AWS_SITE_DISTRIBUTION_ID`, `AWS_SITE_DEPLOY_ROLE_ARN`, and
`AWS_REGION`. Pushes to `main` then build, sync, and invalidate only this site's
resources. No long-lived AWS keys are stored in GitHub.

## Ownership and integration boundary

The frontend is independently deployable and controlled by whoever owns this directory. It consumes a copied example artifact and the draft OpenAPI contract in `examples/` and `contracts/`. The browser does not calculate PRF canonical roots. The draft API has no deployed backend yet; the Agree, Dissent, and Challenge controls only show a local preview.

The fixture and contract were copied from `protocol-robustness-framework` at source revision `2af2720448b3673caa3848d932486be3bc9d55bd`:

- `examples/ratified-with-dissent.json` — `examples/ratification-v1/ratified-with-dissent.json`
- `contracts/research-ratification-demo-api.v1.json` — `schemas/research-ratification-demo-api.v1.json`

The example is committed to this repository so the frontend remains self-contained. Refresh it deliberately when the upstream contract or fixture changes, and review the generated diff and roots before doing so. This frontend is not an official PRF release or a production client.

The sentence describing the analytical claim is illustrative display copy; the fixture contains only the subject and evidence roots, not that prose. The page labels this clearly so it is not mistaken for source evidence.

Expandable forensic panels expose target, policy, contribution, decision, signature, and ratification fields. Root values and signature bytes are copyable. Any `verified`/`verification` text is reported by the fixture; the frontend does not independently verify signatures or recompute canonical roots.

Copied artifact SHA-256 digests:

```text
fixture: sha256:8bb740a54286442a74e90721fc09dd576295f959dfa194191ad6e711c059ef50
OpenAPI: sha256:f467d81f9cb7bb9d6a30f105e6d42782faa6f7dacede042a0e4aeddc54d5dc68
```
