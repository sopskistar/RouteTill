import type {Policy} from './types';

/** A provider's longer deposit lifetime never extends the human's purchase policy. */
export function fundingDeadline(policy:Pick<Policy,'expiresAt'>,response?:any):number {
 const dates=[policy.expiresAt];
 if(response){
  dates.push(response.quoteRequest?.deadline,response.quote?.deadline,response.quote?.timeWhenInactive);
 }
 const times=dates.map(value=>typeof value==='string'?Date.parse(value):NaN);
 return times.every(Number.isFinite)?Math.min(...times):0;
}

/** Subtract the whole round trip rather than trusting the buyer's wall clock. */
export function preflightBudget(packet:{validUntil:string;serverNow?:string;serverRequestAt?:string;checkedAt:string},roundTripMs:number):number {
 const serverNow=Date.parse(packet.serverNow||packet.checkedAt);
 const processing=packet.serverRequestAt?Math.max(0,serverNow-Date.parse(packet.serverRequestAt)):0;
 const transport=Math.max(0,roundTripMs-processing);
 const budget=Date.parse(packet.validUntil)-serverNow-transport;
 return Number.isFinite(budget)?Math.max(0,budget):0;
}
