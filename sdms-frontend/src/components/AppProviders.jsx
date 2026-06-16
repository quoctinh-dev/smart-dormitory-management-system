import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "@/auth";
import theme from "@/theme";          

export const AppProviders = ({ children }) => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {children}
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};