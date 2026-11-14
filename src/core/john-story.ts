/** One illustrative story shared by the homepage and interactive guided demo. */
export const johnStory=[
 {name:'Agent finds it',title:'John needs a dataset.',body:"An agent proposes a merchant’s developer dataset for 10 USDC. John has USDC on Arbitrum; the merchant wants USDC on Base. John wants the file without handing over his wallet."},
 {name:'No blank check',title:'His money. His decision.',body:"The agent can propose a purchase, but cannot approve it or sign a transfer. John stays in control. The merchant lists the file, sets its price and chooses a supported receiving wallet."},
 {name:'John says yes',title:'One file. One approval.',body:"John reviews the seller, product, price, refund address, expected file hash and deadline. He sets an 11 USDC limit for the source payment and authorizes this purchase. He separately confirms the wallet transfer. Network gas is additional."},
 {name:'Payment verified',title:'Paid on Arbitrum. Received on Base.',body:'For the recorded purchase, John deposited 10.105156 USDC on Arbitrum. NEAR Intents settled exactly 10 USDC to the merchant on Base, and 0.095729 USDC returned to the approved Arbitrum refund address. RouteTill independently checked the merchant receipt before delivery.'},
 {name:'File + proof',title:'Delivered. With proof.',body:'The merchant receives the payment. John gets one durable entitlement to the matching file and a signed Purchase Passport linking approval, payment evidence and the delivered bytes. The hash checks bytes, not their usefulness.'}
] as const;
