import client from './client'


const getAllTemplatesFromMarketplaces = () => client.get('/marketplaces/templates')

const getAllCustomTemplates = () => client.get('/marketplaces/custom')
const saveAsCustomTemplate = (body) => client.post('/marketplaces/custom', body)
const deleteCustomTemplate = (id) => client.delete(`/marketplaces/custom/${id}`)

export default {
    getAllTemplatesFromMarketplaces,

    getAllCustomTemplates,
    saveAsCustomTemplate,
    deleteCustomTemplate
}
