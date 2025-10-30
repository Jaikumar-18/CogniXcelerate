import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

// material-ui
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Paper,
    Stack,
    Typography,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    OutlinedInput,
    InputAdornment,
    Divider,
    List,
    ListItemButton,
    ListItem,
    ListItemAvatar,
    ListItemText as MuiListItemText,
    Chip,
    Tab,
    Tabs,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// icons
import {
    IconCirclePlus,
    IconWand,
    IconRocket,
    IconRestore,
    IconPlus,
    IconCode,
    IconSettings,
    IconDeviceFloppy,
    IconChevronDown,
    IconSparkles,
    IconSearch,
    IconX,
    IconCube,
    IconMessageChatbotFilled,
    IconLayoutGridAdd,
    IconPlaylistAdd,
    IconListCheck,
    IconFileSettings,
    IconSettingsDown,
    IconSettingsSpark,
    IconApps,
    IconComponents,
    IconShare
} from '@tabler/icons-react'

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar'

// project imports
import { StyledFab } from '@/ui-component/button/StyledFab'
import { Available } from '@/ui-component/rbac/available'
import MainCard from '@/ui-component/cards/MainCard'
import Transitions from '@/ui-component/extended/Transitions'
import AgentflowGeneratorDialog from '@/ui-component/dialog/AgentflowGeneratorDialog'

// const
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'
import LlamaindexPNG from '@/assets/images/llamaindex.png'
import LangChainPNG from '@/assets/images/langchain.png'
import utilNodesPNG from '@/assets/images/utilNodes.png'

// ==============================|| ACTION BUTTON ||============================== //

function a11yProps(index) {
    return {
        id: `attachment-tab-${index}`,
        'aria-controls': `attachment-tabpanel-${index}`
    }
}

const blacklistCategoriesForAgentCanvas = ['Agents', 'Memory', 'Record Manager', 'Utilities']

const agentMemoryNodes = ['agentMemory', 'sqliteAgentMemory', 'postgresAgentMemory', 'mySQLAgentMemory']

// Show blacklisted nodes (exceptions) for agent canvas
const exceptionsForAgentCanvas = {
    Memory: agentMemoryNodes,
    Utilities: ['getVariable', 'setVariable', 'stickyNote']
}

// Hide some nodes from the chatflow canvas
const blacklistForChatflowCanvas = {
    Memory: agentMemoryNodes
}

const DEFAULT_RADIUS = 120
const DEFAULT_ANGLE = 100 // degrees, for a compact left-side arc
// No downward tilt

