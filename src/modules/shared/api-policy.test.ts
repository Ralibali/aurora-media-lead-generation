import {describe,expect,it} from 'vitest';
import {bearerToken,isPublicOperation,parseEnvelope} from '../../../supabase/functions/aurora-product-api/policy';
describe('product API request policy',()=>{
  it('does not accept the Aurora owner password or opaque keys as customer JWTs',()=>{
    for(const value of [null,'Bearer owner-password','Bearer sb_publishable_example','Basic abc','Bearer a.b.c extra'])expect(bearerToken(value)).toBeNull();
    expect(bearerToken('Bearer header.payload.signature')).toBe('header.payload.signature');
  });
  it('limits anonymous access to existing public read operations and inactive checkout',()=>{
    for(const product of ['care','sight','connect','local-boost','papers'] as const){
      for(const operation of ['getMe','claimFirstAdmin','processDocument','exportApproved','onboardOrganization','updateAgent','generateDemoActivity','setReportSharing'])expect(isPublicOperation(product,operation)).toBe(false);
    }
    expect(isPublicOperation('sight','getSharedReport')).toBe(true);
    expect(isPublicOperation('sight','getProviderStatus')).toBe(true);
  });
  it('rejects user-selected origins, unknown products and arbitrary paths',()=>{
    for(const value of [{product:'https://evil.test',operation:'getMe'},{product:'unknown',operation:'getMe'},{product:'care',operation:'../secret'}])expect(()=>parseEnvelope(value)).toThrow();
    expect(parseEnvelope({product:'papers',operation:'processDocument',data:{id:'one'}}).product).toBe('papers');
  });
});
