import { INodeParams, INodeCredential } from '../src/Interface'

// Scopes for OneDrive operations
const scopes = ['openid', 'offline_access', 'Files.Read.All', 'Files.ReadWrite.All', 'Sites.Read.All', 'Sites.ReadWrite.All']

class OneDriveOAuth2 implements INodeCredential {
    label: string
    name: string
    version: number
    inputs: INodeParams[]
    description: string

    constructor() {
        this.label = 'OneDrive OAuth2'
        this.name = 'oneDriveOAuth2'
        this.version = 1.0
        this.description = 'Microsoft OneDrive OAuth2 credential for accessing OneDrive files and folders'
        this.inputs = [
            {
                label: 'Authorization URL',
                name: 'authorizationUrl',
                type: 'string',
                default: 'https://login.microsoftonline.com/<tenantId>/oauth2/v2.0/authorize'
            },
            {
                label: 'Access Token URL',
                name: 'accessTokenUrl',
                type: 'string',
                default: 'https://login.microsoftonline.com/<tenantId>/oauth2/v2.0/token'
            },
            {
                label: 'Client ID',
                name: 'clientId',
                type: 'string'
            },
            {
                label: 'Client Secret',
                name: 'clientSecret',
                type: 'password'
            },
            {
                label: 'Scope',
                name: 'scope',
                type: 'string',
                hidden: true,
                default: scopes.join(' ')
            }
        ]
    }
}

module.exports = { credClass: OneDriveOAuth2 }
