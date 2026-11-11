import {requireThat} from './types';
export function atomic(input:string,decimals=6):string {
  requireThat(/^(0|[1-9]\d*)(\.\d+)?$/.test(input),'INVALID_AMOUNT','Enter an exact positive decimal amount.');
  const [whole,part='']=input.split('.');
  requireThat(part.length<=decimals,'PRECISION','Amount exceeds token precision.');
  const value=BigInt(whole)*10n**BigInt(decimals)+BigInt(part.padEnd(decimals,'0')||'0');
  requireThat(value>0n && value<=10n**30n,'AMOUNT_RANGE','Amount is outside the supported range.');
  return value.toString();
}
export function assertAtomic(value:string){requireThat(/^[1-9]\d{0,29}$/.test(value),'INVALID_ATOMIC','Atomic amounts must be positive integer strings.');return BigInt(value);}
export function decimal(value:string,decimals=6){const n=BigInt(value);const unit=10n**BigInt(decimals);const fraction=(n%unit).toString().padStart(decimals,'0').replace(/0+$/,'');return `${n/unit}${fraction?'.'+fraction:''}`;}
