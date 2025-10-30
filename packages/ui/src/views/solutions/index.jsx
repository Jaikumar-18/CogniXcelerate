import * as React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// material-ui
import {
    Box,
    Stack,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconWorld, IconBuilding, IconCode, IconMail, IconInfoCircle, IconPuzzle } from '@tabler/icons-react'
import { alpha } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ErrorBoundary from '@/ErrorBoundary'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import { Available } from '@/ui-component/rbac/available'
import CodeAgentDescriptionDialog from './CodeAgentDescriptionDialog'
import SQLAgentDescriptionDialog from './SQLAgentDescriptionDialog'

// API
import marketplacesApi from '@/api/marketplaces'

// Hooks
import useApi from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'

// Utils
import useNotifier from '@/utils/useNotifier'

// constant
import { useError } from '@/store/context/ErrorContext'

// ==============================|| Solutions ||============================== //

const Solutions = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    useNotifier()

    const theme = useTheme()
    const { error, setError } = useError()
    const { hasPermission } = useAuth()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const getAllTemplatesMarketplacesApi = useApi(marketplacesApi.getAllTemplatesFromMarketplaces)

    // State for info dialog
    const [infoDialogOpen, setInfoDialogOpen] = useState(false)
    const [selectedSolution, setSelectedSolution] = useState(null)

    // Solution descriptions

    const handleInfoClick = (solution) => {
        setSelectedSolution(solution)
        setInfoDialogOpen(true)
    }

    const handleInfoDialogClose = () => {
        setInfoDialogOpen(false)
        setSelectedSolution(null)
    }

    // Helper to get summary (first paragraph or up to first double line break)
    const getDescriptionSummary = (desc) => {
        if (!desc) return ''
        const doubleBreak = desc.indexOf('\n\n')
        if (doubleBreak !== -1) return desc.slice(0, doubleBreak)
        return desc.length > 200 ? desc.slice(0, 200) + '...' : desc
    }

    // Solution categories and their solutions
    const solutionCategories = [
        {
            id: 'enterprise',
            title: 'Enterprise',
            description: 'Advanced solutions for enterprise-level operations',
            icon: IconBuilding,
            color: '#1976d2',
            solutions: [
                {
                    id: 'sql-agent',
                    name: 'SQL Agent',
                    description: 'Intelligent SQL query generation and database management',
                    type: 'AgentflowV2',
                    icon: IconCode
                }
            ]
        },
        {
            id: 'organization',
            title: 'Organization',
            description: 'Solutions for organizational efficiency and productivity',
            icon: IconBuilding,
            color: '#388e3c',
            solutions: [
                {
                    id: 'email-agent',
                    name: 'Email Agent',
                    description: 'Intelligent email processing and response automation',
                    type: 'AgentflowV2',
                    icon: IconMail
                },
                {
                    id: 'document-scraper',
                    name: 'Document Scraper',
                    description: 'Extract and process information from various document formats',
                    type: 'Chatflow',
                    icon: IconCode
                },
                {
                    id: 'web-scraper',
                    name: 'Web Scraper',
                    description: 'Automated web data extraction and content processing',
                    type: 'Chatflow',
                    icon: IconWorld
                },
                {
                    id: 'onedrive-scraper',
                    name: 'OneDrive Scraper',
                    description: 'Extract and process information from your OneDrive documents',
                    type: 'Chatflow',
                    icon: IconCode // You can change to a more appropriate icon if available
                }
            ]
        },
        {
            id: 'sdlc',
            title: 'SDLC',
            description: 'Software Development Life Cycle solutions and tools',
            icon: IconCode,
            color: '#f57c00',
            solutions: [
                {
                    id: 'code-agent',
                    name: 'Code Agent',
                    description: 'Intelligent code generation, analysis, and development assistance',
                    type: 'AgentflowV2',
                    icon: IconCode
                }
            ]
        }
    ]

    const handleSolutionClick = async (solution) => {
        if (solution.id === 'coming-soon') {
            enqueueSnackbar({
                message: 'This solution will be available soon!',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'info',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            OK
                        </Button>
                    )
                }
            })
            return
        }

        try {
            // Call the API directly to get the response
            const response = await marketplacesApi.getAllTemplatesFromMarketplaces()
            const templates = response.data

            // Check if templates array is available
            if (!templates || !Array.isArray(templates) || templates.length === 0) {
                enqueueSnackbar({
                    message: 'No templates available. Please try again.',
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'error',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                OK
                            </Button>
                        )
                    }
                })
                return
            }

            let matchingTemplate = null

            if (solution.id === 'sql-agent') {
                matchingTemplate = templates.find(
                    (template) =>
                        template.templateName.toLowerCase().includes('sql') ||
                        template.description.toLowerCase().includes('sql') ||
                        template.templateName.toLowerCase().includes('database') ||
                        template.description.toLowerCase().includes('database')
                )
            } else if (solution.id === 'email-agent') {
                matchingTemplate = templates.find(
                    (template) =>
                        template.templateName.toLowerCase().includes('email') ||
                        template.description.toLowerCase().includes('email') ||
                        template.templateName.toLowerCase().includes('mail') ||
                        template.description.toLowerCase().includes('mail')
                )
            } else if (solution.id === 'code-agent') {
                matchingTemplate = templates.find(
                    (template) =>
                        template.templateName.toLowerCase().includes('code') ||
                        template.description.toLowerCase().includes('code') ||
                        template.templateName.toLowerCase().includes('agent') ||
                        template.description.toLowerCase().includes('agent')
                )
            } else if (solution.id === 'document-scraper') {
                matchingTemplate = templates.find(
                    (template) =>
                        template.templateName.toLowerCase().includes('document') ||
                        template.description.toLowerCase().includes('document') ||
                        template.templateName.toLowerCase().includes('scraper') ||
                        template.description.toLowerCase().includes('scraper')
                )
            } else if (solution.id === 'web-scraper') {
                matchingTemplate = templates.find(
                    (template) =>
                        template.templateName.toLowerCase().includes('web') ||
                        template.description.toLowerCase().includes('web') ||
                        template.templateName.toLowerCase().includes('scraper') ||
                        template.description.toLowerCase().includes('scraper')
                )
            }

            if (matchingTemplate) {
                // Navigate to marketplace canvas based on template type
                if (matchingTemplate.type === 'AgentflowV2') {
                    navigate(`/v2/marketplace/${matchingTemplate.id}`, {
                        state: {
                            flowData: matchingTemplate.flowData,
                            name: matchingTemplate.templateName
                        }
                    })
                } else if (matchingTemplate.type === 'Chatflow') {
                    navigate(`/marketplace/${matchingTemplate.id}`, {
                        state: {
                            flowData: matchingTemplate.flowData,
                            name: matchingTemplate.templateName
                        }
                    })
                }
            } else {
                enqueueSnackbar({
                    message: `${solution.name} template not found. Please try again.`,
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'error',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                OK
                            </Button>
                        )
                    }
                })
            }
        } catch (error) {
            console.error('Error in handleSolutionClick:', error)
            enqueueSnackbar({
                message: 'Failed to load templates. Please try again.',
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            OK
                        </Button>
                    )
                }
            })
        }
    }

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                    <Stack flexDirection='column' spacing={3}>
                        {/* Main Solution Overview Tile */}
                        <Card
                            sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.08)}`
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Box>
                                    <Stack direction='row' alignItems='center' spacing={1.5} mb={1}>
                                        <IconPuzzle size={28} color={theme.palette.primary.main} />
                                        <Typography variant='h3' sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                            Solutions
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant='body1'
                                        color='text.secondary'
                                        sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5 }}
                                    >
                                        Accelerate your AI journey with our pre-built enterprise solutions
                                    </Typography>
                                    <Typography
                                        variant='body1'
                                        color='text.secondary'
                                        sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5, mt: 1 }}
                                    >
                                        Discover ready-to-deploy AI solutions designed for enterprise needs. From database management to
                                        document processing, our solutions help you implement AI faster and more efficiently.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Solution Categories */}
                        <Available permission='templates:marketplace'>
                            <Grid container spacing={3}>
                                {solutionCategories.map((category) => (
                                    <Grid item xs={12} md={4} key={category.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                minHeight: 220, // Reduced from 370
                                                display: 'flex',
                                                flexDirection: 'column',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                backgroundColor: 'white',
                                                color: theme.palette.text.primary,
                                                borderRadius: 3,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                                                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.06)}`,
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: theme.shadows[8],
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.03)
                                                }
                                            }}
                                            onClick={() => navigate(`/solutions/${category.id}`)}
                                        >
                                            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                                {/* Category Header */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                    <Box
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            backgroundColor: theme.palette.primary.main,
                                                            color: 'white',
                                                            mr: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: 40,
                                                            minHeight: 40
                                                        }}
                                                    >
                                                        {category.icon && React.createElement(category.icon, { size: 24 })}
                                                    </Box>
                                                    <Box>
                                                        <Typography
                                                            variant='h5'
                                                            component='div'
                                                            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                                                        >
                                                            {category.title}
                                                        </Typography>
                                                        <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                                                            {category.solutions.length} solution{category.solutions.length !== 1 ? 's' : ''}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {/* Category Description */}
                                                <Typography variant='body2' sx={{ mb: 3, color: theme.palette.text.secondary }}>
                                                    {category.description}
                                                </Typography>
                                                <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push actions to bottom */}
                                                {/* Action Buttons */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 1,
                                                        mt: 2,
                                                        alignItems: 'stretch',
                                                        width: '100%'
                                                    }}
                                                >
                                                    <Button
                                                        variant='contained'
                                                        size='small'
                                                        sx={{
                                                            backgroundColor: theme.palette.primary.main,
                                                            color: 'white',
                                                            textAlign: 'center',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            width: '100%',
                                                            minHeight: 40,
                                                            fontWeight: 600,
                                                            fontSize: '1rem',
                                                            boxShadow: 'none',
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.primary.dark,
                                                                opacity: 0.95,
                                                                boxShadow: 'none'
                                                            }
                                                        }}
                                                    >
                                                        Click to Explore
                                                    </Button>
                                                    {/* Only show Info button for agent tiles, but not for Enterprise, Organization, SDLC */}
                                                    {!(
                                                        category.id === 'enterprise' ||
                                                        category.id === 'organization' ||
                                                        category.id === 'sdlc'
                                                    ) &&
                                                        category.solutions.some((sol) => ['sql-agent', 'code-agent'].includes(sol.id)) && (
                                                            <Tooltip title='View Details'>
                                                                <IconButton
                                                                    size='small'
                                                                    sx={{
                                                                        color: theme.palette.primary.main,
                                                                        alignSelf: 'flex-start',
                                                                        mt: 0.5,
                                                                        '&:hover': {
                                                                            color: 'white',
                                                                            backgroundColor: theme.palette.primary.main
                                                                        }
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleInfoClick(
                                                                            category.solutions.find((sol) =>
                                                                                ['sql-agent', 'code-agent'].includes(sol.id)
                                                                            )
                                                                        )
                                                                    }}
                                                                >
                                                                    <IconInfoCircle size={20} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Available>

                        {/* Info Dialog */}
                        <Dialog open={infoDialogOpen} onClose={handleInfoDialogClose} maxWidth='md' fullWidth>
                            <DialogTitle
                                sx={{
                                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                    color: 'white',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                {selectedSolution && solutionDescriptions[selectedSolution.id]?.title}
                            </DialogTitle>
                            <DialogContent
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    p: 3
                                }}
                            >
                                {selectedSolution && solutionDescriptions[selectedSolution.id] && (
                                    <Typography
                                        variant='body1'
                                        sx={{
                                            whiteSpace: 'pre-line',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {getDescriptionSummary(solutionDescriptions[selectedSolution.id].description)}
                                    </Typography>
                                )}
                            </DialogContent>
                            <DialogActions
                                sx={{
                                    backgroundColor: '#f5f5f5',
                                    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                                    p: 2
                                }}
                            >
                                <Button
                                    onClick={handleInfoDialogClose}
                                    variant='contained'
                                    sx={{
                                        backgroundColor: '#666',
                                        '&:hover': {
                                            backgroundColor: '#555'
                                        }
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                        {selectedSolution && selectedSolution.id === 'code-agent' && (
                            <CodeAgentDescriptionDialog open={infoDialogOpen} onClose={handleInfoDialogClose} />
                        )}
                        {selectedSolution && selectedSolution.id === 'sql-agent' && (
                            <SQLAgentDescriptionDialog open={infoDialogOpen} onClose={handleInfoDialogClose} />
                        )}
                    </Stack>
                )}
            </MainCard>
        </>
    )
}

export default Solutions
