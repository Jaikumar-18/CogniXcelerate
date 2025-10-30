import client from './client'

const getAvailablePrompts = (body) => client.post(`/prompts-list`, body)
const getPrompt = (body) => client.post(`/load-prompt`, body)

// Direct Langfuse API calls using the curl command
const getLangfusePrompts = async () => {
    try {
        let allPrompts = []
        let currentPage = 1
        let hasMorePages = true
        const limit = 50 // Use a reasonable limit per page
        
        // Fetch all prompts by paginating through all pages
        while (hasMorePages) {
            const response = await fetch(`https://xcelerate.cogniwide.com:6443/langfuse/api/public/v2/prompts?page=${currentPage}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic cGstbGYtNWEyYmFlZmMtZTJjZi00ODBkLTlhNGQtNDY4NjAwYTZiNmE0OnNrLWxmLWJkMzk2ZTViLWE0MzgtNGRlYi04YzgxLTFjOTU4MTNjNGQ3OQ==',
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            
            // Add prompts from this page to our collection
            if (data.data && Array.isArray(data.data)) {
                allPrompts = [...allPrompts, ...data.data]
            }
            
            // Check if there are more pages
            if (data.meta && data.meta.totalPages) {
                hasMorePages = currentPage < data.meta.totalPages
                currentPage++
            } else {
                // If no pagination metadata, assume this is the last page
                hasMorePages = false
            }
        }
        
        return { data: allPrompts }
    } catch (error) {
        console.error('Error fetching Langfuse prompts:', error)
        throw error
    }
}

const getLangfusePromptByName = async (promptName) => {
    try {
        const response = await fetch(`https://xcelerate.cogniwide.com:6443/langfuse/api/public/v2/prompts/${promptName}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic cGstbGYtNWEyYmFlZmMtZTJjZi00ODBkLTlhNGQtNDY4NjAwYTZiNmE0OnNrLWxmLWJkMzk2ZTViLWE0MzgtNGRlYi04YzgxLTFjOTU4MTNjNGQ3OQ==',
                'Content-Type': 'application/json'
            }
        })
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        return { data }
    } catch (error) {
        console.error('Error fetching Langfuse prompt:', error)
        throw error
    }
}

const getLangfusePromptContent = async (promptName, version) => {
    try {
        console.log(`Fetching prompt details for: ${promptName}${version ? ` (version ${version})` : ''}`)
        
        // Use the working endpoint to get prompt details
        const response = await fetch(`https://xcelerate.cogniwide.com:6443/langfuse/api/public/v2/prompts/${promptName}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic cGstbGYtNWEyYmFlZmMtZTJjZi00ODBkLTlhNGQtNDY4NjAwYTZiNmE0OnNrLWxmLWJkMzk2ZTViLWE0MzgtNGRlYi04YzgxLTFjOTU4MTNjNGQ3OQ==',
                'Content-Type': 'application/json'
            }
        })
        
        if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ HTTP error! status: ${response.status}, response: ${errorText}`)
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log(`Successfully fetched prompt details for: ${promptName}`)
        console.log(`Response data structure:`, Object.keys(data))
        console.log(`Full response:`, JSON.stringify(data, null, 2))
        
        // If version is specified, we need to fetch the specific version
        if (version) {
            console.log(`Fetching specific version ${version} for prompt: ${promptName}`)
            
            // Use the working endpoint pattern that we know works
            const versionEndpoint = `https://xcelerate.cogniwide.com:6443/langfuse/api/public/v2/prompts/${promptName}?version=${version}`
            
            try {
                console.log(`Fetching from: ${versionEndpoint}`)
                const versionResponse = await fetch(versionEndpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic cGstbGYtNWEyYmFlZmMtZTJjZi00ODBkLTlhNGQtNDY4NjAwYTZiNmE0OnNrLWxmLWJkMzk2ZTViLWE0MzgtNGRlYi04YzgxLTFjOTU4MTNjNGQ3OQ==',
                        'Content-Type': 'application/json'
                    }
                })
                
                if (versionResponse.ok) {
                    const versionData = await versionResponse.json()
                    console.log(`Successfully fetched version ${version}:`, versionData)
                    return { data: versionData }
                } else {
                    const errorText = await versionResponse.text()
                    console.log(`Failed to fetch version ${version}, status: ${versionResponse.status}, response: ${errorText}`)
                    throw new Error(`Failed to fetch version ${version}: ${versionResponse.status}`)
                }
            } catch (error) {
                console.log(`Error fetching version ${version}:`, error.message)
                throw error
            }
        }
        
        return { data }
        
    } catch (error) {
        console.error('❌ Error fetching Langfuse prompt content:', error)
        throw error
    }
}

export default {
    getAvailablePrompts,
    getPrompt,
    getLangfusePrompts,
    getLangfusePromptByName,
    getLangfusePromptContent
}
