import * as React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// material-ui
import { Box, Stack, Typography, Card, CardContent, Button, Chip, Grid, IconButton, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { IconArrowLeft, IconRocket, IconFileText, IconWorld, IconBuilding, IconMail, IconInfoCircle } from '@tabler/icons-react'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'
import { closeSnackbar as closeSnackbarAction, enqueueSnackbar as enqueueSnackbarAction } from '@/store/actions'
import { Available } from '@/ui-component/rbac/available'
import DocumentScraperDescriptionDialog from './Document ScraperDescriptionDialog'
import WebScraperDescriptionDialog from './WebScraperDescriptionDialog'
import OneDriveScraperDescriptionDialog from './OneDriveScraperDescriptionDialog'

// API
import marketplacesApi from '@/api/marketplaces'

// Hooks
import useApi from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'

// Utils
import useNotifier from '@/utils/useNotifier'

// constant
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'
import { useError } from '@/store/context/ErrorContext'

// ==============================|| Organization Solutions ||============================== //

const Organization = () => {
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

    // Organization solutions
    const organizationSolutions = [
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
            icon: IconFileText
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
            icon: IconFileText // You can change to a more appropriate icon if available
        }
    ]

    const handleInfoClick = (solution) => {
        setSelectedSolution(solution)
        setInfoDialogOpen(true)
    }

    const handleInfoDialogClose = () => {
        setInfoDialogOpen(false)
        setSelectedSolution(null)
    }

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
            if (solution.id === 'email-agent') {
                matchingTemplate = templates.find(
                    (template) =>
                        template.templateName.toLowerCase().includes('email') ||
                        template.description.toLowerCase().includes('email') ||
                        template.templateName.toLowerCase().includes('mail') ||
                        template.description.toLowerCase().includes('mail')
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
            } else if (solution.id === 'onedrive-scraper') {
                matchingTemplate = templates.find(
                    (template) =>
                        template.templateName.toLowerCase().includes('onedrive') ||
                        template.description.toLowerCase().includes('onedrive') ||
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
                                variant='outlined'
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

                        {/* Organization Overview */}
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
                                        <IconBuilding size={28} color={theme.palette.primary.main} />
                                        <Typography variant='h3' sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                                            Organization Solutions
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant='body1'
                                        color='text.secondary'
                                        sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5 }}
                                    >
                                        Solutions for organizational efficiency and productivity
                                    </Typography>
                                    <Typography
                                        variant='body1'
                                        color='text.secondary'
                                        sx={{ fontSize: '1.05rem', fontWeight: 400, lineHeight: 1.5, mt: 1 }}
                                    >
                                        Discover powerful solutions designed to enhance organizational efficiency, automate repetitive
                                        tasks, and extract valuable insights from various data sources to drive better decision-making.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Organization Solutions */}
                        <Available permission='templates:marketplace'>
                            <Grid container spacing={3}>
                                {organizationSolutions.map((solution) => (
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
                                                    <Tooltip title='View Details'>
                                                        <IconButton
                                                            size='small'
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
                                                        <Typography
                                                            variant='h5'
                                                            component='div'
                                                            sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                                                        >
                                                            {solution.name}
                                                        </Typography>
                                                        <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                                                            Solution
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {/* Category Description */}
                                                <Typography variant='body2' sx={{ mb: 3, color: theme.palette.text.secondary }}>
                                                    {solution.description}
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
                                                        Use Solution
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Available>

                        {/* Info Dialogs */}
                        {selectedSolution && selectedSolution.id === 'document-scraper' && (
                            <DocumentScraperDescriptionDialog
                                open={infoDialogOpen}
                                onClose={handleInfoDialogClose}
                                onUseAgent={() => {
                                    handleInfoDialogClose()
                                    handleSolutionClick(selectedSolution)
                                }}
                            />
                        )}
                        {selectedSolution && selectedSolution.id === 'web-scraper' && (
                            <WebScraperDescriptionDialog
                                open={infoDialogOpen}
                                onClose={handleInfoDialogClose}
                                onUseAgent={() => {
                                    handleInfoDialogClose()
                                    handleSolutionClick(selectedSolution)
                                }}
                            />
                        )}
                        {selectedSolution && selectedSolution.id === 'onedrive-scraper' && (
                            <OneDriveScraperDescriptionDialog
                                open={infoDialogOpen}
                                onClose={handleInfoDialogClose}
                                onUseAgent={() => {
                                    handleInfoDialogClose()
                                    handleSolutionClick(selectedSolution)
                                }}
                            />
                        )}
                    </Stack>
                )}
            </MainCard>
        </>
    )
}

export default Organization
