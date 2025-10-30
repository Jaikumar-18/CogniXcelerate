import React from 'react'
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
    Paper,
    Divider,
    useTheme
} from '@mui/material'
import { IconX, IconBrain, IconCode, IconCheck, IconArrowRight } from '@tabler/icons-react'

const CodeAgentDescriptionDialog = ({ open, onClose, template, onUseAgent }) => {
    const theme = useTheme()

    const keyFeatures = [
        'Multi-Agent Collaboration - Supervisor, Software Engineer, and Test Engineer LLMs work together.',
        'Iterative Feedback Loop - Supervisor reassigns tasks based on test results.',
        'Automated Code Generation - Produces complete application source code.',
        'Integrated Testing - Ensures functional and quality checks before finalizing.',
        'FastAPI Integration - Generates and serves the application via HTTP.',
        'Packaged Deployment - Application is zipped and ready for download.',
        'Virtual Environment Isolation - Builds run in isolated virtual environments.'
    ]

    const components = [
        'Supervisor LLM - Analyzes the user request. Delegates tasks to Software Engineer or Test Engineer. Decides if code is ready or needs improvements.',
        'Software Engineer LLM - Generates code based on requirements. Sends generated code back to Supervisor for review.',
        'Test Engineer LLM - Tests the generated code. Provides feedback and bug reports to Supervisor.',
        'Supervisor LLM (Review) - Based on feedback, either sends code for improvement or approves for final packaging.',
        'FastAPI Integration - Final approved code is sent to FastAPI endpoint. Uvicorn server handles execution.',
        'Virtual Environment (Backend) - Temporary virtual environment is created. Code is installed and dependencies resolved.',
        'Packaging & Download - Application is compressed into a zip file. FastAPI sends the zip file as HTTP response for download.'
    ]

    const workflow = [
        'User Input: User provides application requirements.',
        'Supervisor: Assigns task to Software Engineer.',
        'Software Engineer: Generates code.',
        'Supervisor: Reviews and sends to Test Engineer.',
        'Test Engineer: Tests code and sends feedback.',
        'Supervisor: Decides to loop back to Software Engineer or finalize.',
        'FastAPI: Receives finalized code.',
        'Backend: Creates virtual environment and installs dependencies.',
        'Packaging: Application is zipped.',
        'Response: Zip file is sent to user for download.'
    ]

    const benefits = [
        'Automated software development workflow.',
        'Reduces manual testing and bug fixing.',
        'Ensures high-quality, tested code before delivery.',
        'Isolated build environment prevents dependency conflicts.',
        'Ready-to-download application package.'
    ]

    const exampleProcess = [
        'Request: "Build a REST API for managing tasks."',
        'Supervisor -> Software Engineer: Generates Flask/FastAPI app.',
        'Supervisor -> Test Engineer: Tests endpoints.',
        'Test Engineer -> Supervisor: Reports bug in POST method.',
        'Supervisor -> Software Engineer: Fixes bug.',
        'Supervisor approves code.',
        'Code is packaged and served as zip file.'
    ]

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    border: `1px solid ${theme.palette.divider}`
                }
            }}
        >
            <DialogTitle sx={{ 
                p: 3,
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
                    <IconCode size={24} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        Code Agent
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Automated Multi-Agent Software Development
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
                        The CogniXcelerate Code Agent is an automated multi-agent system designed to build complete software applications from user requirements. It uses a supervisor-driven workflow that coordinates between multiple specialized agents, ensuring code quality, testing, and packaging for deployment.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        The agent integrates with FastAPI and Uvicorn to deliver the generated application as a downloadable zip file.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        <strong>Architecture:</strong> Human Request → Supervisor LLM → Software Engineer LLM → Supervisor LLM → Test Engineer LLM → Supervisor LLM → Code Packaging → FastAPI HTTP → Zip File Download
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconCode size={20} />
                        Key Features
                    </Typography>
                    <List>
                        {keyFeatures.map((feature, index) => (
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
                        Example Process
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Request:</strong> "Build a REST API for managing tasks."
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        1. Supervisor → Software Engineer: Generates Flask/FastAPI app<br/>
                        2. Supervisor → Test Engineer: Tests endpoints<br/>
                        3. Test Engineer → Supervisor: Reports bug in POST method<br/>
                        4. Supervisor → Software Engineer: Fixes bug<br/>
                        5. Supervisor approves code<br/>
                        6. Code is packaged and served as zip file
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

export default CodeAgentDescriptionDialog 