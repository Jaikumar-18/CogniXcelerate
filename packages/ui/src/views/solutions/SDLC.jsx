import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useState } from 'react'

// material-ui
import {
    Box,
    Stack,
    Typography,
    Card,
    CardContent,
    Button,
    Grid,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { 
    IconArrowLeft,
    IconCode,
    IconInfoCircle
} from '@tabler/icons-react'
import CodeAgentDescriptionDialog from './CodeAgentDescriptionDialog'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import { Available } from '@/ui-component/rbac/available'

// API
import marketplacesApi from '@/api/marketplaces'

// Hooks
import useApi from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'

// Utils
import useNotifier from '@/utils/useNotifier'

// constant
import { useError } from '@/store/context/ErrorContext'

// Helper to get summary (first paragraph or up to the first double line break)
const getDescriptionSummary = (desc) => {
    if (!desc) return ''
    const doubleBreak = desc.indexOf('\n\n')
    if (doubleBreak !== -1) return desc.slice(0, doubleBreak)
    return desc.length > 200 ? desc.slice(0, 200) + '...' : desc
}

// ==============================|| SDLC Solutions ||============================== //

const SDLC = () => {
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
    const [codeDialogOpen, setCodeDialogOpen] = useState(false)

    // Solution descriptions
    const solutionDescriptions = {
        'code-agent': {
            title: 'Code Agent',
            description: `The Code Agent is a sophisticated AI-powered development assistant designed to enhance software development workflows.

Key Features:
• Intelligent code generation and completion
• Multi-language support (Python, JavaScript, Java, C++, etc.)
• Code analysis and optimization suggestions
• Bug detection and debugging assistance
• Documentation generation and code commenting
• Refactoring recommendations and implementation

Use Cases:
• Software developers seeking coding assistance
• Teams working on code reviews and quality assurance
• Beginners learning programming concepts
• Rapid prototyping and MVP development
• Legacy code modernization and maintenance

The Code Agent understands context, follows best practices, and generates production-ready code while maintaining consistency with your existing codebase and coding standards.`
        }
    }

    const handleInfoClick = (solution) => {
        if (solution.id === 'code-agent') {
            setCodeDialogOpen(true)
        } else {
            setSelectedSolution(solution)
            setInfoDialogOpen(true)
        }
    }

    const handleInfoDialogClose = () => {
        setInfoDialogOpen(false)
        setSelectedSolution(null)
    }

    const handleCodeDialogClose = () => {
        setCodeDialogOpen(false)
    }

    const handleUseCodeAgent = () => {
        const codeSolution = sdlcSolutions.find(s => s.id === 'code-agent')
        if (codeSolution) {
            handleSolutionClick(codeSolution)
        }
        setCodeDialogOpen(false)
    }

    // SDLC solutions
    const sdlcSolutions = [
        {
            id: 'code-agent',
            name: 'Code Agent',
            description: 'Intelligent code generation, analysis, and development assistance',
            type: 'AgentflowV2',
            icon: IconCode
        }
    ]

    const handleSolutionClick = async (solution) => {
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
            
            if (solution.id === 'code-agent') {
                matchingTemplate = templates.find(template => 
                    template.templateName.toLowerCase().includes('code') || 
                    template.description.toLowerCase().includes('code') ||
                    template.templateName.toLowerCase().includes('agent') ||
                    template.description.toLowerCase().includes('agent')
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

    const handleBack = () => {
        navigate('/solutions')
    }

    return (
        <>
            <MainCard>
                {error ? (
                    <ErrorBoundary error={error} />
                ) : (
                <Stack flexDirection='column' spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<IconArrowLeft />}
                            onClick={handleBack}
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white'
                                }
                            }}
                        >
                            Back
                        </Button>
                    </Box>

                    {/* SDLC Overview */}
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
                                    <IconCode size={28} color={theme.palette.primary.main} />
                                    <Typography
                                        variant='h3'
                                        sx={{ fontWeight: 700, color: theme.palette.text.primary }}
                                    >
                                        SDLC Solutions
                                    </Typography>
                                </Stack>
                                <Typography
                                    variant='body1'
                                    color='text.secondary'
                                    sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5 }}
                                >
                                    Software Development Life Cycle solutions and tools
                                </Typography>
                                <Typography
                                    variant='body1'
                                    color='text.secondary'
                                    sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5, mt: 1 }}
                                >
                                    Discover powerful solutions designed to streamline the software development process, from planning and design to testing and deployment. Our SDLC solutions help teams work more efficiently and deliver higher quality software.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                        {/* SDLC Solutions */}
                    <Available permission='templates:marketplace'>
                            <Grid container spacing={3}>
                                {sdlcSolutions.map((solution) => (
                                    <Grid item xs={12} md={6} key={solution.id}>
                                        <Card 
                                            sx={{ 
                                                height: '100%',
                                                minHeight: 220,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                backgroundColor: 'white',
                                                color: theme.palette.text.primary,
                                                borderRadius: 3,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                                                boxShadow: `0 2px 12px ${alpha(theme.palette.grey[500], 0.06)}`,
                                                position: 'relative',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: theme.shadows[8],
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.03)
                                                }
                                            }}
                                            onClick={() => handleSolutionClick(solution)}
                                        >
                                            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                                {/* Info Button - Top Right */}
                                                <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ 
                                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                                color: theme.palette.primary.main,
                                                                '&:hover': {
                                                                    backgroundColor: theme.palette.primary.main,
                                                                    color: 'white'
                                                                }
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleInfoClick(solution)
                                                            }}
                                                        >
                                                            <IconInfoCircle size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                                
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
                                                        {solution.icon && React.createElement(solution.icon, { size: 24 })}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                                            {solution.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                            Solution
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Category Description */}
                                                <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                                                    {solution.description}
                                                </Typography>

                                                <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push actions to bottom */}

                                                {/* Action Buttons */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, alignItems: 'stretch', width: '100%' }}>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
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
                                                        Use Solution
                                                    </Button>

                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Available>

                        {/* Code Agent Dialog */}
                        <CodeAgentDescriptionDialog 
                            open={codeDialogOpen}
                            onClose={handleCodeDialogClose}
                            onUseAgent={handleUseCodeAgent}
                        />

                        {/* Info Dialog */}
                        <Dialog 
                            open={infoDialogOpen} 
                            onClose={handleInfoDialogClose}
                            maxWidth="md"
                            fullWidth
                        >
                            <DialogTitle sx={{ 
                                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                color: 'white',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                {selectedSolution && solutionDescriptions[selectedSolution.id]?.title}
                            </DialogTitle>
                            <DialogContent sx={{ 
                                backgroundColor: '#f5f5f5',
                                p: 3
                            }}>
                                {selectedSolution && solutionDescriptions[selectedSolution.id] && (
                                    <Typography 
                                        variant="body1" 
                                        sx={{ 
                                            whiteSpace: 'pre-line',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {getDescriptionSummary(solutionDescriptions[selectedSolution.id].description)}
                                </Typography>
                                )}
                            </DialogContent>
                            <DialogActions sx={{ 
                                backgroundColor: '#f5f5f5',
                                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                                p: 2
                            }}>
                                <Button 
                                    onClick={handleInfoDialogClose}
                                    variant="contained"
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
                </Stack>
                )}
            </MainCard>
        </>
    )
}

export default SDLC 