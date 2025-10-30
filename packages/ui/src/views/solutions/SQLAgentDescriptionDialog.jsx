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
import { IconDatabase, IconCode, IconBrain, IconCheck, IconArrowRight } from '@tabler/icons-react'

const SQLAgentDescriptionDialog = ({ open, onClose, template, onUseAgent }) => {
    const theme = useTheme()

    const features = [
        'Natural Language to SQL Conversion - Translates human questions into accurate SQL queries',
        'Dynamic Database Selection - Automatically selects the right database based on query context',
        'Schema-Aware Query Generation - Reads and understands database schemas before generating queries',
        'Self-Correcting Loop - Validates queries and results; re-generates if the output is incorrect',
        'Data Visualization - Presents final results in both tables and charts for better insights',
        'Scalable & Modular - Supports multiple databases and is easily extendable'
    ]

    const components = [
        'Supervisor LLM - Analyzes the human question and determines the most relevant database',
        'Custom Function: Schema Reader - Reads and returns the database schema for the selected database',
        'Query Generator - Converts the human query and schema into an SQL query',
        'Condition Agent (Query Validator) - Validates SQL query correctness and results',
        'Result Analyzer - Prepares validated data for visualization',
        'Visualization Layer - Presents results in table and chart format'
    ]

    const workflow = [
        'User Input: User provides a natural language query',
        'Database Selection: Supervisor LLM chooses the correct database',
        'Schema Reading: Custom function fetches database schema',
        'Query Generation: SQL query is generated based on schema and question',
        'Validation Loop: Execute query, validate result, regenerate if incorrect',
        'Final Execution: Query executed successfully',
        'Visualization: Data is shown in both table and chart format'
    ]

    const benefits = [
        'Eliminates manual SQL query writing',
        'Reduces human error with self-correcting logic',
        'Supports multiple databases dynamically',
        'Delivers immediate data insights with visualization',
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
                    <IconDatabase size={24} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        SQL Agent
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Intelligent Database Query Assistant
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
                        The CogniXcelerate SQL Agent is an intelligent, automated solution designed to dynamically
                        interpret natural language queries, select the appropriate database, generate optimized SQL
                        queries, validate results, and visualize the data in both tabular and graphical formats.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        It leverages an LLM-based supervisor, a custom schema reader, a query generator, a
                        condition-based query validator, and visualization components to create a fully self-correcting SQL
                        automation pipeline.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                        <strong>Architecture:</strong> Human Question → Supervisor LLM → Schema Reader → Query Generator → Query Validator → Execute Query → Result Analyzer → Visualization
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
                        <strong>Question:</strong> "Show me the top 5 customers by sales in the last quarter."
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        1. Supervisor LLM selects retail_db<br/>
                        2. Schema Reader reads tables<br/>
                        3. Query Generator creates SQL<br/>
                        4. Condition Agent validates query<br/>
                        5. Execution retrieves data<br/>
                        6. Visualization displays data
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

SQLAgentDescriptionDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUseAgent: PropTypes.func.isRequired,
    template: PropTypes.object
}

export default SQLAgentDescriptionDialog 