"use client";

import { useState } from "react";
import type { loginAction, registerAction } from "./actions";

type Tab = "login" | "register";

export function AuthSection({
  defaultTab = "register",
  error,
  loginAction,
  registerAction,
}: {
  defaultTab?: Tab;
  error?: string;
  loginAction: (formData: FormData) => Promise<void>;
  registerAction: (formData: FormData) => Promise<void>;
}) {
  const [active, setActive] = useState<Tab>(defaultTab);

  return (
    <>
      {/* Auth promo banner */}
      <div className="auth-banner">
        <div className="auth-banner-text">
          <strong>Nikmati Diskon Spesial dan Pantau Pesanan Kamu</strong>
          <p>
            Dapatkan diskon eksklusif sambil melacak pesanan dan percakapan kamu dengan mudah.
            Tetap terhubung dengan kami dan selalu tahu perkembangan pembelian kamu, semua
            dalam satu platform.
          </p>
        </div>
        <div className="auth-banner-actions">
          <button
            type="button"
            className="auth-btn-outline"
            onClick={() => setActive("login")}
          >
            Login
          </button>
          <button
            type="button"
            className="auth-btn-fill"
            onClick={() => setActive("register")}
          >
            Daftar
          </button>
        </div>
      </div>

      {error && <p className="auth-error auth-error-center">{decodeURIComponent(error)}</p>}

      {/* Auth forms */}
      <div className="auth-container" id="auth-forms">
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
            {active === "login" ? (
              <form action={loginAction} className="auth-form">
                <label>
                  <span>Email</span>
                  <input type="email" name="email" placeholder="email@kamu.com" required />
                </label>
                <label>
                  <span>Password</span>
                  <input type="password" name="password" placeholder="••••••••" required />
                </label>
                <button type="submit" className="auth-submit">Masuk</button>
                <p className="auth-hint">
                  Belum punya akun?{" "}
                  <button type="button" className="auth-link" onClick={() => setActive("register")}>
                    Daftar sekarang
                  </button>
                </p>
              </form>
            ) : (
              <form action={registerAction} className="auth-form">
                <label>
                  <span>Nama</span>
                  <input type="text" name="name" placeholder="Nama lengkap kamu" required />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" name="email" placeholder="email@kamu.com" required />
                </label>
                <label>
                  <span>Password</span>
                  <input type="password" name="password" placeholder="Min. 6 karakter" required minLength={6} />
                </label>
                <button type="submit" className="auth-submit">Buat Akun</button>
                <p className="auth-hint">
                  Sudah punya akun?{" "}
                  <button type="button" className="auth-link" onClick={() => setActive("login")}>
                    Masuk
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
