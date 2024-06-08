import { Backdrop, CircularProgress } from "@mui/material";

interface IProps {
    isLoading: boolean;
    setIsLoading?: (value: boolean) => void;
}

export default function BaseLoader({ isLoading, setIsLoading }: IProps) {
    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
            onClick={() => {}}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}