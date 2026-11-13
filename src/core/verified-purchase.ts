// Public snapshot of one independently verified purchase, not a live counter.
export const verifiedPurchase={
 orderId:'655d4cc9-0eaf-41b7-a7bf-05fc73286eea',
 sourceTransaction:'0x1afadae771327b11deb4132df51953bd307e2d13c57a8e276ec95f420e5a4a81',
 merchantTransaction:'0x8cc1225a938538842a42db97b5e3592fb37ede94632872d626dd91d1acafe121',
 refundTransaction:'0x040de1f0e88378fcabcaa141480c5fa5499c329a8d899e4b4426fa7c8a6965a6',
 artifactSha256:'f7ecb13c8d1b1576b17311ad3eb3a18848f44bdac3a742dbc66e0ba726f65643',
 sourceUsdc:'10.105156',merchantUsdc:'10',refundUsdc:'0.095729',artifactBytes:1613,verifierChecks:12,
 passportUrl:'https://routetill.vercel.app/passport/655d4cc9-0eaf-41b7-a7bf-05fc73286eea?mode=live',
 evidencePath:'docs/evidence/mainnet-655d4cc9-0eaf-41b7-a7bf-05fc73286eea'
} as const;
export const proofLinks={
 source:`https://arbiscan.io/tx/${verifiedPurchase.sourceTransaction}`,
 merchant:`https://basescan.org/tx/${verifiedPurchase.merchantTransaction}`,
 refund:`https://arbiscan.io/tx/${verifiedPurchase.refundTransaction}`,
 evidence:`https://github.com/sopskistar/RouteTill/tree/main/${verifiedPurchase.evidencePath}`
};
