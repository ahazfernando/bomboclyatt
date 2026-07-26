"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthDivider, AuthField, GithubIcon, GoogleIcon, SocialButton } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  signInWithEmail,
  signInWithGithub,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/firebase/auth";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const router = useRouter();
  const { login, register } = useStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const finishAuth = (userEmail: string, name?: string) => {
    if (login(userEmail)) {
      toast.success("Welcome back!");
      router.push("/dashboard");
      return;
    }
    if (name) {
      register({ name, email: userEmail, role: "buyer" });
      toast.success("Account created!");
      router.push("/dashboard");
      return;
    }
    register({ name: userEmail.split("@")[0], email: userEmail, role: "buyer" });
    toast.success("Account created!");
    router.push("/dashboard");
  };

  const handleSocial = async (provider: "google" | "github") => {
    if (!isFirebaseConfigured()) {
      toast.error("Firebase is not configured.");
      return;
    }
    setLoading(true);
    try {
      const cred =
        provider === "google" ? await signInWithGoogle() : await signInWithGithub();
      const displayName = cred.user.displayName ?? cred.user.email?.split("@")[0] ?? "User";
      finishAuth(cred.user.email ?? "", displayName);
    } catch {
      toast.error("Social sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    try {
      if (isFirebaseConfigured()) {
        await signUpWithEmail(email, password);
      }
      register({ name: fullName, email, role: "buyer" });
      toast.success("Account created!");
      router.push("/dashboard");
    } catch {
      toast.error("Could not create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      if (isFirebaseConfigured()) {
        await signInWithEmail(email, password);
      }
      if (login(email)) {
        toast.success("Signed in!");
        router.push("/dashboard");
      } else {
        toast.error("No account found with that email.");
      }
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "register") {
    return (
      <AuthShell mode="register" activeStep={1}>
        <div>
          <h2 className="text-3xl font-semibold text-white">Sign Up Account</h2>
          <p className="mt-2 text-sm text-white/50">Enter your personal data to create your account.</p>
        </div>

        <div className="mt-8 flex gap-3">
          <SocialButton
            label="Google"
            icon={<GoogleIcon />}
            onClick={() => handleSocial("google")}
            disabled={loading}
          />
          <SocialButton
            label="Github"
            icon={<GithubIcon />}
            onClick={() => handleSocial("github")}
            disabled={loading}
          />
        </div>

        <AuthDivider />

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AuthField
              id="firstName"
              label="First Name"
              placeholder="eg. John"
              value={firstName}
              onChange={setFirstName}
            />
            <AuthField
              id="lastName"
              label="Last Name"
              placeholder="eg. Franklin"
              value={lastName}
              onChange={setLastName}
            />
          </div>
          <AuthField
            id="email"
            label="Email"
            type="email"
            placeholder="eg. johnfranklin@example.com"
            value={email}
            onChange={setEmail}
          />
          <AuthField
            id="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            hint="Must be at least 8 characters."
            showToggle
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
          />

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-white text-base font-semibold text-black hover:bg-white/90"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/auth?mode=login" className="font-medium text-white hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-white/40">
          Platform admin?{" "}
          <Link href="/auth/admin?mode=register" className="font-medium text-white/70 hover:underline">
            Admin sign up
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell mode="login" activeStep={1}>
      <div>
        <h2 className="text-3xl font-semibold text-white">Sign In Account</h2>
        <p className="mt-2 text-sm text-white/50">Enter your credentials to access your account.</p>
      </div>

      <div className="mt-8 flex gap-3">
        <SocialButton
          label="Google"
          icon={<GoogleIcon />}
          onClick={() => handleSocial("google")}
          disabled={loading}
        />
        <SocialButton
          label="Github"
          icon={<GithubIcon />}
          onClick={() => handleSocial("github")}
          disabled={loading}
        />
      </div>

      <AuthDivider />

      <form onSubmit={handleSignIn} className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="eg. johnfranklin@example.com"
          value={email}
          onChange={setEmail}
        />
        <AuthField
          id="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          showToggle
          visible={showPassword}
          onToggle={() => setShowPassword((v) => !v)}
        />

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-xl bg-white text-base font-semibold text-black hover:bg-white/90"
        >
          {loading ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-white/50">
        Don&apos;t have an account?{" "}
        <Link href="/auth?mode=register" className="font-medium text-white hover:underline">
          Sign up
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-white/40">
        Platform admin?{" "}
        <Link href="/auth/admin?mode=login" className="font-medium text-white/70 hover:underline">
          Admin sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
