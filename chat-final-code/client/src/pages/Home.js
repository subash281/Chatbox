import React from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <Grid container>
            <Grid item md={6} container direction="column" alignItems="center" justifyContent="center">
                <div>
                    <Typography variant="h4">Share the world with your friends</Typography>
                    <Typography variant="body1">Chat App lets you connect with the world</Typography>
                    <Link to="/chat" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" color="primary">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </Grid>
            <Grid item md={6} className="home__bg"></Grid>
        </Grid>
    );
}

export default Home;

