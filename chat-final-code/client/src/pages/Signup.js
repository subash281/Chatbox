import React, { useState } from "react";
import { Container, Grid, Typography, TextField, Button, CircularProgress } from "@material-ui/core";
import { useSignupUserMutation } from "../services/appApi";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import botImg from "../assets/bot.jpeg";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [signupUser, { isLoading, error }] = useSignupUserMutation();
    const navigate = useNavigate();
    // image upload states
    const [image, setImage] = useState(null);
    const [upladingImg, setUploadingImg] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    function validateImg(e) {
        const file = e.target.files[0];
        if (file.size >= 1048576) {
            return alert("Max file size is 1mb");
        } else {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    async function uploadImage() {
        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "your-preset-here");
        try {
            setUploadingImg(true);
            let res = await fetch("https://api.cloudinary.com/v1_1/your-username-here/image/upload", {
                method: "post",
                body: data,
            });
            const urlData = await res.json();
            setUploadingImg(false);
            return urlData.url;
        } catch (error) {
            setUploadingImg(false);
            console.log(error);
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        if (!image) return alert("Please upload your profile picture");
        const url = await uploadImage(image);
        console.log(url);
        // signup the user
        signupUser({ name, email, password, picture: url }).then(({ data }) => {
            if (data) {
                console.log(data);
                navigate("/chat");
            }
        });
    }

    return (
        <Container>
            <Grid container>
                <Grid item md={7} container direction="column" alignItems="center" justifyContent="center">
                    <form style={{ width: "80%", maxWidth: 500 }} onSubmit={handleSignup}>
                        <Typography variant="h4" className="text-center">
                            Create account
                        </Typography>
                        <div className="signup-profile-pic__container">
                            <img src={imagePreview || botImg} className="signup-profile-pic" alt="Profile Preview" />
                            <label htmlFor="image-upload" className="image-upload-label">
                                <i className="fas fa-plus-circle add-picture-icon"></i>
                            </label>
                            <input type="file" id="image-upload" hidden accept="image/png, image/jpeg" onChange={validateImg} />
                        </div>
                        {error && <p className="alert alert-danger">{error.data}</p>}
                        <TextField
                            label="Name"
                            type="text"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                        <TextField
                            label="Email address"
                            type="email"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                        <Button variant="contained" color="primary" type="submit" disabled={upladingImg || isLoading}>
                            {upladingImg || isLoading ? <CircularProgress size={24} /> : "Signup"}
                        </Button>
                        <div className="py-4">
                            <Typography variant="body2" align="center">
                                Already have an account? <Link to="/login">Login</Link>
                            </Typography>
                        </div>
                    </form>
                </Grid>
                <Grid item md={5} className="signup__bg"></Grid>
            </Grid>
        </Container>
    );
}

export default Signup;
