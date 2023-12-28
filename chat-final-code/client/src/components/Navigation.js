import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from "@material-ui/core";
import { useLogoutUserMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Navigation() {
    const user = useSelector((state) => state.user);
    const [logoutUser] = useLogoutUserMutation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logoutUser(user);
        // redirect to home page
        window.location.replace("/");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
                    <img src={logo} alt="Logo" style={{ width: 50, height: 50, marginRight: 10 }} />
                </Link>
                <Typography variant="h6" style={{ flexGrow: 1 ,backgroundColor:"white" }}>
                    
                </Typography>
                {!user && (
                    <Button color="inherit" component={Link} to="/login">
                        Login
                    </Button>
                )}
                {user && (
                    <>
                        <IconButton onClick={handleMenuClick} color="inherit">
                            <Avatar alt={user.name} src={user.picture} style={{ width: 30, height: 30 }} />
                        </IconButton>
                        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                            <MenuItem onClick={handleMenuClose}>My account</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navigation;
