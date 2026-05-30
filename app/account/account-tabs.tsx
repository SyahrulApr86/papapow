"use client";

import { useState } from "react";

export function AccountTabs({
  loginForm,
  registerForm,
  defaultTab = "register",
}: {
  loginForm: React.ReactNode;
  registerForm: React.ReactNode;
  defaultTab?: string;
}) {
  const [active, setActive] = useState<"login" | "register">(
    defaultTab === "login" ? "login" : "register",
  );

  return (
    <div className="auth-tabs-wrapper">
      <div className="auth-tab-bar">
        <button
          className={`auth-tab${active === "register" ? " active" : ""}`}
          onClick={() => setActive("register")}
          type="button"
        >
          Daftar
        </button>
        <button
          className={`auth-tab${active === "login" ? " active" : ""}`}
          onClick={() => setActive("login")}
          type="button"
        >
          Masuk
        </button>
      </div>
      <div className="auth-tab-content">
        {active === "login" ? loginForm : registerForm}
      </div>
    </div>
  );
}
