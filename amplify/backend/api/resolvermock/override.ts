import { AmplifyApiGraphQlResourceStackTemplate } from '@aws-amplify/cli-extensibility-helper';


function getName(query: string, action: string, model: string, resolverType: string, resolverNum: number) {
  console.log(`\x1b[38;2;106;153;85;1m  Data Source: \x1b[38;2;156;220;254m${query}.${action}.${model}.${resolverType}.${resolverNum}\x1b[m`)
  return `${query}${action}${model}${resolverType}${resolverNum}Function${query}${action}${model}${resolverType}${resolverNum}Function.AppSyncFunction`
}


export function override(resources: AmplifyApiGraphQlResourceStackTemplate) {
  resources.models["Blog"]
    .appsyncFunctions[getName('Mutation', 'delete', 'Blog', 'preUpdate', 0)]
    .dataSourceName = "PostTable";
}

