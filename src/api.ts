import jwt from "jsonwebtoken";
import tiny from 'tiny-json-http';
import * as uuid from "uuid";
import awsConfig from './aws.config';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';

interface FakeUserTokenPayload {
  "cognito:username": string
  auth_time: number,
  email: string,
  email_verified: boolean,
  event_id: string,
  iat: number,
  jti: string,
  sub: string,
  token_use: "id",
}

export class FakeUser {
  private _idToken: string
  private _payload: FakeUserTokenPayload
  constructor(payload?: Partial<FakeUserTokenPayload>) {
    this._payload = {
      "cognito:username": 'USER NAME',
      auth_time: Date.now(),
      email: 'test@test.de',
      email_verified: true,
      event_id: uuid.v4(),
      iat: Date.now(),
      jti: uuid.v4(),
      sub: uuid.v4(),
      token_use: "id",
      ...payload
    }
    this._idToken = createIdToken(this._payload)
  }

  public get idToken(): string { return this._idToken }
  public get payload(): FakeUserTokenPayload { return this._payload }

  public set payload(v: Partial<FakeUserTokenPayload>) {
    this._payload = { ...this._payload, ...v };
    this._idToken = createIdToken(this._payload)
  }

  private async graphQLCall(query: string, queryKey: string, variables?: object) {
    const res = (await tiny.post({
      url: awsConfig.aws_appsync_graphqlEndpoint,
      headers: {
        Authorization: this._idToken,
      },
      data: {
        query,
        variables,
      },
    })).body
    if (res.errors) {
      let err = '\n'
      res.errors.forEach((e: any, i: number) => err += `\x1b[38;2;255;0;0m${queryKey} error[${i}]: ${e?.message.replace(/"/g, "'")}\x1b[m\n`)
      throw err
    }
    return res.data[queryKey]
  }

  public async query(query: keyof typeof queries, variables?: object) {
    return this.graphQLCall(queries[query], query, variables)
  }

  public async mutation(mutaion: keyof typeof mutations, variables: object) {
    return this.graphQLCall(mutations[mutaion], mutaion, variables)
  }

}

const VERY_SECRET_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIIEogIBAAKCAQEA2uLO7yh1/6Icfd89V3nNTc/qhfpDN7vEmOYlmJQlc9/RmOns\n26lg88fXXFntZESwHOm7/homO2Ih6NOtu4P5eskGs8d8VQMOQfF4YrP+pawVz+gh\n1S7eSvzZRDHBT4ItUuoiVP1B9HN/uScKxIqjmitpPqEQB/o2NJv8npCfqUAU+4Km\nxquGtjdmfctswSZGdz59M3CAYKDfuvLH9/vV6TRGgbUaUAXWC2WJrbbEXzK3XUDB\nrmF3Xo+yw8f3SgD3JOPl3HaaWMKL1zGVAsge7gQaGiJBzBurg5vwN61uDGGz0QZC\n1JqcUTl3cZnrx/L8isIR7074SJEuljIZRnCcjQIDAQABAoIBAE6MIbJVFLMdm5fX\n6o1fmjsYJ5LYkhKIAS7VOBye3SnN4cs79tGE4NPanP/5DWVz+LcHcXzoKVwaBQ0m\nGSw3WemkBhGxvn5LUGx9mLPi37jYHiOzq6By5zaFsfn02OgNUPJ2LsfM8kQkxmrN\nBeIt1jPW7DebWMNkGNucNnU4dPMo76efbxk7oico0BYVEaV8MyDkPwrVexWsiYcC\nQ/zGqDfKm6rgXg48tqdtGLBcHy65Vkq/G0U+eFlQKjuDLvJBtEPhRnVPWzAwU7zx\ngGsa/Ks4F11nKFxDPgcjo7FwHFupu4YXstr84XyftrEgIix7EH3AC8ArrnjcWTc6\n3WYE6MkCgYEA+7Wp/s52Z6Bj5Lggy7ps8LNIFvwFeZkFffT13lsShMUApkEufYsF\notqVR7NdUh8eZ2ES+dE/qCo3TRLWe93BKAWlqZ3LbPXCAaQ6hYVk7g+g0KogXG73\nzY0wnyg5hAU+PMPKiKwbqIC63QzAU7Tn+neiL807BrN4MUQbnLmODU8CgYEA3p3r\nC13eOFSaGy306cFzpApgEwT4UXvT6DCUL3EJZVyDWwyPIuQwiuyso8yJCq210TFD\nEne6ReZhHEM53T56/17AuXDfo4/xGvWfuVZLRHtS0mxjRzqSoepL76s+ux1jFmRu\nz/b+FlkR6P+QeW/AFcSoWLycjARQgO2jOfHPWWMCgYBTeHHQOt1PDgQyY9EUXlUk\nGP/uB1M1eMY2d9ZVD3R7rOzDNVhab5DF6aCZb2SiCAnIFIv7ZiWq+ZzvJTEVUHtu\nbzj5n4dHMdRNQQ3bG1pWC76zk8c5f98TPiACl49DNY3nDrKKUjC110KgbUsWNya6\ni5OwMGnDlh5kkAZsGah+xwKBgGTSHm5Cb+8RGc4vbRkk3OuxKzvR52h37UveHG60\nAe5fDLqCoJzLvdRdRf7VFke4znxUlCzb/ofDw71aEO3La0cWsbAKl65q9WYhUdpN\nY787HxJftkK/G0OragK8iqeRspuklq8nDIIwirT8cYEeBF+XdiriGQAswAz0ExWe\nFytDAoGALg+HzxIdHjWkjjbaOba+TnYbixi1Sn9jFGQXJaovzl8nQaNF/qiTNK3y\nIYBz4cVp9gXfn8FA/kUIMZxq1romb6zp3W2sZkcRD2D40z63pRBkdGknwebSmdy9\nPnwfqONAFKzgJX514vGhM+e7gfoIrUayiVG+fNG2h4nXR1qnUTw=\n-----END RSA PRIVATE KEY-----"
function createIdToken(payload: FakeUserTokenPayload) {
  return jwt.sign(payload, VERY_SECRET_KEY, {
    algorithm: "RS256",
    issuer: 'https://cognito-idp.localhost',
    expiresIn: '1d',
    audience: 'user_pool_id',
    keyid: "CognitoLocal",
  });
}



export async function hasThrown(func: Promise<any>) {
  try {
    await func
    return false
  } catch (e) {
    console.log(e)
    return true
  }
}