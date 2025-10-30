import { omit } from 'lodash'
import { ICommonObject, IDocument, INode, INodeData, INodeParams, INodeOptionsValue } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import {
    convertMultiOptionsToStringArray,
    getCredentialData,
    getCredentialParam,
    handleEscapeCharacters,
    INodeOutputsValue,
    refreshOAuth2Token
} from '../../../src'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { LoadOfSheet } from '../MicrosoftExcel/ExcelLoader'
import { PowerpointLoader } from '../MicrosoftPowerpoint/PowerpointLoader'

// Helper function to get human-readable MIME type labels
const getMimeTypeLabel = (mimeType: string): string | undefined => {
    const mimeTypeLabels: { [key: string]: string } = {
        'application/pdf': 'PDF',
        'text/plain': 'Text File',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Doc',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel File',
        'application/vnd.ms-excel': 'Excel File (Legacy)',
        'application/vnd.ms-powerpoint': 'PowerPoint (Legacy)',
        'application/msword': 'Word Doc (Legacy)',
        'text/csv': 'CSV File',
        'text/html': 'HTML File',
        'application/json': 'JSON File'
    }
    return mimeTypeLabels[mimeType] || undefined
}

// Helper function to extract file/folder ID from OneDrive sharing link
const extractOneDriveId = (link: string): { id: string; isFolder: boolean } | null => {
    try {
        // Handle different OneDrive link formats
        const url = new URL(link.trim())

        // Format: https://1drv.ms/u/s!... or https://1drv.ms/f/s!...
        if (url.hostname === '1drv.ms') {
            const pathParts = url.pathname.split('/')
            if (pathParts.length >= 3) {
                const isFolder = pathParts[1] === 'f'
                const id = pathParts[2]
                if (id && id.startsWith('s!')) {
                    return { id, isFolder }
                }
            }
        }

        // Format: https://onedrive.live.com/redir?resid=... or https://onedrive.live.com/edit.aspx?cid=...
        if (url.hostname === 'onedrive.live.com') {
            const searchParams = url.searchParams
            const resid = searchParams.get('resid')
            const cid = searchParams.get('cid')

            if (resid) {
                return { id: resid, isFolder: false }
            }
            if (cid) {
                return { id: cid, isFolder: true }
            }
        }

        // Format: https://company.sharepoint.com/.../Documents/... (SharePoint/OneDrive for Business)
        if (url.hostname.includes('sharepoint.com')) {
            const pathParts = url.pathname.split('/')
            // Look for the document ID in the URL path
            for (let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i]
                if (part && (part.startsWith('s!') || part.length > 20)) {
                    return { id: part, isFolder: false }
                }
            }
        }

        // Format: Direct file/folder IDs (if user pastes just the ID)
        if (link.startsWith('s!') || link.startsWith('B!') || link.length > 20) {
            // Assume it's a file ID by default, will be determined by API call
            return { id: link, isFolder: false }
        }

        return null
    } catch (error) {
        console.warn(`Failed to parse OneDrive link: ${link}`)
        return null
    }
}

