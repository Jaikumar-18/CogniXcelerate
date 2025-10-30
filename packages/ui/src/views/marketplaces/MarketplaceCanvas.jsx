import { useEffect, useRef, useState } from 'react'
import ReactFlow, { Controls, Background, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import '@/views/canvas/index.css'

import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// material-ui
import { Toolbar, Box, AppBar } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MarketplaceCanvasNode from './MarketplaceCanvasNode'
import MarketplaceCanvasHeader from './MarketplaceCanvasHeader'
import StickyNote from '../canvas/StickyNote'

// icons
import { IconMagnetFilled, IconMagnetOff } from '@tabler/icons-react'

const nodeTypes = { customNode: MarketplaceCanvasNode, stickyNote: StickyNote }
const edgeTypes = { buttonedge: '' }

// ==============================|| CANVAS ||============================== //

const MarketplaceCanvas = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const customization = useSelector((state) => state.customization)

    const { state } = useLocation()
    const { flowData, name } = state

    // ==============================|| ReactFlow ||============================== //

    const [nodes, setNodes, onNodesChange] = useNodesState()
    const [edges, setEdges, onEdgesChange] = useEdgesState()
    const [isSnappingEnabled, setIsSnappingEnabled] = useState(false)

    const reactFlowWrapper = useRef(null)

    // ==============================|| useEffect ||============================== //

    useEffect(() => {
        if (flowData) {
            const initialFlow = JSON.parse(flowData)
            setNodes(initialFlow.nodes || [])
            setEdges(initialFlow.edges || [])
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flowData])

    const onChatflowCopy = (flowData) => {
        const isAgentCanvas = (flowData?.nodes || []).some(
            (node) => node.data.category === 'Multi Agents' || node.data.category === 'Sequential Agents'
        )
        const templateFlowData = JSON.stringify(flowData)
        navigate(`/${isAgentCanvas ? 'agentcanvas' : 'canvas'}`, { state: { templateFlowData } })
    }

    return (
        <>
            <Box>
                <AppBar
                    enableColorOnDark
                    position='fixed'
                    elevation={0}
                    sx={{
                        bgcolor: '#3949ab',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        height: '64px',
                        '& .MuiToolbar-root': {
                            minHeight: '64px',
                            bgcolor: '#3949ab'
                        }
                    }}
                >
                    <Toolbar>
                        <MarketplaceCanvasHeader
                            flowName={name}
                            flowData={JSON.parse(flowData)}
                            onChatflowCopy={(flowData) => onChatflowCopy(flowData)}
                        />
                    </Toolbar>
                </AppBar>
                <Box 
                    sx={{ 
                        pt: '64px', 
                        height: '100vh', 
                        width: '100%',
                        bgcolor: '#f5f7fa'
                    }}
                >
                    <div className='reactflow-parent-wrapper'>
                        <div className='reactflow-wrapper' ref={reactFlowWrapper}>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                nodesDraggable={false}
                                nodeTypes={nodeTypes}
                                edgeTypes={edgeTypes}
                                fitView
                                minZoom={0.1}
                                snapGrid={[20, 20]}
                                snapToGrid={isSnappingEnabled}
                                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                                style={{
                                    backgroundColor: '#f5f7fa'
                                }}
                            >
                                <Controls
                                    className={customization.isDarkMode ? 'dark-mode-controls' : ''}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        right: '20px',
                                        bottom: '20px',
                                        left: 'auto',
                                        transform: 'none'
                                    }}
                                >
                                    <button
                                        className='react-flow__controls-button react-flow__controls-interactive'
                                        onClick={() => {
                                            setIsSnappingEnabled(!isSnappingEnabled)
                                        }}
                                        title='toggle snapping'
                                        aria-label='toggle snapping'
                                        style={{ borderRadius: '4px', margin: '2px' }}
                                    >
                                        {isSnappingEnabled ? <IconMagnetFilled /> : <IconMagnetOff />}
                                    </button>
                                </Controls>
                                <Background 
                                    variant="lines" 
                                    gap={20} 
                                    size={1} 
                                    color={customization.isDarkMode ? '#e3e3e3' : '#e3e3e3'} 
                                    style={{ opacity: 0.3 }} 
                                />
                            </ReactFlow>
                        </div>
                    </div>
                </Box>
            </Box>
        </>
    )
}

export default MarketplaceCanvas
