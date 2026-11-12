/** Original CC0 demonstration resource. The legacy Field Notes product stays available. */
export const RESOURCE_TITLE='Agent Purchase Test Vectors';
export const RESOURCE_DESCRIPTION='Seven synthetic checkout cases for a developer test plan. A deterministic agent verifies the purchased file and summarizes its expected outcomes.';
export const RESOURCE_ARTIFACT=`# Agent Purchase Test Vectors

Original synthetic developer resource by RouteTill Labs. License: CC0-1.0.
Version: 1. These are illustrative fixtures, not measured production or market data.

A developer agent can turn these records into a regression-test plan after purchasing
and checking this exact file. The expected outcomes are supplied fixture labels;
processing them does not independently test a payment system or establish quality.

\`\`\`json
{"format":"routetill.purchase-vectors.v1","cases":[
 {"id":"approved-purchase","change":"All approved terms match","expected":"ACCEPT","condition":"Exact merchant, product, route, limit, expiry and single use"},
 {"id":"recipient-substitution","change":"Replace settlement recipient","expected":"REJECT","condition":"Pinned merchant recipient"},
 {"id":"price-increase","change":"Source amount exceeds approved maximum","expected":"REJECT","condition":"Atomic-unit source cap"},
 {"id":"approval-expired","change":"Execute after approval expiration","expected":"REJECT","condition":"Unexpired authorization"},
 {"id":"approval-reuse","change":"Consume the same approval twice","expected":"REJECT","condition":"Single-use authorization"},
 {"id":"unsupported-route","change":"Pay using an unapproved asset or chain","expected":"REJECT","condition":"Exact asset and route restrictions"},
 {"id":"artifact-change","change":"Modify delivered file bytes","expected":"REJECT","condition":"Approved SHA-256 digest"}
]}
\`\`\`

Use these cases as inputs to your own tests. RouteTill's Break-It Lab separately
executes its real policy, persistence and fulfillment handlers.
`;
export function analyseResource(text:string){
 if(text.length>16000)throw new Error('Developer resource exceeds the supported file limit.');
 const block=text.match(/```json\s*([\s\S]*?)```/);
 if(!block)throw new Error('This download has no supported purchase-vector dataset. Generic digital downloads remain available.');
 const resource=JSON.parse(block[1]);
 if(resource.format!=='routetill.purchase-vectors.v1'||!Array.isArray(resource.cases)||resource.cases.length<1||resource.cases.length>100)throw new Error('Unsupported developer resource format.');
 const tests=resource.cases.map((row:any)=>{
  if(!row||typeof row.id!=='string'||row.id.length>100||typeof row.condition!=='string'||row.condition.length>200||typeof row.change!=='string'||row.change.length>200||!['ACCEPT','REJECT'].includes(row.expected))throw new Error('Invalid purchase-vector record.');
  return {id:row.id,scenario:row.change,assertion:row.condition,expected:row.expected};
 });
 if(new Set(tests.map((t:any)=>t.id)).size!==tests.length)throw new Error('Duplicate test-vector identifiers.');
 return {format:'routetill.test-plan.v1',processor:'Deterministic fixture processing; no LLM',sourceLicense:'CC0-1.0',caseCount:tests.length,expectedAccept:tests.filter((t:any)=>t.expected==='ACCEPT').length,expectedReject:tests.filter((t:any)=>t.expected==='REJECT').length,tests,limitation:'Summarizes supplied synthetic labels. This output does not execute tests or prove the resource is correct.'};
}
