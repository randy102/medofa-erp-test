import {CK} from "./Keys";
import {OdooRPC} from "../utils";

export class GlobalCache{
    static CACHE_PULL = new Map<CK,(rpc: OdooRPC) => Promise<any>>()

    static provide(key: CK, callback: (rpc: OdooRPC) => Promise<any>){
        this.CACHE_PULL.set(key, callback)
    }

     static async get(key: CK): Promise<any>{
        const CACHE: Map<CK, any> = this.getCacheFromEnv()

        if (CACHE.has(key)){
            console.log("GlobalCache: cache hit!")
            return CACHE.get(key)
        }
        else{
            console.log("GlobalCache: cache missed!")
            const value = await this.CACHE_PULL.get(key)(OdooRPC.getInstance())
            CACHE.set(key,value)
            Cypress.env('global_cache', CACHE)
            return value
        }
    }

     static getCacheFromEnv(): Map<CK, any>{
        let cache = Cypress.env('global_cache')
        if (!cache){
            cache = new Map()
            Cypress.env('global_cache', cache)
        }
        return cache
    }
}

import './setup'
