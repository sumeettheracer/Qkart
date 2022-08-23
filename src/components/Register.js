import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState, useEffect } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = (props) => {
  const { enqueueSnackbar } = useSnackbar();
  const formdatainit = {
    username: "",
    password: "",
    confirmPassword: "",
  };
  const [formData, setform] = useState(formdatainit);
  const [isLoading, setIsLoding] = useState(false);
  const [success, setSuccess] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (success) {
      history.push("/login");
    }
  }, [success, history]);
  const register = async (formData) => {
    setIsLoding(true);
    if (validateInput(formData)) {
      await axios
        .post(`${config.endpoint}/auth/register`, {
          username: formData.username,
          password: formData.password,
        })
        .then((res) => {
          if (res.data.success) {
            enqueueSnackbar("User registration successfully", {
              variant: "success",
            });
            // history.push('/login');
          }
        })
        .catch((e) => {
          setIsLoding(false);
          if (!e.response.data.success && e.response.status === 400) {
            enqueueSnackbar(e.response.data.message, { variant: "error" });
          } else {
            enqueueSnackbar("Something went wrong!", { variant: "error" });
          }
        });
      }
    setIsLoding(false);
    setSuccess(true);
  };

  const validateInput = (data) => {
    if (!data.username) {
      enqueueSnackbar("Username is a required field", { variant: "error" });
      return false;
    }
    if (data.username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "error",
      });
      return false;
    }
    if (!data.password) {
      enqueueSnackbar("Password is a required field", { variant: "error" });
      return false;
    }
    if (data.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "error",
      });
      return false;
    }
    if (data.password !== data.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return false;
    }
    return true;
  };
  //handeling the change in Box.
  const handelchange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setform({ ...formData, [name]: value });
  };
  const handleClick = (e) => {
    e.preventDefault();
    register(formData);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={true} />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            onChange={handelchange}
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange={handelchange}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange={handelchange}
          />
          {!isLoading ? (
            <Button
              onClick={handleClick}
              className="button"
              variant="contained"
            >
              Register Now
            </Button>
          ) : (
            <div className="loading">
              <CircularProgress />
            </div>
          )}
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to={`/login`}>
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
