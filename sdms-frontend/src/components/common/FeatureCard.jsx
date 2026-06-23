import { Card, Box, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

/**
 * FeatureCard: Component dùng chung cho các khối chức năng (Trang chủ, Dashboard...)
 */
export default function FeatureCard({ icon, title, description, buttonText, to, variant = "contained", color = "primary" }) {
    return (
        <Card sx={{ 
            p: 4, 
            borderRadius: 4, 
            height: '100%', 
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            '&:hover': { 
                transform: 'translateY(-8px)', 
                boxShadow: (theme) => `0 12px 24px -10px ${theme.palette[color].main}50` 
            } 
        }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>{icon}</Box>
            <Typography variant="h5" fontWeight="700" textAlign="center" gutterBottom>{title}</Typography>
            <Typography color="text.secondary" textAlign="center" mb={4} sx={{ flexGrow: 1 }}>{description}</Typography>
            {buttonText && to && (
                <Button 
                    fullWidth 
                    color={color} 
                    variant={variant} 
                    size="large" 
                    component={RouterLink} 
                    to={to} 
                    sx={{ borderRadius: 3, fontWeight: 'bold' }}
                >
                    {buttonText}
                </Button>
            )}
        </Card>
    );
}
