const PRODUCTS = ['care','sight','connect','local-boost','papers'] as const;
export type Product = typeof PRODUCTS[number];
export function isProduct(value:unknown):value is Product {return typeof value==='string'&&(PRODUCTS as readonly string[]).includes(value);}
export function isPublicOperation(product:Product,operation:string) {
  return (product==='care'&&operation==='createCheckoutSession') || (product==='sight'&&['getProviderStatus','getPricingPlans','getSharedReport'].includes(operation));
}
export function bearerToken(value:string|null):string|null {
  if(!value?.startsWith('Bearer '))return null;
  const token=value.slice(7);
  return token.length<=12000&&/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)?token:null;
}
export function parseEnvelope(value:unknown):{product:Product;operation:string;data:unknown} {
  if(!value||typeof value!=='object')throw new Error('Ogiltig begäran.');
  const input=value as Record<string,unknown>;
  if(!isProduct(input.product)||typeof input.operation!=='string'||!/^\w{1,80}$/.test(input.operation))throw new Error('Okänd tjänst eller åtgärd.');
  return {product:input.product,operation:input.operation,data:input.data};
}
