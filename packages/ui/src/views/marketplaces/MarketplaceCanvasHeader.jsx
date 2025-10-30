import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, Box, ButtonBase, Typography, Stack } from '@mui/material'
import { StyledButton } from '@/ui-component/button/StyledButton'

// icons
import { IconCopy, IconChevronLeft } from '@tabler/icons-react'
import { Available } from '@/ui-component/rbac/available'

// ==============================|| CANVAS HEADER ||============================== //

const MarketplaceCanvasHeader = ({ flowName, flowData, onChatflowCopy }) => {
    const theme = useTheme()
    const navigate = useNavigate()

    return (
        <>
            <Box>
                <ButtonBase title='Back' sx={{ borderRadius: '50%' }}>
                    <Avatar
                        variant='rounded'
                        sx={{
                            ...theme.typography.commonAvatar,
                            ...theme.typography.mediumAvatar,
                            transition: 'all .2s ease-in-out',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: '#fff'
                            }
                        }}
                        color='inherit'
                        onClick={() => navigate(-1)}
                    >
                        <IconChevronLeft stroke={1.5} size='1.3rem' />
                    </Avatar>
                </ButtonBase>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <Stack flexDirection='row'>
                    <Typography
                        sx={{
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            ml: 2,
                            color: '#fff'
                        }}
                    >
                        {flowName}
                    </Typography>
                </Stack>
            </Box>
            <Available permission={'chatflows:create,agentflows.create'}>
                <Box>
                    <StyledButton
                        sx={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#3949ab',
                            '&:hover': {
                                background: '#ffffff',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                            }
                        }}
                        variant='contained'
                        title='Use Chatflow'
                        onClick={() => onChatflowCopy(flowData)}
                        startIcon={<IconCopy style={{ color: '#3949ab' }} />}
                    >
                        Use Template
                    </StyledButton>
                </Box>
            </Available>
        </>
    )
}

MarketplaceCanvasHeader.propTypes = {
    flowName: PropTypes.string,
    flowData: PropTypes.object,
    onChatflowCopy: PropTypes.func
}

export default MarketplaceCanvasHeader
