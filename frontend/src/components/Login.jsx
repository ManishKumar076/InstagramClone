import React, { useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import BrandLogo from "./BrandLogo";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        email: input.email.trim().toLowerCase(),
        password: input.password,
      };
      const res = await axios.post(
        "/api/v1/user/login",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={loginHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="my-4">
          <div className="flex justify-center mb-3">
            <BrandLogo className="text-4xl font-extrabold tracking-tight text-black" />
          </div>
          <p className="text-sm text-center">
            Login to see photos & videos from your friends.
          </p>
        </div>

        <div>
          <span className=" font-medium">Email</span>
          <br />
          <input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            placeholder="Enter your email"
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div>
          <span className=" font-medium">Password</span>
          <br />
          <input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            placeholder="Enter your password"
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit">Login</Button>
        )}

        <span className="text-center">
          Doesn't have an account?
          <Link to="/signup" className="text-blue-600">
            Signup
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