class OneDrive_DocumentLoaders implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    credential: INodeParams
    inputs: INodeParams[]
    outputs: INodeOutputsValue[]

    constructor() {
        this.label = 'OneDrive'
        this.name = 'oneDrive'
        this.version = 1.0
        this.type = 'Document'
        this.icon = 'onedrive.svg'
        this.category = 'Document Loaders'
        this.description = `Load documents from Microsoft OneDrive files using sharing links, file selection, or folder IDs`
        this.baseClasses = [this.type]
        this.credential = {
            label: 'Connect Credential',
            name: 'credential',
            type: 'credential',
            description: 'OneDrive OAuth2 Credential',
            credentialNames: ['oneDriveOAuth2']
        }
        this.inputs = [
            {
                label: 'OneDrive Links',
                name: 'oneDriveLinks',
                type: 'string',
                description: 'OneDrive sharing links (comma-separated). Supports both file and folder links.',
                placeholder: 'https://1drv.ms/u/s!..., https://1drv.ms/f/s!...',
                optional: true
            },
            {
                label: 'Select Files',
                name: 'selectedFiles',
                type: 'asyncMultiOptions',
                loadMethod: 'listFiles',
                description: 'Select files from your OneDrive',
                refresh: true,
                optional: true
            },
            {
                label: 'Folder ID',
                name: 'folderId',
                type: 'string',
                description: 'OneDrive folder ID to load all files from (alternative to selecting specific files)',
                placeholder: 'B!IqtDmSxFiEeqAqB8gEtc5nC7RxZyJLlN97qDLgknulpBnyLl9S!PQ!6ab35bf',
                optional: true
            },
            {
                label: 'File Types',
                name: 'fileTypes',
                type: 'multiOptions',
                description: 'Types of files to load',
                options: [
                    {
                        label: 'PDF Files',
                        name: 'application/pdf'
                    },
                    {
                        label: 'Word Documents',
                        name: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    },
                    {
                        label: 'PowerPoint Presentations',
                        name: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                    },
                    {
                        label: 'Excel Spreadsheets',
                        name: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                    {
                        label: 'Text Files',
                        name: 'text/plain'
                    },
                    {
                        label: 'CSV Files',
                        name: 'text/csv'
                    },
                    {
                        label: 'HTML Files',
                        name: 'text/html'
                    },
                    {
                        label: 'JSON Files',
                        name: 'application/json'
                    }
                ],
                default: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'text/csv'
                ]
            },
            {
                label: 'Include Subfolders',
                name: 'includeSubfolders',
                type: 'boolean',
                description: 'Whether to include files from subfolders when using folder ID',
                default: true
            },
            {
                label: 'Max Files',
                name: 'maxFiles',
                type: 'number',
                description: 'Maximum number of files to load (when using folder ID). Enter a positive integer.',
                default: 50,
                step: 1
            },
            {
                label: 'Text Splitter',
                name: 'textSplitter',
                type: 'TextSplitter',
                description: 'Text splitter to use for splitting documents',
                optional: true
            },
            {
                label: 'Metadata',
                name: 'metadata',
                type: 'json',
                description: 'Additional metadata to be added to the documents',
                optional: true,
                additionalParams: true
            },
            {
                label: 'Omit Metadata Keys',
                name: 'omitMetadataKeys',
                type: 'string',
                rows: 3,
                description: 'Metadata keys to omit from the documents, separated by comma. Use * to omit all metadata.',
                placeholder: 'key1, key2, key3',
                optional: true,
                additionalParams: true
            }
        ]
        this.outputs = [
            {
                label: 'Document',
                name: 'document',
                description: 'Array of document objects',
                baseClasses: ['Document']
            },
            {
                label: 'Text',
                name: 'text',
                description: 'Concatenated text from all documents',
                baseClasses: ['string']
            }
        ]
    }

    //@ts-ignore
    loadMethods = {
        async listFiles(nodeData: INodeData, options: ICommonObject): Promise<INodeOptionsValue[]> {
            const returnOptions: INodeOptionsValue[] = []

            try {
                const credentialData = await getCredentialData(nodeData.credential ?? '', options)
                const accessToken = getCredentialParam('access_token', credentialData, nodeData)

                if (!accessToken) {
                    throw new Error('No access token found in credential')
                }

                // List files from OneDrive using Microsoft Graph API
                const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()
                const files = data.value || []

                for (const file of files) {
                    if (file.file) {
                        returnOptions.push({
                            label: `${file.name} (${getMimeTypeLabel(file.file.mimeType) || 'Unknown Type'})`,
                            name: file.id,
                            description: `Size: ${(file.size / 1024).toFixed(2)} KB`
                        })
                    }
                }

                return returnOptions
            } catch (error) {
                console.error('Error listing OneDrive files:', error)
                return []
            }
        }
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const oneDriveLinks = nodeData.inputs?.oneDriveLinks as string
        const selectedFiles = nodeData.inputs?.selectedFiles as string
        const folderId = nodeData.inputs?.folderId as string
        const fileTypes = nodeData.inputs?.fileTypes as string[]
        const includeSubfolders = nodeData.inputs?.includeSubfolders as boolean
        const maxFiles = (nodeData.inputs?.maxFiles as number) || 50
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const metadata = nodeData.inputs?.metadata
        const _omitMetadataKeys = nodeData.inputs?.omitMetadataKeys as string
        const output = nodeData.outputs?.output as string

        let omitMetadataKeys: string[] = []
        if (_omitMetadataKeys) {
            omitMetadataKeys = _omitMetadataKeys.split(',').map((key) => key.trim())
        }

        if (!oneDriveLinks && !selectedFiles && !folderId) {
            throw new Error('Either OneDrive links, selected files, or Folder ID is required')
        }

        let credentialData = await getCredentialData(nodeData.credential ?? '', options)
        credentialData = await refreshOAuth2Token(nodeData.credential ?? '', credentialData, options)
        const accessToken = getCredentialParam('access_token', credentialData, nodeData)

        if (!accessToken) {
            throw new Error('No access token found in credential')
        }

        let docs: IDocument[] = []

        try {
            let filesToProcess: any[] = []

            if (oneDriveLinks) {
                // Process OneDrive links
                const links = oneDriveLinks
                    .split(',')
                    .map((link) => link.trim())
                    .filter((link) => link.length > 0)

                for (const link of links) {
                    const extractedInfo = extractOneDriveId(link)
                    if (!extractedInfo) {
                        console.warn(`Could not extract ID from OneDrive link: ${link}`)
                        continue
                    }

                    const { id, isFolder } = extractedInfo

                    if (isFolder) {
                        // Process folder
                        const folderFiles = await this.getFilesFromFolder(id, accessToken, fileTypes, includeSubfolders, maxFiles)
                        filesToProcess.push(...folderFiles)
                    } else {
                        // Process single file
                        const fileInfo = await this.getFileInfo(id, accessToken)
                        if (fileInfo && this.shouldProcessFile(fileInfo, fileTypes)) {
                            filesToProcess.push(fileInfo)
                        }
                    }
                }
            } else if (selectedFiles) {
                // Load selected files (selectedFiles can be a single ID or comma-separated IDs)
                let ids: string[] = []
                if (typeof selectedFiles === 'string' && selectedFiles.startsWith('[') && selectedFiles.endsWith(']')) {
                    ids = convertMultiOptionsToStringArray(selectedFiles)
                } else if (typeof selectedFiles === 'string') {
                    ids = [selectedFiles]
                } else if (Array.isArray(selectedFiles)) {
                    ids = selectedFiles
                }
                for (const id of ids) {
                    const fileInfo = await this.getFileInfo(id, accessToken)
                    if (fileInfo && this.shouldProcessFile(fileInfo, fileTypes)) {
                        filesToProcess.push(fileInfo)
                    }
                }
            } else if (folderId) {
                // Load files from folder
                filesToProcess = await this.getFilesFromFolder(folderId, accessToken, fileTypes, includeSubfolders, maxFiles)
            }

            // Process each file
            for (const fileInfo of filesToProcess) {
                try {
                    const doc = await this.processFile(fileInfo, accessToken)
                    if (doc.length > 0) {
                        docs.push(...doc)
                    }
                } catch (error) {
                    console.warn(`Failed to process file ${fileInfo.name}: ${error.message}`)
                }
            }

            // Apply text splitter if provided
            if (textSplitter && docs.length > 0) {
                docs = await textSplitter.splitDocuments(docs)
            }

            // Apply metadata
            if (metadata && docs.length > 0) {
                docs = docs.map((doc) => ({
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        ...metadata
                    }
                }))
            }

            // Apply omit metadata keys
            if (omitMetadataKeys.length > 0 && docs.length > 0) {
                docs = docs.map((doc) => ({
                    ...doc,
                    metadata: omit(doc.metadata, omitMetadataKeys)
                }))
            }

            if (output === 'document') {
                return docs
            } else {
                let finaltext = ''
                for (const doc of docs) {
                    finaltext += `${doc.pageContent}\n`
                }
                return handleEscapeCharacters(finaltext, false)
            }
        } catch (error) {
            throw new Error(`Error processing OneDrive files: ${error.message}`)
        }
    }

    private async getFileInfo(fileId: string, accessToken: string): Promise<any> {
        try {
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to get file info: ${response.status} ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error(`Error getting file info for ${fileId}:`, error)
            return null
        }
    }

    private async getFilesFromFolder(
        folderId: string,
        accessToken: string,
        fileTypes: string[] | undefined,
        includeSubfolders: boolean,
        maxFiles: number
    ): Promise<any[]> {
        try {
            let allFiles: any[] = []
            let processedCount = 0

            const processFolder = async (currentFolderId: string, depth: number = 0): Promise<void> => {
                if (processedCount >= maxFiles || depth > 10) return // Prevent infinite recursion

                const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${currentFolderId}/children`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    throw new Error(`Failed to get folder contents: ${response.status} ${response.statusText}`)
                }

                const data = await response.json()
                const items = data.value || []

                for (const item of items) {
                    if (processedCount >= maxFiles) break

                    if (item.file) {
                        // It's a file
                        if (this.shouldProcessFile(item, fileTypes)) {
                            allFiles.push(item)
                            processedCount++
                        }
                    } else if (item.folder && includeSubfolders) {
                        // It's a folder, recursively process it
                        await processFolder(item.id, depth + 1)
                    }
                }
            }

            await processFolder(folderId)
            return allFiles
        } catch (error) {
            console.error('Error getting files from folder:', error)
            return []
        }
    }

    private shouldProcessFile(fileInfo: any, fileTypes: string[] | undefined): boolean {
        if (!fileInfo.file || !fileInfo.file.mimeType) return false

        if (!fileTypes || fileTypes.length === 0) return true

        return fileTypes.includes(fileInfo.file.mimeType)
    }

    private async processFile(fileInfo: any, accessToken: string): Promise<IDocument[]> {
        const mimeType = fileInfo.file.mimeType
        const fileName = fileInfo.name
        const fileSize = fileInfo.size

        if (fileSize > 100 * 1024 * 1024) {
            // 100MB limit
            throw new Error(`File ${fileName} is too large (${(fileSize / 1024 / 1024).toFixed(2)} MB). Maximum size is 100 MB.`)
        }

        try {
            if (this.isSupportedBinaryFile(mimeType)) {
                return await this.processBinaryFile(fileInfo, accessToken)
            } else if (this.isTextBasedFile(mimeType)) {
                return await this.processTextFile(fileInfo, accessToken)
            } else {
                console.warn(`Unsupported file type: ${mimeType} for file: ${fileName}`)
                return []
            }
        } catch (error) {
            console.error(`Error processing file ${fileName}:`, error)
            return []
        }
    }

    private isSupportedBinaryFile(mimeType: string): boolean {
        const supportedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/vnd.ms-powerpoint',
            'application/msword'
        ]
        return supportedTypes.includes(mimeType)
    }

    private isTextBasedFile(mimeType: string): boolean {
        const textTypes = ['text/plain', 'text/csv', 'text/html', 'application/json']
        return textTypes.includes(mimeType)
    }

    private async processBinaryFile(fileInfo: any, accessToken: string): Promise<IDocument[]> {
        const mimeType = fileInfo.file.mimeType
        const fileName = fileInfo.name
        const fileId = fileInfo.id

        try {
            // Download the file content
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
            }

            const buffer = Buffer.from(await response.arrayBuffer())
            const tempFilePath = await this.createTempFile(buffer, fileName, mimeType)

            let docs: IDocument[] = []

            try {
                if (mimeType === 'application/pdf') {
                    const loader = new PDFLoader(tempFilePath)
                    docs = await loader.load()
                } else if (mimeType.includes('wordprocessingml.document') || mimeType === 'application/msword') {
                    const loader = new DocxLoader(tempFilePath)
                    docs = await loader.load()
                } else if (mimeType.includes('spreadsheetml.sheet') || mimeType === 'application/vnd.ms-excel') {
                    const loader = new LoadOfSheet(tempFilePath)
                    docs = await loader.load()
                } else if (mimeType.includes('presentationml.presentation') || mimeType === 'application/vnd.ms-powerpoint') {
                    const loader = new PowerpointLoader(tempFilePath)
                    docs = await loader.load()
                }

                // Add metadata
                docs = docs.map((doc) => ({
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        source: fileName,
                        mimeType: mimeType,
                        fileId: fileId,
                        sourceType: 'onedrive'
                    }
                }))

                return docs
            } finally {
                // Clean up temp file
                try {
                    fs.unlinkSync(tempFilePath)
                } catch (cleanupError) {
                    console.warn('Failed to clean up temp file:', cleanupError)
                }
            }
        } catch (error) {
            throw new Error(`Failed to process binary file ${fileName}: ${error.message}`)
        }
    }

    private async processTextFile(fileInfo: any, accessToken: string): Promise<IDocument[]> {
        const mimeType = fileInfo.file.mimeType
        const fileName = fileInfo.name
        const fileId = fileInfo.id

        try {
            // Download the file content
            const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
            }

            let content: string
            if (mimeType === 'text/csv') {
                const csvLoader = new CSVLoader(response.body as any)
                const docs = await csvLoader.load()
                return docs.map((doc) => ({
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        source: fileName,
                        mimeType: mimeType,
                        fileId: fileId,
                        sourceType: 'onedrive'
                    }
                }))
            } else {
                content = await response.text()
            }

            return [
                {
                    pageContent: content,
                    metadata: {
                        source: fileName,
                        mimeType: mimeType,
                        fileId: fileId,
                        sourceType: 'onedrive'
                    }
                }
            ]
        } catch (error) {
            throw new Error(`Failed to process text file ${fileName}: ${error.message}`)
        }
    }

    private async createTempFile(buffer: Buffer, fileName: string, _mimeType: string): Promise<string> {
        const tempDir = os.tmpdir()
        const tempFileName = `onedrive_${Date.now()}_${fileName}`
        const tempFilePath = path.join(tempDir, tempFileName)

        fs.writeFileSync(tempFilePath, buffer)
        return tempFilePath
    }
}

module.exports = { nodeClass: OneDrive_DocumentLoaders }
