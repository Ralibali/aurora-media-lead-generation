import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.104.0';
export type ProductContext={supabase:SupabaseClient;userId:string};
export const requireSupabaseAuth=Symbol('authenticated product session');
export type ProductOperation=((input:{data:unknown;context:ProductContext})=>Promise<unknown>) & {requiresAuth:boolean};
function builder<T>(validate:(input:unknown)=>T,requiresAuth:boolean) {
  return {
    inputValidator<Input,Output>(validator:(input:Input)=>Output){return builder((input:unknown)=>validator(input as Input),requiresAuth);},
    middleware(_middleware:unknown[]){return builder(validate,true);},
    handler<Output>(handler:(input:{data:T;context:ProductContext})=>Promise<Output>):ProductOperation {
      const operation=async(input:{data:unknown;context:ProductContext})=>handler({...input,data:validate(input.data)});
      return Object.assign(operation,{requiresAuth});
    },
  };
}
export function createServerFn(_options:unknown) {return builder((input:unknown)=>input,false);}
