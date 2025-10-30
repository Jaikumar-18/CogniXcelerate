import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

// material-ui
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme,
    alpha,
    Alert,
    Skeleton,
    FormControl,
    OutlinedInput,
    Chip,
    TableSortLabel,
    Tooltip,
    Tabs,
    Tab,
    MenuItem
} from '@mui/material'
import {
    IconEraser,
    IconTrash,
    IconWorld,
    IconRobot,
    IconCode,
    IconCopy,
    IconCheck,
    IconSearch,
    IconMessages,
    IconApi
} from '@tabler/icons-react'
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'
import { StyledButton } from '@/ui-component/button/StyledButton'
import APICodeDialog from '@/views/chatflows/APICodeDialog'

// API
import scraperApi from '@/api/scraper'
import chatflowsApi from '@/api/chatflows'
import marketplacesApi from '@/api/marketplaces'

// utils
import useNotifier from '@/utils/useNotifier'
import moment from 'moment'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'

// ==============================|| KNOWLEDGE BASE SCRAP LINKS ||============================== //

const KnowledgeBaseScrapLinks = () => {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    useNotifier()
    const enqueueSnackbar = useCallback((...args) => dispatch(enqueueSnackbarAction(...args)), [dispatch])
    const closeSnackbar = useCallback((...args) => dispatch(closeSnackbarAction(...args)), [dispatch])

    const [loading, setLoading] = useState(false)
    const [oneDriveLoading, setOneDriveLoading] = useState(false) // Separate loading state for OneDrive
    const [selectedLinks, setSelectedLinks] = useState([])
    const [url, setUrl] = useState('') // For web scraping
    const [folderId, setFolderId] = useState('') // For OneDrive folder ID
    const [fileUrl, setFileUrl] = useState('') // For OneDrive manual file URLs
    const [relativeLinksMethod, setRelativeLinksMethod] = useState('webCrawl')
    const [linkLimit, setLinkLimit] = useState(10)
    const [showWebContainer, setShowWebContainer] = useState(false)

    // Document chatflow state
    const [trainingBot, setTrainingBot] = useState(false)
    const [botId, setBotId] = useState('')
    const [showBotDialog, setShowBotDialog] = useState(false)
    const [embedCode, setEmbedCode] = useState('')
    const [copied, setCopied] = useState(false)
    const [chunkSize, setChunkSize] = useState(1000)
    const [chunkOverlap, setChunkOverlap] = useState(200)

    // Table state
    const [chatflows, setChatflows] = useState([])
    const [isLoadingChatflows, setIsLoadingChatflows] = useState(true)
    const [search, setSearch] = useState('')
    const [orderBy, setOrderBy] = useState('createdDate')
    const [order, setOrder] = useState('desc')

    // API Dialog state
    const [apiDialogOpen, setApiDialogOpen] = useState(false)
    const [apiDialogProps, setApiDialogProps] = useState({})

    // Delete Dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [chatflowToDelete, setChatflowToDelete] = useState(null)

    const [selectedTab, setSelectedTab] = useState(0)
    const [uploadedDocs, setUploadedDocs] = useState([])
    const [docChunkSize, setDocChunkSize] = useState(1000)
    const [docChunkOverlap, setDocChunkOverlap] = useState(200)
    const [processingDocs, setProcessingDocs] = useState(false)
    // Guards to prevent duplicate fetches/updates in dev (StrictMode/HMR)
    const hasLoadedOnceRef = useRef(false)
    const fetchSeqRef = useRef(0)
    const firstLoadRef = useRef(true)
    const prevSigRef = useRef('')

    const handleFetchLinks = async () => {
        setLoading(true)
        try {
            if (selectedTab === 2) {
                // OneDrive folder processing (placeholder for actual API integration)
                setOneDriveLoading(true)
                // TODO: Replace with actual OneDrive API call
                const mockOneDriveFiles = [
                    'https://onedrive.live.com/example1.pdf',
                    'https://onedrive.live.com/example2.docx',
                    'https://onedrive.live.com/example3.xlsx'
                ]
                setSelectedLinks(mockOneDriveFiles)
                enqueueSnackbar({
                    message: `Successfully processed OneDrive folder with ${mockOneDriveFiles.length} files`,
                    options: { key: new Date().getTime() + Math.random(), variant: 'success' }
                })
            } else {
                // Regular web link processing
                const fetchLinksResp = await scraperApi.fetchLinks(url, relativeLinksMethod, linkLimit)
                if (fetchLinksResp?.data) {
                    setSelectedLinks(fetchLinksResp.data.links)
                    enqueueSnackbar({
                        message: `Successfully fetched ${fetchLinksResp.data.links.length} links (limited to ${linkLimit})`,
                        options: { key: new Date().getTime() + Math.random(), variant: 'success' }
                    })
                }
            }
        } catch (error) {
            enqueueSnackbar({
                message: error.response?.data?.message || 'Error fetching links',
                options: { key: new Date().getTime() + Math.random(), variant: 'error', persist: true }
            })
        } finally {
            setLoading(false)
            setOneDriveLoading(false)
        }
    }

    const handleChangeLink = (index, event) => {
        const { value } = event.target
        setSelectedLinks((prev) => {
            const links = [...prev]
            links[index] = value
            return links
        })
    }

    const handleRemoveLink = (index) => {
        setSelectedLinks((prev) => prev.filter((_, i) => i !== index))
    }

    const handleRemoveAllLinks = () => {
        setSelectedLinks([])
    }

    const handleSaveLinks = () => {
        enqueueSnackbar({
            message: `Successfully saved ${selectedLinks.length} links`,
            options: { key: new Date().getTime() + Math.random(), variant: 'success' }
        })
    }

    const handleCreateUnifiedDocumentChatflow = async () => {
        const isWeb = selectedTab === 0
        const isFile = selectedTab === 1
        const isOneDrive = selectedTab === 2

        if (isWeb && selectedLinks.length === 0) {
            enqueueSnackbar({
                message: 'Please add some links first before creating the document chatflow',
                options: { key: new Date().getTime() + Math.random(), variant: 'warning' }
            })
            return
        }
        if (isFile && uploadedDocs.length === 0) {
            enqueueSnackbar({
                message: 'Please upload at least one document before processing.',
                options: { key: new Date().getTime() + Math.random(), variant: 'warning' }
            })
            return
        }
        if (isOneDrive && selectedLinks.length === 0) {
            enqueueSnackbar({
                message: 'Please add some OneDrive files first before creating the document chatflow',
                options: { key: new Date().getTime() + Math.random(), variant: 'warning' }
            })
            return
        }

        if (isWeb || isOneDrive) setTrainingBot(true)
        if (isFile) setProcessingDocs(true)

        try {
            const templatesResponse = await marketplacesApi.getAllTemplatesFromMarketplaces()
            if (!templatesResponse.data) {
                throw new Error('Failed to fetch templates from solutions directory')
            }

            let templateName = isWeb ? 'WebScrapper' : isFile ? 'DocumentScrapper' : 'OneDriveScrapper'
            const template = templatesResponse.data.find((t) => t.templateName === templateName)
            if (!template) {
                throw new Error(`${templateName} template not found in solutions directory`)
            }

            const flowData = template.flowData ? JSON.parse(template.flowData) : template

            if (isWeb) {
                const cheerioNode = flowData.nodes.find((node) => node.data.name === 'cheerioWebScraper')
                if (cheerioNode) {
                    cheerioNode.data.inputs.url = url
                    cheerioNode.data.inputs.selectedLinks = selectedLinks
                    cheerioNode.data.inputs.limit = linkLimit.toString()
                    cheerioNode.data.inputs.relativeLinksMethod = relativeLinksMethod
                }
            } else if (isFile) {
                const fileLoaderNode = flowData.nodes.find((node) => node.data.name === 'fileLoader')
                if (fileLoaderNode && uploadedDocs.length > 0) {
                    fileLoaderNode.data.inputs.file = uploadedDocs[0].content
                    fileLoaderNode.data.inputs.chunkSize = docChunkSize
                    fileLoaderNode.data.inputs.chunkOverlap = docChunkOverlap
                }
            } else if (isOneDrive) {
                const fileLoaderNode = flowData.nodes.find((node) => node.data.name === 'fileLoader')
                if (fileLoaderNode && selectedLinks.length > 0) {
                    fileLoaderNode.data.inputs.file = selectedLinks[0]
                    fileLoaderNode.data.inputs.chunkSize = chunkSize
                    fileLoaderNode.data.inputs.chunkOverlap = chunkOverlap
                }
            }

            const chatflowData = {
                name: isWeb
                    ? `Document Chat - ${url}`
                    : `Document Chat - ${uploadedDocs
                          .map((f) => f.name)
                          .join(', ')
                          .slice(0, 40)}...`,
                type: 'CHATFLOW',
                flowData: JSON.stringify(flowData)
            }

            const chatflowResponse = await chatflowsApi.createNewChatflow(chatflowData)
            if (chatflowResponse.data?.id) {
                const newBotId = chatflowResponse.data.id
                setBotId(newBotId)
                const baseURL = window.location.origin
                const generatedEmbedCode = `<script type="module">
    import Chatbot from "https://cdn.jsdelivr.net/npm/cognixcelerate-embed/dist/web.js"
    Chatbot.init({
        chatflowid: "${newBotId}",
        apiHost: "${baseURL}",
    })
</script>`
                setEmbedCode(generatedEmbedCode)
                setShowBotDialog(true)
                enqueueSnackbar({
                    message: `Document chatflow created successfully! Bot ID: ${newBotId}`,
                    options: { key: new Date().getTime() + Math.random(), variant: 'success' }
                })
                if (isWeb || isOneDrive) setSelectedLinks([])
                if (isFile) setUploadedDocs([])
                loadChatflows()
            } else {
                throw new Error('Failed to create chatflow')
            }
        } catch (error) {
            enqueueSnackbar({
                message: `Error creating document chatflow: ${error.response?.data?.message || error.message}`,
                options: { key: new Date().getTime() + Math.random(), variant: 'error', persist: true }
            })
        } finally {
            if (isWeb || isOneDrive) setTrainingBot(false)
            if (isFile) setProcessingDocs(false)
        }
    }

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(embedCode)
            setCopied(true)
            enqueueSnackbar({
                message: 'Embed code copied to clipboard!',
                options: { key: new Date().getTime() + Math.random(), variant: 'success' }
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            enqueueSnackbar({
                message: 'Failed to copy code',
                options: { key: new Date().getTime() + Math.random(), variant: 'error' }
            })
        }
    }

    const loadChatflows = useCallback(async () => {
        const seq = ++fetchSeqRef.current
        if (firstLoadRef.current) setIsLoadingChatflows(true)
        try {
            const response = await chatflowsApi.getAllChatflows()
            if (response?.data) {
                const documentChatflows = response.data.filter((chatflow) => chatflow.name?.includes('Document Chat -'))
                // Ignore stale responses if a newer request has been issued
                if (seq === fetchSeqRef.current) {
                    // Only update state if content actually changed to avoid flicker
                    const incomingSig = documentChatflows.map((c) => `${c.id}:${c.updatedDate}`).join('|')
                    if (prevSigRef.current !== incomingSig) {
                        prevSigRef.current = incomingSig
                        setChatflows(documentChatflows)
                        // cache to sessionStorage to survive re-mounts in dev
                        try {
                            sessionStorage.setItem('kb_chatflows_cache', JSON.stringify(documentChatflows))
                            sessionStorage.setItem('kb_chatflows_sig', incomingSig)
                        } catch (_) {}
                    }
                }
            }
        } catch (error) {
            enqueueSnackbar({
                message: 'Error loading document chatflows',
                options: { key: new Date().getTime() + Math.random(), variant: 'error' }
            })
        } finally {
            if (seq === fetchSeqRef.current) {
                setIsLoadingChatflows(false)
                firstLoadRef.current = false
            }
        }
    }, [enqueueSnackbar])

    const handleSearchChange = (event) => {
        setSearch(event.target.value)
    }

    const filterChatflows = (data) => {
        if (!data) return false
        const searchLower = search.toLowerCase()
        return (
            data.name?.toLowerCase().includes(searchLower) ||
            data.category?.toLowerCase().includes(searchLower) ||
            data.id?.toLowerCase().includes(searchLower)
        )
    }

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
    }

    const handleRowClick = (chatflow) => {
        navigate(`/canvas/${chatflow.id}`)
    }

    const handleAPIDialogClick = (chatflow) => {
        let isFormDataRequired = false
        let isSessionMemory = false

        try {
            const flowData = JSON.parse(chatflow.flowData)
            const nodes = flowData.nodes
            isFormDataRequired = nodes.some((node) => node.data.inputParams?.some((param) => param.type === 'file'))
            isSessionMemory = nodes.some((node) => node.data.inputParams?.some((param) => param.name === 'sessionId'))
        } catch (e) {
            enqueueSnackbar({
                message: 'Error parsing chatflow data',
                options: { key: new Date().getTime() + Math.random(), variant: 'error' }
            })
        }

        setApiDialogProps({
            title: 'Embed in website or use as API',
            chatflowid: chatflow.id,
            chatflowApiKeyId: chatflow.apikeyid,
            isFormDataRequired,
            isSessionMemory,
            isAgentCanvas: false,
            isAgentflowV2: false
        })
        setApiDialogOpen(true)
    }

    const handleDeleteClick = (chatflow) => {
        setChatflowToDelete(chatflow)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!chatflowToDelete) return

        try {
            await chatflowsApi.deleteChatflow(chatflowToDelete.id)
            enqueueSnackbar({
                message: `Document chatflow "${chatflowToDelete.name}" deleted successfully`,
                options: { key: new Date().getTime() + Math.random(), variant: 'success' }
            })
            loadChatflows()
        } catch (error) {
            enqueueSnackbar({
                message: 'Error deleting document chatflow. Please try again.',
                options: { key: new Date().getTime() + Math.random(), variant: 'error' }
            })
        } finally {
            setDeleteDialogOpen(false)
            setChatflowToDelete(null)
        }
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setChatflowToDelete(null)
    }

    useEffect(() => {
        if (hasLoadedOnceRef.current) return
        hasLoadedOnceRef.current = true
        // hydrate from sessionStorage to avoid skeleton on dev remounts
        try {
            const cache = sessionStorage.getItem('kb_chatflows_cache')
            const sig = sessionStorage.getItem('kb_chatflows_sig') || ''
            if (cache) {
                const parsed = JSON.parse(cache)
                prevSigRef.current = sig
                setChatflows(parsed)
                setIsLoadingChatflows(false)
                firstLoadRef.current = false // background refresh only
            }
        } catch (_) {}
        // always trigger a background refresh
        loadChatflows()
    }, [loadChatflows])

    return (
        <Container
            maxWidth={false}
            sx={{
                py: 3,
                px: { xs: 2, sm: 3, md: 4 },
                width: '100%',
                minWidth: '100%'
            }}
            aria-label='Knowledge Base Scrap Links Container'
        >
            <MainCard
                sx={{
                    border: 'none',
                    boxShadow: 'none',
                    backgroundColor: 'transparent',
                    width: '100%',
                    minWidth: '100%'
                }}
            >
                <Stack spacing={3}>
                    {/* Header Section */}
                    <Paper
                        sx={{
                            p: 4,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`
                        }}
                    >
                        <Stack spacing={4}>
                            <Box>
                                <Stack direction='row' alignItems='center' spacing={1.5} mb={1}>
                                    <IconWorld size={28} color={theme.palette.primary.main} />
                                    <Typography variant='h3' sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                        Chat Agent
                                    </Typography>
                                </Stack>
                                <Typography
                                    variant='body1'
                                    color='text.secondary'
                                    sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5 }}
                                >
                                    Scrape web content and create document-based chatflows
                                </Typography>
                            </Box>

                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                                <Tabs
                                    value={selectedTab}
                                    onChange={(_, newValue) => setSelectedTab(newValue)}
                                    textColor='primary'
                                    indicatorColor='primary'
                                    aria-label='Scraping method tabs'
                                    sx={{
                                        minHeight: 48,
                                        '& .MuiTab-root': {
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            textTransform: 'none',
                                            minHeight: 48,
                                            color: theme.palette.text.primary,
                                            borderRadius: 2,
                                            px: 3,
                                            py: 1,
                                            mr: 2,
                                            '&.Mui-selected': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                color: theme.palette.primary.main
                                            }
                                        }
                                    }}
                                >
                                    <Tab label='Scrap Links' />
                                    <Tab label='Scrap Documents' />
                                    <Tab label='One Drive' />
                                </Tabs>
                            </Box>
                        </Stack>
                    </Paper>

                    {selectedTab === 0 && (
                        <Paper
                            sx={{
                                p: 4,
                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`
                            }}
                        >
                            <Typography variant='h4' gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3 }}>
                                Web Container Scraper
                            </Typography>

                            {/* URL Input Section */}
                            <Box sx={{ mb: 4 }}>
                                <Stack direction='row' gap={1}>
                                    <FormControl sx={{ mt: 1, width: '100%' }} size='small'>
                                        <OutlinedInput
                                            id='url'
                                            size='small'
                                            type='text'
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder='Enter URL to scrape...'
                                            aria-label='URL input for web scraping'
                                        />
                                    </FormControl>
                                    <Button
                                        disabled={!url}
                                        sx={{ borderRadius: '12px', mt: 1 }}
                                        size='small'
                                        variant='contained'
                                        onClick={handleFetchLinks}
                                        aria-label='Add and train web links'
                                    >
                                        Add & Train
                                    </Button>
                                </Stack>
                            </Box>

                            {/* Link Limit Configuration */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    Link Limitation Settings
                                </Typography>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            Maximum Links to Scrape
                                        </Typography>
                                        <FormControl fullWidth size='small'>
                                            <OutlinedInput
                                                type='number'
                                                value={linkLimit}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    if (value === '') {
                                                        setLinkLimit(1)
                                                    } else {
                                                        const numValue = parseInt(value)
                                                        if (!isNaN(numValue)) {
                                                            setLinkLimit(Math.max(1, Math.min(1000, numValue)))
                                                        }
                                                    }
                                                }}
                                                inputProps={{ min: 1, max: 1000, step: 1 }}
                                                placeholder='Enter number of links (1-1000)'
                                                sx={{ borderRadius: 2 }}
                                                aria-label='Maximum links to scrape'
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box>
                                        <Typography variant='body2' color='text.secondary'>
                                            Set to 0 for unlimited links
                                        </Typography>
                                        <Typography variant='caption' color='text.secondary'>
                                            Higher limits may take longer to process
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Text Splitter Configuration */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    Text Splitter Settings
                                </Typography>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            Chunk Size
                                        </Typography>
                                        <FormControl fullWidth size='small'>
                                            <OutlinedInput
                                                type='number'
                                                value={chunkSize}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 1000
                                                    setChunkSize(Math.max(100, Math.min(10000, value)))
                                                }}
                                                inputProps={{ min: 100, max: 10000, step: 100 }}
                                                placeholder='Chunk size (100-10000)'
                                                sx={{ borderRadius: 2 }}
                                                aria-label='Chunk size for text splitting'
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            Chunk Overlap
                                        </Typography>
                                        <FormControl fullWidth size='small'>
                                            <OutlinedInput
                                                type='number'
                                                value={chunkOverlap}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 200
                                                    setChunkOverlap(Math.max(0, Math.min(chunkSize, value)))
                                                }}
                                                inputProps={{ min: 0, max: chunkSize, step: 50 }}
                                                placeholder='Chunk overlap (0-chunkSize)'
                                                sx={{ borderRadius: 2 }}
                                                aria-label='Chunk overlap for text splitting'
                                            />
                                        </FormControl>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Relative Links Method Selection */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    Scraping Method
                                </Typography>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            Get Relative Links Method
                                        </Typography>
                                        <FormControl fullWidth size='small'>
                                            <TextField
                                                select
                                                size='small'
                                                value={relativeLinksMethod}
                                                onChange={(e) => setRelativeLinksMethod(e.target.value)}
                                                sx={{ borderRadius: 2 }}
                                                aria-label='Select scraping method'
                                            >
                                                <MenuItem value='webCrawl'>Web Crawl</MenuItem>
                                                <MenuItem value='scrapeXMLSitemap'>Scrape XML Sitemap</MenuItem>
                                            </TextField>
                                        </FormControl>
                                    </Box>
                                    <Box>
                                        <Typography variant='body2' color='text.secondary'>
                                            {relativeLinksMethod === 'webCrawl'
                                                ? 'Crawl relative links from HTML URL'
                                                : 'Scrape relative links from XML sitemap URL'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Scraped Links Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography sx={{ fontWeight: 500 }}>
                                    Scraped Links {selectedLinks.length > 0 && `(${selectedLinks.length})`}
                                </Typography>
                                {selectedLinks.length > 0 && (
                                    <Button
                                        variant='outlined'
                                        color='error'
                                        onClick={handleRemoveAllLinks}
                                        startIcon={<IconEraser />}
                                        aria-label='Clear all scraped links'
                                    >
                                        Clear All
                                    </Button>
                                )}
                            </Box>

                            {loading && <BackdropLoader open={loading} />}
                            {selectedLinks.length > 0 ? (
                                <PerfectScrollbar
                                    style={{
                                        height: '100%',
                                        maxHeight: '320px',
                                        overflowX: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 4
                                    }}
                                >
                                    {selectedLinks.map((link, index) => (
                                        <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                                            <OutlinedInput
                                                sx={{ width: '100%' }}
                                                type='text'
                                                onChange={(e) => handleChangeLink(index, e)}
                                                size='small'
                                                value={link}
                                                name={`link_${index}`}
                                                aria-label={`Scraped link ${index + 1}`}
                                            />
                                            <IconButton
                                                sx={{ height: 30, width: 30 }}
                                                size='small'
                                                color='error'
                                                onClick={() => handleRemoveLink(index)}
                                                aria-label={`Remove scraped link ${index + 1}`}
                                            >
                                                <IconTrash />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </PerfectScrollbar>
                            ) : (
                                <Typography sx={{ my: 2, textAlign: 'center' }}>Links scraped from the URL will appear here</Typography>
                            )}

                            {/* Action Buttons */}
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction='row' spacing={2}>
                                    {selectedLinks.length > 0 && (
                                        <StyledButton
                                            variant='contained'
                                            onClick={handleSaveLinks}
                                            sx={{
                                                bgcolor: theme.palette.primary.main,
                                                '&:hover': { bgcolor: theme.palette.primary.dark }
                                            }}
                                            aria-label='Save scraped links'
                                        >
                                            Save Links
                                        </StyledButton>
                                    )}
                                </Stack>
                                <StyledButton
                                    variant='contained'
                                    onClick={handleCreateUnifiedDocumentChatflow}
                                    disabled={trainingBot || selectedLinks.length === 0}
                                    startIcon={trainingBot ? null : <IconRobot size={20} />}
                                    sx={{
                                        bgcolor: theme.palette.success.main,
                                        '&:hover': { bgcolor: theme.palette.success.dark },
                                        '&:disabled': { bgcolor: theme.palette.grey[300], color: theme.palette.grey[500] }
                                    }}
                                    aria-label='Create document chatflow from web links'
                                >
                                    {trainingBot ? 'Creating Chatflow...' : 'Create Document Chatflow'}
                                </StyledButton>
                            </Box>
                        </Paper>
                    )}

                    {selectedTab === 1 && (
                        <Paper
                            sx={{
                                mt: 2,
                                p: 4,
                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`
                            }}
                        >
                            <Typography variant='h4' gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3 }}>
                                Scrap Documents
                            </Typography>
                            <Typography color='text.secondary' sx={{ mb: 2 }}>
                                Upload documents (PDF, DOCX, TXT, etc.) to create a knowledge base for your chat agent.
                            </Typography>
                            <Box sx={{ mb: 4 }}>
                                <Button variant='contained' component='label' sx={{ borderRadius: 2, mb: 2 }} aria-label='Upload documents'>
                                    Upload Documents
                                    <input
                                        type='file'
                                        hidden
                                        multiple
                                        accept='.pdf,.doc,.docx,.txt,.md,.rtf,.odt,.html,.csv,.json,.xlsx,.xls'
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || [])
                                            const maxFileSize = 10 * 1024 * 1024 // 10MB limit
                                            const validFiles = files.filter((file) => file.size <= maxFileSize)
                                            if (validFiles.length !== files.length) {
                                                enqueueSnackbar({
                                                    message: 'Some files were rejected due to size exceeding 10MB',
                                                    options: { key: new Date().getTime() + Math.random(), variant: 'warning' }
                                                })
                                            }
                                            const processedFiles = await Promise.all(
                                                validFiles.map(async (file) => {
                                                    const content = await new Promise((resolve, reject) => {
                                                        const reader = new FileReader()
                                                        reader.onload = () => resolve(reader.result + `,filename:${file.name}`)
                                                        reader.onerror = reject
                                                        reader.readAsDataURL(file)
                                                    })
                                                    return { name: file.name, content }
                                                })
                                            )
                                            setUploadedDocs((prev) => [...prev, ...processedFiles])
                                        }}
                                    />
                                </Button>
                                {uploadedDocs.length > 0 && (
                                    <Stack spacing={1}>
                                        {uploadedDocs.map((file, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 1,
                                                    border: '1px solid',
                                                    borderColor: theme.palette.divider,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <Typography variant='body2'>{file.name}</Typography>
                                                <IconButton
                                                    color='error'
                                                    size='small'
                                                    onClick={() => setUploadedDocs((prev) => prev.filter((_, i) => i !== idx))}
                                                    aria-label={`Remove uploaded document ${file.name}`}
                                                >
                                                    <IconTrash />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                                {uploadedDocs.length === 0 && (
                                    <Typography color='text.secondary' sx={{ mt: 1 }}>
                                        No documents uploaded yet.
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                    Text Splitter Settings
                                </Typography>
                                <Stack direction='row' spacing={2} alignItems='center'>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            Chunk Size
                                        </Typography>
                                        <FormControl fullWidth size='small'>
                                            <OutlinedInput
                                                type='number'
                                                value={docChunkSize}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 1000
                                                    setDocChunkSize(Math.max(100, Math.min(10000, value)))
                                                }}
                                                inputProps={{ min: 100, max: 10000, step: 100 }}
                                                placeholder='Chunk size (100-10000)'
                                                sx={{ borderRadius: 2 }}
                                                aria-label='Chunk size for document splitting'
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            Chunk Overlap
                                        </Typography>
                                        <FormControl fullWidth size='small'>
                                            <OutlinedInput
                                                type='number'
                                                value={docChunkOverlap}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 200
                                                    setDocChunkOverlap(Math.max(0, Math.min(docChunkSize, value)))
                                                }}
                                                inputProps={{ min: 0, max: docChunkSize, step: 50 }}
                                                placeholder='Chunk overlap (0-chunkSize)'
                                                sx={{ borderRadius: 2 }}
                                                aria-label='Chunk overlap for document splitting'
                                            />
                                        </FormControl>
                                    </Box>
                                </Stack>
                            </Box>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <StyledButton
                                    variant='contained'
                                    onClick={handleCreateUnifiedDocumentChatflow}
                                    disabled={processingDocs || uploadedDocs.length === 0}
                                    startIcon={processingDocs ? null : <IconRobot size={20} />}
                                    sx={{
                                        bgcolor: theme.palette.success.main,
                                        '&:hover': { bgcolor: theme.palette.success.dark },
                                        '&:disabled': { bgcolor: theme.palette.grey[300], color: theme.palette.grey[500] }
                                    }}
                                    aria-label='Process and train documents'
                                >
                                    {processingDocs ? 'Processing...' : 'Process & Train'}
                                </StyledButton>
                            </Box>
                        </Paper>
                    )}

                    {selectedTab === 2 && (
                        <Paper
                            sx={{
                                mt: 2,
                                p: 4,
                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`
                            }}
                        >
                            <Typography variant='h4' gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3 }}>
                                OneDrive
                            </Typography>
                            <Typography color='text.secondary' sx={{ mb: 2 }}>
                                Connect to your OneDrive account and select documents to create a knowledge base for your chat agent.
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                                <Alert severity='info' sx={{ mb: 2 }}>
                                    <Typography variant='body2'>
                                        <strong>Note:</strong> You need to configure OneDrive OAuth2 credentials first. Go to Access Keys →
                                        Add New → OneDrive OAuth2 to set up your Microsoft 365 connection.
                                    </Typography>
                                </Alert>
                            </Box>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                                    Select OneDrive Files
                                </Typography>
                                <Typography color='text.secondary' sx={{ mb: 2 }}>
                                    Choose specific files or enter a folder ID to process all files from that folder.
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                                        Selection Method
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant={selectedLinks.length > 0 ? 'contained' : 'outlined'}
                                            onClick={() => {
                                                setSelectedLinks([])
                                                setFolderId('')
                                            }}
                                            sx={{ borderRadius: 2 }}
                                            aria-label='Select specific OneDrive files'
                                        >
                                            Select Specific Files
                                        </Button>
                                        <Button
                                            variant={folderId ? 'contained' : 'outlined'}
                                            onClick={() => {
                                                setSelectedLinks([])
                                                setFolderId('')
                                            }}
                                            sx={{ borderRadius: 2 }}
                                            aria-label='Process OneDrive folder'
                                        >
                                            Process Folder
                                        </Button>
                                    </Box>
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        label='OneDrive Folder ID (Optional)'
                                        placeholder='Enter OneDrive folder ID to process all files from that folder'
                                        value={folderId}
                                        onChange={(e) => setFolderId(e.target.value)}
                                        helperText='Leave empty to select specific files manually'
                                        sx={{ mb: 2 }}
                                        aria-label='OneDrive folder ID input'
                                    />
                                    {folderId && (
                                        <Button
                                            variant='contained'
                                            onClick={handleFetchLinks}
                                            disabled={oneDriveLoading || !folderId}
                                            sx={{ borderRadius: 2 }}
                                            aria-label='Process OneDrive folder'
                                        >
                                            {oneDriveLoading ? 'Processing...' : 'Process Folder'}
                                        </Button>
                                    )}
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                                        Manual File Selection
                                    </Typography>
                                    <Typography color='text.secondary' sx={{ mb: 2, fontSize: '0.9rem' }}>
                                        Add OneDrive file URLs manually (you can get these from OneDrive sharing links)
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            placeholder='https://onedrive.live.com/...'
                                            value={fileUrl}
                                            onChange={(e) => setFileUrl(e.target.value)}
                                            size='small'
                                            aria-label='OneDrive file URL input'
                                        />
                                        <Button
                                            variant='outlined'
                                            onClick={() => {
                                                if (fileUrl && !selectedLinks.includes(fileUrl)) {
                                                    setSelectedLinks([...selectedLinks, fileUrl])
                                                    setFileUrl('')
                                                } else if (selectedLinks.includes(fileUrl)) {
                                                    enqueueSnackbar({
                                                        message: 'This file URL is already added',
                                                        options: { key: new Date().getTime() + Math.random(), variant: 'warning' }
                                                    })
                                                }
                                            }}
                                            disabled={!fileUrl}
                                            sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                                            aria-label='Add OneDrive file URL'
                                        >
                                            Add
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                            {selectedLinks.length > 0 && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                                        Selected OneDrive Files ({selectedLinks.length})
                                    </Typography>
                                    <PerfectScrollbar
                                        style={{
                                            height: '100%',
                                            maxHeight: '320px',
                                            overflowX: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 4
                                        }}
                                    >
                                        {selectedLinks.map((link, index) => (
                                            <Box key={index} sx={{ display: 'flex', width: '100%' }}>
                                                <OutlinedInput
                                                    sx={{ width: '100%' }}
                                                    type='text'
                                                    onChange={(e) => handleChangeLink(index, e)}
                                                    size='small'
                                                    value={link}
                                                    name={`link_${index}`}
                                                    aria-label={`OneDrive file link ${index + 1}`}
                                                />
                                                <IconButton
                                                    sx={{ height: 30, width: 30 }}
                                                    size='small'
                                                    color='error'
                                                    onClick={() => handleRemoveLink(index)}
                                                    aria-label={`Remove OneDrive file link ${index + 1}`}
                                                >
                                                    <IconTrash />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </PerfectScrollbar>
                                </Box>
                            )}
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction='row' spacing={2}>
                                    {selectedLinks.length > 0 && (
                                        <StyledButton
                                            variant='contained'
                                            onClick={handleSaveLinks}
                                            sx={{
                                                bgcolor: theme.palette.primary.main,
                                                '&:hover': { bgcolor: theme.palette.primary.dark }
                                            }}
                                            aria-label='Save OneDrive files'
                                        >
                                            Save OneDrive Files
                                        </StyledButton>
                                    )}
                                </Stack>
                                <Stack direction='row' spacing={2}>
                                    {selectedLinks.length > 0 && (
                                        <StyledButton
                                            variant='outlined'
                                            onClick={handleRemoveAllLinks}
                                            sx={{
                                                borderColor: theme.palette.error.main,
                                                color: theme.palette.error.main,
                                                '&:hover': {
                                                    borderColor: theme.palette.error.dark,
                                                    backgroundColor: alpha(theme.palette.error.main, 0.04)
                                                }
                                            }}
                                            aria-label='Clear all OneDrive files'
                                        >
                                            Clear All
                                        </StyledButton>
                                    )}
                                </Stack>
                            </Box>
                            {selectedLinks.length > 0 && (
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <StyledButton
                                        variant='contained'
                                        onClick={handleCreateUnifiedDocumentChatflow}
                                        disabled={trainingBot}
                                        sx={{
                                            bgcolor: theme.palette.success.main,
                                            '&:hover': { bgcolor: theme.palette.success.dark },
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem'
                                        }}
                                        aria-label='Create document chatflow from OneDrive files'
                                    >
                                        {trainingBot ? 'Creating Chatflow...' : 'Create Document Chatflow from OneDrive'}
                                    </StyledButton>
                                </Box>
                            )}
                        </Paper>
                    )}

                    {selectedTab === 0 && (
                        <Paper
                            sx={{
                                p: 4,
                                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`,
                                transition: 'box-shadow 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: `0 4px 20px ${alpha(theme.palette.grey[500], 0.12)}`
                                }
                            }}
                        >
                            <Stack spacing={3}>
                                <Box>
                                    <Stack direction='row' alignItems='center' spacing={1.5} mb={1}>
                                        <IconMessages size={28} color={theme.palette.primary.main} />
                                        <Typography variant='h4' sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                            Knowledge Base Chatflows
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant='body1'
                                        color='text.secondary'
                                        sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5 }}
                                    >
                                        View and manage your document-based chatflows created from web scraping
                                    </Typography>
                                </Box>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={3}
                                    alignItems={{ xs: 'stretch', sm: 'center' }}
                                    justifyContent='space-between'
                                >
                                    <TextField
                                        placeholder='Search chatflows, categories, or IDs...'
                                        value={search}
                                        onChange={handleSearchChange}
                                        size='medium'
                                        sx={{
                                            flexGrow: 1,
                                            maxWidth: { xs: '100%', sm: 420 },
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: theme.palette.background.paper,
                                                fontSize: '0.95rem',
                                                border: 'none',
                                                boxShadow: `0 2px 8px ${alpha(theme.palette.grey[500], 0.1)}`,
                                                transition: 'all 0.3s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 4px 16px ${alpha(theme.palette.grey[500], 0.15)}`
                                                },
                                                '&.Mui-focused': {
                                                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                                                },
                                                '& fieldset': { border: 'none' }
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position='start'>
                                                    <IconSearch size={20} color={theme.palette.text.secondary} />
                                                </InputAdornment>
                                            )
                                        }}
                                        aria-label='Search chatflows'
                                    />
                                </Stack>
                                {isLoadingChatflows ? (
                                    <Stack spacing={2}>
                                        {[...Array(5)].map((_, index) => (
                                            <Skeleton
                                                key={index}
                                                variant='rectangular'
                                                width='100%'
                                                height={80}
                                                sx={{ borderRadius: 1.5, backgroundColor: alpha(theme.palette.grey[500], 0.06) }}
                                            />
                                        ))}
                                    </Stack>
                                ) : chatflows.length > 0 ? (
                                    <Paper
                                        sx={{
                                            borderRadius: 2.5,
                                            overflow: 'hidden',
                                            backgroundColor: theme.palette.background.paper,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                            boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`
                                        }}
                                    >
                                        <TableContainer>
                                            <Table aria-label='Knowledge base chatflows table'>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell
                                                            sortDirection={orderBy === 'name' ? order : false}
                                                            sx={{ fontWeight: 600 }}
                                                        >
                                                            <TableSortLabel
                                                                active={orderBy === 'name'}
                                                                direction={orderBy === 'name' ? order : 'asc'}
                                                                onClick={() => handleRequestSort('name')}
                                                                aria-label='Sort by name'
                                                            >
                                                                Name
                                                            </TableSortLabel>
                                                        </TableCell>
                                                        <TableCell
                                                            sortDirection={orderBy === 'createdDate' ? order : false}
                                                            sx={{ fontWeight: 600 }}
                                                        >
                                                            <TableSortLabel
                                                                active={orderBy === 'createdDate'}
                                                                direction={orderBy === 'createdDate' ? order : 'asc'}
                                                                onClick={() => handleRequestSort('createdDate')}
                                                                aria-label='Sort by creation date'
                                                            >
                                                                Created
                                                            </TableSortLabel>
                                                        </TableCell>
                                                        <TableCell
                                                            sortDirection={orderBy === 'updatedDate' ? order : false}
                                                            sx={{ fontWeight: 600 }}
                                                        >
                                                            <TableSortLabel
                                                                active={orderBy === 'updatedDate'}
                                                                direction={orderBy === 'updatedDate' ? order : 'asc'}
                                                                onClick={() => handleRequestSort('updatedDate')}
                                                                aria-label='Sort by update date'
                                                            >
                                                                Updated
                                                            </TableSortLabel>
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {chatflows
                                                        .filter(filterChatflows)
                                                        .sort((a, b) => {
                                                            if (orderBy === 'createdDate' || orderBy === 'updatedDate') {
                                                                const aTime = a[orderBy] ? new Date(a[orderBy]).getTime() : 0
                                                                const bTime = b[orderBy] ? new Date(b[orderBy]).getTime() : 0
                                                                return order === 'desc' ? bTime - aTime : aTime - bTime
                                                            }
                                                            const aValue = (a[orderBy] || '').toString().toLowerCase()
                                                            const bValue = (b[orderBy] || '').toString().toLowerCase()
                                                            return order === 'desc'
                                                                ? bValue.localeCompare(aValue)
                                                                : aValue.localeCompare(bValue)
                                                        })
                                                        .map((chatflow) => (
                                                            <TableRow
                                                                key={chatflow.id}
                                                                hover
                                                                onClick={() => handleRowClick(chatflow)}
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) }
                                                                }}
                                                                aria-label={`Chatflow ${chatflow.name}`}
                                                            >
                                                                <TableCell>
                                                                    <Stack direction='row' alignItems='center' spacing={1}>
                                                                        <IconRobot size={20} color={theme.palette.primary.main} />
                                                                        <Box>
                                                                            <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                                                                {chatflow.name}
                                                                            </Typography>
                                                                            <Typography variant='caption' color='text.secondary'>
                                                                                ID: {chatflow.id}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Stack>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant='body2'>
                                                                        {moment(chatflow.createdDate).format('MMM DD, YYYY HH:mm')}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant='body2'>
                                                                        {moment(chatflow.updatedDate).format('MMM DD, YYYY HH:mm')}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Stack direction='row' spacing={1}>
                                                                        <Tooltip title='Open in Canvas'>
                                                                            <IconButton
                                                                                size='small'
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleRowClick(chatflow)
                                                                                }}
                                                                                sx={{
                                                                                    color: theme.palette.primary.main,
                                                                                    '&:hover': {
                                                                                        backgroundColor: alpha(
                                                                                            theme.palette.primary.main,
                                                                                            0.1
                                                                                        )
                                                                                    }
                                                                                }}
                                                                                aria-label={`Open chatflow ${chatflow.name} in canvas`}
                                                                            >
                                                                                <IconCode size={20} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title='Embed in website or use as API'>
                                                                            <IconButton
                                                                                size='small'
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleAPIDialogClick(chatflow)
                                                                                }}
                                                                                sx={{
                                                                                    color: theme.palette.secondary.main,
                                                                                    '&:hover': {
                                                                                        backgroundColor: alpha(
                                                                                            theme.palette.secondary.main,
                                                                                            0.1
                                                                                        )
                                                                                    }
                                                                                }}
                                                                                aria-label={`Embed or use API for chatflow ${chatflow.name}`}
                                                                            >
                                                                                <IconApi size={18} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title='Delete Document Chatflow'>
                                                                            <IconButton
                                                                                size='small'
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleDeleteClick(chatflow)
                                                                                }}
                                                                                sx={{
                                                                                    color: theme.palette.error.main,
                                                                                    '&:hover': {
                                                                                        backgroundColor: alpha(
                                                                                            theme.palette.error.main,
                                                                                            0.1
                                                                                        )
                                                                                    }
                                                                                }}
                                                                                aria-label={`Delete chatflow ${chatflow.name}`}
                                                                            >
                                                                                <IconTrash size={16} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Stack>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                ) : (
                                    <Paper
                                        sx={{
                                            p: { xs: 4, sm: 6, md: 8 },
                                            textAlign: 'center',
                                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                            borderRadius: 3,
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            minWidth: { xs: '100%', sm: 'auto' },
                                            width: '100%'
                                        }}
                                    >
                                        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                                            <IconMessages
                                                size={80}
                                                color={theme.palette.primary.main}
                                                style={{ opacity: 0.6, width: '100%', maxWidth: '80px', height: 'auto' }}
                                            />
                                        </Box>
                                        <Typography
                                            variant='h4'
                                            gutterBottom
                                            sx={{
                                                fontWeight: 700,
                                                color: theme.palette.primary.main,
                                                mb: 2,
                                                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                                            }}
                                        >
                                            No Knowledge Base Chatflows Yet
                                        </Typography>
                                        <Typography
                                            variant='body1'
                                            color='text.secondary'
                                            sx={{
                                                mb: { xs: 3, sm: 4 },
                                                maxWidth: { xs: '100%', sm: 480 },
                                                mx: 'auto',
                                                lineHeight: 1.6,
                                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                                px: { xs: 2, sm: 0 }
                                            }}
                                        >
                                            Create your first document chatflow by scraping web content above
                                        </Typography>
                                        <StyledButton
                                            variant='contained'
                                            onClick={() => setSelectedTab(0)}
                                            startIcon={<IconWorld size={20} />}
                                            sx={{
                                                borderRadius: 2,
                                                px: { xs: 3, sm: 4 },
                                                py: { xs: 1.25, sm: 1.5 },
                                                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                backgroundColor: theme.palette.primary.main,
                                                boxShadow: 'none',
                                                minWidth: { xs: '200px', sm: 'auto' },
                                                width: { xs: '100%', sm: 'auto' },
                                                '&:hover': {
                                                    transform: 'translateY(-1px)',
                                                    backgroundColor: theme.palette.primary.dark,
                                                    boxShadow: 'none'
                                                }
                                            }}
                                            aria-label='Start scraping links'
                                        >
                                            Start Scraping Links
                                        </StyledButton>
                                    </Paper>
                                )}
                            </Stack>
                        </Paper>
                    )}

                    <Dialog open={showBotDialog} onClose={() => setShowBotDialog(false)} maxWidth='md' fullWidth>
                        <DialogTitle>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <IconRobot size={24} color={theme.palette.success.main} />
                                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                    Document Chatflow Created! 📄🤖
                                </Typography>
                            </Stack>
                        </DialogTitle>
                        <DialogContent>
                            <Stack spacing={3}>
                                <Alert severity='success' sx={{ mb: 2 }}>
                                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                        Your document-based chatflow has been successfully created!
                                    </Typography>
                                    <Typography variant='body2' sx={{ mt: 1 }}>
                                        Chatflow ID: <strong>{botId}</strong>
                                    </Typography>
                                </Alert>
                                <Divider />
                                <Box>
                                    <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                        <IconCode size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                                        Embed Code
                                    </Typography>
                                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                                        Copy and paste this code into any HTML file to embed your document chatflow:
                                    </Typography>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            border: `1px solid ${theme.palette.grey[300]}`,
                                            borderRadius: 2,
                                            p: 2,
                                            bgcolor: theme.palette.grey[50]
                                        }}
                                    >
                                        <TextField
                                            multiline
                                            rows={6}
                                            value={embedCode}
                                            variant='outlined'
                                            fullWidth
                                            InputProps={{
                                                readOnly: true,
                                                sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                                            }}
                                            aria-label='Embed code for chatflow'
                                        />
                                        <Button
                                            variant='contained'
                                            onClick={handleCopyCode}
                                            startIcon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                minWidth: 'auto',
                                                px: 2,
                                                py: 0.5,
                                                fontSize: '0.75rem'
                                            }}
                                            aria-label={copied ? 'Copied embed code' : 'Copy embed code'}
                                        >
                                            {copied ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </Box>
                                </Box>
                                <Alert severity='info'>
                                    <Typography variant='body2'>
                                        <strong>How to use:</strong>
                                    </Typography>
                                    <Typography variant='body2' sx={{ mt: 1 }}>
                                        1. Copy the embed code above
                                    </Typography>
                                    <Typography variant='body2'>2. Paste it into the &lt;body&gt; tag of any HTML file</Typography>
                                    <Typography variant='body2'>3. Open the HTML file in a browser</Typography>
                                    <Typography variant='body2'>4. Start chatting with your document-based bot!</Typography>
                                </Alert>
                                <Box
                                    sx={{
                                        p: 2,
                                        bgcolor: theme.palette.info[50],
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.info[200]}`
                                    }}
                                >
                                    <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                                        Chatflow Template:
                                    </Typography>
                                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                                        <Chip label='document_sample Template' size='small' color='primary' />
                                        <Chip label='Updated URL Only' size='small' color='secondary' />
                                    </Stack>
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowBotDialog(false)} aria-label='Close chatflow creation dialog'>
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth='sm' fullWidth>
                        <DialogTitle>
                            <Stack direction='row' spacing={2} alignItems='center'>
                                <IconTrash size={24} color={theme.palette.error.main} />
                                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                    Delete Document Chatflow
                                </Typography>
                            </Stack>
                        </DialogTitle>
                        <DialogContent>
                            <Typography variant='body1' sx={{ mb: 2 }}>
                                Are you sure you want to delete the document chatflow &quot;{chatflowToDelete?.name}&quot;?
                            </Typography>
                            <Alert severity='warning' sx={{ mb: 2 }}>
                                <Typography variant='body2'>
                                    <strong>Warning:</strong> This action cannot be undone. The chatflow and all its associated data will be
                                    permanently deleted.
                                </Typography>
                            </Alert>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCancelDelete} color='inherit' aria-label='Cancel deletion'>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmDelete}
                                variant='contained'
                                color='error'
                                startIcon={<IconTrash size={16} />}
                                aria-label='Confirm chatflow deletion'
                            >
                                Delete Chatflow
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {apiDialogOpen && (
                        <APICodeDialog show={apiDialogOpen} dialogProps={apiDialogProps} onCancel={() => setApiDialogOpen(false)} />
                    )}
                </Stack>
            </MainCard>
        </Container>
    )
}

export default KnowledgeBaseScrapLinks
