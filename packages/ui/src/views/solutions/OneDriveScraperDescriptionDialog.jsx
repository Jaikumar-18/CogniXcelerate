import * as React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

const OneDriveScraperDescriptionDialog = ({ open, onClose, onUseAgent }) => (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle>OneDrive Scraper</DialogTitle>
        <DialogContent>
            <Typography variant='body1' gutterBottom>
                Extract and process information from your OneDrive documents securely and efficiently. This solution connects to your
                OneDrive, fetches documents, and enables automated data extraction and processing workflows.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} color='secondary'>
                Close
            </Button>
            <Button onClick={onUseAgent} color='primary' variant='contained'>
                Use Solution
            </Button>
        </DialogActions>
    </Dialog>
)

export default OneDriveScraperDescriptionDialog
