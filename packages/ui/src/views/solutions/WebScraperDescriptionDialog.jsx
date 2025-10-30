import React from 'react'
import PropTypes from 'prop-types'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
    Paper
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconWorld, IconCode, IconBrain, IconCheck, IconArrowRight } from '@tabler/icons-react'

const WebScraperDescriptionDialog = ({ open, onClose, template, onUseAgent }) => {
    const theme = useTheme()

    const features = [
        'Web Data Extraction - Extracts structured data from websites using natural language prompts',
        'Dynamic URL Handling - Automatically navigates and scrapes multiple pages or URLs',
        'Schema-Aware Parsing - Understands website structure for precise data extraction',
        'Self-Correcting Scraping - Validates extracted data and retries if errors are detected',
        'Data Formatting - Converts scraped data into structured formats like JSON or CSV',
        'Scalable & Modular - Supports various websites and is easily extendable'
    ]

    const components = [
        'Supervisor LLM - Analyzes the user prompt and identifies target websites or URLs',
        'Custom Function: DOM Parser - Reads and interprets website DOM structure',
        'Data Extractor - Pulls relevant data based on user prompt and DOM structure',
        'Validation Agent - Verifies the accuracy and completeness of extracted data',
        'Data Formatter - Structures extracted data into user-specified formats',
        'Output Layer - Delivers final data in a downloadable or viewable format'
    ]

    const workflow = [
        'User Input: User provides a natural language scraping request',
        'Website Selection: Supervisor LLM identifies the target website or URLs',
        'DOM Parsing: Custom function analyzes website structure',
        'Data Extraction: Relevant data is scraped based on user prompt',
        'Validation Loop: Validate extracted data, re-scrape if incomplete or incorrect',
        'Data Formatting: Data is structured into JSON, CSV, or other formats',
        'Output Delivery: Final data is presented or made available for download'
    ]

    const benefits = [
        'Eliminates manual web scraping efforts',
        'Reduces errors with self-correcting logic',
        'Handles dynamic and complex websites',
        'Delivers structured data in multiple formats',
        'Modular and easy to integrate'
    ]

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: theme.shadows[8],
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`
            }}>
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}
                >
                    <IconWorld size={24} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        Web Scraper Agent
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Intelligent Web Data Extraction Assistant
                    </Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconBrain size={20} />
                        Overview
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        The Web Scraper Agent is an intelligent, automated solution designed to extract structured data
                        from websites based on natural language prompts. It dynamically identifies target websites, parses
                        their structure, extracts relevant data, validates it, and formats it into user-specified formats.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        It leverages an LLM-based supervisor, a custom DOM parser, a data extractor, a validation agent,
                        and formatting components to create a fully self-correcting web scraping pipeline.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        <strong>Architecture:</strong> User Prompt → Supervisor LLM → DOM Parser → Data Extractor → Validation Agent → Data Formatter → Output Layer
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconCode size={20} />
                        Key Features
                    </Typography>
                    <List>
                        {features.map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <IconCheck 
                                        size={18} 
                                        color={theme.palette.success.main}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={feature}
                                    primaryTypographyProps={{
                                        variant: 'body1',
                                        sx: { fontWeight: 500 }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Components
                    </Typography>
                    <List>
                        {components.map((component, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            background: theme.palette.secondary.main,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.6rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
                                </ListItemIcon>
                                <ListItemText
                                    primary={component}
                                    primaryTypographyProps={{
                                        variant: 'body1',
                                        sx: { fontWeight: 500 }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Workflow
                    </Typography>
                    <List>
                        {workflow.map((step, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Box
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            background: theme.palette.secondary.main,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.6rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
                                </ListItemIcon>
                                <ListItemText
                                    primary={step}
                                    primaryTypographyProps={{
                                        variant: 'body1',
                                        sx: { fontWeight: 500 }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                        Benefits
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
                        {benefits.map((benefit, index) => (
                            <Paper key={index} sx={{ p: 2, border: `1px solid ${theme.palette.secondary.main}`, background: theme.palette.secondary.light }}>
                                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.secondary.dark }}>
                                    {benefit}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Box>

                <Paper sx={{ p: 3, background: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                    <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconArrowRight size={20} />
                        Example Query
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Prompt:</strong> "Extract product names and prices from the electronics section of an online store."
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        1. Supervisor LLM identifies target website<br/>
                        2. DOM Parser reads website structure<br/>
                        3. Data Extractor pulls product names and prices<br/>
                        4. Validation Agent checks data accuracy<br/>
                        5. Data Formatter structures data into JSON<br/>
                        6. Output Layer delivers formatted data
                    </Typography>
                </Paper>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1
                    }}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    onClick={onUseAgent}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1
                    }}
                >
                    Use This Agent
                </Button>
            </DialogActions>
        </Dialog>
    )
}

WebScraperDescriptionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUseAgent: PropTypes.func.isRequired,
    template: PropTypes.object
}

export default WebScraperDescriptionDialog