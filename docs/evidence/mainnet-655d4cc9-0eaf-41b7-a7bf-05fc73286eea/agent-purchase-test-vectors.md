# Agent Purchase Test Vectors

Original synthetic developer resource by RouteTill Labs. License: CC0-1.0.
Version: 1. These are illustrative fixtures, not measured production or market data.

A developer agent can turn these records into a regression-test plan after purchasing
and checking this exact file. The expected outcomes are supplied fixture labels;
processing them does not independently test a payment system or establish quality.

```json
{"format":"routetill.purchase-vectors.v1","cases":[
 {"id":"approved-purchase","change":"All approved terms match","expected":"ACCEPT","condition":"Exact merchant, product, route, limit, expiry and single use"},
 {"id":"recipient-substitution","change":"Replace settlement recipient","expected":"REJECT","condition":"Pinned merchant recipient"},
 {"id":"price-increase","change":"Source amount exceeds approved maximum","expected":"REJECT","condition":"Atomic-unit source cap"},
 {"id":"approval-expired","change":"Execute after approval expiration","expected":"REJECT","condition":"Unexpired authorization"},
 {"id":"approval-reuse","change":"Consume the same approval twice","expected":"REJECT","condition":"Single-use authorization"},
 {"id":"unsupported-route","change":"Pay using an unapproved asset or chain","expected":"REJECT","condition":"Exact asset and route restrictions"},
 {"id":"artifact-change","change":"Modify delivered file bytes","expected":"REJECT","condition":"Approved SHA-256 digest"}
]}
```

Use these cases as inputs to your own tests. RouteTill's Break-It Lab separately
executes its real policy, persistence and fulfillment handlers.
