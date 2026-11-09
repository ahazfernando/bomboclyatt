"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthDivider, AuthField, GoogleIcon, SocialButton } from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  authErrorMessage,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/firebase/auth";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

function AdminAuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "register" ? "register" : "login";
  const router = useRouter();
  const { loginAdmin, registerAdmin } = useStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const finishAdminAuth = (adminEmail: string, name?: string) => {
    if (loginAdmin(adminEmail)) {
      toast.success("Welcome back!");
      router.push("/admin");
      return;
    }
    const fullName = name ?? adminEmail.split("@")[0];
    if (registerAdmin({ name: fullName, email: adminEmail })) {
      toast.success("Admin account created!");
      router.push("/admin");
    } else {
      toast.error("An admin account with that email already exists.");
    }
  };

  const handleGoogle = async () => {
    if (!isFirebaseConfigured()) {
      toast.error("Firebase is not configured.");
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithGoogle();
      const adminEmail = cred.user.email;
      if (!adminEmail) {
        toast.error("Google did not return an email for this account.");
        return;
      }
      const displayName = cred.user.displayName ?? adminEmail.split("@")[0] ?? "Admin";
      finishAdminAuth(adminEmail, displayName);
    } catch (error) {
      toast.error(authErrorMessage(error));
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
      if (registerAdmin({ name: fullName, email })) {
        toast.success("Admin account created!");
        router.push("/admin");
      } else {
        toast.error("An admin account with that email already exists.");
      }
    } catch {
      toast.error("Could not create admin account.");
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
      if (loginAdmin(email)) {
        toast.success("Signed in!");
        router.push("/admin");
      } else {
        toast.error("No admin account found with that email.");
      }
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "register") {
    return (
      <AuthShell mode="register" portal="admin" activeStep={1}>
        <div>
          <h2 className="text-3xl font-semibold text-white">Admin Sign Up</h2>
          <p className="mt-2 text-sm text-white/50">
            Create a secure operator account for the BomboClyatt platform.
          </p>
        </div>

        <div className="mt-8">
          <SocialButton
            label="Continue with Google"
            icon={<GoogleIcon />}
            onClick={handleGoogle}
            disabled={loading}
          />
        </div>

        <AuthDivider />

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AuthField
              id="admin-firstName"
              label="First Name"
              placeholder="eg. John"
              value={firstName}
              onChange={setFirstName}
            />
            <AuthField
              id="admin-lastName"
              label="Last Name"
              placeholder="eg. Franklin"
              value={lastName}
              onChange={setLastName}
            />
          </div>
          <AuthField
            id="admin-email"
            label="Admin Email"
            type="email"
            placeholder="admin@bomboclyatt.com"
            value={email}
            onChange={setEmail}
          />
          <AuthField
            id="admin-password"
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
          Already have an admin account?{" "}
          <Link href="/auth/admin?mode=login" className="font-medium text-white hover:underline">
            Log in
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-white/40">
          Buyer or seller?{" "}
          <Link href="/auth?mode=login" className="font-medium text-white/70 hover:underline">
            User sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell mode="login" portal="admin" activeStep={1}>
      <div>
        <h2 className="text-3xl font-semibold text-white">Admin Sign In</h2>
        <p className="mt-2 text-sm text-white/50">
          Platform operators only. Separate from buyer and seller accounts.
        </p>
      </div>

      <div className="mt-8">
        <SocialButton
          label="Continue with Google"
          icon={<GoogleIcon />}
          onClick={handleGoogle}
          disabled={loading}
        />
      </div>

      <AuthDivider />

      <form onSubmit={handleSignIn} className="space-y-4">
        <AuthField
          id="admin-email"
          label="Admin Email"
          type="email"
          placeholder="admin@bomboclyatt.com"
          value={email}
          onChange={setEmail}
        />
        <AuthField
          id="admin-password"
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
        Don&apos;t have an admin account?{" "}
        <Link href="/auth/admin?mode=register" className="font-medium text-white hover:underline">
          Sign up
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-white/40">
        Buyer or seller?{" "}
        <Link href="/auth?mode=login" className="font-medium text-white/70 hover:underline">
          User sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function AdminAuthPage() {
  return (
    <Suspense fallback={null}>
      <AdminAuthContent />
    </Suspense>
  );
}
