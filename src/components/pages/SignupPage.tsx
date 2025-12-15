import React from "react";
import { Helmet } from "react-helmet-async";
import SignupForm from "../bussiness/SignupForm";
import NavBar from "../common/NavBar";

export default function SignupPage() {
  return (
    <>
      <Helmet>
        <title>注册 - SeuOJ</title>
      </Helmet>
      <div className="flex flex-col justify-center items-center m-8 bg-muted">
        <span className="text-3xl font-bold">注册</span>
        <SignupForm />
      </div>
    </>
  );
}
