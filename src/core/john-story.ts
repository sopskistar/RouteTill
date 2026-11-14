/** One illustrative story shared by the homepage and interactive guided demo. */
export const johnStory=[
 {name:'Agent finds it',title:'John needs a dataset.',body:"An agent proposes a merchant’s developer dataset for 10 USDC. John has USDC on Arbitrum; the merchant wants USDC on Base. John wants the file without handing over his wallet."},
 {name:'No blank check',title:'His money. His decision.',body:"The agent can propose a purchase, but cannot approve it or sign a transfer. John stays in control. The merchant lists the file, sets its price and chooses a supported receiving wallet."},
 {name:'John says yes',title:'One file. One approval.',body:"John reviews the seller, product, price, refund wallet, expected file hash and deadline. He sets an 11 USDC source cap and authorizes this purchase. Wallet confirmation is a separate, personal step; ETH gas is additional."},
 {name:'Payment verified',title:'Paid on Arbitrum. Received on Base.',body:'John personally confirms the source payment in his wallet. NEAR Intents 1Click routes Arbitrum USDC to Base USDC. RouteTill checks the intended merchant’s receipt, token, amount and finality before delivery.'},
 {name:'File + proof',title:'Delivered. With proof.',body:'The merchant receives the payment. John gets one durable entitlement to the matching file and a signed Purchase Passport linking approval, payment evidence and the delivered bytes. The hash checks bytes, not their usefulness.'}
] as const;
