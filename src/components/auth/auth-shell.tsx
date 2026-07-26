"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  activeStep = 1,
  mode,
  portal = "user",
  children,
}: {
  activeStep?: number;
  mode: "login" | "register";
  portal?: "user" | "admin";
  children: ReactNode;
}) {
  const steps =
    portal === "admin"
      ? [
          { n: 1, title: "Create admin account" },
          { n: 2, title: "Verify workspace" },
          { n: 3, title: "Configure platform" },
        ]
      : [
          { n: 1, title: "Sign up your account" },
          { n: 2, title: "Set up your workspace" },
          { n: 3, title: "Set up your profile" },
        ];

  const heading =
    mode === "register"
      ? portal === "admin"
        ? "Admin Access Setup"
        : "Get Started with Us"
      : portal === "admin"
        ? "Admin Portal"
        : "Welcome Back";

  const subheading =
    mode === "register"
      ? portal === "admin"
        ? "Register a secure operator account for the BomboClyatt platform."
        : "Complete these easy steps to register your account."
      : portal === "admin"
        ? "Sign in to manage listings, users, and platform settings."
        : "Sign in to buy, sell, and track your collectibles.";
  return (
    <div className="grid min-h-screen bg-black lg:grid-cols-2">
      {/* Left card */}
      <div className="hidden lg:flex lg:ml-6 lg:my-6 lg:min-h-[calc(100vh-3rem)]">
        <div className="relative flex w-full flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-hero p-12 shadow-glow">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 15% 35%, oklch(0.80 0.13 65 / 0.45) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 85% 75%, oklch(0.58 0.20 38 / 0.35) 0%, transparent 50%)",
            }}
          />

          <div className="relative z-10">
            <Link href="/">
              <img
                src="/logo/BomboclyattRedesign.png"
                alt="BomboClyatt"
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <h1 className="display text-5xl leading-none text-tuft">{heading}</h1>
            <p className="mt-4 text-base text-tuft/75">{subheading}</p>
          </div>

          <div className="relative z-10 flex gap-3">
            {steps.map((step) => {
              const active = step.n === activeStep;
              return (
                <div
                  key={step.n}
                  className={`flex flex-1 flex-col gap-3 rounded-2xl p-4 transition-colors ${
                    active
                      ? "bg-tuft text-maple shadow-card"
                      : "border border-tuft/20 bg-maple/30 text-tuft/70 backdrop-blur-sm"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      active ? "bg-maple text-tuft" : "bg-tuft/15 text-tuft/80"
                    }`}
                  >
                    {step.n}
                  </div>
                  <p
                    className={`text-sm font-medium leading-snug ${
                      active ? "text-maple" : "text-tuft/65"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex min-h-screen flex-col bg-black px-6 py-10 sm:px-12 lg:px-16 lg:py-16">
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <img
              src="/logo/BomboclyattRedesign.png"
              alt="BomboClyatt"
              className="h-9 w-auto brightness-0 invert"
            />
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">{children}</div>
      </div>
    </div>
  );
}