const ActionButton = ({
    onAddNode,
    onEmbed,
    onSettings,
    onSave,
    onGenerateAgentflow,
    isAgentCanvas = false,
    savePermission = 'chatflows:create',
    isDirty = false,
    nodesData = [],
    radius = DEFAULT_RADIUS, // px
    arcAngle = DEFAULT_ANGLE // degrees
}) => {
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const [showNodeDialog, setShowNodeDialog] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})
    const [searchValue, setSearchValue] = useState('')
    const [nodes, setNodes] = useState({})
    const [categoryExpanded, setCategoryExpanded] = useState({})
    const [tabValue, setTabValue] = useState(0)
    const buttonRef = useRef(null)
    // Remove hoveredIdx state
    // const [hoveredIdx, setHoveredIdx] = useState(null)

    const isAgentCanvasV2 = window.location.pathname.includes('/agentcanvas')

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
        setIsOpen(!isOpen)
    }

    const handleClose = () => {
        setAnchorEl(null)
        setIsOpen(false)
    }

    const handleMenuItemClick = (action) => {
        handleClose()
        switch (action) {
            case 'addNode':
                setShowNodeDialog(true)
                break
            case 'embed':
                onEmbed()
                break
            case 'settings':
                onSettings()
                break
            case 'save':
                onSave()
                break
            case 'generateAgentflow':
                handleOpenDialog()
                break
            default:
                break
        }
    }

    const addException = (category) => {
        let nodes = []
        if (category) {
            const nodeNames = exceptionsForAgentCanvas[category] || []
            nodes = nodesData.filter((nd) => nd.category === category && nodeNames.includes(nd.name))
        } else {
            for (const category in exceptionsForAgentCanvas) {
                const nodeNames = exceptionsForAgentCanvas[category]
                nodes.push(...nodesData.filter((nd) => nd.category === category && nodeNames.includes(nd.name)))
            }
        }
        return nodes
    }

    const getSearchedNodes = (value) => {
        if (isAgentCanvas) {
            const nodes = nodesData.filter((nd) => !blacklistCategoriesForAgentCanvas.includes(nd.category))
            nodes.push(...addException())
            const passed = nodes.filter((nd) => {
                const passesName = nd.name.toLowerCase().includes(value.toLowerCase())
                const passesLabel = nd.label.toLowerCase().includes(value.toLowerCase())
                const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
                return passesName || passesCategory || passesLabel
            })
            return passed
        }
        let nodes = nodesData.filter((nd) => nd.category !== 'Multi Agents' && nd.category !== 'Sequential Agents')

        for (const category in blacklistForChatflowCanvas) {
            const nodeNames = blacklistForChatflowCanvas[category]
            nodes = nodes.filter((nd) => !nodeNames.includes(nd.name))
        }

        const passed = nodes.filter((nd) => {
            const passesName = nd.name.toLowerCase().includes(value.toLowerCase())
            const passesLabel = nd.label.toLowerCase().includes(value.toLowerCase())
            const passesCategory = nd.category.toLowerCase().includes(value.toLowerCase())
            return passesName || passesCategory || passesLabel
        })
        return passed
    }

    const filterSearch = (value, newTabValue) => {
        setSearchValue(value)
        setTimeout(() => {
            if (value) {
                const returnData = getSearchedNodes(value)
                groupByCategory(returnData, newTabValue ?? tabValue, true)
            } else if (value === '') {
                groupByCategory(nodesData, newTabValue ?? tabValue)
            }
        }, 500)
    }

    const groupByTags = (nodes, newTabValue = 0) => {
        const langchainNodes = nodes.filter((nd) => !nd.tags)
        const llmaindexNodes = nodes.filter((nd) => nd.tags && nd.tags.includes('LlamaIndex'))
        const utilitiesNodes = nodes.filter((nd) => nd.tags && nd.tags.includes('Utilities'))
        if (newTabValue === 0) {
            return langchainNodes
        } else if (newTabValue === 1) {
            return llmaindexNodes
        } else {
            return utilitiesNodes
        }
    }

    const groupByCategory = (nodes, newTabValue, isFilter) => {
        if (isAgentCanvas) {
            const accordianCategories = {}
            const result = nodes.reduce(function (r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                if (isAgentCanvasV2) {
                    if (category !== 'Agent Flows') {
                        continue
                    }
                } else {
                    if (category === 'Agent Flows') {
                        continue
                    }
                }
                // Filter out blacklisted categories
                if (!blacklistCategoriesForAgentCanvas.includes(category)) {
                    // Filter out LlamaIndex nodes
                    const nodes = result[category].filter((nd) => !nd.tags || !nd.tags.includes('LlamaIndex'))
                    if (!nodes.length) continue

                    filteredResult[category] = nodes
                }

                // Allow exceptionsForAgentCanvas
                if (Object.keys(exceptionsForAgentCanvas).includes(category)) {
                    filteredResult[category] = addException(category)
                }
            }
            setNodes(filteredResult)
            accordianCategories['Multi Agents'] = true
            accordianCategories['Sequential Agents'] = true
            accordianCategories['Memory'] = true
            accordianCategories['Agent Flows'] = true
            setCategoryExpanded(accordianCategories)
        } else {
            const taggedNodes = groupByTags(nodes, newTabValue)
            const accordianCategories = {}
            const result = taggedNodes.reduce(function (r, a) {
                r[a.category] = r[a.category] || []
                r[a.category].push(a)
                accordianCategories[a.category] = isFilter ? true : false
                return r
            }, Object.create(null))

            const filteredResult = {}
            for (const category in result) {
                if (category === 'Agent Flows' || category === 'Multi Agents' || category === 'Sequential Agents') {
                    continue
                }
                if (Object.keys(blacklistForChatflowCanvas).includes(category)) {
                    const nodes = blacklistForChatflowCanvas[category]
                    result[category] = result[category].filter((nd) => !nodes.includes(nd.name))
                }
                filteredResult[category] = result[category]
            }

            setNodes(filteredResult)
            setCategoryExpanded(accordianCategories)
        }
    }

    const handleAccordionChange = (category) => (event, isExpanded) => {
        const accordianCategories = { ...categoryExpanded }
        accordianCategories[category] = isExpanded
        setCategoryExpanded(accordianCategories)
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
        filterSearch(searchValue, newValue)
    }

    const onDragStart = (event, node) => {
        // Update node color to use AGENTFLOW_ICONS color if it's an agentflow node
        const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === node.name)
        const nodeWithUpdatedColor = foundIcon ? { ...node, color: foundIcon.color } : node

        event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeWithUpdatedColor))
        event.dataTransfer.effectAllowed = 'move'
    }

    const getImage = (tabValue) => {
        if (tabValue === 0) {
            return LangChainPNG
        } else if (tabValue === 1) {
            return LlamaindexPNG
        } else {
            return utilNodesPNG
        }
    }

    const renderIcon = (node) => {
        const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === node.name)

        if (!foundIcon) return null
        return <foundIcon.icon size={30} color={foundIcon.color} />
    }

    useEffect(() => {
        if (nodesData && showNodeDialog) {
            groupByCategory(nodesData)
        }
    }, [nodesData, showNodeDialog])

    // Handle dialog open/close
    const handleOpenDialog = () => {
        setOpenDialog(true)
        setDialogProps({
            title: 'What would you like to build?',
            description:
                'Enter your prompt to generate an agentflow. Performance may vary with different models. Only nodes and edges are generated, you will need to fill in the input fields for each node.'
        })
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
    }

    const handleConfirmDialog = () => {
        setOpenDialog(false)
        // Call the onGenerateAgentflow callback if provided
        if (onGenerateAgentflow) {
            onGenerateAgentflow()
        }
    }

    // Remove labels from subButtons array
    const subButtons = [
        {
            key: 'addNode',
            icon: <IconApps size={22} />,
            color: '#8b5cf6',
            hover: '#7c3aed',
            onClick: () => handleMenuItemClick('addNode'),
            title: 'Add Node'
        },
        {
            key: 'embed',
            icon: <IconShare size={22} />,
            color: '#0f766e',
            hover: '#134e4a',
            onClick: () => handleMenuItemClick('embed'),
            title: 'Embed'
        },
        {
            key: 'settings',
            icon: <IconSettings size={22} />,
            color: '#06b6d4',
            hover: '#0891b2',
            onClick: () => handleMenuItemClick('settings'),
            title: 'Settings'
        }
    ]
    if (isAgentCanvas) {
        subButtons.push({
            key: 'generateAgentflow',
            icon: <IconSparkles size={22} />,
            color: '#ec4899',
            hover: '#db2777',
            onClick: () => handleMenuItemClick('generateAgentflow'),
            title: 'Generate Agentflow'
        })
    }

    return (
        <>
            <Box
                sx={{
                    position: 'absolute',
                    left: 50,
                    top: 50,
                    zIndex: 1000,
                    width: 0,
                    height: 0
                }}
            >
                {/* Central Action Button */}
                <Box sx={{ position: 'relative', width: 0, height: 0 }}>
                    <StyledFab
                        ref={buttonRef}
                        sx={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#2563eb',
                                transform: isOpen ? 'rotate(45deg) scale(1.05)' : 'scale(1.05)',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
                            },
                            transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            '&:active': {
                                transform: isOpen ? 'rotate(45deg) scale(0.95)' : 'scale(0.95)'
                            },
                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                            width: '52px',
                            height: '52px',
                            position: 'relative',
                            zIndex: 2
                        }}
                        size='medium'
                        aria-label='actions'
                        title='Actions'
                        onClick={handleClick}
                    >
                        <IconPlus size={24} />
                    </StyledFab>

                    {/* Radial Sub-Buttons */}
                    {subButtons.map((btn, idx) => {
                        const count = subButtons.length
                        const angleStep = count === 1 ? 0 : arcAngle / (count - 1)
                        const startAngle = 360 - arcAngle / 270
                        const angle = startAngle + angleStep * idx
                        const rad = (angle * Math.PI) / 180
                        const x = isOpen ? Math.cos(rad) * radius : 0
                        const y = isOpen ? Math.sin(rad) * radius : 0

                        return (
                            <Box
                                key={btn.key}
                                sx={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` + (isOpen ? '' : ' scale(0.5)'),
                                    opacity: isOpen ? 1 : 0,
                                    transition: 'all 0.4s cubic-bezier(.4,2,.6,1)',
                                    zIndex: 1
                                }}
                            >
                                {btn.permission ? (
                                    <Available permission={btn.permission}>
                                        <StyledFab
                                            size='small'
                                            sx={{
                                                backgroundColor: btn.color,
                                                color: 'white',
                                                border: btn.border,
                                                '&:hover': {
                                                    backgroundColor: btn.hover,
                                                    transform: 'scale(1.1)',
                                                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
                                                },
                                                transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                                                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                                                width: '48px',
                                                height: '48px'
                                            }}
                                            onClick={btn.onClick}
                                            title={btn.title}
                                        >
                                            {btn.icon}
                                        </StyledFab>
                                    </Available>
                                ) : (
                                    <StyledFab
                                        size='small'
                                        sx={{
                                            backgroundColor: btn.color,
                                            color: 'white',
                                            border: btn.border,
                                            '&:hover': {
                                                backgroundColor: btn.hover,
                                                transform: 'scale(1.1)',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
                                            },
                                            transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                                            width: '48px',
                                            height: '48px'
                                        }}
                                        onClick={btn.onClick}
                                        title={btn.title}
                                    >
                                        {btn.icon}
                                    </StyledFab>
                                )}
                            </Box>
                        )
                    })}
                </Box>
            </Box>

            <style>
                {`
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateX(-20px) scale(0.8);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0) scale(1);
                        }
                    }
                `}
            </style>

            {/* Node Selection Dialog */}
            <Dialog
                open={showNodeDialog}
                onClose={() => setShowNodeDialog(false)}
                maxWidth={false}
                fullWidth={false}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        maxHeight: '80vh',
                        width: '580px',
                        position: 'fixed',
                        left: '30px',
                        top: '120px',
                        margin: 0,
                        maxWidth: 'none',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                        backdropFilter: 'blur(20px)'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        py: 2.5,
                        px: 3,
                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)'
                    }}
                >
                    <Typography
                        variant='h5'
                        component='span'
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <IconCube size={20} />
                        Add Nodes
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3 }}>
                        <OutlinedInput
                            sx={{
                                width: '100%',
                                pr: 2,
                                pl: 2,
                                my: 2,
                                borderRadius: '12px',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'rgba(0,0,0,0.1)',
                                        borderWidth: '1px'
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'rgba(0,0,0,0.2)'
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: theme.palette.primary.main,
                                        borderWidth: '2px'
                                    }
                                }
                            }}
                            id='input-search-node'
                            value={searchValue}
                            onChange={(e) => filterSearch(e.target.value)}
                            placeholder='Search nodes'
                            startAdornment={
                                <InputAdornment position='start'>
                                    <IconSearch stroke={1.5} size='1rem' color={theme.palette.grey[500]} />
                                </InputAdornment>
                            }
                            endAdornment={
                                <InputAdornment
                                    position='end'
                                    sx={{
                                        cursor: 'pointer',
                                        color: theme.palette.grey[500],
                                        '&:hover': {
                                            color: theme.palette.grey[900]
                                        }
                                    }}
                                    title='Clear Search'
                                >
                                    <IconX
                                        stroke={1.5}
                                        size='1rem'
                                        onClick={() => filterSearch('')}
                                        style={{
                                            cursor: 'pointer'
                                        }}
                                    />
                                </InputAdornment>
                            }
                            aria-describedby='search-helper-text'
                            inputProps={{
                                'aria-label': 'weight'
                            }}
                            autoFocus={false}
                        />
                        {!isAgentCanvas && (
                            <Tabs
                                sx={{
                                    position: 'relative',
                                    minHeight: '48px',
                                    height: '48px',
                                    '& .MuiTabs-indicator': {
                                        height: '3px',
                                        borderRadius: '2px',
                                        backgroundColor: theme.palette.primary.main
                                    },
                                    '& .MuiTab-root': {
                                        minHeight: '48px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        color: theme.palette.text.secondary,
                                        '&.Mui-selected': {
                                            color: theme.palette.primary.main,
                                            fontWeight: 600
                                        }
                                    }
                                }}
                                variant='fullWidth'
                                value={tabValue}
                                onChange={handleTabChange}
                                aria-label='tabs'
                            >
                                {['LangChain', 'LlamaIndex', 'Utilities'].map((item, index) => (
                                    <Tab
                                        icon={
                                            <div
                                                style={{
                                                    borderRadius: '50%'
                                                }}
                                            >
                                                <img
                                                    style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        borderRadius: '50%',
                                                        objectFit: 'contain'
                                                    }}
                                                    src={getImage(index)}
                                                    alt={item}
                                                />
                                            </div>
                                        }
                                        iconPosition='start'
                                        sx={{
                                            minHeight: '48px',
                                            height: '48px',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            textTransform: 'none'
                                        }}
                                        key={index}
                                        label={item}
                                        {...a11yProps(index)}
                                    />
                                ))}
                            </Tabs>
                        )}

                        <Divider />
                    </Box>
                    <PerfectScrollbar
                        style={{
                            height: '100%',
                            maxHeight: `calc(85vh - ${isAgentCanvas ? '200' : '280'}px)`,
                            overflowX: 'hidden'
                        }}
                    >
                        <Box sx={{ p: 2, pt: 0 }}>
                            <List
                                sx={{
                                    width: '100%',
                                    py: 0,
                                    borderRadius: '10px',
                                    '& .MuiListItemSecondaryAction-root': {
                                        top: 22
                                    },
                                    '& .MuiDivider-root': {
                                        my: 0
                                    },
                                    '& .list-container': {
                                        pl: 7
                                    }
                                }}
                            >
                                {Object.keys(nodes)
                                    .sort()
                                    .map((category) => (
                                        <Accordion
                                            expanded={categoryExpanded[category] || false}
                                            onChange={handleAccordionChange(category)}
                                            key={category}
                                            disableGutters
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={`nodes-accordian-${category}`}
                                                id={`nodes-accordian-header-${category}`}
                                                sx={{ minHeight: '40px', '& .MuiAccordionSummary-content': { my: 0.5 } }}
                                            >
                                                {category.split(';').length > 1 ? (
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Typography variant='h5'>{category.split(';')[0]}</Typography>
                                                        &nbsp;
                                                        <Chip
                                                            sx={{
                                                                width: 'max-content',
                                                                fontWeight: 700,
                                                                fontSize: '0.65rem',
                                                                background:
                                                                    category.split(';')[1] === 'DEPRECATING'
                                                                        ? theme.palette.warning.main
                                                                        : theme.palette.teal.main,
                                                                color: category.split(';')[1] !== 'DEPRECATING' ? 'white' : 'inherit'
                                                            }}
                                                            size='small'
                                                            label={category.split(';')[1]}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Typography variant='h5'>{category}</Typography>
                                                )}
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                {nodes[category].map((node, index) => (
                                                    <div key={node.name} onDragStart={(event) => onDragStart(event, node)} draggable>
                                                        <ListItemButton
                                                            sx={{
                                                                p: 0.5,
                                                                borderRadius: '6px',
                                                                cursor: 'grab',
                                                                '&:active': {
                                                                    cursor: 'grabbing'
                                                                },
                                                                '&:hover': {
                                                                    backgroundColor: theme.palette.action.hover
                                                                }
                                                            }}
                                                        >
                                                            <ListItem alignItems='center' sx={{ py: 0.5 }}>
                                                                {node.color && !node.icon ? (
                                                                    <ListItemAvatar>
                                                                        <div
                                                                            style={{
                                                                                width: 40,
                                                                                height: 'auto',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center'
                                                                            }}
                                                                        >
                                                                            {renderIcon(node)}
                                                                        </div>
                                                                    </ListItemAvatar>
                                                                ) : (
                                                                    <ListItemAvatar>
                                                                        <div
                                                                            style={{
                                                                                width: 40,
                                                                                height: 40,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: 'white'
                                                                            }}
                                                                        >
                                                                            <img
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    padding: 8,
                                                                                    objectFit: 'contain'
                                                                                }}
                                                                                alt={node.name}
                                                                                src={`${baseURL}/api/v1/node-icon/${node.name}`}
                                                                            />
                                                                        </div>
                                                                    </ListItemAvatar>
                                                                )}
                                                                <MuiListItemText
                                                                    sx={{ ml: 1 }}
                                                                    primary={
                                                                        <>
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    flexDirection: 'row',
                                                                                    alignItems: 'center'
                                                                                }}
                                                                            >
                                                                                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                                                                    {node.label}
                                                                                </span>
                                                                                &nbsp;
                                                                                {node.badge && (
                                                                                    <Chip
                                                                                        sx={{
                                                                                            width: 'max-content',
                                                                                            fontWeight: 700,
                                                                                            fontSize: '0.6rem',
                                                                                            height: '16px',
                                                                                            background:
                                                                                                node.badge === 'DEPRECATING'
                                                                                                    ? theme.palette.warning.main
                                                                                                    : theme.palette.teal.main,
                                                                                            color:
                                                                                                node.badge !== 'DEPRECATING'
                                                                                                    ? 'white'
                                                                                                    : 'inherit'
                                                                                        }}
                                                                                        size='small'
                                                                                        label={node.badge}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                            {node.author && (
                                                                                <span
                                                                                    style={{
                                                                                        fontSize: '0.6rem',
                                                                                        fontWeight: 600
                                                                                    }}
                                                                                >
                                                                                    By {node.author}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    }
                                                                    secondary={
                                                                        <span style={{ fontSize: '0.75rem' }}>{node.description}</span>
                                                                    }
                                                                />
                                                            </ListItem>
                                                        </ListItemButton>
                                                        {index === nodes[category].length - 1 ? null : <Divider />}
                                                    </div>
                                                ))}
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                            </List>
                        </Box>
                    </PerfectScrollbar>
                </DialogContent>
            </Dialog>

            <AgentflowGeneratorDialog
                show={openDialog}
                dialogProps={dialogProps}
                onCancel={handleCloseDialog}
                onConfirm={handleConfirmDialog}
            />
        </>
    )
}

ActionButton.propTypes = {
    onAddNode: PropTypes.func.isRequired,
    onEmbed: PropTypes.func.isRequired,
    onSettings: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onGenerateAgentflow: PropTypes.func,
    isAgentCanvas: PropTypes.bool,
    savePermission: PropTypes.string,
    isDirty: PropTypes.bool,
    nodesData: PropTypes.array,
    radius: PropTypes.number, // px
    arcAngle: PropTypes.number // degrees
}

export default ActionButton
